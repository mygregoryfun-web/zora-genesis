function studioPage() {
  return `<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zora Genesis Studio</title>
  <style>
    :root{color-scheme:light;--bg:#f5f1eb;--paper:#fffdf9;--ink:#181512;--muted:#6d675f;--line:#ddd3c7;--accent:#8d4b34;--green:#1e6f62;--blue:#285e9c;--soft:#eee5da;--warn:#9b5f00}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink)}
    main{width:min(1240px,calc(100% - 28px));margin:0 auto;padding:20px 0 42px}header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1px solid var(--line);padding:16px 0;margin-bottom:14px}
    h1{font-size:clamp(30px,5vw,50px);line-height:1;margin:0;letter-spacing:0}h2{font-size:17px;margin:0 0 10px}p{color:var(--muted);margin:8px 0 0;line-height:1.45}a,button,input,select,textarea{font:inherit}a{color:var(--green);font-weight:760;text-decoration:none}
    button,.button{min-height:42px;border:1px solid var(--accent);border-radius:8px;padding:0 14px;background:var(--accent);color:#fff;font-weight:780;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px}
    button.secondary,.button.secondary{background:var(--paper);color:var(--ink);border-color:var(--line)}button.blue{background:var(--blue);border-color:var(--blue)}button.green,.button.green{background:var(--green);border-color:var(--green)}button:disabled{opacity:.6;cursor:progress}
    .actions,.tabs,.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.layout{display:grid;grid-template-columns:340px minmax(0,1fr) 360px;gap:14px;align-items:start}.panel{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:15px;box-shadow:0 1px 2px rgba(24,21,18,.04)}
    label{display:grid;gap:6px;color:var(--muted);font-size:13px;font-weight:730;margin-bottom:10px}input,select,textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:10px 11px}textarea{resize:vertical;line-height:1.5}.prompt{min-height:108px}.post{min-height:430px;font-size:16px}
    .two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.image{aspect-ratio:4/5;border-radius:8px;background:var(--soft);display:grid;place-items:center;overflow:hidden;color:var(--muted);text-align:center;padding:14px}.image img{width:100%;height:100%;object-fit:cover;display:block}
    .tab.active{background:var(--green);border-color:var(--green);color:#fff}.status{min-height:22px;color:var(--muted);font-size:14px;margin-top:10px}.meta{font-size:12px;color:var(--muted);line-height:1.4;margin-top:10px;word-break:break-word}
    .queue{display:grid;gap:8px;margin-top:12px}.topic-chip{border:1px solid var(--line);background:#fff;border-radius:8px;padding:10px;display:flex;justify-content:space-between;gap:8px;align-items:center}.topic-chip span{font-size:14px}.topic-chip button{min-height:32px;padding:0 10px}
    .checklist{display:grid;gap:8px;margin-top:12px}.check{display:flex;gap:8px;align-items:flex-start;color:var(--muted);font-size:13px}.check input{width:auto;margin-top:3px}.small{font-size:12px;color:var(--muted)}.image-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
    @media(max-width:1040px){.layout{grid-template-columns:1fr 1fr}.side{grid-column:1/-1}}@media(max-width:760px){header,.layout,.two{grid-template-columns:1fr}header{flex-direction:column}.post{min-height:330px}.image-actions{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <header>
      <div><h1>Content Studio</h1><p>Ena tema noter. Tekst, slika, video prompt in objava za Facebook, Instagram ali X ven.</p></div>
      <div class="actions"><a class="button secondary" href="/preview">Predogled</a><a class="button secondary" href="/video">Video editor</a><button id="generate">Generiraj</button></div>
    </header>

    <section class="layout">
      <aside class="panel">
        <h2>Vhod</h2>
        <label>Tema<input id="topic" placeholder="Npr. ponos, izdaja, prevara, denar..." /></label>
        <div class="two">
          <label>Jezik<select id="language"><option value="si">SI</option><option value="eng">ENG</option><option value="esp">ESP</option></select></label>
          <label>Dolzina<select id="length"><option value="medium">Srednja</option><option value="short">Kratka</option><option value="long">Daljsa</option></select></label>
        </div>
        <label>Ton<select id="tone"><option value="balanced">Topel + direkten</option><option value="deep">Globok</option><option value="sharp">Bolj oster</option><option value="soft">Nezen</option><option value="story">Kot zgodba</option></select></label>
        <label>Slog slike<select id="imageStyle"><option value="social-editorial">Social editorial</option><option value="zora-cover">Zora artwork cover</option></select></label>
        <label>Dodatna navodila<textarea id="notes" class="prompt" placeholder="Npr. naj bo bolj za mojo FB skupino, brez moraliziranja, z mocnim zacetkom..."></textarea></label>
        <div class="tools"><button id="addTopic" class="secondary" type="button">Dodaj tema</button><button id="clear" class="secondary" type="button">Pocisti</button></div>
        <div class="queue" id="queue"></div>
        <div class="status" id="status">Pripravljeno.</div>
      </aside>

      <section class="panel">
        <h2>Objava</h2>
        <div class="tabs"><button class="secondary tab active" data-channel="facebook">Facebook</button><button class="secondary tab" data-channel="instagram">Instagram</button><button class="secondary tab" data-channel="x">X</button></div>
        <textarea id="postText" class="post" spellcheck="true" placeholder="Tukaj bo tekst za objavo."></textarea>
        <div class="tools"><button id="copyText" class="green" type="button">Kopiraj tekst</button><button id="sendToVideo" class="blue" type="button">Uporabi za video</button></div>
        <div class="checklist">
          <label class="check"><input type="checkbox" /> Tekst sem prebral in zveni kot jaz.</label>
          <label class="check"><input type="checkbox" /> Slika ustreza temi in ni zavajajoca.</label>
          <label class="check"><input type="checkbox" /> Objavljam rocno, nic ni bilo poslano samo.</label>
        </div>
      </section>

      <aside class="panel side">
        <h2>Slika</h2>
        <div class="image" id="imageBox">Slika bo tukaj.</div>
        <div class="image-actions"><button id="copyImage" class="secondary" type="button">Kopiraj sliko</button><button id="downloadImage" class="secondary" type="button">Prenesi sliko</button></div>
        <div class="meta" id="imageMeta"></div>
        <h2 style="margin-top:16px">Video opis</h2>
        <textarea id="videoPrompt" class="prompt" placeholder="Opis za premik slike v video."></textarea>
        <p class="small">Za pravi video odpri Video editor. Studio prenese temo in tekst v URL, sliko pa po potrebi nalozis tam.</p>
      </aside>
    </section>
  </main>
  <script>
    let draft=null,activeChannel="facebook";const topic=document.getElementById("topic"),language=document.getElementById("language"),tone=document.getElementById("tone"),length=document.getElementById("length"),imageStyle=document.getElementById("imageStyle"),notes=document.getElementById("notes"),status=document.getElementById("status"),postText=document.getElementById("postText"),imageBox=document.getElementById("imageBox"),imageMeta=document.getElementById("imageMeta"),videoPrompt=document.getElementById("videoPrompt"),queue=document.getElementById("queue"),generate=document.getElementById("generate");
    const savedTopics=JSON.parse(localStorage.getItem("zg_topics")||"[]");function setStatus(v){status.textContent=v}function topicValue(){return [topic.value.trim(),notes.value.trim()].filter(Boolean).join("\\n\\nDodatno: ")}function saveTopics(){localStorage.setItem("zg_topics",JSON.stringify(savedTopics.slice(0,8)));renderQueue()}function renderQueue(){queue.innerHTML="";savedTopics.forEach((item,index)=>{const row=document.createElement("div");row.className="topic-chip";row.innerHTML='<span></span><button class="secondary" type="button">Uporabi</button>';row.querySelector("span").textContent=item;row.querySelector("button").addEventListener("click",()=>{topic.value=item;createDraft()});queue.appendChild(row)})}
    function renderDraft(){if(!draft)return;const channel=draft.channels[activeChannel];postText.value=channel?channel.text:"";videoPrompt.value=draft.image?.prompt||draft.source?.post||"";if(draft.image?.dataUrl){imageBox.innerHTML="";const img=document.createElement("img");img.src=draft.image.dataUrl;img.alt="Generirana slika";imageBox.appendChild(img);imageMeta.textContent=draft.image.filename||"Generirana slika"}else{imageBox.textContent="Slika ni bila ustvarjena.";imageMeta.textContent=""}}
    async function createDraft(){generate.disabled=true;setStatus("Ustvarjam tekst in sliko...");try{const response=await fetch("/agent/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topicValue(),language:language.value,tone:tone.value,length:length.value,imageStyle:imageStyle.value})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Draft failed");draft=data.draft;renderDraft();setStatus("Osnutek pripravljen. Nic ni bilo objavljeno.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{generate.disabled=false}}
    document.querySelectorAll(".tab").forEach((button)=>button.addEventListener("click",()=>{activeChannel=button.dataset.channel;document.querySelectorAll(".tab").forEach((item)=>item.classList.remove("active"));button.classList.add("active");renderDraft()}));
    generate.addEventListener("click",createDraft);document.getElementById("addTopic").addEventListener("click",()=>{const value=topic.value.trim();if(!value)return setStatus("Najprej vpisi temo.");savedTopics.unshift(value);saveTopics();setStatus("Tema dodana.")});document.getElementById("clear").addEventListener("click",()=>{topic.value="";notes.value="";postText.value="";videoPrompt.value="";imageBox.textContent="Slika bo tukaj.";imageMeta.textContent="";draft=null;setStatus("Pocisceno.")});
    document.getElementById("copyText").addEventListener("click",async()=>{await navigator.clipboard.writeText(postText.value);setStatus("Tekst kopiran.")});document.getElementById("copyImage").addEventListener("click",async()=>{if(!draft?.image?.dataUrl)return setStatus("Ni slike za kopiranje.");const blob=await fetch(draft.image.dataUrl).then((response)=>response.blob());await navigator.clipboard.write([new ClipboardItem({[blob.type]:blob})]);setStatus("Slika kopirana.")});
    document.getElementById("downloadImage").addEventListener("click",()=>{if(!draft?.image?.dataUrl)return setStatus("Ni slike za prenos.");const a=document.createElement("a");a.href=draft.image.dataUrl;a.download=draft.image.filename||"zora-genesis-image.png";a.click();setStatus("Prenos slike pripravljen.")});document.getElementById("sendToVideo").addEventListener("click",()=>{const params=new URLSearchParams({topic:topic.value.trim(),text:postText.value.slice(0,1200),language:language.value});window.location.href="/video?"+params.toString()});
    renderQueue();
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
