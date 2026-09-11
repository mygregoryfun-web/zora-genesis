import "dotenv/config";

import http from "node:http";
import { config } from "./config.js";
import { runAgent } from "./agent.js";
import { getAgentProfile } from "./profile.js";
import { fetchMarketData } from "./services/market.js";
import { generateOpportunities } from "./services/opportunities.js";
import { fetchTrends } from "./services/trends.js";
import { generateMonetizationPlan } from "./services/monetization.js";
import { getBuilderCodeAttribution } from "./services/base-builder.js";
import { generateMetrics } from "./services/metrics.js";
import { generateGrowthPlan } from "./services/growth.js";
import { scanContractSecurity, type SecurityNetwork } from "./services/contract-security.js";
import { createNftDraft } from "./services/nft-draft.js";
import { createSocialDraft } from "./services/social-draft.js";
import { createRunwayImageToVideoTask, getRunwayTask, type RunwayVideoInput } from "./services/runway-video.js";

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendHtml(res: http.ServerResponse, statusCode: number, html: string) {
  res.writeHead(statusCode, {
    "content-type": "text/html; charset=utf-8",
  });
  res.end(html);
}

function readJsonBody<T>(req: http.IncomingMessage, maxBytes = 6_000_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve((text ? JSON.parse(text) : {}) as T);
      } catch {
        reject(new Error("Invalid JSON request body."));
      }
    });

    req.on("error", reject);
  });
}

