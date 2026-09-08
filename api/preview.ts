function previewPage() {
  return `<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zora Genesis Preview</title>
  <style>
    :root{color-scheme:light;--bg:#f6f3ef;--paper:#fffdf9;--ink:#191715;--muted:#706a63;--line:#ddd5cb;--accent:#8c4b35;--accent2:#1f6f64;--soft:#efe7de}
    *{box-sizing:border-box} body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink)}
    main{width:min(1120px,calc(100% - 28px));margin:0 auto;padding:22px 0 40px} header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 0;border-bottom:1px solid var(--line);margin-bottom:16px}
    h1{margin:0;font-size:clamp(30px,5vw,48px);line-height:1;letter-spacing:0} p{color:var(--muted)} a,button,input,select,textarea{font:inherit}
    a.button,button{min-height:42px;border:1px solid var(--accent);border-radius:8px;padding:0 14px;background:var(--accent);color:#fff;font-weight:750;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
    button.secondary,a.secondary{background:var(--paper);color:var(--ink);border-color:var(--line)} button:disabled{opacity:.6;cursor:progress}
    .actions,.tabs,.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.grid{display:grid;grid-template-columns:390px minmax(0,1fr);gap:14px;align-items:start}
    .panel{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:16px;box-shadow:0 1px 2px rgba(25,23,21,.04)}
    .topic{display:grid;grid-template-columns:minmax(0,1fr) 120px auto;gap:10px;align-items:end;margin-bottom:14px} label{display:grid;gap:6px;color:var(--muted);font-size:13px;font-weight:700}
    input,select,textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:10px 11px} textarea{min-height:430px;resize:vertical;line-height:1.5}
    .image{aspect-ratio:4/5;border-radius:8px;background:var(--soft);display:grid;place-items:center;overflow:hidden;color:var(--muted);text-align:center;padding:16px}.image img{width:100%;height:100%;object-fit:cover;display:block}
    .tab.active{background:var(--accent2);border-color:var(--accent2);color:#fff}.status{color:var(--muted);font-size:14px;margin-left:auto}
    @media(max-width:840px){header,.grid,.topic{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}textarea{min-height:330px}}
  </style>
</head>
<body>
  <main>
    <header><div><h1>Predogled objave</h1><p>Vnesi temo, izberi jezik, agent pripravi tekst in sliko. Objavis rocno.</p></div><div class="actions"><a class="button secondary" href="/video">Foto v video</a><button id="generate">Ustvari osnutek</button></div></header>
    <section class="grid">
      <aside class="panel"><div class="image" id="image">Slika bo tukaj.</div></aside>
      <section class="panel">
        <div class="topic"><label>Tema objave<input id="topic" placeholder="Npr. ponos, prevara, denar, zaupanje..." /></label><label>Jezik<select id="language"><option value="si">SI</option><option value="eng">ENG</option><option value="esp">ESP</option></select></label><button id="addTopic" class="secondary" type="button">Dodaj temo</button></div>
        <div class="tabs"><button class="secondary tab active" data-channel="facebook">Facebook</button><button class="secondary tab" data-channel="instagram">Instagram</button><button class="secondary tab" data-channel="x">X</button></div>
        <textarea id="text" placeholder="Tukaj bo tekst za kopiranje."></textarea>
        <div class="toolbar"><button id="copyText" class="secondary">Kopiraj tekst</button><button id="copyImage" class="secondary">Kopiraj sliko</button><span class="status" id="status">Pripravljeno.</span></div>
      </section>
    </section>
  </main>
  <script>
    let draft=null,activeChannel="facebook";const status=document.getElementById("status"),text=document.getElementById("text"),image=document.getElementById("image"),generate=document.getElementById("generate"),topic=document.getElementById("topic"),language=document.getElementById("language");
    function setStatus(v){status.textContent=v} function renderDraft(){if(!draft)return;text.value=draft.channels[activeChannel]?.text||"";if(draft.image?.dataUrl){image.innerHTML="";const img=document.createElement("img");img.src=draft.image.dataUrl;img.alt="Generirana slika";image.appendChild(img)}else image.textContent="Slika ni bila ustvarjena."}
    document.querySelectorAll(".tab").forEach((button)=>button.addEventListener("click",()=>{activeChannel=button.dataset.channel;document.querySelectorAll(".tab").forEach((item)=>item.classList.remove("active"));button.classList.add("active");renderDraft()}));
    async function createDraft(){generate.disabled=true;setStatus("Ustvarjam...");try{const response=await fetch("/agent/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topic.value.trim(),language:language.value})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Draft failed");draft=data.draft;renderDraft();setStatus("Osnutek pripravljen.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{generate.disabled=false}}
    generate.addEventListener("click",createDraft);document.getElementById("addTopic").addEventListener("click",createDraft);document.getElementById("copyText").addEventListener("click",async()=>{await navigator.clipboard.writeText(text.value);setStatus("Tekst kopiran.")});document.getElementById("copyImage").addEventListener("click",async()=>{if(!draft?.image?.dataUrl)return setStatus("Ni slike za kopiranje.");const blob=await fetch(draft.image.dataUrl).then((response)=>response.blob());await navigator.clipboard.write([new ClipboardItem({[blob.type]:blob})]);setStatus("Slika kopirana.")});
  </script>
</body>
</html>`;
}

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  res.setHeader("content-type", "text/html; charset=utf-8");
  res.status(200).send(previewPage());
}
