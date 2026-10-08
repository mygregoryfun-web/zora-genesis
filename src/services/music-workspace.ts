export function musicWorkspace() {
  return String.raw`
<section class="panel" id="musicWorkspace" style="margin-top:16px">
  <h2>Glasbeni studio</h2>
  <p>Ustvarjanje glasbe prek ACEMusic je trenutno na voljo prijavljenemu skrbniku. Veljajo omejitve ponudnika.</p>

  <div class="two" style="margin-top:12px">
    <label>Slog
      <select id="musicStyle">
        <option value="pop rock ballad">Pop-rock</option>
        <option value="pop">Pop</option>
        <option value="rock">Rock</option>
        <option value="acoustic ballad">Akustična balada</option>
        <option value="electronic dance">Elektronska</option>
        <option value="advertising jingle">Jingle</option>
      </select>
    </label>

    <label>Glas
      <select id="musicVoice">
        <option value="warm deep male baritone">Moški — globok</option>
        <option value="slightly raspy male rock vocals">Moški — hripav</option>
        <option value="warm expressive female vocals">Ženski — topel</option>
        <option value="male and female vocal duet">Duet</option>
        <option value="instrumental">Instrumental</option>
      </select>
    </label>

    <label>Trajanje v sekundah
      <input id="musicDuration" type="number" min="10" max="120" value="30">
    </label>

    <label>Jezik petja
      <select id="musicLanguage">
        <option value="sl">Slovenščina</option>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </label>
  </div>

  <label>Opis glasbe in vzdušja
    <textarea id="musicPrompt" rows="3" maxlength="3500"></textarea>
  </label>

  <label>Besedilo pesmi
    <textarea id="musicLyrics" rows="8" maxlength="12000"></textarea>
  </label>

  <div class="actions">
    <button type="button" class="secondary" id="musicUsePost">Uporabi besedilo objave</button>
    <button type="button" id="musicGenerate">Ustvari glasbo</button>
    <a class="button secondary" id="musicDownload" download="studio-music.mp3" hidden>Prenesi MP3</a>
  </div>

  <div class="status" id="musicStatus" role="status" aria-live="polite"></div>
  <audio id="musicAudio" controls hidden style="width:100%;margin-top:12px"></audio>

  <p class="small">Izbira glasu usmerja generator, ne zagotavlja istega pevca. Zvok prenesi pred osvežitvijo strani. Še ni vključen v izvoz videa.</p>
</section>`;
}

export function musicWorkspaceScript() {
  return String.raw`
<script>
(() => {
  const el = id => document.getElementById(id);
  const status = message => {
    el("musicStatus").textContent = message;
  };

  el("musicUsePost").onclick = () => {
    const post = el("postText");
    if (post) el("musicLyrics").value = post.value;
  };

  let audioUrl;

  el("musicGenerate").onclick = async () => {
    const prompt = el("musicPrompt").value.trim();
    const lyrics = el("musicLyrics").value.trim();
    const instrumental = el("musicVoice").value === "instrumental";

    if (!prompt) {
      status("Vnesi opis glasbe.");
      return;
    }

    if (!instrumental && !lyrics) {
      status("Za petje vnesi besedilo.");
      return;
    }

    if (!el("musicDuration").reportValidity()) return;

    const button = el("musicGenerate");
    button.disabled = true;
    status("Ustvarjam glasbo ...");

    try {
      const description = [
        el("musicStyle").value,
        el("musicVoice").value,
        "Clear pronunciation. " + prompt
      ].join(". ");

      const response = await fetch("/api/music", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: description,
          lyrics,
          duration: Number(el("musicDuration").value),
          language: el("musicLanguage").value,
          instrumental
        })
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(
          problem.error || "Ustvarjanje ni uspelo."
        );
      }

      if (
        !String(response.headers.get("content-type"))
          .startsWith("audio/")
      ) {
        throw new Error("Streznik ni vrnil zvoka.");
      }

      const audio = await response.blob();

      if (!audio.size) {
        throw new Error("Zvok je prazen.");
      }

      el("musicAudio").pause();

      if (audioUrl) URL.revokeObjectURL(audioUrl);

      audioUrl = URL.createObjectURL(audio);
      el("musicAudio").src = audioUrl;
      el("musicAudio").hidden = false;
      el("musicAudio").load();

      el("musicDownload").href = audioUrl;
      el("musicDownload").hidden = false;

      status("Glasba je pripravljena.");
    } catch (error) {
      status(error.message || "Ustvarjanje ni uspelo.");
    } finally {
      button.disabled = false;
    }
  };

  el("musicAudio").onerror = () => {
    status("Brskalnik ne more predvajati zvoka.");
  };

  window.addEventListener("pagehide", () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  });
})();
</script>`;
}