export function previewPage() {
  return `<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Social Draft Preview</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f3ef;
      --paper: #fffdf9;
      --ink: #191715;
      --muted: #706a63;
      --line: #ddd5cb;
      --accent: #8c4b35;
      --accent-2: #1f6f64;
      --soft: #efe7de;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--ink);
    }
    main {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
      padding: 22px 0 40px;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 0;
      border-bottom: 1px solid var(--line);
      margin-bottom: 18px;
    }
    h1 {
      margin: 0;
      font-size: clamp(28px, 5vw, 48px);
      line-height: 1;
      letter-spacing: 0;
    }
    .lead {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 15px;
    }
    button {
      min-height: 42px;
      border: 1px solid var(--accent);
      border-radius: 8px;
      padding: 0 14px;
      background: var(--accent);
      color: #fff;
      font-weight: 750;
      cursor: pointer;
    }
    button.secondary {
      background: var(--paper);
      color: var(--ink);
      border-color: var(--line);
    }
    button:disabled {
      opacity: .55;
      cursor: progress;
    }
    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    .link-button {
      min-height: 42px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0 14px;
      background: var(--paper);
      color: var(--ink);
      font-weight: 750;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    .grid {
      display: grid;
      grid-template-columns: 390px minmax(0, 1fr);
      gap: 14px;
      align-items: start;
    }
    .panel {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(25, 23, 21, .04);
    }
    .image-box {
      aspect-ratio: 4 / 5;
      border-radius: 8px;
      background: var(--soft);
      display: grid;
      place-items: center;
      overflow: hidden;
      color: var(--muted);
      text-align: center;
      padding: 16px;
    }
    .image-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .tab.active {
      background: var(--accent-2);
      border-color: var(--accent-2);
      color: #fff;
    }
    textarea {
      width: 100%;
      min-height: 430px;
      resize: vertical;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: #fff;
      color: var(--ink);
      font: 16px/1.5 ui-sans-serif, system-ui, sans-serif;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-top: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    .status {
      color: var(--muted);
      font-size: 14px;
    }
    .meta {
      margin-top: 12px;
      color: var(--muted);
      font-size: 13px;
      word-break: break-word;
    }
    .topic-bar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 120px auto;
      gap: 10px;
      margin-bottom: 14px;
      align-items: end;
    }
    .topic-bar label {
      display: grid;
      gap: 6px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }
    .topic-bar input,
    .topic-bar select {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0 12px;
      background: #fff;
      color: var(--ink);
      font: inherit;
    }
    @media (max-width: 840px) {
      header, .grid { grid-template-columns: 1fr; }
      header { align-items: flex-start; flex-direction: column; }
      .grid { display: grid; }
      textarea { min-height: 340px; }
      .topic-bar { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Predogled objave</h1>
        <p class="lead">Agent pripravi tekst in sliko. Objaviš šele ti, ročno.</p>
      </div>
      <div class="header-actions">
        <a class="link-button" href="/video">Foto v video</a>
        <button id="generate">Ustvari nov osnutek</button>
      </div>
    </header>

    <section class="grid">
      <aside class="panel">
        <div class="image-box" id="imageBox">Klikni “Ustvari nov osnutek”.</div>
        <div class="meta" id="imageMeta"></div>
      </aside>

      <section class="panel">
        <div class="topic-bar">
          <label>
            Tema objave
            <input id="topic" type="text" placeholder="Npr. ponos, prevara, denar, zaupanje..." />
          </label>
          <label>
            Jezik
            <select id="language">
              <option value="si">SI</option>
              <option value="eng">ENG</option>
              <option value="esp">ESP</option>
            </select>
          </label>
          <button id="addTopic" class="secondary" type="button">Dodaj temo</button>
        </div>
        <div class="tabs">
          <button class="secondary tab active" data-channel="facebook">Facebook</button>
          <button class="secondary tab" data-channel="instagram">Instagram</button>
          <button class="secondary tab" data-channel="x">X</button>
        </div>
        <textarea id="text" spellcheck="true" placeholder="Tukaj bo tekst za kopiranje."></textarea>
        <div class="toolbar">
          <div>
            <button id="copyText" class="secondary">Kopiraj tekst</button>
            <button id="copyImage" class="secondary">Kopiraj sliko</button>
          </div>
          <span class="status" id="status">Pripravljeno.</span>
        </div>
      </section>
    </section>
  </main>

  <script>
    let draft = null;
    let activeChannel = "facebook";
    const generate = document.getElementById("generate");
    const status = document.getElementById("status");
    const text = document.getElementById("text");
    const topic = document.getElementById("topic");
    const language = document.getElementById("language");
    const imageBox = document.getElementById("imageBox");
    const imageMeta = document.getElementById("imageMeta");

    function setStatus(value) {
      status.textContent = value;
    }

    function renderDraft() {
      if (!draft) return;
      const channel = draft.channels[activeChannel];
      text.value = channel ? channel.text : "";

      if (draft.image && draft.image.dataUrl) {
        imageBox.innerHTML = "";
        const img = document.createElement("img");
        img.src = draft.image.dataUrl;
        img.alt = "Predogled generirane slike";
        imageBox.appendChild(img);
        imageMeta.textContent = draft.image.filename || "";
      } else {
        imageBox.textContent = "Slika ni bila ustvarjena.";
        imageMeta.textContent = "";
      }
    }

    document.querySelectorAll(".tab").forEach((button) => {
      button.addEventListener("click", () => {
        activeChannel = button.dataset.channel;
        document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        renderDraft();
      });
    });

    generate.addEventListener("click", async () => {
      generate.disabled = true;
      setStatus("Ustvarjam tekst in sliko...");
      try {
        const response = await fetch("/agent/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topic.value.trim(), language: language.value }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Draft failed");
        draft = data.draft;
        renderDraft();
        setStatus("Osnutek pripravljen. Nič ni bilo objavljeno.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : String(error));
      } finally {
        generate.disabled = false;
      }
    });

    document.getElementById("addTopic").addEventListener("click", () => {
      generate.click();
    });

    document.getElementById("copyText").addEventListener("click", async () => {
      await navigator.clipboard.writeText(text.value);
      setStatus("Tekst kopiran.");
    });

    document.getElementById("copyImage").addEventListener("click", async () => {
      if (!draft?.image?.dataUrl) {
        setStatus("Ni slike za kopiranje.");
        return;
      }
      const blob = await fetch(draft.image.dataUrl).then((response) => response.blob());
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setStatus("Slika kopirana.");
    });
  </script>
</body>
</html>`;
}

