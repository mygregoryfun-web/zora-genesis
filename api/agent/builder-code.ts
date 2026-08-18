import { getBuilderCodeAttribution } from "../../src/services/base-builder.js";
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

  const generatedAt = new Date().toISOString();
  const builderCode = getBuilderCodeAttribution();
  const body = `
    <section class="hero">
      <div>
        <div class="eyebrow">Base Builder Code</div>
        <h1>Attribution layer for Zora Genesis activity.</h1>
        <p class="lead">${escapeHtml(builderCode.attribution)} This helps connect future app, wallet, and agent activity back to the builder.</p>
      </div>
      <div class="stat"><strong>${escapeHtml(builderCode.builderCode)}</strong><span class="${builderCode.valid ? "ok" : "bad"}">${builderCode.valid ? "valid format" : "invalid format"}</span></div>
    </section>

    <section class="section">
      <h2>Usage</h2>
      <div class="grid">
        ${builderCode.usage.map((item) => `<article class="card"><p>${escapeHtml(item)}</p></article>`).join("")}
      </div>
    </section>

    <section class="section">
      <h2>Integration Targets</h2>
      <div class="band">${tags(builderCode.integrationTargets)}</div>
    </section>

    <section class="section">
      <div class="band"><strong>Safety boundary:</strong> ${escapeHtml(builderCode.safetyBoundary)}</div>
    </section>
  `;

  if (!wantsJson(req, "/agent/builder-code")) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(page("Zora Genesis Builder Code", body));
    return;
  }

  res.status(200).json({
    ok: true,
    service: "zora-genesis",
    generatedAt,
    builderCode,
  });
}
