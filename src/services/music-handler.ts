import { getSession } from "./auth.js";
import {
  generateMusic,
  MusicError
} from "./music-generation.js";

export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({
      ok: false,
      error: "Metoda ni dovoljena."
    });
    return;
  }

  const origin = req.headers?.origin;

  if (origin) {
    try {
      if (new URL(origin).host !== req.headers?.host) {
        res.status(403).json({
          ok: false,
          error: "Izvor zahteve ni dovoljen."
        });
        return;
      }
    } catch {
      res.status(403).json({
        ok: false,
        error: "Neveljaven izvor zahteve."
      });
      return;
    }
  }

  const contentType = String(
    req.headers?.["content-type"] || ""
  ).toLowerCase();

  if (!contentType.startsWith("application/json")) {
    res.status(415).json({
      ok: false,
      error: "Zahteva mora biti JSON."
    });
    return;
  }

  try {
    if (process.env.VERCEL && !process.env.AUTH_SECRET) {
      res.status(503).json({
        ok: false,
        error: "Za varno prijavo nastavi AUTH_SECRET."
      });
      return;
    }

    const session = await getSession(req);

    if (!session) {
      res.status(401).json({
        ok: false,
        error: "Najprej se prijavi v Studio."
      });
      return;
    }

    if (session.role !== "owner") {
      res.status(403).json({
        ok: false,
        error: "Ustvarjanje glasbe je trenutno na voljo skrbniku."
      });
      return;
    }

    const audio = await generateMusic(req.body);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="studio-music.mp3"'
    );
    res.status(200).send(audio);
  } catch (error) {
    res.status(
      error instanceof MusicError ? error.status : 500
    ).json({
      ok: false,
      error:
        error instanceof MusicError
          ? error.message
          : "Ustvarjanje glasbe ni uspelo."
    });
  }
}