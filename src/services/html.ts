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
    .hero, .card, .band {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    .hero {
      padding: 26px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(260px, .35fr);
      gap: 22px;
      align-items: center;
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
    .stat strong { display: block; font-size: 28px; }
    .stat span, .muted, li, p { color: var(--muted); font-size: 14px; }
    .section { padding: 18px 0 0; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .card, .band { padding: 18px; min-width: 0; }
    .card.highlight { border-color: var(--blue); box-shadow: inset 0 3px 0 var(--blue); }
    .score { font-size: 26px; font-weight: 800; color: var(--green); }
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
    .ok { color: var(--green); font-weight: 760; }
    .warn { color: var(--amber); font-weight: 760; }
    .bad { color: var(--red); font-weight: 760; }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-top: 1px solid var(--line);
      font-size: 14px;
    }
    .row:first-of-type { border-top: 0; }
    .label { color: var(--muted); }
    code {
      background: #edf2fa;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 12px;
      word-break: break-word;
    }
    ul { margin: 10px 0 0; padding-left: 18px; }
    footer { padding: 22px 0 34px; color: var(--muted); font-size: 14px; }
    @media (max-width: 900px) {
      header, .hero { grid-template-columns: 1fr; flex-direction: column; }
      .grid, .grid.two { grid-template-columns: 1fr; }
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
      <a href="/agent/monetization">Monetization</a>
      <a href="/agent/profile">Profile</a>
    </nav>
  </header>
  <main>${body}</main>
  <footer>API JSON is available with <code>?format=json</code>.</footer>
</body>
</html>`;
}
