function videoPage() {
  return `<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zora Genesis AI Video</title>
  <style>
    :root{color-scheme:light;--bg:#f6f3ef;--paper:#fffdf9;--ink:#191715;--muted:#706a63;--line:#ddd5cb;--accent:#8c4b35;--accent2:#1f6f64;--soft:#efe7de;--dark:#151312}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink)}
    main{width:min(1180px,calc(100% - 28px));margin:0 auto;padding:22px 0 40px}header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0;border-bottom:1px solid var(--line);margin-bottom:18px}
    h1{margin:0;font-size:clamp(30px,5vw,48px);line-height:1;letter-spacing:0}h2{margin:0;font-size:16px}p{color:var(--muted)}a,button,input,select,textarea{font:inherit}a{color:var(--accent2);text-decoration:none;font-weight:750}
    .layout{display:grid;grid-template-columns:minmax(300px,390px) minmax(0,1fr);gap:14px;align-items:start}.panel{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:16px;box-shadow:0 1px 2px rgba(25,23,21,.04)}.controls{display:grid;gap:13px}
    label{display:grid;gap:6px;color:var(--muted);font-size:13px;font-weight:720}input,select,textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);padding:10px 11px}textarea{min-height:100px;resize:vertical;line-height:1.45}
    .row,.credit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.credit-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.button-row{display:flex;flex-wrap:wrap;gap:9px}
    button{min-height:42px;border:1px solid var(--accent);border-radius:8px;padding:0 14px;background:var(--accent);color:#fff;font-weight:780;cursor:pointer}button.secondary{background:var(--paper);color:var(--ink);border-color:var(--line)}button:disabled{opacity:.6;cursor:progress}
    .stage{display:grid;place-items:center;min-height:620px}.canvas-wrap{width:min(100%,430px);display:grid;gap:12px;justify-items:center}canvas,video{width:100%;height:auto;border-radius:8px;background:var(--dark);box-shadow:0 18px 50px rgba(25,23,21,.18)}video{display:none}
    .status{color:var(--muted);font-size:14px;text-align:center;min-height:22px}.download{display:none;min-height:42px;align-items:center;justify-content:center;border-radius:8px;padding:0 14px;color:#fff;background:var(--accent2)}.download.show{display:inline-flex}
    .credit-panel,.credit-card{display:grid;gap:8px;border:1px solid var(--line);border-radius:8px;padding:12px;background:#fff}.credit-card{background:var(--soft);min-height:82px}.credit-card span,.note{color:var(--muted);font-size:12px;line-height:1.4}
    @media(max-width:880px){header,.layout,.row,.credit-grid{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}.stage{min-height:auto}}
  </style>
</head>
<body>
  <main>
    <header><div><h1>AI foto v video</h1><p>Nalozi sliko, opisi prizor, Runway ustvari pravi AI video za objave.</p></div><a href="/preview">Nazaj na predogled objave</a></header>
    <section class="layout">
      <aside class="panel controls">
        <label>Slika<input id="file" type="file" accept="image/*" /></label>
        <div class="row"><label>Format<select id="aspect"><option value="9:16">Reels / Story 9:16</option><option value="1:1">Kvadrat 1:1</option><option value="16:9">Lezece 16:9</option></select></label><label>Trajanje<select id="duration"><option value="5">5 sekund</option><option value="10">10 sekund</option></select></label></div>
        <div class="row"><label>Tema za govor<input id="speechTopic" placeholder="Npr. ponos, izdaja, denar, zaupanje..." /></label><label>Jezik govora<select id="speechLanguage"><option value="si">SI</option><option value="eng">ENG</option><option value="esp">ESP</option></select></label></div>
        <button id="generateSpeech" class="secondary" type="button">Ustvari govor</button>
        <label>Opis videa<textarea id="prompt" placeholder="Npr. pocasen cinematic priblizek, oseba se nasmehne, topla svetloba, realisticno gibanje..."></textarea></label>
        <div class="button-row"><button id="aiVideo" type="button">Ustvari AI video</button><button id="localExport" class="secondary" type="button">Hiter WebM izvoz</button></div>
        <section class="credit-panel"><h2>Video krediti</h2><div class="credit-grid"><div class="credit-card"><strong>5 sekund</strong><span>Gen-4 Turbo porabi priblizno 25 kreditov.</span></div><div class="credit-card"><strong>10 sekund</strong><span>Gen-4 Turbo porabi priblizno 50 kreditov.</span></div><div class="credit-card"><strong>1000 kreditov</strong><span>Priblizno 40 kratkih 5s testov.</span></div></div><p class="note">Kljuc ostane na backendu kot RUNWAYML_API_SECRET. Browser ga nikoli ne vidi.</p></section>
      </aside>
      <section class="panel stage"><div class="canvas-wrap"><canvas id="canvas" width="1080" height="1920"></canvas><video id="video" controls playsinline></video><div class="status" id="status">Nalozi sliko in ustvari AI video.</div><a id="download" class="download" download="ai-video.mp4">Prenesi video</a></div></section>
    </section>
  </main>
  <script>
    const file=document.getElementById("file"),aspect=document.getElementById("aspect"),duration=document.getElementById("duration"),prompt=document.getElementById("prompt"),speechTopic=document.getElementById("speechTopic"),speechLanguage=document.getElementById("speechLanguage"),canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d"),video=document.getElementById("video"),status=document.getElementById("status"),download=document.getElementById("download");let image=null,imageDataUrl="";
    function setStatus(v){status.textContent=v}function ratio(){if(aspect.value==="16:9")return"1280:720";if(aspect.value==="1:1")return"960:960";return"720:1280"}function setCanvas(){if(aspect.value==="16:9"){canvas.width=1920;canvas.height=1080}else if(aspect.value==="1:1"){canvas.width=1080;canvas.height=1080}else{canvas.width=1080;canvas.height=1920}draw()}
    function draw(){ctx.fillStyle="#151312";ctx.fillRect(0,0,canvas.width,canvas.height);if(!image){ctx.fillStyle="#efe7de";ctx.font="700 42px Arial,sans-serif";ctx.textAlign="center";ctx.fillText("Nalozi sliko",canvas.width/2,canvas.height/2);ctx.textAlign="left";return}const ir=image.width/image.height;let w=canvas.width,h=w/ir;if(h<canvas.height){h=canvas.height;w=h*ir}ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h)}
    file.addEventListener("change",()=>{const selected=file.files&&file.files[0];if(!selected)return;const reader=new FileReader();reader.onload=()=>{imageDataUrl=String(reader.result);const img=new Image();img.onload=()=>{image=img;draw();setStatus("Slika pripravljena.")};img.src=imageDataUrl};reader.readAsDataURL(selected)});
    aspect.addEventListener("change",setCanvas);
    document.getElementById("generateSpeech").addEventListener("click",async()=>{const topic=speechTopic.value.trim();if(!topic)return setStatus("Najprej vpisi temo za govor.");const button=document.getElementById("generateSpeech");button.disabled=true;try{setStatus("Ustvarjam govor...");const response=await fetch("/agent/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic:topic,language:speechLanguage.value})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Speech draft failed");prompt.value=data.draft.source.post;setStatus("Govor je pripravljen kot opis videa.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{button.disabled=false}});
    async function poll(id){for(let i=0;i<48;i++){await new Promise((resolve)=>setTimeout(resolve,i<2?2500:5000));const response=await fetch("/api/video/task?id="+encodeURIComponent(id));const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"Video status failed");const task=data.task;setStatus("Runway: "+(task.status||"processing")+(task.progress?" "+Math.round(task.progress*100)+"%":""));if(task.status==="SUCCEEDED"&&task.output?.[0])return task.output[0];if(task.status==="FAILED"||task.status==="CANCELED")throw new Error("AI video ni uspel: "+task.status)}throw new Error("Video se predolgo ustvarja.")}
    document.getElementById("aiVideo").addEventListener("click",async()=>{if(!imageDataUrl)return setStatus("Najprej nalozi sliko.");const button=document.getElementById("aiVideo");button.disabled=true;video.style.display="none";download.classList.remove("show");try{setStatus("Posiljam v Runway...");const response=await fetch("/api/video/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"gen4_turbo",promptImage:imageDataUrl,promptText:prompt.value.trim()||"Subtle cinematic movement, natural light, realistic social media video.",ratio:ratio(),duration:Number(duration.value)})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||"AI video generation failed");setStatus("Runway task sprejet. Cena: "+(data.task.estimatedCost?.credits||"?")+" kreditov.");const url=await poll(data.task.id);video.src=url;video.style.display="block";download.href=url;download.classList.add("show");setStatus("AI video je pripravljen.")}catch(error){setStatus(error instanceof Error?error.message:String(error))}finally{button.disabled=false}});
    document.getElementById("localExport").addEventListener("click",()=>{if(!image)return setStatus("Najprej nalozi sliko.");const stream=canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp9"}),chunks=[];recorder.ondataavailable=(event)=>{if(event.data.size)chunks.push(event.data)};recorder.onstop=()=>{const blob=new Blob(chunks,{type:"video/webm"});download.href=URL.createObjectURL(blob);download.download="hitri-video.webm";download.classList.add("show");setStatus("WebM pripravljen.")};recorder.start();setTimeout(()=>recorder.stop(),Number(duration.value)*1000);setStatus("Izvazam WebM...")});
    setCanvas();
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
  res.status(200).send(videoPage());
}
