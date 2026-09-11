import { config } from "../src/config.js";

const usdcBaseAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const baseChainId = "0x2105";

const tiers = [
  {
    id: "creator",
    name: "Creator",
    price: 19,
    description: "Za posameznike, ki zelijo redne objave za FB, Instagram in X.",
    features: ["Content Studio", "Moj slog", "Tekst + slika", "Ročno objavljanje", "Osnovni video workflow"],
  },
  {
    id: "studio",
    name: "Studio",
    price: 49,
    description: "Za ustvarjalce, strani in manjse skupine, ki rabijo vec idej in boljsi workflow.",
    features: ["Vse iz Creator", "Vec stilov slik", "Kontradiktorni art", "Video osnutki", "Prioritetne izboljsave promptov"],
  },
  {
    id: "agency",
    name: "Agency",
    price: 149,
    description: "Za uporabo z vec profili ali za storitev, ki jo prodajas naprej.",
    features: ["Vse iz Studio", "Vec brand glasov", "White-label priprava", "Mesecni setup support", "Rocni pregled workflowa"],
  },
];

const creditPacks = [
  {
    id: "credits-100",
    name: "100 kreditov",
    price: 9,
    description: "Za testiranje tekstov, slik in nekaj kratkih video poskusov.",
    features: ["100 Studio kreditov", "Tekst: 5 kreditov", "Izboljšava: 3 krediti", "Slika/video: 25 kreditov"],
  },
  {
    id: "credits-300",
    name: "300 kreditov",
    price: 24,
    description: "Za aktivno ustvarjanje objav z več slikami in videi.",
    features: ["300 Studio kreditov", "Do 12 slik ali videov", "Primerno za FB/Instagram kampanjo", "Brez mesečne obveze"],
  },
  {
    id: "credits-1000",
    name: "1000 kreditov",
    price: 69,
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
    <div class="price"><strong>${tier.price} USDC</strong><span>/ mesec</span></div>
    <ul>${tier.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <button class="pay" data-plan="${escapeHtml(tier.id)}" data-amount="${tier.price}" ${billingReady ? "" : "disabled"}>Plačaj z denarnico</button>
  </article>`;
}

function creditCard(pack: (typeof creditPacks)[number], billingReady: boolean) {
  return `<article class="tier">
    <div>
      <h2>${escapeHtml(pack.name)}</h2>
      <p>${escapeHtml(pack.description)}</p>
    </div>
    <div class="price"><strong>${pack.price} USDC</strong><span>enkratno</span></div>
    <ul>${pack.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <button class="pay" data-plan="${escapeHtml(pack.id)}" data-amount="${pack.price}" ${billingReady ? "" : "disabled"}>Kupi kredite</button>
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
    .section-head{margin:22px 0 12px}.section-head h2{font-size:18px}.tiers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.tier{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:16px;display:grid;gap:14px;box-shadow:0 1px 2px rgba(24,21,18,.04)}.price strong{font-size:28px}.price span{color:var(--muted);margin-left:6px}ul{margin:0;padding-left:19px;color:var(--muted);line-height:1.55}.pay{width:100%}
    .notice,.receipt{margin-top:14px;background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:14px;color:var(--muted)}.notice strong{color:var(--ink)}.warn{border-color:#e5b0a9;background:#fff7f5;color:var(--danger)}code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;word-break:break-all;color:var(--ink)}
    .receipt{display:none}.receipt.show{display:block}.actions{display:flex;gap:8px;flex-wrap:wrap}.tiny{font-size:12px;color:var(--muted)}
    @media(max-width:880px){header{flex-direction:column}.tiers{grid-template-columns:1fr}}
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

    <div class="section-head"><h2>Video in AI krediti</h2><p>Za uporabnike, ki želijo plačati samo porabo. Tekst stane 5 kreditov, izboljšava 3, video in slika pa po 25 kreditov.</p></div>
    <section class="tiers">${creditPacks.map((pack) => creditCard(pack, billingReady)).join("")}</section>

    ${
      billingReady
        ? `<div class="notice"><strong>Plačilo:</strong> USDC na Base omrežju. Prejemni naslov: <code id="receiver">${escapeHtml(receiver)}</code><br /><span class="tiny">USDC contract: <code>${usdcBaseAddress}</code></span></div>`
        : `<div class="notice warn"><strong>Plačila še niso aktivna.</strong> Nastavi <code>BILLING_WALLET_ADDRESS</code> na svež varen prejemni wallet in redeployaj projekt.</div>`
    }

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
    const receipt = document.getElementById("receipt");
    const txHash = document.getElementById("txHash");

    function pad64(value) {
      return value.toLowerCase().replace(/^0x/, "").padStart(64, "0");
    }

    function usdcAmount(value) {
      return (BigInt(value) * 1000000n).toString(16).padStart(64, "0");
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
        alert("Najprej odpri stran v brskalniku z walletom, npr. MetaMask ali Coinbase Wallet.");
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
