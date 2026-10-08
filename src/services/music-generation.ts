export class MusicError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

export function validateMusicInput(body: any) {
  const prompt =
    typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const lyrics =
    typeof body?.lyrics === "string" ? body.lyrics.trim() : "";
  const duration = Number(body?.duration);
  const language = body?.language;

  if (!prompt || prompt.length > 4000)
    throw new MusicError("Opis: od 1 do 4000 znakov.", 400);

  if (lyrics.length > 12000)
    throw new MusicError("Besedilo: najvec 12000 znakov.", 400);

  if (!Number.isFinite(duration) || duration < 10 || duration > 120)
    throw new MusicError("Trajanje: od 10 do 120 sekund.", 400);

  if (!["sl", "en", "es"].includes(language))
    throw new MusicError("Izberi jezik sl, en ali es.", 400);

  if (typeof body?.instrumental !== "boolean")
    throw new MusicError("Izberi vokal ali instrumental.", 400);

  if (!body.instrumental && !lyrics)
    throw new MusicError("Za petje vnesi besedilo.", 400);

  return {
    prompt,
    lyrics,
    duration,
    language,
    instrumental: body.instrumental
  };
}

async function readMusicJson(response: Response) {
  if (!response.ok) {
    await response.body?.cancel();

    if (response.status === 429)
      throw new MusicError("Omejitev ACEMusic. Poskusi pozneje.", 429);

    if ([401, 403].includes(response.status))
      throw new MusicError("Preveri ACEMusic API kljuc in dovoljenja.");

    throw new MusicError("ACEMusic trenutno ne more dokoncati zahteve.");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new MusicError("Prazen odgovor ACEMusic.");

  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      size += value.length;

      if (size > 8 * 1024 * 1024) {
        await reader.cancel();
        throw new MusicError("Odgovor je prevelik. Skrajsaj skladbo.", 413);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new MusicError("Neveljaven odgovor ACEMusic.");
  }
}

export async function generateMusic(
  body: unknown,
  fetcher: typeof fetch = fetch
) {
  const input = validateMusicInput(body);
  const key = process.env.ACESTEP_API_KEY?.trim();
  const base = (
    process.env.ACESTEP_API_URL || "https://api.acemusic.ai"
  ).replace(/\/+$/, "");

  if (!key)
    throw new MusicError("API kljuc ni nastavljen.", 503);

  if (base !== "https://api.acemusic.ai")
    throw new MusicError(
      "API naslov mora biti https://api.acemusic.ai.",
      503
    );

  const signal = AbortSignal.timeout(52000);

  const headers = {
    Authorization: "Bearer " + key,
    "Content-Type": "application/json"
  };

  try {
    let model = process.env.ACESTEP_MODEL?.trim();

    if (!model) {
      const models = await readMusicJson(
        await fetcher(base + "/v1/models", {
          headers,
          signal,
          redirect: "error"
        })
      );

      model = models?.data?.find(
        (m: any) =>
          typeof m.id === "string" &&
          /acestep.*turbo/i.test(m.id)
      )?.id;

      if (!model)
        throw new MusicError("ACE-Step turbo model ni na voljo.");
    }

    const result = await readMusicJson(
      await fetcher(base + "/v1/chat/completions", {
        method: "POST",
        headers,
        signal,
        redirect: "error",
        body: JSON.stringify({
          model,
          messages: [
            { role: "user", content: input.prompt }
          ],
          lyrics: input.instrumental
            ? "[Instrumental]"
            : input.lyrics,
          stream: false,
          sample_mode: false,
          use_format: false,
          use_cot_caption: false,
          use_cot_language: false,
          batch_size: 1,
          audio_config: {
            duration: input.duration,
            vocal_language: input.language,
            instrumental: input.instrumental,
            format: "mp3"
          }
        })
      })
    );

    const url =
      result?.choices?.[0]?.message?.audio?.[0]?.audio_url?.url;

    if (
      typeof url !== "string" ||
      !/^data:audio\/(?:mpeg|mp3);base64,[A-Za-z0-9+/]+={0,2}$/.test(url)
    )
      throw new MusicError("ACEMusic ni vrnil MP3 zvoka.");

    const audio = Buffer.from(
      url.slice(url.indexOf(",") + 1),
      "base64"
    );

    if (!audio.length || audio.length > 3 * 1024 * 1024)
      throw new MusicError(
        "Zvok je prevelik. Skrajsaj skladbo.",
        413
      );

    return audio;
  } catch (error) {
    if (error instanceof MusicError) throw error;

    if (signal.aborted)
      throw new MusicError(
        "Casovna omejitev. Poskusi krajso skladbo.",
        504
      );

    throw new MusicError("Povezava z ACEMusic ni uspela.");
  }
}