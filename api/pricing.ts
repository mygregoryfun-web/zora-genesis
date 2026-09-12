import { billingProductsPublic, USDC_BASE_ADDRESS } from "../src/services/billing.js";
import { config } from "../src/config.js";

const usdcBaseAddress = USDC_BASE_ADDRESS;
const baseChainId = "0x2105";
const baseChainIdDecimal = "8453";
const products = billingProductsPublic();

const tiers = [
  {
    id: "creator",
    name: "Creator",
    price: 19,
    credits: 250,
    description: "Za posameznike, ki želijo redne objave za FB, Instagram in X.",
    features: ["Content Studio", "Moj slog", "Tekst + slika", "Ročno objavljanje", "Osnovni video workflow"],
  },
  {
    id: "studio",
    name: "Studio",
    price: 49,
    credits: 800,
    description: "Za ustvarjalce, strani in manjse skupine, ki rabijo vec idej in boljsi workflow.",
    features: ["Vse iz Creator", "Vec stilov slik", "Kontradiktorni art", "Video osnutki", "Prioritetne izboljsave promptov"],
  },
  {
    id: "agency",
    name: "Agency",
    price: 149,
    credits: 3000,
    description: "Za uporabo z vec profili ali za storitev, ki jo prodajas naprej.",
    features: ["Vse iz Studio", "Vec brand glasov", "White-label priprava", "Mesecni setup support", "Rocni pregled workflowa"],
  },
];

const creditPacks = [
  {
    id: "credits-100",
    name: "100 kreditov",
    price: 9,
    credits: 100,
    description: "Za testiranje tekstov, slik in nekaj kratkih video poskusov.",
    features: ["100 Studio kreditov", "Tekst: 5 kreditov", "Izboljšava: 3 krediti", "Slika: 15 kreditov", "Video: 25 kreditov"],
  },
  {
    id: "credits-300",
    name: "300 kreditov",
    price: 24,
    credits: 300,
    description: "Za aktivno ustvarjanje objav z več slikami in videi.",
    features: ["300 Studio kreditov", "Do 12 slik ali videov", "Primerno za FB/Instagram kampanjo", "Brez mesečne obveze"],
  },
  {
    id: "credits-1000",
    name: "1000 kreditov",
    price: 69,
    credits: 1000,
    description: "Za resno video testiranje in več profilov.",
    features: ["1000 Studio kreditov", "Do 40 slik ali videov", "Najboljše za agencijsko uporabo", "Ročno objavljanje"],
  },
];

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tierCard(tier: (typeof tiers)[number], billingReady: boolean) {
  return `<article class="tier">
    <div>
      <h2>${escapeHtml(tier.name)}</h2>
      <p>${escapeHtml(tier.description)}</p>
    </div>
    <div class="price"><strong>${tier.price} USDC</strong><span>/ mesec</span><em>${tier.credits} kreditov</em></div>
    <ul>${tier.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <div class="pay-row">
      <button class="pay" data-plan="${escapeHtml(tier.id)}" data-label="${escapeHtml(tier.name)}" data-amount="${tier.price}" ${billingReady ? "" : "disabled"}>Plačaj v brskalniku</button>
      <button class="qr-pay secondary" data-plan="${escapeHtml(tier.id)}" data-label="${escapeHtml(tier.name)}" data-amount="${tier.price}" ${billingReady ? "" : "disabled"}>QR za telefon</button>
    </div>
  </article>`;
}

function creditCard(pack: (typeof creditPacks)[number], billingReady: boolean) {
  return `<article class="tier">
    <div>
      <h2>${escapeHtml(pack.name)}</h2>
      <p>${escapeHtml(pack.description)}</p>
    </div>
    <div class="price"><strong>${pack.price} USDC</strong><span>enkratno</span><em>${pack.credits} kreditov</em></div>
    <ul>${pack.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <div class="pay-row">
      <button class="pay" data-plan="${escapeHtml(pack.id)}" data-label="${escapeHtml(pack.name)}" data-amount="${pack.price}" ${billingReady ? "" : "disabled"}>Plačaj v brskalniku</button>
      <button class="qr-pay secondary" data-plan="${escapeHtml(pack.id)}" data-label="${escapeHtml(pack.name)}" data-amount="${pack.price}" ${billingReady ? "" : "disabled"}>QR za telefon</button>
    </div>
  </article>`;
}

