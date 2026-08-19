import { generateGrowthPlan } from "../../src/services/growth.js";
import { escapeHtml, list, page, wantsJson } from "../../src/services/html.js";

export const config = {
  maxDuration: 30,
};

function renderSample(title: string, text: string) {
  return `
    <article class="card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
    </article>
  `;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  const generatedAt = new Date().toISOString();
  const plan = generateGrowthPlan();

  if (!wantsJson(req, "/agent/growth")) {
    const body = `
      <section class="hero">
        <div>
          <div class="eyebrow">Growth Plan</div>
          <h1>Free distribution for the Base/Zora agent.</h1>
          <p class="lead">${escapeHtml(plan.positioning)} The plan turns product proof into weekly public updates, creator examples, and grant-friendly evidence.</p>
        </div>
        <div class="stat">
          <strong>${escapeHtml(plan.primaryCta)}</strong>
          <span>First revenue experiment</span>
        </div>
      </section>

      <section class="section">
        <h2>Weekly Loop</h2>
        <div class="band">${list(plan.weeklyLoop)}</div>
      </section>

      <section class="section">
        <h2>Free Promotion Channels</h2>
        <div class="grid two">
          ${plan.channels.map((channel) => `
            <article class="card">
              <div class="eyebrow">${escapeHtml(channel.name)}</div>
              <h3>${escapeHtml(channel.audience)}</h3>
              <p>${escapeHtml(channel.freeTactic)}</p>
              <p><strong>Proof:</strong> ${escapeHtml(channel.proofToShare)}</p>
              <p><strong>Cadence:</strong> ${escapeHtml(channel.cadence)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="section">
        <h2>Ready-to-Use Posts</h2>
        <div class="grid">
          ${renderSample("X", plan.samplePosts.x)}
          ${renderSample("Farcaster", plan.samplePosts.farcaster)}
          ${renderSample("Facebook", plan.samplePosts.facebook)}
        </div>
      </section>

      <section class="section">
        <div class="band">
          <strong>Safety boundary:</strong> ${escapeHtml(plan.safetyBoundary)}
        </div>
      </section>
    `;

    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(page("Zora Genesis Growth Plan", body));
    return;
  }

  res.status(200).json({
    ok: true,
    service: "zora-genesis",
    generatedAt,
    plan,
  });
}