export function videoEditorPage() {
  return `<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Foto v video</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f3ef;
      --paper: #fffdf9;
      --ink: #191715;
      --muted: #706a63;
      --line: #ddd5cb;
      --accent: #8c4b35;
      --accent-2: #1f6f64;
      --soft: #efe7de;
      --dark: #151312;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--ink);
    }
    main {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
      padding: 22px 0 40px;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 0;
      border-bottom: 1px solid var(--line);
      margin-bottom: 18px;
    }
    h1 {
      margin: 0;
      font-size: clamp(28px, 5vw, 48px);
      line-height: 1;
      letter-spacing: 0;
    }
    .lead {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 15px;
    }
    a, button, input, select, textarea { font: inherit; }
    a {
      color: var(--accent-2);
      text-decoration: none;
      font-weight: 750;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(300px, 390px) minmax(0, 1fr);
      gap: 14px;
      align-items: start;
    }
    .panel {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(25, 23, 21, .04);
    }
    .controls {
      display: grid;
      gap: 13px;
    }
    label {
      display: grid;
      gap: 6px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 720;
    }
    input[type="file"], input[type="text"], input[type="number"], select, textarea {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--ink);
      padding: 10px 11px;
    }
    textarea {
      min-height: 86px;
      resize: vertical;
      line-height: 1.45;
    }
    input[type="range"] { width: 100%; }
    .row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin-top: 4px;
    }
    button {
      min-height: 42px;
      border: 1px solid var(--accent);
      border-radius: 8px;
      padding: 0 14px;
      background: var(--accent);
      color: #fff;
      font-weight: 780;
      cursor: pointer;
    }
    button.secondary {
      background: var(--paper);
      color: var(--ink);
      border-color: var(--line);
    }
    button:disabled {
      opacity: .55;
      cursor: progress;
    }
    .stage {
      display: grid;
      place-items: center;
      min-height: 620px;
      background:
        linear-gradient(135deg, rgba(31, 111, 100, .08), transparent 38%),
        var(--paper);
    }
    .canvas-wrap {
      width: min(100%, 390px);
      display: grid;
      gap: 12px;
      justify-items: center;
    }
    canvas {
      width: 100%;
      height: auto;
      border-radius: 8px;
      background: var(--dark);
      box-shadow: 0 18px 50px rgba(25, 23, 21, .18);
    }
    .status {
      color: var(--muted);
      font-size: 14px;
      text-align: center;
      min-height: 22px;
    }
    .download {
      display: none;
      min-height: 42px;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      padding: 0 14px;
      color: #fff;
      background: var(--accent-2);
    }
    .download.show { display: inline-flex; }
    .hint {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.45;
    }
    .credit-panel {
      display: grid;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
    }
    .credit-panel h2 {
      margin: 0;
      font-size: 16px;
      line-height: 1.2;
    }
    .credit-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .credit-card {
      min-height: 86px;
      display: grid;
      gap: 4px;
      align-content: start;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      color: var(--ink);
      background: var(--paper);
    }
    .credit-card strong {
      font-size: 15px;
    }
    .credit-card span {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.35;
    }
    .credit-note {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.45;
    }
    @media (max-width: 880px) {
      header, .layout { grid-template-columns: 1fr; }
      header {
        align-items: flex-start;
        flex-direction: column;
      }
      .stage { min-height: auto; }
      .credit-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Foto v video</h1>
        <p class="lead">Naloži sliko, dodaj gibanje in napis, izvozi kratek video za Reels, Story ali objavo.</p>
      </div>
      <a href="/preview">Nazaj na predogled objave</a>
    </header>

    <section class="layout">
      <aside class="panel controls">
        <label>
          Slika
          <input id="file" type="file" accept="image/*" />
        </label>

        <div class="row">
          <label>
            Format
            <select id="aspect">
              <option value="9:16">Reels / Story 9:16</option>
              <option value="1:1">Kvadrat 1:1</option>
              <option value="16:9">Ležeče 16:9</option>
            </select>
          </label>
          <label>
            Gibanje
            <select id="motion">
              <option value="zoom-in">Počasen približek</option>
              <option value="zoom-out">Počasen odmik</option>
              <option value="pan-left">Premik levo</option>
              <option value="pan-right">Premik desno</option>
              <option value="still">Skoraj mirno</option>
            </select>
          </label>
        </div>

        <div class="row">
          <label>
            Trajanje sekund
            <input id="duration" type="number" min="3" max="20" value="8" />
          </label>
          <label>
            Velikost napisa
            <input id="fontSize" type="range" min="28" max="76" value="46" />
          </label>
        </div>

        <div class="row">
          <label>
            Tema za govor
            <input id="speechTopic" type="text" placeholder="Npr. ponos, izdaja, denar, zaupanje..." />
          </label>
          <label>
            Jezik govora
            <select id="speechLanguage">
              <option value="si">SI</option>
              <option value="eng">ENG</option>
              <option value="esp">ESP</option>
            </select>
          </label>
        </div>
        <button id="generateSpeech" class="secondary" type="button">Ustvari govor</button>

        <label>
          Glavni napis
          <textarea id="headline" placeholder="Npr. Ponos pogosto ne brani resnice. Brani podobo."></textarea>
        </label>

        <label>
          Podpis
          <input id="signature" type="text" value="Fun Gregory" />
        </label>

        <div class="button-row">
          <button id="play" class="secondary">Predvajaj</button>
          <button id="export">Izvozi video</button>
          <button id="aiVideo" type="button">Ustvari AI video</button>
        </div>
        <p class="hint">Predvajaj/izvozi naredi lokalno WebM animacijo. Ustvari AI video uporabi zunanji video model in vrne pravi AI posnetek.</p>

        <section class="credit-panel" aria-label="AI video krediti">
          <h2>AI video krediti</h2>
          <p class="credit-note">Naslednja uporabna verzija: slika in opis se pošljeta v AI video model, tukaj pa vidiš stanje kreditov, ceno posnetka in gumb za zakup.</p>
          <div class="credit-grid">
            <div class="credit-card">
              <strong>Starter</strong>
              <span>5 EUR za kratke teste in 6 do 12 osnutkov.</span>
            </div>
            <div class="credit-card">
              <strong>Creator</strong>
              <span>15 EUR za redne Reels/Story poskuse.</span>
            </div>
            <div class="credit-card">
              <strong>Studio</strong>
              <span>49 EUR za vec variant in boljse modele.</span>
            </div>
          </div>
          <p class="credit-note">Najboljsa prva integracija: Runway Dev API. Poceni osnutek je priblizno 25 do 60 Runway kreditov za 5 sekund, odvisno od modela.</p>
          <button class="secondary" type="button" disabled>Zakup kreditov bo aktiven po Stripe povezavi</button>
        </section>
      </aside>

      <section class="panel stage">
        <div class="canvas-wrap">
          <canvas id="canvas" width="1080" height="1920"></canvas>
          <div class="status" id="status">Naloži sliko in klikni Predvajaj.</div>
          <a id="download" class="download" download="social-video.webm">Prenesi video</a>
          <video id="aiPreview" controls playsinline style="display:none;width:100%;border-radius:8px;background:#151312;"></video>
          <a id="aiDownload" class="download" download="ai-video.mp4">Prenesi AI video</a>
        </div>
      </section>
    </section>
  </main>

  <script>
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const file = document.getElementById("file");
    const aspect = document.getElementById("aspect");
    const motion = document.getElementById("motion");
    const durationInput = document.getElementById("duration");
    const headline = document.getElementById("headline");
    const speechTopic = document.getElementById("speechTopic");
    const speechLanguage = document.getElementById("speechLanguage");
    const signature = document.getElementById("signature");
    const fontSize = document.getElementById("fontSize");
    const status = document.getElementById("status");
    const download = document.getElementById("download");
    const aiPreview = document.getElementById("aiPreview");
    const aiDownload = document.getElementById("aiDownload");
    let imageDataUrl = "";
    let image = null;
    let raf = 0;

    const params = new URLSearchParams(window.location.search);
    if (params.get("topic")) speechTopic.value = params.get("topic");
    if (params.get("language")) speechLanguage.value = params.get("language");
    if (params.get("text")) headline.value = params.get("text");

    function setStatus(value) {
      status.textContent = value;
    }

    function setCanvasSize() {
      if (aspect.value === "1:1") {
        canvas.width = 1080;
        canvas.height = 1080;
      } else if (aspect.value === "16:9") {
        canvas.width = 1920;
        canvas.height = 1080;
      } else {
        canvas.width = 1080;
        canvas.height = 1920;
      }
      drawFrame(0);
    }

    function ease(t) {
      return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function coverRect(img, scale, offsetX, offsetY) {
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = img.width / img.height;
      let width = canvas.width * scale;
      let height = width / imageRatio;
      if (height < canvas.height * scale) {
        height = canvas.height * scale;
        width = height * imageRatio;
      }
      return {
        x: (canvas.width - width) / 2 + offsetX,
        y: (canvas.height - height) / 2 + offsetY,
        width,
        height,
      };
    }

    function wrapText(text, maxWidth, size) {
      const words = text.trim().split(/\\s+/).filter(Boolean);
      const lines = [];
      let line = "";
      for (const word of words) {
        const next = line ? line + " " + word : word;
        if (ctx.measureText(next).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);
      return lines.slice(0, 5);
    }

    function drawTextOverlay() {
      const text = headline.value.trim();
      const byline = signature.value.trim();
      if (!text && !byline) return;

      const pad = Math.round(canvas.width * .07);
      const size = Number(fontSize.value);
      ctx.textBaseline = "top";
      ctx.font = "800 " + size + "px Inter, Arial, sans-serif";
      const lines = wrapText(text, canvas.width - pad * 2, size);
      const lineHeight = Math.round(size * 1.16);
      const boxHeight = lines.length * lineHeight + (byline ? Math.round(size * 1.35) : 0) + pad;
      const y = canvas.height - boxHeight - pad;

      const gradient = ctx.createLinearGradient(0, y - pad, 0, canvas.height);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(.38, "rgba(0,0,0,.62)");
      gradient.addColorStop(1, "rgba(0,0,0,.86)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y - pad, canvas.width, canvas.height - y + pad);

      ctx.fillStyle = "#fffdf9";
      lines.forEach((line, index) => {
        ctx.fillText(line, pad, y + index * lineHeight);
      });

      if (byline) {
        ctx.font = "650 " + Math.round(size * .46) + "px Inter, Arial, sans-serif";
        ctx.fillStyle = "rgba(255,253,249,.84)";
        ctx.fillText("- " + byline, pad, y + lines.length * lineHeight + Math.round(size * .42));
      }
    }

    function drawFrame(progress) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#151312";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!image) {
        ctx.fillStyle = "#efe7de";
        ctx.font = "700 42px Inter, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Naloži sliko", canvas.width / 2, canvas.height / 2 - 24);
        ctx.font = "400 28px Inter, Arial, sans-serif";
        ctx.fillText("potem izberi gibanje in izvozi video", canvas.width / 2, canvas.height / 2 + 28);
        ctx.textAlign = "left";
        return;
      }

      const t = ease(progress);
      const maxShift = Math.round(canvas.width * .09);
      let scale = 1.08;
      let offsetX = 0;
      let offsetY = 0;

      if (motion.value === "zoom-in") scale = 1.03 + t * .12;
      if (motion.value === "zoom-out") scale = 1.15 - t * .10;
      if (motion.value === "pan-left") offsetX = maxShift - t * maxShift * 2;
      if (motion.value === "pan-right") offsetX = -maxShift + t * maxShift * 2;
      if (motion.value === "still") scale = 1.04 + Math.sin(t * Math.PI) * .025;

      const rect = coverRect(image, scale, offsetX, offsetY);
      ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
      drawTextOverlay();
    }

    function playPreview() {
      cancelAnimationFrame(raf);
      const started = performance.now();
      const duration = Math.max(3, Math.min(20, Number(durationInput.value) || 8)) * 1000;

      function loop(now) {
        const progress = Math.min(1, (now - started) / duration);
        drawFrame(progress);
        if (progress < 1) raf = requestAnimationFrame(loop);
      }

      raf = requestAnimationFrame(loop);
    }

    file.addEventListener("change", () => {
      const selected = file.files && file.files[0];
      if (!selected) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          image = img;
          drawFrame(0);
          setStatus("Slika pripravljena.");
        };
        imageDataUrl = String(reader.result);
        img.src = imageDataUrl;
      };
      reader.readAsDataURL(selected);
    });

    function runwayRatio() {
      if (aspect.value === "16:9") return "1280:720";
      if (aspect.value === "1:1") return "960:960";
      return "720:1280";
    }

    function aiDuration() {
      return Number(durationInput.value) > 7 ? 10 : 5;
    }

    async function pollVideoTask(taskId) {
      for (let attempt = 0; attempt < 36; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, attempt < 2 ? 2500 : 5000));
        const response = await fetch("/api/video/task?id=" + encodeURIComponent(taskId));
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Video status failed.");
        }

        const task = data.task;
        setStatus("AI video status: " + (task.status || "processing"));
        if (task.status === "SUCCEEDED" && task.output && task.output[0]) {
          return task.output[0];
        }
        if (task.status === "FAILED" || task.status === "CANCELED") {
          throw new Error("AI video ni uspel: " + task.status);
        }
      }

      throw new Error("AI video se predolgo ustvarja. Poskusi preveriti kasneje.");
    }

    aspect.addEventListener("change", setCanvasSize);
    motion.addEventListener("change", () => drawFrame(0));
    headline.addEventListener("input", () => drawFrame(0));
    signature.addEventListener("input", () => drawFrame(0));
    fontSize.addEventListener("input", () => drawFrame(0));
    document.getElementById("play").addEventListener("click", playPreview);
    document.getElementById("generateSpeech").addEventListener("click", async () => {
      const topic = speechTopic.value.trim();
      if (!topic) {
        setStatus("Najprej vpiši temo za govor.");
        return;
      }

      const button = document.getElementById("generateSpeech");
      button.disabled = true;
      try {
        setStatus("Ustvarjam govor...");
        const response = await fetch("/agent/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, language: speechLanguage.value }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Speech draft failed.");
        }

        const source = data.draft.source;
        headline.value = source.post;
        drawFrame(0);
        setStatus("Govor je pripravljen in uporabljen kot opis videa.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Govor ni uspel.");
      } finally {
        button.disabled = false;
      }
    });
    document.getElementById("aiVideo").addEventListener("click", async () => {
      if (!imageDataUrl) {
        setStatus("Najprej naloži sliko.");
        return;
      }

      const promptText = headline.value.trim() || "Subtle cinematic movement, natural light, elegant social media video, realistic details.";
      const button = document.getElementById("aiVideo");
      button.disabled = true;
      aiPreview.style.display = "none";
      aiDownload.classList.remove("show");

      try {
        setStatus("Pošiljam sliko v AI video model...");
        const response = await fetch("/api/video/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gen4_turbo",
            promptImage: imageDataUrl,
            promptText,
            ratio: runwayRatio(),
            duration: aiDuration(),
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "AI video generation failed.");
        }

        const videoUrl = await pollVideoTask(data.task.id);
        aiPreview.src = videoUrl;
        aiPreview.style.display = "block";
        aiDownload.href = videoUrl;
        aiDownload.download = "ai-video-" + Date.now() + ".mp4";
        aiDownload.classList.add("show");
        setStatus("AI video je pripravljen.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "AI video ni uspel.");
      } finally {
        button.disabled = false;
      }
    });

    document.getElementById("export").addEventListener("click", async () => {
      if (!image) {
        setStatus("Najprej naloži sliko.");
        return;
      }

      download.classList.remove("show");
      setStatus("Izvažam video...");
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        download.href = url;
        download.download = "foto-v-video-" + Date.now() + ".webm";
        download.classList.add("show");
        setStatus("Video pripravljen za prenos.");
      };

      recorder.start();
      playPreview();
      setTimeout(() => recorder.stop(), Math.max(3, Math.min(20, Number(durationInput.value) || 8)) * 1000 + 150);
    });

    setCanvasSize();
  </script>
</body>
</html>`;
}

