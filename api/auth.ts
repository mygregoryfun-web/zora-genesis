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
import { getAdminSystemStatus } from "../src/services/admin-dashboard.js";

export const config = { maxDuration: 10 };

export default async function handler(req: any, res: any) {
  const action = String(req.query?.action ?? "").toLowerCase();

  if (req.method === "GET" && action === "admin") {
    const session = getSession(req);
    if (!session || session.role !== "owner") {
      res.status(401).send("<!doctype html><meta charset=\"utf-8\"><title>Admin</title><p>Najprej se prijavi kot admin v Studiu.</p><p><a href=\"/studio\">Nazaj v Studio</a></p>");
      return;
    }

    const [rows, systemStatus] = await Promise.all([listUsers(), getAdminSystemStatus()]);
    const storage = storageMode();
    const storageNotice = storage === "supabase"
      ? `<section class="card ok"><strong>Shramba je aktivna:</strong> uporabniki, krediti in knjižnica objav se shranjujejo v Supabase bazo.</section>`
      : `<section class="card warn"><strong>Pomembno:</strong> trenutna shramba je primerna za MVP in testiranje. Na Vercel Hobby brez prave baze datoteka v <code>/tmp</code> ni trajna garancija proti ponovni registraciji po cold-startu ali redeployu. Za oglase rabimo Supabase, Neon ali Vercel KV.</section>`;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(`<!doctype html>
<html lang="sl"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Studio Admin</title><style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f6f7f9;color:#15171a}main{width:min(1180px,calc(100% - 24px));margin:0 auto;padding:22px 0}header{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}h1{margin:0;font-size:30px}h2{margin:0 0 10px;font-size:20px}a{color:#147a6c;font-weight:750;text-decoration:none}.card{background:#fff;border:1px solid #d8dee8;border-radius:8px;padding:14px;margin-bottom:12px}.warn{border-color:#f2c7c3;background:#fff7f5;color:#9f2d20}.ok{border-color:#b7e4d3;background:#f3fcf8;color:#146c43}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}.metric{background:#fff;border:1px solid #d8dee8;border-radius:8px;padding:13px}.metric strong{display:block;font-size:24px}.metric span{color:#667085;font-size:13px}.metric.ok{border-top:4px solid #147a6c}.metric.warn{border-top:4px solid #c2410c}.metric.danger{border-top:4px solid #b42318}.health{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 14px}.pill{border:1px solid #d8dee8;border-radius:999px;background:#fff;padding:6px 10px;font-size:13px}.pill.ok{border-color:#b7e4d3;background:#f3fcf8;color:#146c43}.pill.warn{border-color:#f2c7c3;background:#fff7f5;color:#9f2d20}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #d8dee8;border-radius:8px;overflow:hidden}th,td{text-align:left;border-bottom:1px solid #eef2f6;padding:10px;font-size:14px}th{background:#f8fafc;color:#475467}code{font-family:ui-monospace,Consolas,monospace}.num{text-align:right}.muted{color:#667085}input,select,button{font:inherit;border:1px solid #cfd8e5;border-radius:8px;min-height:34px;padding:0 9px;background:#fff}input[type=number]{width:100px;text-align:right}button{background:#147a6c;color:#fff;border-color:#147a6c;font-weight:750;cursor:pointer}.edit-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.status{min-height:20px;color:#475467;margin:8px 0;font-size:14px}.toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0}.tiny{font-size:12px;color:#667085}@media(max-width:900px){.grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.grid{grid-template-columns:1fr}}</style></head>
<body><main><header><div><h1>Studio Admin</h1><p class="muted">Pregled prijav in kreditov.</p></div><a href="/studio">Studio</a></header>
${storageNotice}
${systemDashboard(systemStatus)}
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
async function refreshSystem(){
  const box=document.getElementById("systemStatus");
  if(!box)return;
  box.setAttribute("aria-busy","true");
  try{
    const response=await fetch("/admin/system/status");
    const data=await response.json();
    if(!response.ok||!data.ok)throw new Error(data.error||"Statusa ni bilo mogoče prebrati.");
    box.outerHTML=renderSystem(data.status);
  }catch(error){
    status.textContent=error instanceof Error?error.message:String(error);
  }finally{
    box.setAttribute("aria-busy","false");
  }
}
function metric(label,value,state){
  return '<div class="metric '+state+'"><strong>'+value+'</strong><span>'+label+'</span></div>';
}
function pill(label,ok){
  return '<span class="pill '+(ok?'ok':'warn')+'">'+label+': '+(ok?'OK':'manjka')+'</span>';
}
function esc(value){
  return String(value??'').replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function fmtNumber(value){
  return value===null||value===undefined?'?':Number(value).toLocaleString('sl-SI');
}
function renderSystem(data){
  const runway=data.runway;
  const runwayState=runway.ok?(Number(runway.creditBalance)<100?'warn':'ok'):'danger';
  return '<section class="card" id="systemStatus"><div class="toolbar"><div><h2>Nadzorna plošča sredstev</h2><p class="muted">Stanje API goriva za tekst, sliko in video. Ključi se ne prikazujejo.</p></div><button type="button" onclick="refreshSystem()">Osveži</button></div>'+
    '<div class="grid">'+
    metric('Runway krediti',fmtNumber(runway.creditBalance),runwayState)+
    metric('Ocenjena vrednost USD',fmtNumber(runway.usdEstimate),runwayState)+
    metric('Približno 5s videov',fmtNumber(runway.estimatedFiveSecondVideos),runwayState)+
    metric('Približno 10s videov',fmtNumber(runway.estimatedTenSecondVideos),runwayState)+
    metric('Uporabniški krediti v obtoku',fmtNumber(data.users.creditsOutstanding),data.users.creditsOutstanding>500?'warn':'ok')+
    '</div>'+
    '<div class="health">'+
    pill('Runway API',runway.configured&&runway.ok)+
    pill('OpenAI',data.providers.openai)+
    pill('OpenRouter',data.providers.openrouter)+
    pill('Supabase',data.providers.supabase)+
    pill('Billing wallet',data.providers.billingWallet)+
    '</div>'+
    '<p class="tiny">Runway ocena: Gen-4 Turbo 5 kreditov/s, 5s video 25 kreditov, 10s video 50 kreditov. Zadnji zajem: '+esc(new Date(data.generatedAt).toLocaleString('sl-SI'))+'. '+(runway.error?'Runway opozorilo: '+esc(runway.error):'')+'</p></section>';
}
</script>
</main></body></html>`);
    return;
  }

  if (req.method === "GET" && action === "admin-system-status") {
    const session = getSession(req);
    if (!session || session.role !== "owner") {
      res.status(401).json({ ok: false, error: "Najprej se prijavi kot admin." });
      return;
    }

    res.status(200).json({ ok: true, status: await getAdminSystemStatus() });
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

function formatAdminNumber(value: number | null) {
  return value === null || value === undefined ? "?" : Math.round(value).toLocaleString("sl-SI");
}

function metricHtml(label: string, value: number | null, state: "ok" | "warn" | "danger") {
  return `<div class="metric ${state}"><strong>${formatAdminNumber(value)}</strong><span>${escapeHtml(label)}</span></div>`;
}

function providerPill(label: string, ok: boolean) {
  return `<span class="pill ${ok ? "ok" : "warn"}">${escapeHtml(label)}: ${ok ? "OK" : "manjka"}</span>`;
}

function systemDashboard(status: Awaited<ReturnType<typeof getAdminSystemStatus>>) {
  const runwayState = status.runway.ok
    ? Number(status.runway.creditBalance) < 100 ? "warn" : "ok"
    : "danger";
  const userCreditsState = status.users.creditsOutstanding > 500 ? "warn" : "ok";
  const runwayNote = status.runway.error
    ? ` Runway opozorilo: ${escapeHtml(status.runway.error)}`
    : "";

  return `<section class="card" id="systemStatus">
    <div class="toolbar">
      <div><h2>Nadzorna plošča sredstev</h2><p class="muted">Stanje API goriva za tekst, sliko in video. Ključi se ne prikazujejo.</p></div>
      <button type="button" onclick="refreshSystem()">Osveži</button>
    </div>
    <div class="grid">
      ${metricHtml("Runway krediti", status.runway.creditBalance, runwayState)}
      ${metricHtml("Ocenjena vrednost USD", status.runway.usdEstimate, runwayState)}
      ${metricHtml("Približno 5s videov", status.runway.estimatedFiveSecondVideos, runwayState)}
      ${metricHtml("Približno 10s videov", status.runway.estimatedTenSecondVideos, runwayState)}
      ${metricHtml("Uporabniški krediti v obtoku", status.users.creditsOutstanding, userCreditsState)}
    </div>
    <div class="health">
      ${providerPill("Runway API", status.runway.configured && status.runway.ok)}
      ${providerPill("OpenAI", status.providers.openai)}
      ${providerPill("OpenRouter", status.providers.openrouter)}
      ${providerPill("Supabase", status.providers.supabase)}
      ${providerPill("Billing wallet", status.providers.billingWallet)}
    </div>
    <p class="tiny">Runway ocena: Gen-4 Turbo 5 kreditov/s, 5s video 25 kreditov, 10s video 50 kreditov. Zadnji zajem: ${escapeHtml(new Date(status.generatedAt).toLocaleString("sl-SI"))}.${runwayNote}</p>
  </section>`;
}
