import { config } from "../../src/config.js";
import { getAgentProfile } from "../../src/profile.js";
import { escapeHtml, page, tags, wantsJson } from "../../src/services/html.js";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  const profile = getAgentProfile();
  const body = `
    <section class="hero">
      <div>
        <div class="eyebrow">Agent Profile</div>
        <h1>${escapeHtml(profile.display_name)}</h1>
        <p class="lead">${escapeHtml(profile.bio)}</p>
      </div>
      <div class="stat"><strong>${escapeHtml(profile.alias)}</strong><span>hcs-10 agent profile</span></div>
    </section>

    <section class="section">
      <h2>Identity</h2>
      <div class="grid">
        <article class="card"><h3>Creator</h3><p>${escapeHtml(profile.aiAgent.creator)}</p></article>
        <article class="card"><h3>Model</h3><p>${escapeHtml(profile.aiAgent.model)}</p></article>
        <article class="card"><h3>Base account</h3><p><code>${escapeHtml(profile.base_account ?? "not configured")}</code></p></article>
      </div>
    </section>

    <section class="section">
      <h2>Capabilities</h2>
      <div class="band">${tags(profile.aiAgent.capabilities.map(String))}</div>
    </section>

    <section class="section">
      <h2>Endpoints</h2>
      <div class="grid two">
        <article class="card"><h3>Agent endpoint</h3><code>${escapeHtml(config.agentEndpoint)}</code></article>
        <article class="card"><h3>Public URL</h3><a href="${escapeHtml(config.agentPublicUrl)}">${escapeHtml(config.agentPublicUrl)}</a></article>
      </div>
    </section>
  `;

  if (!wantsJson(req, "/agent/profile")) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(page("Zora Genesis Profile", body));
    return;
  }

  res.status(200).json({
    profile,
    endpoint: config.agentEndpoint,
    publicUrl: config.agentPublicUrl,
    communicationProtocol: "hcs-10",
  });
}