function pricingPage() {
  const receiver = config.billingWalletAddress;
  const billingReady = /^0x[a-fA-F0-9]{40}$/.test(receiver);

  return `<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Content Studio Pricing</title>
  <style>
    :root{color-scheme:light;--bg:#f5f1eb;--paper:#fffdf9;--ink:#181512;--muted:#6d675f;--line:#ddd3c7;--accent:#8d4b34;--green:#1e6f62;--blue:#285e9c;--soft:#eee5da;--danger:#9f2d20}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink)}
    main{width:min(1180px,calc(100% - 28px));margin:0 auto;padding:22px 0 42px}header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1px solid var(--line);padding:16px 0;margin-bottom:18px}
    h1{font-size:clamp(32px,5vw,54px);line-height:1;margin:0;letter-spacing:0}h2{font-size:22px;margin:0}p{color:var(--muted);line-height:1.45;margin:8px 0 0}a,button{font:inherit}a{color:var(--green);font-weight:760;text-decoration:none}
    .button,button{min-height:42px;border:1px solid var(--accent);border-radius:8px;padding:0 14px;background:var(--accent);color:#fff;font-weight:780;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.button.secondary{background:var(--paper);color:var(--ink);border-color:var(--line)}button:disabled{opacity:.55;cursor:not-allowed}
    .section-head{margin:22px 0 12px}.section-head h2{font-size:18px}.tiers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.tier{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:16px;display:grid;gap:14px;box-shadow:0 1px 2px rgba(24,21,18,.04)}.price strong{font-size:28px}.price span{color:var(--muted);margin-left:6px}.price em{display:block;font-style:normal;color:var(--green);font-weight:780;margin-top:4px}ul{margin:0;padding-left:19px;color:var(--muted);line-height:1.55}.pay-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pay,.qr-pay{width:100%}
    .wallet-guide{margin-top:18px;background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:16px}.wallet-guide h2{font-size:20px;margin:0 0 8px}.steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}.step{border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px}.step strong{display:block;color:var(--ink);margin-bottom:5px}.safe{border-color:#b7e4d3;background:#f4fbf7;color:#1e6f62}.danger-note{border-color:#e5b0a9;background:#fff7f5;color:var(--danger)}
    .notice,.receipt{margin-top:14px;background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:14px;color:var(--muted)}.notice strong{color:var(--ink)}.warn{border-color:#e5b0a9;background:#fff7f5;color:var(--danger)}code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;word-break:break-all;color:var(--ink)}
    .receipt{display:none}.receipt.show{display:block}.claim{margin-top:14px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.claim-grid{display:grid;grid-template-columns:180px minmax(0,1fr) auto;gap:10px;align-items:end}.claim label{display:grid;gap:5px;color:var(--muted);font-size:13px;font-weight:760}.claim input,.claim select{min-height:42px;border:1px solid var(--line);border-radius:8px;padding:0 10px;background:#fff}.qr-panel{display:none;margin-top:14px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.qr-panel.show{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px;align-items:center}.qr-frame{width:220px;height:220px;border:1px solid var(--line);border-radius:8px;background:#fff;display:grid;place-items:center}.qr-frame img{width:200px;height:200px}.qr-details{display:grid;gap:8px}.qr-details h2{font-size:20px}.wallet-link{width:max-content}.actions{display:flex;gap:8px;flex-wrap:wrap}.tiny{font-size:12px;color:var(--muted)}
    @media(max-width:880px){header{flex-direction:column}.tiers,.steps,.qr-panel.show,.claim-grid{grid-template-columns:1fr}.qr-frame{width:100%;height:auto;aspect-ratio:1;max-width:260px}.qr-frame img{width:min(220px,86vw);height:min(220px,86vw)}.pay-row{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <header>
      <div><h1>Naročnine</h1><p>Studio za ustvarjalce: tekst, slika in video workflow. Plačilo je approval-first in nikoli ne zahteva zasebnega ključa.</p></div>
      <div class="actions"><a class="button secondary" href="/studio">Studio</a><a class="button secondary" href="/video">Video</a></div>
    </header>

    <div class="section-head"><h2>Mesečne naročnine</h2><p>Za redno uporabo Studia in storitev za druge.</p></div>
    <section class="tiers">${tiers.map((tier) => tierCard(tier, billingReady)).join("")}</section>

    <div class="section-head"><h2>Video in AI krediti</h2><p>Za uporabnike, ki želijo plačati samo porabo. Tekst stane 5 kreditov, izboljšava 3, slika 15, video pa 25 kreditov.</p></div>
    <section class="tiers">${creditPacks.map((pack) => creditCard(pack, billingReady)).join("")}</section>

    <section class="wallet-guide">
      <h2>Kako plačaš z digitalno denarnico?</h2>
      <p>Za plačilo potrebuješ denarnico, ki podpira Base omrežje, na primer MetaMask, Coinbase Wallet ali Rabby. Plačilo poteka v USDC na Base omrežju.</p>
      <div class="steps">
        <div class="step"><strong>1. Odpri denarnico</strong><span>Uporabi browser wallet ali mobilno denarnico, kjer lahko poskeniraš QR kodo.</span></div>
        <div class="step"><strong>2. Izberi Base</strong><span>Če nisi na Base omrežju, te bo stran prosila za preklop. Preklop potrdi v denarnici.</span></div>
        <div class="step"><strong>3. Imej USDC na Base</strong><span>Za plačilo rabiš USDC na Base in malo ETH na Base za omrežno provizijo.</span></div>
        <div class="step"><strong>4. Potrdi plačilo</strong><span>Klikni plačilni gumb, preveri znesek v denarnici in potrdi transakcijo.</span></div>
      </div>
      <div class="notice safe"><strong>Varno:</strong> Studio nikoli ne zahteva seed phrase, private keya ali dovoljenja za upravljanje vseh sredstev. Potrdiš samo konkretno USDC transakcijo.</div>
      <div class="notice danger-note"><strong>Pazi:</strong> če stran ali denarnica kadarkoli zahteva seed phrase ali private key, prekini. Tega se nikoli ne vpisuje v nobeno spletno stran.</div>
    </section>

    ${
      billingReady
        ? `<div class="notice"><strong>Plačilo:</strong> USDC na Base omrežju. Prejemni naslov: <code id="receiver">${escapeHtml(receiver)}</code><br /><span class="tiny">USDC contract: <code>${usdcBaseAddress}</code></span></div>`
        : `<div class="notice warn"><strong>Plačila še niso aktivna.</strong> Nastavi <code>BILLING_WALLET_ADDRESS</code> na svež varen prejemni wallet in redeployaj projekt.</div>`
    }

    <div class="qr-panel" id="qrPanel">
      <div class="qr-frame"><img id="qrImage" alt="QR koda za USDC plačilo na Base" /></div>
      <div class="qr-details">
        <h2 id="qrTitle">Plačilo z mobilno denarnico</h2>
        <p id="qrText">Poskeniraj QR kodo z denarnico in pred potrditvijo preveri znesek, USDC contract, Base omrežje in prejemni naslov.</p>
        <a class="button wallet-link" id="walletLink" href="#">Odpri v denarnici</a>
        <div><span class="tiny">Wallet URI</span><br /><code id="walletUri"></code></div>
      </div>
    </div>

    <section class="claim">
      <h2>Potrdi plačilo in dodaj kredite</h2>
      <p>Po plačilu prilepi transaction hash. Sistem preveri USDC transfer na Base in kredite doda tvojemu prijavljenemu računu.</p>
      <div class="claim-grid">
        <label>Paket<select id="claimProduct">${products.map((product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} - ${product.priceUsdc} USDC / ${product.credits} kreditov</option>`).join("")}</select></label>
        <label>Transaction hash<input id="claimTx" placeholder="0x..." /></label>
        <button id="claimPayment" type="button">Potrdi plačilo</button>
      </div>
      <p class="tiny" id="claimStatus">Najprej moraš biti prijavljen v Studiu z e-mailom, potem lahko potrdiš plačilo.</p>
    </section>

    <div class="receipt" id="receipt">
      <strong>Plačilo poslano.</strong>
      <p>Transaction hash:</p>
      <code id="txHash"></code>
      <p class="tiny">Shrani hash. V naslednjem koraku lahko dodamo avtomatsko preverjanje plačila in aktivacijo naročnine.</p>
    </div>
  </main>

  <script>
    const receiver = ${JSON.stringify(receiver)};
    const usdc = ${JSON.stringify(usdcBaseAddress)};
    const baseChainId = ${JSON.stringify(baseChainId)};
    const baseChainIdDecimal = ${JSON.stringify(baseChainIdDecimal)};
    const receipt = document.getElementById("receipt");
    const txHash = document.getElementById("txHash");
    const qrPanel = document.getElementById("qrPanel");
    const qrImage = document.getElementById("qrImage");
    const qrTitle = document.getElementById("qrTitle");
    const qrText = document.getElementById("qrText");
    const walletUri = document.getElementById("walletUri");
    const walletLink = document.getElementById("walletLink");
    const claimProduct = document.getElementById("claimProduct");
    const claimTx = document.getElementById("claimTx");
    const claimStatus = document.getElementById("claimStatus");
    const claimPayment = document.getElementById("claimPayment");

    function pad64(value) {
      return value.toLowerCase().replace(/^0x/, "").padStart(64, "0");
    }

    function usdcAmount(value) {
      return (BigInt(value) * 1000000n).toString(16).padStart(64, "0");
    }

    function usdcAmountDecimal(value) {
      return (BigInt(value) * 1000000n).toString();
    }

    function paymentUri(amount) {
      return "ethereum:" + usdc + "@" + baseChainIdDecimal + "/transfer?address=" + receiver + "&uint256=" + usdcAmountDecimal(amount);
    }

    function renderQr(button) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(receiver)) {
        alert("Billing wallet se ni nastavljen.");
        return;
      }

      const amount = button.dataset.amount;
      const label = button.dataset.label || button.dataset.plan || "paket";
      const uri = paymentUri(amount);
      qrTitle.textContent = label + " - " + amount + " USDC";
      qrText.textContent = "Poskeniraj QR kodo z mobilno denarnico. Pred potrditvijo preveri Base omrežje, USDC, znesek " + amount + " USDC in prejemni naslov.";
      walletUri.textContent = uri;
      walletLink.href = uri;
      qrImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" + encodeURIComponent(uri);
      qrPanel.classList.add("show");
      qrPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    async function claim() {
      claimPayment.disabled = true;
      claimStatus.textContent = "Preverjam transakcijo na Base...";
      try {
        const response = await fetch("/billing/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: claimProduct.value, txHash: claimTx.value.trim() }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Plačila ni bilo mogoče potrditi.");
        claimStatus.textContent = "Plačilo potrjeno. Dodano: " + data.addedCredits + " kreditov. Novo stanje: " + data.session.credits + " kreditov.";
        claimTx.value = "";
      } catch (error) {
        claimStatus.textContent = error instanceof Error ? error.message : String(error);
      } finally {
        claimPayment.disabled = false;
      }
    }

    async function ensureBase(ethereum) {
      try {
        await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: baseChainId }] });
      } catch (error) {
        if (error && error.code === 4902) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: baseChainId,
              chainName: "Base",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            }],
          });
          return;
        }
        throw error;
      }
    }

    async function pay(button) {
      if (!window.ethereum) {
        renderQr(button);
        return;
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(receiver)) {
        alert("Billing wallet se ni nastavljen.");
        return;
      }

      button.disabled = true;
      const label = button.textContent;
      button.textContent = "Cakam denarnico...";
      try {
        await ensureBase(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const from = accounts[0];
        const amount = button.dataset.amount;
        const data = "0xa9059cbb" + pad64(receiver) + usdcAmount(amount);
        const hash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [{ from, to: usdc, value: "0x0", data }],
        });
        txHash.textContent = hash;
        receipt.classList.add("show");
        button.textContent = "Poslano";
      } catch (error) {
        alert(error && error.message ? error.message : String(error));
        button.textContent = label;
        button.disabled = false;
      }
    }

    document.querySelectorAll(".pay").forEach((button) => button.addEventListener("click", () => pay(button)));
    document.querySelectorAll(".qr-pay").forEach((button) => button.addEventListener("click", () => renderQr(button)));
    claimPayment.addEventListener("click", claim);
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
  res.status(200).send(pricingPage());
}
