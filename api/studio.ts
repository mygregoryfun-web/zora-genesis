function studioPage() {
  return `<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Content Studio</title>
  <style>
    :root{color-scheme:light;--bg:#f5f1eb;--paper:#fffdf9;--ink:#181512;--muted:#6d675f;--line:#ddd3c7;--accent:#8d4b34;--green:#1e6f62;--blue:#285e9c;--soft:#eee5da}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink)}
    main{width:min(1280px,calc(100% - 28px));margin:0 auto;padding:20px 0 42px}header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1px solid var(--line);padding:16px 0;margin-bottom:14px}
    h1{font-size:clamp(30px,5vw,50px);line-height:1;margin:0;letter-spacing:0}h2{font-size:17px;margin:0 0 10px}p{color:var(--muted);margin:8px 0 0;line-height:1.45}a,button,input,select,textarea{font:inherit}a{color:var(--green);font-weight:760;text-decoration:none}
    button,.button{min-height:40px;border:1px solid var(--accent);border-radius:8px;padding:0 12px;background:var(--accent);color:#fff;font-weight:780;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px}
    button.secondary,.button.secondary{background:var(--paper);color:var(--ink);border-color:var(--line)}button.blue{background:var(--blue);border-color:var(--blue)}button.green{background:var(--green);border-color:var(--green)}button:disabled{opacity:.6;cursor:progress}
    .actions,.tabs,.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.layout{display:grid;grid-template-columns:330px minmax(0,1fr) 360px;gap:14px;align-items:start}.panel{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:15px;box-shadow:0 1px 2px rgba(24,21,18,.04)}
    label{display:grid;gap:6px;color:var(--muted);font-size:13px;font-weight:730;margin-bottom:10px}input,select,textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:10px 11px}textarea{resize:vertical;line-height:1.5}.prompt{min-height:96px}.post{min-height:360px;font-size:16px}
    .two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.image{aspect-ratio:4/5;border-radius:8px;background:var(--soft);display:grid;place-items:center;overflow:hidden;color:var(--muted);text-align:center;padding:14px}.image img{width:100%;height:100%;object-fit:cover;display:block}
    .tab.active{background:var(--green);border-color:var(--green);color:#fff}.status{min-height:22px;color:var(--muted);font-size:14px;margin-top:10px}.meta{font-size:12px;color:var(--muted);line-height:1.4;margin-top:10px;word-break:break-word}
    .costs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 14px}.cost{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:10px}.cost strong{display:block;color:var(--ink)}.cost span{font-size:12px;color:var(--muted)}
    .library{display:grid;gap:8px;margin-top:12px;max-height:320px;overflow:auto}.draft-item{border:1px solid var(--line);background:#fff;border-radius:8px;padding:10px;display:grid;gap:8px}.draft-item strong{font-size:13px}.draft-item span{font-size:12px;color:var(--muted)}.draft-item .row{display:flex;gap:6px;flex-wrap:wrap}
    .checklist{display:grid;gap:8px;margin-top:12px}.check{display:flex;gap:8px;align-items:flex-start;color:var(--muted);font-size:13px}.check input{width:auto;margin-top:3px}.small{font-size:12px;color:var(--muted)}.image-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.preview-card{border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;margin-top:12px;white-space:pre-wrap;line-height:1.45}
    @media(max-width:1040px){.layout{grid-template-columns:1fr 1fr}.side{grid-column:1/-1}.costs{grid-template-columns:1fr}}@media(max-width:760px){header,.layout,.two{grid-template-columns:1fr}header{flex-direction:column}.post{min-height:300px}.image-actions{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <header>
      <div><h1>Content Studio</h1><p>Najprej poceni tekst, potem slika samo za dobre osnutke, video samo za zmagovalne objave.</p></div>
      <div class="actions"><a class="button secondary" href="/pricing">Naročnine</a><a class="button secondary" href="/video">Video editor</a></div>
    </header>

    <section class="costs">
      <div class="cost"><strong>Tekst</strong><span>pribl. $0.001 do $0.002</span></div>
      <div class="cost"><strong>Slika</strong><span>pribl. $0.04 do $0.08</span></div>
      <div class="cost"><strong>Video</strong><span>5s pribl. 25 Runway kreditov</span></div>
    </section>

    <section class="layout">
      <aside class="panel">
        <h2>Vhod</h2>
        <label>Tema<input id="topic" placeholder="Npr. ponos, izdaja, prevara, denar..." /></label>
        <div class="two">
          <label>Jezik<select id="language"><option value="si">SI</option><option value="eng">ENG</option><option value="esp">ESP</option></select></label>
          <label>Dolzina<select id="length"><option value="medium">Srednja</option><option value="short">Kratka</option><option value="long">Daljsa</option></select></label>
        </div>
        <label>Ton<select id="tone"><option value="my-style">Moj slog</option><option value="balanced">Topel + direkten</option><option value="deep">Globok</option><option value="sharp">Bolj oster</option><option value="soft">Nezen</option><option value="story">Kot zgodba</option></select></label>
        <label>Slog slike<select id="imageStyle"><option value="social-editorial">Social editorial</option><option value="artwork-cover">Artwork cover</option><option value="contradictory-art">Kontradiktorni art</option></select></label>
        <label>Dodatna navodila<textarea id="notes" class="prompt" placeholder="Npr. bolj za mojo FB skupino, brez moraliziranja, z močnim začetkom..."></textarea></label>
        <div class="tools"><button id="generateText" class="green" type="button">Generiraj tekst</button><button id="clear" class="secondary" type="button">Pocisti</button></div>
        <div class="status" id="status">Pripravljeno.</div>
        <h2 style="margin-top:16px">Knjižnica</h2>
        <div class="library" id="library"></div>
      </aside>

      <section class="panel">
        <h2>Objava</h2>
        <div class="tabs"><button class="secondary tab active" data-channel="facebook">Facebook</button><button class="secondary tab" data-channel="instagram">Instagram</button><button class="secondary tab" data-channel="x">X</button></div>
        <textarea id="postText" class="post" spellcheck="true" placeholder="Najprej klikni Generiraj tekst."></textarea>
        <div class="tools">
          <button id="copyText" class="secondary" type="button">Kopiraj</button>
          <button id="saveDraft" class="secondary" type="button">Shrani</button>
          <button class="secondary refine" data-action="my-style" type="button">Moj slog</button>
          <button class="secondary refine" data-action="sharper" type="button">Bolj ostro</button>
          <button class="secondary refine" data-action="emotional" type="button">Bolj custveno</button>
          <button class="secondary refine" data-action="less-ai" type="button">Manj AI</button>
          <button class="secondary refine" data-action="shorter" type="button">Krajse</button>
          <button class="secondary refine" data-action="longer" type="button">Daljse</button>
          <button class="secondary refine" data-action="question" type="button">Boljsi konec</button>
        </div>
        <div class="preview-card" id="previewCard">Predogled objave bo tukaj.</div>
        <div class="checklist">
          <label class="check"><input type="checkbox" /> Tekst sem prebral in zveni kot jaz.</label>
          <label class="check"><input type="checkbox" /> Slika ustreza temi in ni zavajajoca.</label>
          <label class="check"><input type="checkbox" /> Objavljam rocno, nic ni bilo poslano samo.</label>
        </div>
      </section>

      <aside class="panel side">
        <h2>Slika in video</h2>
        <div class="image" id="imageBox">Slika bo tukaj sele, ko kliknes Generiraj sliko.</div>
        <div class="image-actions"><button id="generateImage" class="green" type="button">Generiraj sliko</button><button id="downloadImage" class="secondary" type="button">Prenesi sliko</button></div>
        <div class="image-actions"><button id="copyImage" class="secondary" type="button">Kopiraj sliko</button><button id="sendToVideo" class="blue" type="button">Ustvari video</button></div>
        <div class="meta" id="imageMeta"></div>
        <h2 style="margin-top:16px">Video opis</h2>
        <textarea id="videoPrompt" class="prompt" placeholder="Opis za premik slike v video."></textarea>
        <p class="small">Video porablja Runway kredite. Uporabi ga sele, ko sta tekst in slika dobra.</p>
      </aside>
    </section>
  </main>
  <script>
    let draft=null,activeChannel="facebook";
    const topic=document.getElementById("topic"),language=document.getElementById("language"),tone=document.getElementById("tone"),length=document.getElementById("length"),imageStyle=document.getElementById("imageStyle"),notes=document.getElementById("notes"),status=document.getElementById("status"),postText=document.getElementById("postText"),imageBox=document.getElementById("imageBox"),imageMeta=document.getElementById("imageMeta"),videoPrompt=document.getElementById("videoPrompt"),previewCard=document.getElementById("previewCard"),library=document.getElementById("library");
    const savedDrafts=JSON.parse(localStorage.getItem("zg_drafts")||"[]");
    function setStatus(v){status.textContent=v}
    function topicValue(){return [topic.value.trim(),notes.value.trim()].filter(Boolean).join("\\n\\nDodatno: ")}
    function currentText(){return postText.value.trim()}
    function setBusy(button,busy,label){button.disabled=busy;if(label)button.textContent=busy?label:button.dataset.label}
    function channelText(){return draft?.channels?.[activeChannel]?.text||currentText()}
    function renderPreview(){previewCard.textContent=channelText()||"Predogled objave bo tukaj."}
    function renderDraft(){if(!draft)return;postText.value=channelText();videoPrompt.value=draft.image?.prompt||draft.source?.post||postText.value;renderPreview();if(draft.image?.dataUrl){imageBox.innerHTML="";const img=document.createElement("img");img.src=draft.image.dataUrl;img.alt="Generirana slika";imageBox.appendChild(img);imageMeta.textContent=draft.image.filename||"Generirana slika"}else{imageBox.textContent="Slika se ni generirana.";imageMeta.textContent=""}}
    function saveLibrary(){localStorage.setItem("zg_drafts",JSON.stringify(savedDrafts.slice(0,20)));renderLibrary()}
    function renderLibrary(){library.innerHTML="";if(!savedDrafts.length){library.innerHTML='<p class="small">Shranjeni osnutki bodo tukaj.</p>';return}savedDrafts.forEach((item,index)=>{const row=document.createElement("div");row.className="draft-item";row.innerHTML='<strong></strong><span></span><div class="row"><button class="secondary" type="button">Odpri</button><button class="secondary" type="button">Izbrisi</button></div>';row.querySelector("strong").textContent=item.title||item.topic||"Osnutek";row.querySelector("span").textContent=(item.text||"").slice(0,120);const buttons=row.querySelectorAll("button");buttons[0].addEventListener("click",()=>{topic.value=item.topic||"";postText.value=item.text||"";draft=item.draft||null;renderPreview();setStatus("Osnutek odprt.")});buttons[1].addEventListener("click",()=>{savedDrafts.splice(index,1);saveLibrary()});library.appendChild(row)})}
    async function generateText(){const button=document.getElementById("generateText");button.dataset.label=button.textContent;setBusy(button,true,"Ustvarjam...");setStatus("Ustvarjam tekst brez slike...");try{const response=await fetch("/agent/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topicValue(),language:language.value,tone:tone.value,length:length.value,imageStyle:imageStyle.value,includeImage:false})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Draft failed");draft=data.draft;renderDraft();setStatus("Tekst pripravljen. Slika se ni bila generirana.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{setBusy(button,false)}}
    async function refine(action,button){if(!currentText())return setStatus("Najprej generiraj ali vpisi tekst.");button.dataset.label=button.textContent;setBusy(button,true,"Pisem...");try{const response=await fetch("/agent/rewrite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:draft?.source?.title||topic.value,post:currentText(),hashtags:draft?.source?.hashtags||[],action,language:language.value})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Rewrite failed");draft={...(draft||{}),source:data.post,channels:{facebook:{title:data.post.title,text:data.post.post+"\\n\\n"+data.post.hashtags.join(" ")},instagram:{title:data.post.title,text:data.post.post+"\\n\\n"+data.post.hashtags.join(" ")},x:{title:data.post.title,text:(data.post.post+" "+data.post.hashtags.slice(0,2).join(" ")).slice(0,280)}}};renderDraft();setStatus("Tekst izboljsan.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{setBusy(button,false)}}
    async function generateImage(){if(!currentText())return setStatus("Najprej pripravi tekst.");const button=document.getElementById("generateImage");button.dataset.label=button.textContent;setBusy(button,true,"Generiram...");setStatus("Generiram sliko...");try{const response=await fetch("/agent/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:draft?.source?.title||topic.value||"Objava",post:currentText(),hashtags:draft?.source?.hashtags||[],imageStyle:imageStyle.value})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Image failed");draft={...(draft||{}),image:data.image};renderDraft();setStatus("Slika pripravljena.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{setBusy(button,false)}}
    document.querySelectorAll(".tab").forEach((button)=>button.addEventListener("click",()=>{activeChannel=button.dataset.channel;document.querySelectorAll(".tab").forEach((item)=>item.classList.remove("active"));button.classList.add("active");renderDraft()}));
    document.querySelectorAll(".refine").forEach((button)=>button.addEventListener("click",()=>refine(button.dataset.action,button)));
    document.getElementById("generateText").addEventListener("click",generateText);document.getElementById("generateImage").addEventListener("click",generateImage);
    document.getElementById("saveDraft").addEventListener("click",()=>{const text=currentText();if(!text)return setStatus("Ni teksta za shranjevanje.");savedDrafts.unshift({topic:topic.value.trim(),title:draft?.source?.title||topic.value.trim(),text,draft,createdAt:new Date().toISOString()});saveLibrary();setStatus("Osnutek shranjen.")});
    document.getElementById("clear").addEventListener("click",()=>{topic.value="";notes.value="";postText.value="";videoPrompt.value="";imageBox.textContent="Slika bo tukaj sele, ko kliknes Generiraj sliko.";imageMeta.textContent="";draft=null;renderPreview();setStatus("Pocisceno.")});
    document.getElementById("copyText").addEventListener("click",async()=>{await navigator.clipboard.writeText(currentText());setStatus("Tekst kopiran.")});
    document.getElementById("copyImage").addEventListener("click",async()=>{if(!draft?.image?.dataUrl)return setStatus("Ni slike za kopiranje.");const blob=await fetch(draft.image.dataUrl).then((response)=>response.blob());await navigator.clipboard.write([new ClipboardItem({[blob.type]:blob})]);setStatus("Slika kopirana.")});
    document.getElementById("downloadImage").addEventListener("click",()=>{if(!draft?.image?.dataUrl)return setStatus("Ni slike za prenos.");const a=document.createElement("a");a.href=draft.image.dataUrl;a.download=draft.image.filename||"content-studio-image.png";a.click();setStatus("Prenos slike pripravljen.")});
    document.getElementById("sendToVideo").addEventListener("click",()=>{const params=new URLSearchParams({topic:topic.value.trim(),text:currentText().slice(0,1200),language:language.value});window.location.href="/video?"+params.toString()});
    postText.addEventListener("input",renderPreview);renderLibrary();renderPreview();
  </script>
</body>
</html>`;
}

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  res.setHeader("content-type", "text/html; charset=utf-8");
  res.status(200).send(studioPage());
}
