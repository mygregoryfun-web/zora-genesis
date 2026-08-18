import { generateMetrics } from "../../src/services/metrics.js";
import { escapeHtml, page, tags, wantsJson } from "../../src/services/html.js";

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  const metrics = generateMetrics();
  const body = `
    <section class="hero">
      <div>
        <div class="eyebrow">Proof Metrics</div>
        <h1>Public evidence for Base builder review.</h1>
        <p class="lead">Zora Genesis exposes live proof links across Base, Zora, Farcaster, X, and Builder Codes so reviewers can verify shipped work fast.</p>
      </div>
      <div class="stat"><strong>${metrics.publishedPostCount}</strong><span>saved published posts</span></div>
    </section>

    <section class="section">
      <h2>Channels</h2>
      <div class="band">${tags(metrics.activeChannels)}</div>
    </section>

    <section class="section">
      <h2>Public Proofs</h2>
      <div class="grid two">
        ${metrics.publicProofs.map((proof) => `
          <article class="card">
            <h3>${escapeHtml(proof.label)}</h3>
            ${proof.url ? `<a href="${escapeHtml(proof.url)}"><code>${escapeHtml(proof.value)}</code></a>` : `<code>${escapeHtml(proof.value)}</code>`}
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <h2>Next Milestones</h2>
      <div class="band">${tags(metrics.nextMilestones)}</div>
    </section>
  `;

  if (!wantsJson(req, "/agent/metrics")) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(page("Zora Genesis Metrics", body));
    return;
  }

  res.status(200).json({
    ok: true,
    service: "zora-genesis",
    metrics,
  });
}
