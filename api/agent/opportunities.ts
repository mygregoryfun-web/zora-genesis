import { fetchMarketData } from "../../src/services/market.js";
import { generateOpportunities } from "../../src/services/opportunities.js";
import { fetchTrends } from "../../src/services/trends.js";
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

  const trends = fetchTrends();
  const market = await fetchMarketData();
  const opportunities = generateOpportunities({ trends, market });
  const body = `
    <section class="hero">
      <div>
        <div class="eyebrow">Opportunity Radar</div>
        <h1>Base/Zora builder signals ranked for action.</h1>
        <p class="lead">The agent turns Base activity, Zora creator momentum, consumer app demand, and prediction-market narratives into practical creator asset opportunities.</p>
      </div>
      <div class="stat"><strong>${opportunities.length}</strong><span>ranked opportunities</span></div>
    </section>

    <section class="section">
      <h2>Top Opportunities</h2>
      <div class="grid two">
        ${opportunities.map((item) => `
          <article class="card ${item.score >= 85 ? "highlight" : ""}">
            <div class="score">${item.score}</div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.whyNow)}</p>
            <div style="margin-top:12px">${tags([item.area, item.confidence, item.suggestedAction])}</div>
            ${item.zoraAssetIdea ? `<p><strong>Zora idea:</strong> ${escapeHtml(item.zoraAssetIdea)}</p>` : ""}
            <p><strong>Builder note:</strong> ${escapeHtml(item.builderNote)}</p>
            <p class="warn"><strong>Risk:</strong> ${escapeHtml(item.riskNote)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;

  if (!wantsJson(req, "/agent/opportunities")) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(page("Zora Genesis Opportunities", body));
    return;
  }

  res.status(200).json({
    ok: true,
    service: "zora-genesis",
    dryRun: true,
    opportunities,
  });
}
