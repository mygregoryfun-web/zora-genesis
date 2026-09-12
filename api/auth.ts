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
  storageMode,
  updateUserForAdmin,
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
    const storage = storageMode();
    const storageNotice = storage === "supabase"
      ? `<section class="card ok"><strong>Shramba je aktivna:</strong> uporabniki, krediti in knjižnica objav se shranjujejo v Supabase bazo.</section>`
      : `<section class="card warn"><strong>Pomembno:</strong> trenutna shramba je primerna za MVP in testiranje. Na Vercel Hobby brez prave baze datoteka v <code>/tmp</code> ni trajna garancija proti ponovni registraciji po cold-startu ali redeployu. Za oglase rabimo Supabase, Neon ali Vercel KV.</section>`;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(`<!doctype html>
<html lang="sl"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Studio Admin</title><style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f6f7f9;color:#15171a}main{width:min(1180px,calc(100% - 24px));margin:0 auto;padding:22px 0}header{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}h1{margin:0;font-size:30px}a{color:#147a6c;font-weight:750;text-decoration:none}.card{background:#fff;border:1px solid #d8dee8;border-radius:8px;padding:14px;margin-bottom:12px}.warn{border-color:#f2c7c3;background:#fff7f5;color:#9f2d20}.ok{border-color:#b7e4d3;background:#f3fcf8;color:#146c43}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #d8dee8;border-radius:8px;overflow:hidden}th,td{text-align:left;border-bottom:1px solid #eef2f6;padding:10px;font-size:14px}th{background:#f8fafc;color:#475467}code{font-family:ui-monospace,Consolas,monospace}.num{text-align:right}.muted{color:#667085}input,select,button{font:inherit;border:1px solid #cfd8e5;border-radius:8px;min-height:34px;padding:0 9px;background:#fff}input[type=number]{width:100px;text-align:right}button{background:#147a6c;color:#fff;border-color:#147a6c;font-weight:750;cursor:pointer}.edit-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.status{min-height:20px;color:#475467;margin:8px 0;font-size:14px}</style></head>
<body><main><header><div><h1>Studio Admin</h1><p class="muted">Pregled prijav in kreditov.</p></div><a href="/studio">Studio</a></header>
${storageNotice}
<section class="card"><strong>Uporabniki:</strong> ${rows.length}</section>
<div class="status" id="status"></div>
<table><thead><tr><th>E-mail</th><th>Uredi</th><th class="num">Porabljeno</th><th class="num">Prijave</th><th>Zadnja prijava</th><th>Posodobljeno</th></tr></thead>
<tbody>${rows.map((user) => `<tr><td><code>${escapeHtml(user.email)}</code></td><td><div class="edit-row"><input type="hidden" value="${escapeHtml(user.email)}" data-field="email" /><select data-field="role"><option value="user" ${user.role === "user" ? "selected" : ""}>user</option><option value="owner" ${user.role === "owner" ? "selected" : ""}>owner</option></select><input type="number" min="0" step="1" value="${user.credits}" data-field="credits" /><button type="button" data-save-user>Shrani</button></div></td><td class="num">${user.totalSpent}</td><td class="num">${user.loginCount}</td><td>${escapeHtml(user.lastLoginAt)}</td><td>${escapeHtml(user.updatedAt)}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Ni še prijavljenih uporabnikov v trenutni shrambi.</td></tr>`}</tbody></table>
<script>
const status=document.getElementById("status");
document.querySelectorAll("[data-save-user]").forEach((button)=>button.addEventListener("click",async()=>{
  const row=button.closest("tr");
  const email=row.querySelector('[data-field="email"]').value;
  const role=row.querySelector('[data-field="role"]').value;
  const credits=Number(row.querySelector('[data-field="credits"]').value);
  button.disabled=true;
  status.textContent="Shranjujem uporabnika "+email+"...";
  try {
    const response=await fetch("/admin/users/update",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,role,credits})});
    const data=await response.json();
    if(!response.ok||!data.ok) throw new Error(data.error||"Shranjevanje ni uspelo.");
    status.textContent="Uporabnik "+email+" je posodobljen.";
  } catch(error) {
    status.textContent=error instanceof Error?error.message:String(error);
  } finally {
    button.disabled=false;
  }
}));
</script>
</main></body></html>`);
    return;
  }

  if (req.method === "POST" && action === "admin-user-update") {
    const session = getSession(req);
    if (!session || session.role !== "owner") {
      res.status(401).json({ ok: false, error: "Najprej se prijavi kot admin." });
      return;
    }

    res.status(200).json({
      ok: true,
      user: await updateUserForAdmin(req.body ?? {}),
    });
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
