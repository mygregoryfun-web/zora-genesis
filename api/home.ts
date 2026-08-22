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
      --ink: #10131a;
      --muted: #626b7a;
      --subtle: #7b8494;
      --line: #d8e0ec;
      --soft-line: #e8edf5;
      --paper: #f3f6fb;
      --panel: #ffffff;
      --panel-soft: #f9fbff;
      --blue: #0052ff;
      --blue-soft: #edf3ff;
      --green: #12715b;
      --green-soft: #e9f7f1;
      --amber: #9b5f00;
      --amber-soft: #fff4df;
      --red: #b42318;
      --violet: #5b4bdb;
      --violet-soft: #f1efff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #fbfcff 0, var(--paper) 340px);
      color: var(--ink);
      line-height: 1.45;
    }
    a { color: var(--blue); text-decoration: none; }
    a:hover { text-decoration: underline; }
    header, main, footer {
      width: min(1220px, calc(100% - 32px));
      margin: 0 auto;
    }
    header {
      min-height: 74px;
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
      min-width: 210px;
      font-weight: 780;
    }
    .mark {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #111827;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-weight: 850;
      box-shadow: inset 0 -3px 0 var(--blue);
    }
    .brand small {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
      margin-top: 1px;
    }
    nav {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
      font-size: 13px;
    }
    nav a {
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      padding: 0 9px;
      border: 1px solid transparent;
      border-radius: 8px;
      color: var(--muted);
      font-weight: 660;
    }
    nav a:hover {
      color: var(--ink);
      background: var(--panel);
      border-color: var(--line);
      text-decoration: none;
    }
    main { padding: 22px 0 10px; }
    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 384px;
      gap: 16px;
      align-items: stretch;
    }
    .hero, .panel, .card, .metric, .proof, .task {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(16, 19, 26, .04);
    }
    .hero {
      min-height: 390px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .hero-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    .eyebrow {
      color: var(--blue);
      font-size: 13px;
      font-weight: 780;
      margin-bottom: 12px;
    }
    h1 {
      margin: 0;
      max-width: 760px;
      font-size: 56px;
      line-height: 1;
      letter-spacing: 0;
    }
    .lead {
      max-width: 760px;
      margin: 18px 0 0;
      color: var(--muted);
      font-size: 18px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 32px;
      padding: 0 10px;
      border: 1px solid #bfe7d7;
      border-radius: 8px;
      background: var(--green-soft);
      color: var(--green);
      font-size: 13px;
      font-weight: 760;
      white-space: nowrap;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 24px;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 0 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--ink);
      font-weight: 700;
      font-size: 14px;
    }
    .button:hover {
      text-decoration: none;
      border-color: #b8c5d8;
      background: #fbfcff;
    }
    .button.primary {
      background: var(--blue);
      border-color: var(--blue);
      color: #ffffff;
    }
    .button.success {
      background: var(--green);
      border-color: var(--green);
      color: #ffffff;
    }
    .mini-strip {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 26px;
    }
    .mini {
      min-height: 74px;
      padding: 12px;
      border: 1px solid var(--soft-line);
      border-radius: 8px;
      background: var(--panel-soft);
    }
    .mini span {
      display: block;
      color: var(--subtle);
      font-size: 12px;
      margin-bottom: 4px;
    }
    .mini strong {
      display: block;
      font-size: 15px;
    }
    .panel { padding: 18px; }
    .panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }
    .panel h2, .section h2 {
      margin: 0;
      font-size: 19px;
    }
    .panel-caption {
      color: var(--muted);
      font-size: 13px;
      margin: 0 0 12px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      padding: 11px 0;
      border-top: 1px solid var(--soft-line);
      font-size: 14px;
    }
    .row:first-of-type { border-top: 0; }
    .label { color: var(--muted); }
    .ok, .warn, .bad {
      font-weight: 780;
      text-align: right;
    }
    .ok { color: var(--green); }
    .warn { color: var(--amber); }
    .bad { color: var(--red); }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin: 16px 0;
    }
    .metric {
      min-height: 116px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .metric span {
      color: var(--muted);
      font-size: 13px;
      font-weight: 650;
    }
    .metric strong {
      display: block;
      margin-top: 12px;
      font-size: 25px;
      line-height: 1.15;
    }
    .metric.blue { border-top: 4px solid var(--blue); }
    .metric.green { border-top: 4px solid var(--green); }
    .metric.amber { border-top: 4px solid var(--amber); }
    .metric.violet { border-top: 4px solid var(--violet); }
    .section { padding: 14px 0; }
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
      margin-bottom: 12px;
    }
    .section-head p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 14px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .card {
      min-height: 178px;
      padding: 18px;
    }
    .card h3 {
      margin: 0 0 8px;
      font-size: 17px;
    }
    .card p, .card li {
      color: var(--muted);
      font-size: 14px;
    }
    .card p { margin: 0; }
    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 0 9px;
      border-radius: 8px;
      color: var(--blue);
      background: var(--blue-soft);
      font-size: 12px;
      font-weight: 780;
      margin-bottom: 14px;
    }
    .tag.green {
      color: var(--green);
      background: var(--green-soft);
    }
    .tag.amber {
      color: var(--amber);
      background: var(--amber-soft);
    }
    .tag.violet {
      color: var(--violet);
      background: var(--violet-soft);
    }
    .proofs {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }
    .proof {
      min-height: 104px;
      padding: 13px;
      min-width: 0;
      background: var(--panel-soft);
    }
    .proof span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 660;
      margin-bottom: 8px;
    }
    .proof code, code {
      background: #edf2fa;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 12px;
      word-break: break-word;
    }
    .task-list {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 14px;
      align-items: stretch;
    }
    .task {
      padding: 18px;
      min-height: 210px;
    }
    .task ol {
      margin: 12px 0 0;
      padding-left: 20px;
      color: var(--muted);
      font-size: 14px;
    }
    .task li { margin: 7px 0; }
    .cta {
      background: #111827;
      color: #ffffff;
      border-color: #111827;
    }
    .cta p {
      color: #d4d9e4;
      margin: 8px 0 0;
      font-size: 14px;
    }
    .cta .button {
      margin-top: 18px;
      color: #ffffff;
      background: var(--blue);
      border-color: var(--blue);
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
    @media (max-width: 980px) {
      header {
        min-height: auto;
        align-items: flex-start;
        flex-direction: column;
        padding: 18px 0;
      }
      nav { justify-content: flex-start; }
      .hero-grid, .task-list { grid-template-columns: 1fr; }
      .proofs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      h1 { font-size: 42px; }
    }
    @media (max-width: 760px) {
      .metrics, .grid, .mini-strip, .proofs {
        grid-template-columns: 1fr;
      }
      .hero { min-height: auto; padding: 20px; }
      .hero-top {
        flex-direction: column;
        align-items: flex-start;
      }
      h1 { font-size: 36px; }
      .lead { font-size: 16px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="mark">ZG</div>
      <div>
        <span>Zora Genesis</span>
        <small>Base + Zora creator intelligence</small>
      </div>
    </div>
    <nav>
      <a href="/agent/opportunities">Radar</a>
      <a href="/base-grant">Grant</a>
      <a href="/agent/metrics">Metrics</a>
      <a href="/agent/monetization">Revenue</a>
      <a href="/agent/security">Security</a>
      <a href="/agent/firewall">Firewall</a>
      <a href="/agent/nft">NFT Studio</a>
      <a href="/agent/growth">Growth</a>
      <a href="/agent/builder-code">Builder Code</a>
      <a href="/agent/profile">Profile</a>
    </nav>
  </header>
  <main>
    <section class="hero-grid">
      <div class="hero">
        <div>
          <div class="hero-top">
            <div>
              <div class="eyebrow">Live Base Builder Grant Prototype</div>
              <h1>Creator signals into Zora-ready assets.</h1>
              <p class="lead">Zora Genesis tracks Base and Zora narratives, scores creator asset opportunities, drafts channel-ready posts, and keeps publishing approval-first.</p>
            </div>
            <div class="status-pill"><span class="dot"></span>Live on Base</div>
          </div>
          <div class="actions">
            <a class="button primary" href="/agent/opportunities">Open Opportunity Radar</a>
            <a class="button" href="/base-grant">Base Grant Page</a>
            <a class="button success" href="https://x.com/mygregoryfun">Request Premium Brief</a>
            <a class="button" href="/agent/metrics">Proof Metrics</a>
            <a class="button" href="/agent/firewall">Check Transaction</a>
          </div>
        </div>
        <div class="mini-strip" aria-label="Core product flow">
          <div class="mini"><span>Step 1</span><strong>Read Base/Zora signals</strong></div>
          <div class="mini"><span>Step 2</span><strong>Score asset opportunities</strong></div>
          <div class="mini"><span>Step 3</span><strong>Draft posts and briefs</strong></div>
        </div>
      </div>

      <aside class="panel" aria-label="Deployment status">
        <div class="panel-head">
          <h2>Launch Readiness</h2>
          <span class="status-pill"><span class="dot"></span>Ready</span>
        </div>
        <p class="panel-caption">Public proof, attribution, channels, and safety surfaces for Base review.</p>
        <div class="row"><span class="label">Deployment</span><span class="ok">Live</span></div>
        <div class="row"><span class="label">Network</span><span>Base Mainnet</span></div>
        <div class="row"><span class="label">Builder Code</span><span><code>bc_lk15eqwc</code></span></div>
        <div class="row"><span class="label">Zora</span><span class="ok">Published</span></div>
        <div class="row"><span class="label">Farcaster</span><span class="ok">Published</span></div>
        <div class="row"><span class="label">X</span><span class="ok">Text live</span></div>
        <div class="row"><span class="label">X Images</span><span class="warn">Manual fallback</span></div>
      </aside>
    </section>

    <section class="metrics" aria-label="Agent metrics">
      <div class="metric blue"><span>Published memory</span><strong id="post-count">28</strong></div>
      <div class="metric green"><span>Active channels</span><strong>Zora / FC / X</strong></div>
      <div class="metric amber"><span>Primary Base track</span><strong>New assets</strong></div>
      <div class="metric violet"><span>Revenue experiment</span><strong>Premium briefs</strong></div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>Product Surface</h2>
          <p>Each surface is public, linkable, and useful for grant review or early users.</p>
        </div>
        <a class="button" href="/agent/monetization">View revenue model</a>
      </div>
      <div class="grid">
        <article class="card">
          <span class="tag">Radar</span>
          <h3>Opportunity scoring</h3>
          <p>Ranks Base/Zora signals across new asset creation, launchpad-lite flows, consumer discovery, x402 commerce, and prediction-market attention.</p>
        </article>
        <article class="card">
          <span class="tag green">Publishing</span>
          <h3>Channel-ready output</h3>
          <p>Generates separate versions for Zora, Farcaster, and X, keeps X concise, and adds the Fun Gregory signature.</p>
        </article>
        <article class="card">
          <span class="tag amber">Monetization</span>
          <h3>Premium creator briefs</h3>
          <p>Defines free previews, Pro Creator, Builder Studio, pay-per-brief, and done-for-you setup paths without trading promises.</p>
        </article>
        <article class="card">
          <span class="tag violet">Growth</span>
          <h3>Free distribution loop</h3>
          <p>Turns product proof into build logs, Farcaster/X updates, Facebook creator examples, GitHub proof links, and Base-friendly evidence.</p>
        </article>
        <article class="card">
          <span class="tag">Safety</span>
          <h3>Contract risk scanner</h3>
          <p>Checks Base contracts for owner authority, mint, blacklist, fee, pause, and proxy warning signals before creators promote unknown assets.</p>
        </article>
        <article class="card">
          <span class="tag green">NFT Studio</span>
          <h3>Article-to-NFT edition</h3>
          <p>Turns article prompts into original NFT-ready image direction and metadata without relying on paid image generation for every draft.</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>Public Proofs</h2>
          <p>Fast links for reviewers, users, and builder profile verification.</p>
        </div>
        <a class="button" href="/agent/metrics">Open metrics</a>
      </div>
      <div class="proofs">
        <div class="proof"><span>Latest Zora asset</span><a href="https://basescan.org/address/0x380518528ba2C7B80B61fAd1A03B52aA4006F892"><code>0x380518528ba2C7B80B61fAd1A03B52aA4006F892</code></a></div>
        <div class="proof"><span>Latest Zora transaction</span><a href="https://basescan.org/tx/0x2c45b55722868fe72b1dfc5c5f0338f37d3125665d7344abb9cc813fbd35d8c2"><code>0x2c45b55722868fe72b1dfc5c5f0338f37d3125665d7344abb9cc813fbd35d8c2</code></a></div>
        <div class="proof"><span>Latest X post</span><a href="https://x.com/mygregoryfun/status/2090559452877324327"><code>2090559452877324327</code></a></div>
        <div class="proof"><span>Base proof contract</span><a href="https://basescan.org/address/0xc74659ce159b88ef3aae55a61fc3906fe2b1de58"><code>0xc74659ce159b88ef3aae55a61fc3906fe2b1de58</code></a></div>
      </div>
    </section>

    <section class="section">
      <div class="task-list">
        <article class="task">
          <h2>Next Build Steps</h2>
          <ol>
            <li>Keep X text publishing active and use manual image fallback until X media access is unlocked.</li>
            <li>Add a simple approval queue for draft review before live publishing.</li>
            <li>Turn Premium Brief requests into the first paid creator-intelligence experiment.</li>
            <li>Track engagement and publish proof metrics for the Base Builder Grant story.</li>
          </ol>
        </article>
        <article class="task cta">
          <h2>Premium Brief Experiment</h2>
          <p>Offer one sample Base/Zora creator brief, then test paid follow-up briefs for creators who want asset concepts, post copy, cover direction, and a launch checklist.</p>
          <a class="button" href="https://x.com/mygregoryfun">Request Premium Brief</a>
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