function isAuthorized(req: http.IncomingMessage) {
  if (!config.agentRunToken || !config.agentAllowedUserId) {
    return false;
  }

  return (
    req.headers.authorization === `Bearer ${config.agentRunToken}` &&
    req.headers["x-user-id"] === config.agentAllowedUserId
  );
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "zora-genesis",
      dryRun: config.dryRun,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/preview") {
    sendHtml(res, 200, previewPage());
    return;
  }

  if (req.method === "GET" && url.pathname === "/video") {
    sendHtml(res, 200, videoEditorPage());
    return;
  }

  if (req.method === "POST" && url.pathname === "/agent/draft") {
    try {
      const body = await readJsonBody<{ topic?: string; language?: string; tone?: string; length?: string; imageStyle?: "social-editorial" | "artwork-cover" | "contradictory-art"; includeImage?: boolean }>(req).catch(() => ({
        topic: "",
        language: "si",
        tone: "my-style",
        length: "medium",
        imageStyle: "social-editorial",
        includeImage: true,
      }));
      const imageStyle =
        body.imageStyle === "artwork-cover" || body.imageStyle === "contradictory-art"
          ? body.imageStyle
          : "social-editorial";
      sendJson(res, 200, {
        ok: true,
        draft: await createSocialDraft({ topic: body.topic, language: body.language, tone: body.tone, length: body.length, imageStyle, includeImage: body.includeImage }),
      });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return;
  }

  if (req.method === "POST" && url.pathname === "/api/video/generate") {
    try {
      const body = await readJsonBody<RunwayVideoInput>(req);
      sendJson(res, 200, {
        ok: true,
        task: await createRunwayImageToVideoTask(body),
      });
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : "Video generation failed",
      });
    }

    return;
  }

  if (req.method === "GET" && url.pathname === "/api/video/task") {
    try {
      sendJson(res, 200, {
        ok: true,
        task: await getRunwayTask(url.searchParams.get("id") ?? ""),
      });
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : "Video task lookup failed",
      });
    }

    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/profile") {
    sendJson(res, 200, {
      profile: getAgentProfile(),
      endpoint: config.agentEndpoint,
      publicUrl: config.agentPublicUrl,
      communicationProtocol: "hcs-10",
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/opportunities") {
    try {
      const trends = fetchTrends();
      const market = await fetchMarketData();
      sendJson(res, 200, {
        generatedAt: new Date().toISOString(),
        positioning: "Base/Zora opportunity engine for new asset creation, token launchpads, consumer apps, and agent-assisted creator workflows.",
        disclaimer: "Opportunities are builder/product signals, not financial advice or trading instructions.",
        opportunities: generateOpportunities({ trends, market }),
      });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/monetization") {
    sendJson(res, 200, {
      generatedAt: new Date().toISOString(),
      disclaimer: "Monetization ideas sell workflow and creator intelligence, not trading advice or autonomous execution.",
      plan: generateMonetizationPlan(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/growth") {
    sendJson(res, 200, {
      ok: true,
      service: "zora-genesis",
      generatedAt: new Date().toISOString(),
      plan: generateGrowthPlan(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/builder-code") {
    sendJson(res, 200, {
      ok: true,
      service: "zora-genesis",
      generatedAt: new Date().toISOString(),
      builderCode: getBuilderCodeAttribution(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/metrics") {
    sendJson(res, 200, {
      ok: true,
      service: "zora-genesis",
      metrics: generateMetrics(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/security") {
    const address = url.searchParams.get("address") ?? "";
    const network = (url.searchParams.get("network") ?? "base") as SecurityNetwork;
    if (!address || !["base", "base-sepolia"].includes(network)) {
      sendJson(res, 400, { ok: false, error: "Provide address and a valid network (base or base-sepolia)." });
      return;
    }

    try {
      sendJson(res, 200, { ok: true, report: await scanContractSecurity({ address, network }) });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error instanceof Error ? error.message : "Scan failed" });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/nft") {
    sendJson(res, 200, { ok: true, draft: createNftDraft() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/agent/run") {
    if (!isAuthorized(req)) {
      sendJson(res, 403, {
        ok: false,
        error: "Valid AGENT_RUN_TOKEN and x-user-id are required to trigger the agent over HTTP.",
      });
      return;
    }

    try {
      await runAgent();
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: "Not found",
  });
});

if (!process.env.VERCEL) {
  server.listen(config.port, () => {
    console.log(`Zora Genesis endpoint listening on port ${config.port}`);
  });
}
