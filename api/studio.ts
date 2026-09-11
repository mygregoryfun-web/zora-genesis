function studioPage() {
  return `<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Content Studio</title>
  <style>
    :root{color-scheme:light;--bg:#f3f5f7;--paper:#ffffff;--ink:#121417;--muted:#667085;--line:#d7dee8;--accent:#8a3f2d;--green:#117466;--blue:#235fd8;--amber:#b86b1c;--soft:#edf1f5;--danger:#b42318;--shadow:0 10px 28px rgba(18,24,33,.08)}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:linear-gradient(180deg,#eef3f6 0,#f8fafb 240px,#f3f5f7 100%);color:var(--ink)}
    main{width:min(1380px,calc(100% - 24px));margin:0 auto;padding:12px 0 28px}header{display:flex;justify-content:space-between;align-items:center;gap:14px;border:1px solid #cfd8e5;background:linear-gradient(135deg,#ffffff 0,#f8fbfa 52%,#fff6ef 100%);border-radius:8px;padding:14px 16px;margin-bottom:10px;box-shadow:var(--shadow)}
    h1{font-size:30px;line-height:1;margin:0;letter-spacing:0}.eyebrow{display:inline-flex;align-items:center;width:max-content;border:1px solid #c7d8d3;background:#eef8f5;color:#117466;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:820;margin-bottom:7px}h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;color:#2f3a48;display:flex;align-items:center;gap:7px}h2:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--accent)}p{color:var(--muted);margin:5px 0 0;line-height:1.42}a,button,input,select,textarea{font:inherit}a{color:var(--green);font-weight:760;text-decoration:none}
    button,.button{min-height:36px;border:1px solid var(--accent);border-radius:8px;padding:0 12px;background:var(--accent);color:#fff;font-size:13px;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 1px 1px rgba(18,20,23,.06)}button:hover,.button:hover{filter:brightness(.98);transform:translateY(-1px)}
    button.secondary,.button.secondary{background:#fff;color:var(--ink);border-color:var(--line)}button.blue{background:var(--blue);border-color:var(--blue)}button.green{background:var(--green);border-color:var(--green)}button:disabled{opacity:.6;cursor:progress;transform:none}
    .actions,.tabs,.tools{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.layout{display:grid;grid-template-columns:304px minmax(0,1fr) 336px;gap:12px;align-items:start}.panel{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:8px;padding:13px;box-shadow:var(--shadow)}
    label{display:grid;gap:5px;color:#596579;font-size:12px;font-weight:760;margin-bottom:8px}input,select,textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:9px 10px}input:focus,select:focus,textarea:focus{outline:3px solid rgba(35,95,216,.14);border-color:#8ba7f7}textarea{resize:vertical;line-height:1.5}.prompt{min-height:82px}.post{min-height:450px;font-size:15.5px;background:#fffdf9}
    .two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.image{aspect-ratio:4/5;border-radius:8px;background:linear-gradient(135deg,#e8eef3,#fffaf6);border:1px dashed #b8c5d3;display:grid;place-items:center;overflow:hidden;color:var(--muted);text-align:center;padding:12px}.image img{width:100%;height:100%;object-fit:cover;display:block}
    .tab{border-color:#cfd8e5}.tab.active{background:#182230;border-color:#182230;color:#fff}.mode-tabs{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px}.mode{min-height:34px}.mode.active{background:#182230;border-color:#182230;color:#fff}.suggestions{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 9px}.suggestion{min-height:30px;padding:0 9px;font-size:12px;border-color:#d2dae6;background:#fff;color:#253044}.status{min-height:20px;color:#475467;font-size:13px;margin-top:8px;border:1px solid #e1e7ee;background:#f8fafc;border-radius:8px;padding:7px 9px}.meta{font-size:12px;color:var(--muted);line-height:1.4;margin-top:8px;word-break:break-word}
    .costs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 10px}.cost{background:#fff;border:1px solid var(--line);border-top:3px solid var(--accent);border-radius:8px;padding:9px 10px;box-shadow:0 1px 2px rgba(18,24,33,.04)}.cost:nth-child(2){border-top-color:var(--blue)}.cost:nth-child(3){border-top-color:var(--green)}.cost:nth-child(4){border-top-color:var(--amber)}.cost strong{display:block;color:var(--ink);font-size:13px}.cost span{font-size:12px;color:var(--muted)}
    .account{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end;background:linear-gradient(135deg,#182230 0,#223247 58%,#173c35 100%);color:#fff;border:1px solid #293548;border-radius:8px;padding:11px 12px;margin:0 0 10px;box-shadow:var(--shadow)}.account p,.account label{color:#d6dde7}.account .signed{display:none}.account.authed .signed{display:block}.account.authed .login{display:none}.account input{margin:0;background:#fff}.account strong{display:block;color:#fff}.account .danger{color:var(--danger)}
    .library{display:grid;gap:8px;margin-top:10px;max-height:270px;overflow:auto}.draft-item{border:1px solid var(--line);background:#fff;border-radius:8px;padding:9px;display:grid;gap:8px;box-shadow:0 1px 2px rgba(18,24,33,.04)}.draft-item strong{font-size:13px}.draft-item span{font-size:12px;color:var(--muted)}.draft-item .row{display:flex;gap:6px;flex-wrap:wrap}
    .checklist{display:grid;gap:7px;margin-top:10px;border-top:1px solid #edf1f5;padding-top:10px}.check{display:flex;gap:8px;align-items:flex-start;color:var(--muted);font-size:12px}.check input{width:auto;margin-top:3px}.small{font-size:12px;color:var(--muted)}.score{display:grid;gap:7px;border:1px solid var(--line);background:#fbfcfe;border-radius:8px;padding:10px;margin-top:10px}.score-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:#475467}.badge{border:1px solid #d8dee8;border-radius:999px;padding:3px 8px;background:#fff;font-weight:820;color:#667085}.badge.ok{color:#146c43;border-color:#b7e4d3;background:#f3fcf8}.badge.warn{color:#9f2d20;border-color:#f2c7c3;background:#fff7f5}.image-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.preview-card{border:1px solid var(--line);border-left:3px solid var(--green);border-radius:8px;background:#fbfcfe;padding:11px;margin-top:10px;white-space:pre-wrap;line-height:1.45;font-size:14px;max-height:220px;overflow:auto}
    @media(max-width:1040px){.layout{grid-template-columns:1fr 1fr}.side{grid-column:1/-1}.costs{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){header,.layout,.two,.account{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}.post{min-height:300px}.image-actions,.costs{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <header>
      <div><div class="eyebrow">AI workflow za ustvarjalce</div><h1>Content Studio</h1><p>Ustvari, uredi in shrani objave, slike ter video osnutke za družbena omrežja na enem mestu. Objavo vedno pregledaš in objaviš ročno.</p></div>
      <div class="actions"><a class="button secondary" href="/admin">Admin</a><a class="button secondary" href="/pricing">Naročnine</a><a class="button secondary" href="/video">Video editor</a></div>
    </header>

    <section class="account" id="accountBox">
      <div class="login">
        <label>E-mail za prijavo<input id="email" type="email" placeholder="tvoj@email.com" /></label>
        <label>Admin koda<input id="ownerCode" type="password" placeholder="Samo za lastnika" /></label>
      </div>
      <div class="signed">
        <strong id="accountName">Nisi prijavljen</strong>
        <p id="creditLine">Krediti se naložijo po prijavi.</p>
      </div>
      <div class="actions"><button id="login" type="button">Prijava</button><button id="logout" class="secondary" type="button">Odjava</button><a class="button secondary" href="/pricing">Kupi kredite</a></div>
    </section>

    <section class="costs">
      <div class="cost"><strong>Tekst</strong><span>5 kreditov</span></div>
      <div class="cost"><strong>Izboljšava</strong><span>3 krediti</span></div>
      <div class="cost"><strong>Slika</strong><span>15 kreditov</span></div>
      <div class="cost"><strong>Video</strong><span>25 kreditov</span></div>
    </section>

    <section class="layout">
      <aside class="panel">
        <h2>Pogovor</h2>
        <div class="mode-tabs"><button class="secondary mode active" data-mode="chat" type="button">Pogovor z agentom</button><button class="secondary mode" data-mode="post" type="button">Hitro ustvari objavo</button></div>
        <label>Kaj želiš ustvariti?<input id="topic" placeholder="Npr. predstavi sebe kaj počneš, napiši odgovor, pripravi objavo za FB..." /></label>
        <div class="suggestions">
          <button class="suggestion" data-prompt="Predstavi moj projekt za Facebook, Instagram in X. Naj bo jasno, uporabno in človeško." type="button">Predstavi moj projekt</button>
          <button class="suggestion" data-prompt="Napiši FB objavo na temo: " type="button">Napiši FB objavo</button>
          <button class="suggestion" data-prompt="Napiši odgovor na to vprašanje: " type="button">Napiši odgovor</button>
          <button class="suggestion" data-prompt="Naredi ta tekst bolj človeški, manj AI in bolj uporaben: " type="button">Bolj človeško</button>
          <button class="suggestion" data-prompt="Naredi ta tekst bolj prodajen, ampak ne vsiljiv: " type="button">Bolj prodajno</button>
          <button class="suggestion" data-prompt="Naredi ta tekst krajši in močnejši: " type="button">Naredi krajše</button>
        </div>
        <div class="two">
          <label>Jezik<select id="language"><option value="si">SI</option><option value="eng">ENG</option><option value="esp">ESP</option></select></label>
          <label>Dolžina<select id="length"><option value="medium">Srednja</option><option value="short">Kratka</option><option value="long">Daljša</option></select></label>
        </div>
        <label>Ton<select id="tone"><option value="my-style">Moj slog</option><option value="balanced">Topel + direkten</option><option value="deep">Globok</option><option value="sharp">Bolj oster</option><option value="soft">Nežen</option><option value="story">Kot zgodba</option></select></label>
        <label>Slog slike<select id="imageStyle"><option value="social-editorial">Social editorial</option><option value="artwork-cover">Artwork cover</option><option value="contradictory-art">Kontradiktorni art</option></select></label>
        <label>Kontekst in dodatna navodila<textarea id="notes" class="prompt" placeholder="Piši kot v pogovoru: komu je namenjeno, kaj želiš doseči, kaj naj izpusti, kakšen slog želiš..."></textarea></label>
        <div class="tools"><button id="generateText" class="green" type="button">Pripravi osnutek</button><button id="clear" class="secondary" type="button">Počisti</button></div>
        <div class="status" id="status">Pripravljeno.</div>
        <h2 style="margin-top:16px">Knjižnica</h2>
        <div class="library" id="library"></div>
      </aside>

      <section class="panel">
        <h2>Objava</h2>
        <div class="tabs"><button class="secondary tab active" data-channel="facebook">Facebook</button><button class="secondary tab" data-channel="instagram">Instagram</button><button class="secondary tab" data-channel="x">X</button></div>
        <textarea id="postText" class="post" spellcheck="true" placeholder="Najprej napiši, kaj želiš, nato klikni Pripravi osnutek."></textarea>
        <div class="tools">
          <button id="copyText" class="secondary" type="button">Kopiraj</button>
          <button id="saveDraft" class="secondary" type="button">Shrani</button>
          <button class="secondary refine" data-action="my-style" type="button">Moj slog</button>
          <button class="secondary refine" data-action="sharper" type="button">Bolj ostro</button>
          <button class="secondary refine" data-action="emotional" type="button">Bolj čustveno</button>
          <button class="secondary refine" data-action="less-ai" type="button">Manj AI</button>
          <button class="secondary refine" data-action="shorter" type="button">Krajše</button>
          <button class="secondary refine" data-action="longer" type="button">Daljše</button>
          <button class="secondary refine" data-action="question" type="button">Boljši konec</button>
        </div>
        <div class="preview-card" id="previewCard">Predogled objave bo tukaj.</div>
        <div class="score" id="scoreBox">
          <div class="score-row"><span>Drži se navodila</span><span class="badge" id="scoreInstruction">-</span></div>
          <div class="score-row"><span>Uporabno za objavo</span><span class="badge" id="scoreUseful">-</span></div>
          <div class="score-row"><span>Zveni preveč AI</span><span class="badge" id="scoreAi">-</span></div>
          <button id="autoFix" class="secondary" type="button">Popravi samodejno</button>
        </div>
        <div class="checklist">
          <label class="check"><input type="checkbox" /> Tekst sem prebral in zveni kot jaz.</label>
          <label class="check"><input type="checkbox" /> Slika ustreza temi in ni zavajajoča.</label>
          <label class="check"><input type="checkbox" /> Objavljam ročno, nič ni bilo poslano samo.</label>
        </div>
      </section>

      <aside class="panel side">
        <h2>Slika in video</h2>
        <div class="image" id="imageBox">Slika bo tukaj šele, ko klikneš Generiraj sliko.</div>
        <div class="image-actions"><button id="generateImage" class="green" type="button">Generiraj sliko</button><button id="downloadImage" class="secondary" type="button">Prenesi sliko</button></div>
        <div class="image-actions"><button id="copyImage" class="secondary" type="button">Kopiraj sliko</button><button id="sendToVideo" class="blue" type="button">Ustvari video</button></div>
        <div class="meta" id="imageMeta"></div>
        <h2 style="margin-top:16px">Video opis</h2>
        <textarea id="videoPrompt" class="prompt" placeholder="Opis za premik slike v video."></textarea>
        <p class="small">Video porablja Runway kredite. Uporabi ga šele, ko sta tekst in slika dobra.</p>
      </aside>
    </section>
  </main>
  <script>
    let draft=null,activeChannel="facebook",session=null,inputMode="chat";
    const topic=document.getElementById("topic"),language=document.getElementById("language"),tone=document.getElementById("tone"),length=document.getElementById("length"),imageStyle=document.getElementById("imageStyle"),notes=document.getElementById("notes"),status=document.getElementById("status"),postText=document.getElementById("postText"),imageBox=document.getElementById("imageBox"),imageMeta=document.getElementById("imageMeta"),videoPrompt=document.getElementById("videoPrompt"),previewCard=document.getElementById("previewCard"),library=document.getElementById("library"),accountBox=document.getElementById("accountBox"),accountName=document.getElementById("accountName"),creditLine=document.getElementById("creditLine"),email=document.getElementById("email"),ownerCode=document.getElementById("ownerCode"),scoreInstruction=document.getElementById("scoreInstruction"),scoreUseful=document.getElementById("scoreUseful"),scoreAi=document.getElementById("scoreAi");
    const savedDrafts=JSON.parse(localStorage.getItem("zg_drafts")||"[]");
    function setStatus(v){status.textContent=v}
    function renderAccount(){accountBox.classList.toggle("authed",!!session);accountName.textContent=session?session.email:"Nisi prijavljen";creditLine.textContent=session?(session.role==="owner"?"Admin račun: neomejena uporaba.":"Na voljo: "+session.credits+" kreditov."):"Krediti se naložijo po prijavi."}
    async function refreshSession(){const response=await fetch("/auth/status");const data=await response.json();session=data.session;renderAccount();await loadAccountDrafts()}
    async function login(){const value=email.value.trim();if(!value)return setStatus("Vpiši e-mail.");const response=await fetch("/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:value,ownerCode:ownerCode.value})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Login failed");session=data.session;renderAccount();await loadAccountDrafts();setStatus(session.role==="owner"?"Prijavljen kot admin.":"Prijavljen. Krediti so pripravljeni.")}
    async function logout(){await fetch("/auth/logout",{method:"POST"});session=null;renderAccount();setStatus("Odjavljen.")}
    function updateSession(data){if(data&&data.session){session=data.session;renderAccount()}}
    function topicValue(){const mode=inputMode==="post"?"Način: Hitro ustvari objavo. Uporabnik je verjetno vpisal temo, iz nje pripravi uporabno objavo.":"Način: Pogovor z agentom. Uporabnik piše navodilo ali vprašanje, najprej razumi namen in šele potem pripravi osnutek.";return [mode,topic.value.trim(),notes.value.trim()].filter(Boolean).join("\\n\\nDodatno: ")}
    function currentText(){return postText.value.trim()}
    function setBusy(button,busy,label){button.disabled=busy;if(label)button.textContent=busy?label:button.dataset.label}
    function channelText(){return draft?.channels?.[activeChannel]?.text||currentText()}
    function setBadge(el,ok,yesText="Da",noText="Ne"){el.textContent=ok?yesText:noText;el.className="badge "+(ok?"ok":"warn")}
    function importantWords(){return (topic.value+" "+notes.value).toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9čšžćđ\\s]/gi," ").split(/\\s+/).filter((word)=>word.length>=5&&!["napisi","naredi","pripravi","objavo","odgovor","projekt","facebook","instagram","ustvari","zelim","kako","tema"].includes(word)).slice(0,8)}
    function evaluateDraft(){const text=currentText();if(!text){scoreInstruction.textContent="-";scoreUseful.textContent="-";scoreAi.textContent="-";scoreInstruction.className=scoreUseful.className=scoreAi.className="badge";return}const normalized=text.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"");const words=importantWords();const hits=words.filter((word)=>normalized.includes(word)).length;const follows=!words.length||hits>=Math.min(2,words.length);const useful=text.length>=180&&/[.!?]/.test(text)&&!/Tukaj bo|Lorem/i.test(text);const ai=/(v današnjem svetu|pomembno je|vsak ima svojo pot|komunikacija je ključ|globok strah|pod površjem|ta vprašanja niso enostavna|kot umetna inteligenca|ne morem)/i.test(text);setBadge(scoreInstruction,follows);setBadge(scoreUseful,useful);setBadge(scoreAi,!ai,"Ne","Da")}
    function renderPreview(){previewCard.textContent=channelText()||"Predogled objave bo tukaj.";evaluateDraft()}
    function renderDraft(){if(!draft)return;postText.value=channelText();videoPrompt.value=draft.image?.prompt||draft.source?.post||postText.value;renderPreview();if(draft.image?.dataUrl){imageBox.innerHTML="";const img=document.createElement("img");img.src=draft.image.dataUrl;img.alt="Generirana slika";imageBox.appendChild(img);imageMeta.textContent=draft.image.filename||"Generirana slika"}else{imageBox.textContent="Slika še ni generirana.";imageMeta.textContent=""}}
    function saveLibrary(){localStorage.setItem("zg_drafts",JSON.stringify(savedDrafts.slice(0,20)));renderLibrary()}
    async function loadAccountDrafts(){if(!session||session.role==="owner")return;try{const response=await fetch("/drafts/list");const data=await response.json();if(response.ok&&data.ok&&Array.isArray(data.drafts)){savedDrafts.splice(0,savedDrafts.length,...data.drafts.map((item)=>({topic:item.topic,title:item.title,text:item.text,draft:item.draft,createdAt:item.createdAt})));saveLibrary()}}catch{}}
    function renderLibrary(){library.innerHTML="";if(!savedDrafts.length){library.innerHTML='<p class="small">Shranjeni osnutki bodo tukaj.</p>';return}savedDrafts.forEach((item,index)=>{const row=document.createElement("div");row.className="draft-item";row.innerHTML='<strong></strong><span></span><div class="row"><button class="secondary" type="button">Odpri</button><button class="secondary" type="button">Izbriši</button></div>';row.querySelector("strong").textContent=item.title||item.topic||"Osnutek";row.querySelector("span").textContent=(item.text||"").slice(0,120);const buttons=row.querySelectorAll("button");buttons[0].addEventListener("click",()=>{topic.value=item.topic||"";postText.value=item.text||"";draft=item.draft||null;renderPreview();setStatus("Osnutek odprt.")});buttons[1].addEventListener("click",()=>{savedDrafts.splice(index,1);saveLibrary()});library.appendChild(row)})}
    async function generateText(){const button=document.getElementById("generateText");button.dataset.label=button.textContent;setBusy(button,true,"Razmišljam...");setStatus("Pripravljam osnutek iz tvojega navodila...");try{const response=await fetch("/agent/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topicValue(),language:language.value,tone:tone.value,length:length.value,imageStyle:imageStyle.value,includeImage:false})});const data=await response.json();updateSession(data);if(!response.ok||!data.ok)throw new Error(data.error||"Draft failed");draft=data.draft;renderDraft();setStatus("Osnutek pripravljen. Porabljenih 5 kreditov.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{setBusy(button,false)}}
    async function refine(action,button){if(!currentText())return setStatus("Najprej generiraj ali vpiši tekst.");button.dataset.label=button.textContent;setBusy(button,true,"Pišem...");try{const response=await fetch("/agent/rewrite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:draft?.source?.title||topic.value,post:currentText(),hashtags:draft?.source?.hashtags||[],action,language:language.value})});const data=await response.json();updateSession(data);if(!response.ok||!data.ok)throw new Error(data.error||"Rewrite failed");draft={...(draft||{}),source:data.post,channels:{facebook:{title:data.post.title,text:data.post.post+"\\n\\n"+data.post.hashtags.join(" ")},instagram:{title:data.post.title,text:data.post.post+"\\n\\n"+data.post.hashtags.join(" ")},x:{title:data.post.title,text:(data.post.post+" "+data.post.hashtags.slice(0,2).join(" ")).slice(0,280)}}};renderDraft();setStatus("Tekst izboljšan. Porabljeni 3 krediti.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{setBusy(button,false)}}
    async function generateImage(){if(!currentText())return setStatus("Najprej pripravi tekst.");const button=document.getElementById("generateImage");button.dataset.label=button.textContent;setBusy(button,true,"Generiram...");setStatus("Generiram sliko...");try{const response=await fetch("/agent/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:draft?.source?.title||topic.value||"Objava",post:currentText(),hashtags:draft?.source?.hashtags||[],imageStyle:imageStyle.value})});const data=await response.json();updateSession(data);if(!response.ok||!data.ok)throw new Error(data.error||"Image failed");draft={...(draft||{}),image:data.image};renderDraft();setStatus("Slika pripravljena. Porabljenih 15 kreditov.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{setBusy(button,false)}}
    document.querySelectorAll(".tab").forEach((button)=>button.addEventListener("click",()=>{activeChannel=button.dataset.channel;document.querySelectorAll(".tab").forEach((item)=>item.classList.remove("active"));button.classList.add("active");renderDraft()}));
    document.querySelectorAll(".refine").forEach((button)=>button.addEventListener("click",()=>refine(button.dataset.action,button)));
    document.querySelectorAll(".mode").forEach((button)=>button.addEventListener("click",()=>{inputMode=button.dataset.mode;document.querySelectorAll(".mode").forEach((item)=>item.classList.remove("active"));button.classList.add("active");topic.placeholder=inputMode==="post"?"Npr. ponos, izdaja, prevara, denar...":"Npr. predstavi sebe kaj počneš, napiši odgovor, pripravi objavo za FB...";setStatus(inputMode==="post"?"Način: hitro ustvari objavo.":"Način: pogovor z agentom.")}));
    document.querySelectorAll(".suggestion").forEach((button)=>button.addEventListener("click",()=>{const value=button.dataset.prompt||"";topic.value=topic.value?value+topic.value:value;topic.focus()}));
    document.getElementById("generateText").addEventListener("click",generateText);document.getElementById("generateImage").addEventListener("click",generateImage);
    document.getElementById("autoFix").addEventListener("click",()=>refine("auto-fix",document.getElementById("autoFix")));
    document.getElementById("login").addEventListener("click",()=>login().catch((error)=>setStatus(error instanceof Error?error.message:String(error))));
    document.getElementById("logout").addEventListener("click",()=>logout().catch((error)=>setStatus(error instanceof Error?error.message:String(error))));
    document.getElementById("saveDraft").addEventListener("click",async()=>{const text=currentText();if(!text)return setStatus("Ni teksta za shranjevanje.");const item={topic:topic.value.trim(),title:draft?.source?.title||topic.value.trim(),text,draft,createdAt:new Date().toISOString()};savedDrafts.unshift(item);saveLibrary();try{if(session&&session.role!=="owner"){const response=await fetch("/drafts/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Save failed");setStatus("Osnutek shranjen v račun.")}else{setStatus("Osnutek shranjen lokalno.")}}catch(error){setStatus("Osnutek je shranjen lokalno. Baza se ni shranila: "+(error instanceof Error?error.message:String(error)))}})
    document.getElementById("clear").addEventListener("click",()=>{topic.value="";notes.value="";postText.value="";videoPrompt.value="";imageBox.textContent="Slika bo tukaj šele, ko klikneš Generiraj sliko.";imageMeta.textContent="";draft=null;renderPreview();setStatus("Počiščeno.")});
    document.getElementById("copyText").addEventListener("click",async()=>{await navigator.clipboard.writeText(currentText());setStatus("Tekst kopiran.")});
    document.getElementById("copyImage").addEventListener("click",async()=>{if(!draft?.image?.dataUrl)return setStatus("Ni slike za kopiranje.");const blob=await fetch(draft.image.dataUrl).then((response)=>response.blob());await navigator.clipboard.write([new ClipboardItem({[blob.type]:blob})]);setStatus("Slika kopirana.")});
    document.getElementById("downloadImage").addEventListener("click",()=>{if(!draft?.image?.dataUrl)return setStatus("Ni slike za prenos.");const a=document.createElement("a");a.href=draft.image.dataUrl;a.download=draft.image.filename||"content-studio-image.png";a.click();setStatus("Prenos slike pripravljen.")});
    document.getElementById("sendToVideo").addEventListener("click",()=>{const params=new URLSearchParams({topic:topic.value.trim(),text:currentText().slice(0,1200),language:language.value});window.location.href="/video?"+params.toString()});
    postText.addEventListener("input",renderPreview);topic.addEventListener("input",evaluateDraft);notes.addEventListener("input",evaluateDraft);renderLibrary();renderPreview();refreshSession().catch(()=>renderAccount());
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
