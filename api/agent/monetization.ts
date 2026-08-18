import { generateMonetizationPlan } from "../../src/services/monetization.js";
import type { MonetizationPlan } from "../../src/types.js";

export const config = {
  maxDuration: 30,
};

function wantsJson(req: any) {
  const url = new URL(req.url ?? "/agent/monetization", "https://zora-genesis-t1j9.vercel.app");
  return url.searchParams.get("format") === "json" || String(req.headers.accept ?? "").includes("application/json");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderPage(plan: MonetizationPlan, generatedAt: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="base:app_id" content="69af0091f6467f4d78d304ac" />
  <title>Zora Genesis Monetization</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #12141a;
      --muted: #626b7a;
      --line: #d9e1ee;
      --paper: #f6f8fc;
      --panel: #ffffff;
      --blue: #0052ff;
      --green: #11845b;
      --amber: #a76100;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.48;
    }
    header, main, footer {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
    }
    header {
      padding: 22px 0 16px;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--line);
    }
    .brand { font-weight: 780; }
    nav { display: flex; gap: 12px; flex-wrap: wrap; font-size: 14px; }
    a { color: var(--blue); text-decoration: none; }
    a:hover { text-decoration: underline; }
    main { padding: 28px 0 10px; }
    .hero {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 26px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 22px;
    }
    .eyebrow {
      color: var(--blue);
      font-size: 13px;
      font-weight: 760;
      margin-bottom: 12px;
    }
    h1 {
      margin: 0;
      font-size: clamp(34px, 4.5vw, 56px);
      line-height: 1;
      letter-spacing: 0;
    }
    .lead {
      margin: 16px 0 0;
      max-width: 780px;
      color: var(--muted);
      font-size: 18px;
    }
    .summary {
      border-left: 4px solid var(--blue);
      padding-left: 14px;
      align-self: center;
    }
    .summary strong {
      display: block;
      font-size: 28px;
      margin-bottom: 4px;
    }
    .summary span { color: var(--muted); font-size: 14px; }
    .section { padding: 18px 0 0; }
    .section h2 {
      margin: 0 0 12px;
      font-size: 19px;
    }
    .tiers, .products {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      min-height: 230px;
    }
    .card.highlight { border-color: var(--blue); box-shadow: inset 0 3px 0 var(--blue); }
    .card h3 { margin: 0 0 8px; font-size: 17px; }
    .price {
      font-size: 30px;
      font-weight: 800;
      margin: 4px 0;
    }
    .price small {
      color: var(--muted);
      font-size: 14px;
      font-weight: 500;
    }
    .audience, .note {
      color: var(--muted);
      font-size: 14px;
      margin: 0 0 12px;
    }
    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 25px;
      padding: 0 9px;
      border-radius: 999px;
      background: #edf2ff;
      color: var(--blue);
      font-size: 12px;
      font-weight: 760;
      margin: 0 6px 6px 0;
    }
    ul {
      margin: 10px 0 0;
      padding-left: 18px;
    }
    li {
      color: var(--muted);
      font-size: 14px;
      margin: 4px 0;
    }
    .band {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
    }
    .band strong { color: var(--green); }
    .risk strong { color: var(--amber); }
    footer {
      padding: 22px 0 34px;
      color: var(--muted);
      font-size: 14px;
    }
    @media (max-width: 900px) {
      header, .hero { grid-template-columns: 1fr; flex-direction: column; }
      .tiers, .products { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">Zora Genesis</div>
    <nav>
      <a href="/">Dashboard</a>
      <a href="/agent/opportunities">Opportunities</a>
      <a href="/agent/metrics">Metrics</a>
      <a href="/agent/monetization?format=json">JSON</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div>
        <div class="eyebrow">Revenue Model</div>
        <h1>Monetization for Base/Zora creator intelligence.</h1>
        <p class="lead">${escapeHtml(plan.positioning)} The model sells useful workflow, brief generation, and setup help while avoiding trading advice or autonomous financial execution.</p>
      </div>
      <div class="summary">
        <strong>$19-$49/mo</strong>
        <span>Subscription path plus pay-per-brief and setup revenue.</span>
      </div>
    </section>

    <section class="section">
      <h2>Pricing Tiers</h2>
      <div class="tiers">
        ${plan.tiers.map((tier) => `
          <article class="card ${tier.id === "pro-creator" ? "highlight" : ""}">
            <h3>${escapeHtml(tier.name)}</h3>
            <div class="price">$${tier.priceUsdMonthly}<small>/mo</small></div>
            <p class="audience">${escapeHtml(tier.audience)}</p>
            ${list(tier.included)}
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <h2>Products</h2>
      <div class="products">
        ${plan.products.map((product) => `
          <article class="card">
            <h3>${escapeHtml(product.name)}</h3>
            <p class="note"><strong>${escapeHtml(product.revenueHypothesis)}</strong></p>
            <p class="note">${escapeHtml(product.userValue)}</p>
            <div>${product.baseFit.map((fit) => `<span class="tag">${escapeHtml(fit)}</span>`).join("")}</div>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <div class="band">
        <strong>Next experiment:</strong> ${escapeHtml(plan.nextExperiment)}
      </div>
    </section>

    <section class="section">
      <div class="band risk">
        <strong>Safety boundary:</strong> ${escapeHtml(plan.riskNote)}
      </div>
    </section>
  </main>
  <footer>
    Generated at ${escapeHtml(generatedAt)}. API JSON remains available at <a href="/agent/monetization?format=json">?format=json</a>.
  </footer>
</body>
</html>`;
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
  const plan = generateMonetizationPlan();

  if (!wantsJson(req)) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(renderPage(plan, generatedAt));
    return;
  }

  res.status(200).json({
    ok: true,
    service: "zora-genesis",
    generatedAt,
    plan,
  });
}
