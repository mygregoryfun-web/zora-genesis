const productionUrl = "https://zora-genesis-t1j9.vercel.app";

function page() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="talentapp:project_verification" content="7c6058f9ea0632426fc0a6c3d08ee4877a7fb59563066a6b999211904155a3ebe328ea030b68a2835651423ef9f9c310d2bbf666ee93c3f750ab98ba867b3b60" />
  <meta name="base:app_id" content="69af0091f6467f4d78d304ac" />
  <title>Zora Genesis | Base Creator Agent</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #14151a;
      --muted: #5c6370;
      --line: #d7dde8;
      --paper: #f7f8fb;
      --panel: #ffffff;
      --blue: #0052ff;
      --green: #11845b;
      --amber: #b26b00;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.5;
    }
    header, main, footer {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
    }
    header {
      padding: 28px 0 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      border-bottom: 1px solid var(--line);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 760;
    }
    .mark {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: var(--blue);
      display: grid;
      place-items: center;
      color: white;
      font-weight: 800;
    }
    nav {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      font-size: 14px;
    }
    a { color: var(--blue); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .hero {
      padding: 56px 0 32px;
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(320px, .75fr);
      gap: 28px;
      align-items: start;
    }
    h1 {
      margin: 0;
      max-width: 820px;
      font-size: clamp(40px, 6vw, 76px);
      line-height: .96;
      letter-spacing: 0;
    }
    .lead {
      margin: 22px 0 0;
      max-width: 720px;
      color: var(--muted);
      font-size: 19px;
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 28px;
    }
    .button {
      display: inline-flex;
      align-items: center;
      min-height: 42px;
      padding: 0 16px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--ink);
      font-weight: 650;
    }
    .button.primary {
      background: var(--blue);
      border-color: var(--blue);
      color: white;
    }
    .status {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
    }
    .status h2, .section h2 {
      margin: 0 0 14px;
      font-size: 18px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 0;
      border-top: 1px solid var(--line);
      font-size: 14px;
    }
    .row:first-of-type { border-top: 0; }
    .label { color: var(--muted); }
    .ok { color: var(--green); font-weight: 700; }
    .safe { color: var(--amber); font-weight: 700; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin: 16px 0 34px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      min-height: 176px;
    }
    .card h3 {
      margin: 0 0 8px;
      font-size: 17px;
    }
    .card p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }
    .tag {
      display: inline-block;
      margin-bottom: 12px;
      color: var(--blue);
      font-size: 13px;
      font-weight: 750;
    }
    .section {
      padding: 20px 0 10px;
    }
    .wide {
      background: var(--panel);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      margin: 22px calc(50% - 50vw);
      padding: 34px calc(50vw - 50%);
    }
    .steps {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }
    .step {
      border-left: 3px solid var(--blue);
      padding: 4px 12px;
    }
    .step strong {
      display: block;
      margin-bottom: 4px;
    }
    .step span {
      color: var(--muted);
      font-size: 14px;
    }
    code {
      background: #edf1f8;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 13px;
    }
    footer {
      padding: 26px 0 36px;
      color: var(--muted);
      font-size: 14px;
    }
    @media (max-width: 820px) {
      header { align-items: flex-start; flex-direction: column; }
      .hero { grid-template-columns: 1fr; padding-top: 38px; }
      .grid, .steps { grid-template-columns: 1fr; }
      h1 { font-size: 44px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand"><div class="mark">ZG</div><span>Zora Genesis</span></div>
    <nav>
      <a href="/agent/profile">Profile</a>
      <a href="/agent/opportunities">Opportunities</a>
      <a href="/agent/monetization">Monetization</a>
      <a href="/agent/builder-code">Builder Code</a>
      <a href="/health">Health</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div>
        <h1>AI agent for Base creator asset discovery.</h1>
        <p class="lead">Zora Genesis monitors Base and Zora creator-economy signals, scores new asset opportunities, and turns them into launchpad-lite workflows for creators, collectors, and builders.</p>
        <div class="actions">
          <a class="button primary" href="/agent/opportunities">View Live Opportunities</a>
          <a class="button" href="/agent/profile">Agent Profile</a>
        </div>
      </div>
      <aside class="status" aria-label="Deployment status">
        <h2>Production Status</h2>
        <div class="row"><span class="label">Deployment</span><span class="ok">Live</span></div>
        <div class="row"><span class="label">Network Focus</span><span>Base + Zora</span></div>
        <div class="row"><span class="label">Primary Track</span><span>New asset creation</span></div>
        <div class="row"><span class="label">Publishing Guard</span><span class="safe">Protected</span></div>
        <div class="row"><span class="label">Demo Endpoint</span><span><code>/agent/opportunities</code></span></div>
        <div class="row"><span class="label">Revenue Model</span><span><code>/agent/monetization</code></span></div>
        <div class="row"><span class="label">Builder Code</span><span><code>bc_lk15eqwc</code></span></div>
      </aside>
    </section>

    <section class="section">
      <h2>Base Builder Fit</h2>
      <div class="grid">
        <article class="card">
          <span class="tag">New Asset Creation</span>
          <h3>Creator asset pulse</h3>
          <p>Turns Base and Zora creator signals into collectible market notes, launch concepts, and shareable asset briefs.</p>
        </article>
        <article class="card">
          <span class="tag">Token Launchpads</span>
          <h3>Launchpad-lite flow</h3>
          <p>Guides creators from idea to image, metadata, launch post, distribution checklist, and future Zora coin workflow.</p>
        </article>
        <article class="card">
          <span class="tag">Consumer Apps</span>
          <h3>Discovery feed</h3>
          <p>Ranks cultural relevance and creator activity so non-technical users can discover onchain creator assets faster.</p>
        </article>
        <article class="card">
          <span class="tag">x402 Commerce</span>
          <h3>Premium briefs</h3>
          <p>Packages deeper creator asset briefs as paid access while keeping safety-critical context free.</p>
        </article>
        <article class="card">
          <span class="tag">Builder Codes</span>
          <h3>Attributed activity</h3>
          <p>Exposes Base Builder Code metadata so future app, wallet, and agent transactions can be measured.</p>
        </article>
      </div>
    </section>

    <section class="wide">
      <h2>How The Agent Works</h2>
      <div class="steps">
        <div class="step"><strong>1. Detect</strong><span>Reads Base, Zora, and creator-economy trend inputs.</span></div>
        <div class="step"><strong>2. Score</strong><span>Ranks signals for asset, launchpad, consumer, and commerce fit.</span></div>
        <div class="step"><strong>3. Generate</strong><span>Creates concise builder/operator notes and launch ideas.</span></div>
        <div class="step"><strong>4. Guard</strong><span>Filters malformed AI output and keeps publishing behind safety controls.</span></div>
      </div>
    </section>

    <section class="section">
      <h2>Grant Pitch</h2>
      <div class="grid">
        <article class="card">
          <h3>Problem</h3>
          <p>Creators and builders see many signals, but few simple tools convert those signals into usable onchain asset workflows.</p>
        </article>
        <article class="card">
          <h3>Prototype</h3>
          <p>A deployed AI agent with public profile, opportunity engine, safe AI post generation, and production endpoints.</p>
        </article>
        <article class="card">
          <h3>Next Milestone</h3>
          <p>Build a lightweight UI and creator launch flow that connects opportunity scoring to Zora-ready asset creation.</p>
        </article>
      </div>
    </section>
  </main>
  <footer>
    <span>Live production URL: <a href="${productionUrl}">${productionUrl}</a></span>
  </footer>
</body>
</html>`;
}

export default function handler(_req: any, res: any) {
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.status(200).send(page());
}
