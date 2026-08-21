import { createNftDraft } from "../../src/services/nft-draft.js";
import { escapeHtml, page, wantsJson } from "../../src/services/html.js";

export const config = { maxDuration: 30 };

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const draft = createNftDraft();
  if (wantsJson(req, "/agent/nft")) {
    return res.status(200).json({ ok: true, service: "zora-genesis", draft });
  }

  const body = `
    <section class="hero">
      <div>
        <div class="eyebrow">Article-to-NFT Studio</div>
        <h1>${escapeHtml(draft.name)}</h1>
        <p class="lead">One NFT-ready artwork generated from the latest saved article prompt, without a paid image API.</p>
      </div>
      <div class="stat"><strong>1</strong><span>NFT draft · not minted</span></div>
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
