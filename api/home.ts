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
      --ink: #12141a;
      --muted: #626b7a;
      --line: #d9e1ee;
      --paper: #f6f8fc;
      --panel: #ffffff;
      --blue: #0052ff;
      --green: #11845b;
      --amber: #a76100;
      --red: #b42318;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.45;
    }
    header, main, footer {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
    }
    header {
      padding: 22px 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      border-bottom: 1px solid var(--line);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 760;
    }
    .mark {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--blue);
      display: grid;
      place-items: center;
      color: white;
      font-weight: 820;
    }
    nav {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 14px;
    }
    a { color: var(--blue); text-decoration: none; }
    a:hover { text-decoration: underline; }
    main { padding: 26px 0 8px; }
    .topbar {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(330px, .85fr);
      gap: 18px;
      align-items: stretch;
    }
    .hero, .panel, .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    .hero { padding: 26px; }
    .eyebrow {
      color: var(--blue);
      font-size: 13px;
      font-weight: 760;
      margin-bottom: 14px;
    }
    h1 {
      margin: 0;
      max-width: 820px;
      font-size: clamp(34px, 4.5vw, 58px);
      line-height: 1;
      letter-spacing: 0;
    }
    .lead {
      margin: 18px 0 0;
      max-width: 760px;
      color: var(--muted);
      font-size: 18px;
    }
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 22px;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      padding: 0 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--ink);
      font-weight: 650;
      font-size: 14px;
    }
    .button.primary {
      background: var(--blue);
      border-color: var(--blue);
      color: white;
    }
    .button.success {
      background: var(--green);
      border-color: var(--green);
      color: white;
    }
    .panel { padding: 18px; }
    .panel h2, .section h2 {
      margin: 0 0 14px;
      font-size: 18px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      padding: 10px 0;
      border-top: 1px solid var(--line);
      font-size: 14px;
    }
    .row:first-of-type { border-top: 0; }
    .label { color: var(--muted); }
    .ok { color: var(--green); font-weight: 760; }
    .warn { color: var(--amber); font-weight: 760; }
    .bad { color: var(--red); font-weight: 760; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin: 18px 0;
    }
    .metric {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      min-height: 104px;
    }
    .metric span {
      display: block;
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 8px;
    }
    .metric strong {
      display: block;
      font-size: 24px;
      line-height: 1.15;
    }
    .section { padding: 12px 0; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .card {
      padding: 17px;
      min-height: 168px;
    }
    .card h3 {
      margin: 0 0 8px;
      font-size: 16px;
    }
    .card p, .card li {
      color: var(--muted);
      font-size: 14px;
    }
    .card p { margin: 0; }
    .tag {
      display: inline-block;
      margin-bottom: 12px;
      color: var(--blue);
      font-size: 12px;
      font-weight: 760;
    }
    .proofs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .proof {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: #fbfcff;
      min-width: 0;
    }
    .proof span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 5px;
    }
    .proof code, code {
      background: #edf2fa;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 12px;
      word-break: break-word;
    }
    ul {
      margin: 8px 0 0;
      padding-left: 18px;
    }
    footer {
      padding: 22px 0 34px;
      color: var(--muted);
      font-size: 14px;
    }
    @media (max-width: 900px) {
      header { align-items: flex-start; flex-direction: column; }
      .topbar, .grid, .proofs { grid-template-columns: 1fr; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 560px) {
      .metrics { grid-template-columns: 1fr; }
      h1 { font-size: 38px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand"><div class="mark">ZG</div><span>Zora Genesis</span></div>
    <nav>
      <a href="/agent/opportunities">Opportunities</a>
      <a href="/agent/metrics">Metrics</a>
      <a href="/agent/monetization">Monetization</a>
      <a href="/agent/security">Security</a>
      <a href="/agent/firewall">Transaction Firewall</a>
      <a href="/agent/nft">NFT Studio</a>
      <a href="/agent/growth">Growth</a>
      <a href="/agent/builder-code">Builder Code</a>
      <a href="/agent/profile">Profile</a>
    </nav>
  </header>
  <main>
    <section class="topbar">
      <div class="hero">
        <div class="eyebrow">Base Builder Grant Prototype</div>
        <h1>Signal-to-asset agent for Base and Zora creators.</h1>
        <p class="lead">Zora Genesis tracks builder narratives, scores creator asset opportunities, generates channel-ready posts, and creates Zora-ready briefs with an approval-first publishing flow.</p>
        <div class="actions">
          <a class="button primary" href="/agent/opportunities">Open Opportunity Radar</a>
          <a class="button success" href="https://x.com/mygregoryfun">Request Premium Brief</a>
          <a class="button" href="/agent/metrics">View Proof Metrics</a>
          <a class="button" href="/agent/monetization">Revenue Model</a>
          <a class="button" href="/agent/nft">View Article NFT</a>
          <a class="button" href="/agent/firewall">Check Transaction</a>
          <a class="button" href="/agent/growth">Free Growth Plan</a>
          <a class="button" href="https://x.com/mygregoryfun/status/2089550413590647294">Latest X Post</a>
        </div>
      </div>
      <aside class="panel" aria-label="Deployment status">
        <h2>Launch Readiness</h2>
        <div class="row"><span class="label">Deployment</span><span class="ok">Live</span></div>
        <div class="row"><span class="label">Network</span><span>Base Mainnet</span></div>
        <div class="row"><span class="label">Builder Code</span><span><code>bc_lk15eqwc</code></span></div>
        <div class="row"><span class="label">Zora</span><span class="ok">Published</span></div>
        <div class="row"><span class="label">Farcaster</span><span class="ok">Published</span></div>
        <div class="row"><span class="label">X</span><span class="warn">Text live</span></div>
        <div class="row"><span class="label">X Images</span><span class="bad">Needs media.write</span></div>
      </aside>
    </section>

    <section class="metrics" aria-label="Agent metrics">
      <div class="metric"><span>Published memory</span><strong id="post-count">26</strong></div>
      <div class="metric"><span>Active channels</span><strong>Zora / FC / X</strong></div>
      <div class="metric"><span>Primary Base track</span><strong>New assets</strong></div>
      <div class="metric"><span>Revenue experiment</span><strong>Premium briefs</strong></div>
    </section>

    <section class="section">
      <h2>Working Product Surface</h2>
      <div class="grid">
        <article class="card">
          <span class="tag">Radar</span>
          <h3>Opportunity scoring</h3>
          <p>Ranks Base/Zora signals across new asset creation, launchpad-lite flows, consumer discovery, x402 commerce, and prediction-market narrative attention.</p>
        </article>
        <article class="card">
          <span class="tag">Publishing</span>
          <h3>Channel-specific output</h3>
          <p>Generates different versions for Zora, Farcaster, and X, keeps X under 280 characters, and adds the Fun Gregory signature.</p>
        </article>
        <article class="card">
          <span class="tag">Monetization</span>
          <h3>Premium creator briefs</h3>
          <p>Defines free previews, Pro Creator, Builder Studio, pay-per-brief, and done-for-you setup paths without trading promises.</p>
        </article>
        <article class="card">
          <span class="tag">Growth</span>
          <h3>Free distribution loop</h3>
          <p>Turns product proof into weekly build logs, Farcaster/X updates, Facebook creator examples, GitHub proof links, and Base grant-friendly evidence.</p>
        </article>
        <article class="card">
          <span class="tag">Safety</span>
          <h3>Contract risk scanner</h3>
          <p>Checks Base contracts for owner authority, mint, blacklist, fee, pause and proxy warning signals before creators promote unknown assets.</p>
        </article>
        <article class="card">
          <span class="tag">NFT Studio</span>
          <h3>Article-to-NFT edition</h3>
          <p>Turns the latest saved article prompt into one original NFT-ready image and metadata package without paid image generation.</p>
        </article>
      </div>
    </section>

    <section class="section">
      <h2>Public Proofs</h2>
      <div class="proofs">
        <div class="proof"><span>Latest Zora asset</span><a href="https://basescan.org/address/0x380518528ba2C7B80B61fAd1A03B52aA4006F892"><code>0x380518528ba2C7B80B61fAd1A03B52aA4006F892</code></a></div>
        <div class="proof"><span>Latest Zora transaction</span><a href="https://basescan.org/tx/0x2c45b55722868fe72b1dfc5c5f0338f37d3125665d7344abb9cc813fbd35d8c2"><code>0x2c45b55722868fe72b1dfc5c5f0338f37d3125665d7344abb9cc813fbd35d8c2</code></a></div>
        <div class="proof"><span>Latest X post</span><a href="https://x.com/mygregoryfun/status/2089550413590647294"><code>2089550413590647294</code></a></div>
        <div class="proof"><span>Base proof contract</span><a href="https://basescan.org/address/0xc74659ce159b88ef3aae55a61fc3906fe2b1de58"><code>0xc74659ce159b88ef3aae55a61fc3906fe2b1de58</code></a></div>
      </div>
    </section>

    <section class="section">
      <h2>Next Build Steps</h2>
      <div class="grid">
        <article class="card">
          <h3>Approval Queue</h3>
          <ul>
            <li>Preview generated post</li>
            <li>Select channels</li>
            <li>Publish only after approval</li>
          </ul>
        </article>
        <article class="card">
          <h3>Creator Brief Studio</h3>
          <ul>
            <li>Generate asset concept</li>
            <li>Cover image direction</li>
            <li>Zora launch checklist</li>
          </ul>
        </article>
        <article class="card">
          <h3>Usage Metrics</h3>
          <ul>
            <li>Track posts and assets</li>
            <li>Track channel status</li>
            <li>Expose grant-ready proof links</li>
          </ul>
        </article>
      </div>
    </section>
  </main>
  <footer>
    <span>Live production URL: <a href="${productionUrl}">${productionUrl}</a></span>
  </footer>
  <script>
    fetch("/agent/metrics")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const metrics = data && data.metrics;
        if (!metrics) return;
        const count = document.getElementById("post-count");
        if (count) count.textContent = String(metrics.publishedPostCount);
      })
      .catch(() => {});
  </script>
</body>
</html>`;
}

export default function handler(_req: any, res: any) {
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.status(200).send(page());
}
