export function wantsJson(req: any, fallbackPath: string) {
  const url = new URL(req.url ?? fallbackPath, "https://zora-genesis-t1j9.vercel.app");
  return url.searchParams.get("format") === "json" || String(req.headers.accept ?? "").includes("application/json");
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function tags(items: string[]) {
  return items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("");
}

export function page(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="base:app_id" content="69af0091f6467f4d78d304ac" />
  <title>${escapeHtml(title)}</title>
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
      --red-soft: #fff0ed;
      --violet: #5b4bdb;
      --violet-soft: #f1efff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #fbfcff 0, var(--paper) 340px);
      color: var(--ink);
      line-height: 1.48;
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
      display: grid;
      place-items: center;
      background: #111827;
      color: #ffffff;
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
    .hero, .card, .band {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(16, 19, 26, .04);
    }
    .hero {
      padding: 28px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(260px, .34fr);
      gap: 22px;
      align-items: center;
    }
    .eyebrow {
      color: var(--blue);
      font-size: 13px;
      font-weight: 780;
      margin-bottom: 12px;
    }
    h1 {
      margin: 0;
      font-size: clamp(34px, 4.5vw, 56px);
      line-height: 1;
      letter-spacing: 0;
    }
    h2 { margin: 0 0 12px; font-size: 19px; }
    h3 { margin: 0 0 8px; font-size: 16px; }
    .lead {
      margin: 16px 0 0;
      max-width: 820px;
      color: var(--muted);
      font-size: 18px;
    }
    .stat {
      border-left: 4px solid var(--blue);
      padding-left: 14px;
    }
    .stat strong {
      display: block;
      font-size: 28px;
      line-height: 1.15;
    }
    .stat span, .muted, li, p {
      color: var(--muted);
      font-size: 14px;
    }
    .section { padding: 18px 0 0; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .card, .band { padding: 18px; min-width: 0; }
    .card.highlight {
      border-color: var(--blue);
      box-shadow: inset 0 3px 0 var(--blue);
    }
    .score {
      font-size: 26px;
      font-weight: 800;
      color: var(--green);
    }
    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 0 9px;
      border-radius: 8px;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 12px;
      font-weight: 780;
      margin: 0 6px 6px 0;
    }
    .ok { color: var(--green); font-weight: 780; }
    .warn { color: var(--amber); font-weight: 780; }
    .bad { color: var(--red); font-weight: 780; }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-top: 1px solid var(--soft-line);
      font-size: 14px;
    }
    .row:first-of-type { border-top: 0; }
    .label { color: var(--muted); }
    .button, button {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--ink);
      font: inherit;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .button:hover, button:hover {
      text-decoration: none;
      border-color: #b8c5d8;
      background: #fbfcff;
    }
    button[type="submit"], .button.primary {
      background: var(--blue);
      border-color: var(--blue);
      color: #ffffff;
    }
    form {
      display: grid;
      gap: 14px;
    }
    label {
      display: grid;
      gap: 7px;
      color: var(--ink);
      font-size: 14px;
      font-weight: 700;
    }
    input, textarea, select {
      width: 100%;
      min-height: 44px;
      padding: 11px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #ffffff;
      color: var(--ink);
      font: inherit;
      font-size: 14px;
    }
    textarea {
      min-height: 128px;
      resize: vertical;
    }
    input:focus, textarea:focus, select:focus {
      outline: 3px solid rgba(0, 82, 255, .15);
      border-color: var(--blue);
    }
    small {
      color: var(--subtle);
      font-size: 12px;
      font-weight: 500;
    }
    code, pre {
      background: #edf2fa;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 12px;
      word-break: break-word;
    }
    pre {
      padding: 12px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    ul { margin: 10px 0 0; padding-left: 18px; }
    footer {
      padding: 22px 0 34px;
      color: var(--muted);
      font-size: 14px;
    }
    @media (max-width: 900px) {
      header {
        min-height: auto;
        align-items: flex-start;
        flex-direction: column;
        padding: 18px 0;
      }
      nav { justify-content: flex-start; }
      .hero, .grid, .grid.two { grid-template-columns: 1fr; }
      h1 { font-size: 38px; }
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
      <a href="/">Dashboard</a>
      <a href="/agent/opportunities">Radar</a>
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
  <main>${body}</main>
  <footer>API JSON is available with <code>?format=json</code>.</footer>
</body>
</html>`;
}
