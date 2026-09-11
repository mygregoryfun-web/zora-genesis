import {
  clearSessionCookie,
  getSession,
  isValidEmail,
  listDraftsForSession,
  listUsers,
  loginSession,
  publicSession,
  saveDraftForSession,
  setSessionCookie,
} from "../src/services/auth.js";

export const config = { maxDuration: 10 };

export default async function handler(req: any, res: any) {
  const action = String(req.query?.action ?? "").toLowerCase();

  if (req.method === "GET" && action === "admin") {
    const session = getSession(req);
    if (!session || session.role !== "owner") {
      res.status(401).send("<!doctype html><meta charset=\"utf-8\"><title>Admin</title><p>Najprej se prijavi kot admin v Studiu.</p><p><a href=\"/studio\">Nazaj v Studio</a></p>");
      return;
    }

    const rows = await listUsers();
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(`<!doctype html>
<html lang="sl"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Studio Admin</title><style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f6f7f9;color:#15171a}main{width:min(1120px,calc(100% - 24px));margin:0 auto;padding:22px 0}header{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}h1{margin:0;font-size:30px}a{color:#147a6c;font-weight:750;text-decoration:none}.card{background:#fff;border:1px solid #d8dee8;border-radius:8px;padding:14px;margin-bottom:12px}.warn{border-color:#f2c7c3;background:#fff7f5;color:#9f2d20}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #d8dee8;border-radius:8px;overflow:hidden}th,td{text-align:left;border-bottom:1px solid #eef2f6;padding:10px;font-size:14px}th{background:#f8fafc;color:#475467}code{font-family:ui-monospace,Consolas,monospace}.num{text-align:right}.muted{color:#667085}</style></head>
<body><main><header><div><h1>Studio Admin</h1><p class="muted">Pregled prijav in kreditov.</p></div><a href="/studio">Studio</a></header>
<section class="card warn"><strong>Pomembno:</strong> trenutna shramba je primerna za MVP in testiranje. Na Vercel Hobby brez prave baze datoteka v <code>/tmp</code> ni trajna garancija proti ponovni registraciji po cold-startu ali redeployu. Za oglase rabimo Supabase, Neon ali Vercel KV.</section>
<section class="card"><strong>Uporabniki:</strong> ${rows.length}</section>
<table><thead><tr><th>E-mail</th><th>Vloga</th><th class="num">Krediti</th><th class="num">Porabljeno</th><th class="num">Prijave</th><th>Zadnja prijava</th><th>Posodobljeno</th></tr></thead>
<tbody>${rows.map((user) => `<tr><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.role)}</td><td class="num">${user.credits}</td><td class="num">${user.totalSpent}</td><td class="num">${user.loginCount}</td><td>${escapeHtml(user.lastLoginAt)}</td><td>${escapeHtml(user.updatedAt)}</td></tr>`).join("") || `<tr><td colspan="7" class="muted">Ni še prijavljenih uporabnikov v trenutni shrambi.</td></tr>`}</tbody></table>
</main></body></html>`);
    return;
  }

  if (req.method === "GET" && action === "status") {
    res.status(200).json({ ok: true, session: publicSession(getSession(req)) });
    return;
  }

  if (req.method === "POST" && action === "login") {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      res.status(400).json({ ok: false, error: "Vpiši veljaven e-mail." });
      return;
    }

    const session = await loginSession(email, req.body?.ownerCode);
    setSessionCookie(res, session);
    res.status(200).json({ ok: true, session: publicSession(session) });
    return;
  }

  if (req.method === "GET" && action === "drafts") {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ ok: false, error: "Najprej se prijavi." });
      return;
    }

    res.status(200).json({ ok: true, drafts: await listDraftsForSession(session) });
    return;
  }

  if (req.method === "POST" && action === "drafts-save") {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ ok: false, error: "Najprej se prijavi." });
      return;
    }

    const draft = await saveDraftForSession(session, req.body ?? {});
    res.status(200).json({ ok: true, draft });
    return;
  }

  if (req.method === "POST" && action === "logout") {
    clearSessionCookie(res);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(404).json({ ok: false, error: "Unknown auth action." });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
