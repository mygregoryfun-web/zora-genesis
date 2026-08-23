import { createNftDraft } from "../../src/services/nft-draft.js";
import { escapeHtml, page, wantsJson } from "../../src/services/html.js";

export const config = { maxDuration: 30 };

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const url = new URL(req.url ?? "/agent/nft", "https://zora-genesis-t1j9.vercel.app");
  const prompt = String(req.query?.prompt ?? url.searchParams.get("prompt") ?? "").trim();
  const random = String(req.query?.mode ?? url.searchParams.get("mode") ?? "") === "random";
  const seed = String(req.query?.seed ?? url.searchParams.get("seed") ?? "").trim();
  const draft = createNftDraft({ prompt, random, seed });
  if (wantsJson(req, "/agent/nft")) {
    return res.status(200).json({ ok: true, service: "zora-genesis", draft });
  }

  const body = `
    <section class="hero visual">
      <div>
        <div class="eyebrow">Article-to-NFT Studio</div>
        <h1>${escapeHtml(draft.name)}</h1>
        <p class="lead">Generate an NFT-ready draft from the latest article, a random Base/Zora concept, or your own prompt. This preview uses local SVG generation, so it does not spend image API credits.</p>
      </div>
      <div class="stat"><strong>1</strong><span>${escapeHtml(draft.generationMode)} · not minted</span></div>
    </section>

    <section class="section">
      <div class="cockpit">
        <div class="radar-panel">
          <div class="eyebrow">NFT Generator</div>
          <div class="radar" aria-hidden="true"></div>
          <div class="check-row"><span>Preview</span><span class="safe-badge">Free</span></div>
          <div class="check-row"><span>Minting</span><span class="safe-badge">Manual</span></div>
        </div>
        <div class="console-panel">
          <div class="console-top"><span>Zora Genesis Studio</span><span>Seed ${escapeHtml(draft.seed)}</span></div>
          <div class="wave" aria-hidden="true"></div>
          <div class="proof-grid">
            <div class="proof-chip"><span>Mode</span><strong>${escapeHtml(draft.generationMode)}</strong></div>
            <div class="proof-chip"><span>Image</span><strong>SVG draft</strong></div>
            <div class="proof-chip"><span>Status</span><strong>Not minted</strong></div>
          </div>
        </div>
        <div class="status-panel">
          <div class="eyebrow">Controls</div>
          <div class="check-row"><span>No wallet</span><span class="safe-badge">Preview</span></div>
          <div class="check-row"><span>No gas</span><span class="safe-badge">Preview</span></div>
          <div class="check-row"><span>No API spend</span><span class="safe-badge">On</span></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="grid two">
        <article class="card highlight">
          <h2>Generate NFT draft</h2>
          <form method="get" action="/agent/nft">
            <label>Custom prompt
              <textarea name="prompt" rows="4" placeholder="Example: Base creator signal map with a luminous Zora launch cockpit">${escapeHtml(prompt)}</textarea>
              <small>Leave empty and use random if you want the agent to choose a concept.</small>
            </label>
            <button type="submit">Generate from prompt</button>
          </form>
          <p style="margin-top:12px"><a class="button" href="/agent/nft?mode=random&seed=${Date.now()}">Generate random concept</a></p>
        </article>
        <article class="card">
          <h2>Why this makes sense</h2>
          <ul>
            <li>Useful for creator asset previews and premium brief examples.</li>
            <li>Free local SVG generation avoids burning image credits.</li>
            <li>Minting stays separate, wallet-signed, and approval-first.</li>
            <li>Later we can add Comfy/OpenAI high-quality image generation as an optional paid upgrade.</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="grid two">
        <article class="card">
          <img src="${draft.image.dataUri}" alt="${escapeHtml(draft.name)}" style="display:block;width:100%;border-radius:8px;border:1px solid #d8e0ec" />
        </article>
        <article class="card">
          <div class="eyebrow">Source article</div>
          <h2>${escapeHtml(draft.sourceArticle.title)}</h2>
          <p>${escapeHtml(draft.description)}</p>
          <h3>Generation prompt</h3>
          <pre>${escapeHtml(draft.imagePrompt)}</pre>
          <p class="warn"><strong>Approval required:</strong> Metadata and a token URI are ready, but the NFT is not minted. Minting needs a wallet signature and may cost gas.</p>
          <p><a class="button primary" href="/agent/nft?format=json">Open metadata JSON</a></p>
        </article>
      </div>
    </section>
  `;

  res.setHeader("content-type", "text/html; charset=utf-8");
  return res.status(200).send(page("Zora Genesis NFT Draft", body));
}
