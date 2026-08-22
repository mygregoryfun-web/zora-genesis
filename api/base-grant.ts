import { escapeHtml, page, tags, wantsJson } from "../src/services/html.js";

export const config = {
  maxDuration: 30,
};

const productionUrl = "https://zora-genesis-t1j9.vercel.app";

const grantBrief = {
  appName: "Zora Genesis",
  tagline: "AI for creator assets",
  oneLiner:
    "Zora Genesis is an approval-first AI agent that turns Base and Zora market signals into creator asset ideas, channel-ready posts, and premium launch briefs.",
  builderCode: "bc_lk15eqwc",
  baseAppId: "69af0091f6467f4d78d304ac",
  baseProofContract: "0xc74659ce159b88ef3aae55a61fc3906fe2b1de58",
  zoraAsset: "0x380518528ba2C7B80B61fAd1A03B52aA4006F892",
  latestXPost: "2090559452877324327",
  baseFit: [
    "new asset creation",
    "consumer apps",
    "agent-assisted publishing",
    "x402-style paid briefs",
    "creator economy assets",
    "Builder Codes attribution",
  ],
  shipped: [
    "Live production dashboard with Base app verification tag",
    "Public opportunity radar for Base/Zora creator signals",
    "Monetization page with free, creator, studio, and service tiers",
    "Contract safety radar and transaction firewall surfaces",
    "NFT-ready draft page for turning article ideas into collectible asset concepts",
    "Live X text publishing, Farcaster publishing, Zora publishing, and local post memory",
  ],
  safety: [
    "Manual approval remains required before publishing or minting",
    "No custody of user funds",
    "No autonomous trading execution",
    "No leverage, lending, yield, or price-target recommendations",
    "DeFi and prediction-market narratives are treated as context only",
  ],
  userFlow: [
    "Free visitors can open the public dashboard, radar, metrics, and proof links without signing in",
    "Creators connect a Base wallet only when they want saved briefs, paid requests, or onchain attribution",
    "Sign-in uses a signed wallet message, not a private key or seed phrase",
    "Payments can later use an x402-style flow or ordinary checkout while keeping publishing approval-first",
  ],
  monetization: [
    "Free public radar and draft previews",
    "Pro Creator at $19/month for unlimited channel-ready previews and saved briefs",
    "Builder Studio at $49/month for narrative radar, workflow templates, and API-ready brief output",
    "$1-$5 pay-per-brief experiment for premium Base/Zora creator briefs",
    "$250-$1,000 done-for-you setup service for small creator or builder teams",
  ],
  roadmap: [
    "Approval queue for all live channel publishing",
    "Premium brief request form with simple checkout-ready output",
    "Builder Code attribution on eligible onchain flows",
    "Engagement metrics panel for X, Farcaster, Zora, and site traffic",
    "x402-style paid access gate after the free endpoint proves useful",
  ],
};

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function proof(label: string, value: string, href: string) {
  return `
    <article class="card">
      <h3>${escapeHtml(label)}</h3>
      <p><a href="${escapeHtml(href)}"><code>${escapeHtml(value)}</code></a></p>
    </article>
  `;
}

function renderApplicationCopy() {
  return `${grantBrief.appName} is a live Base and Zora creator-intelligence agent. It tracks Base/Zora signals, scores opportunities around new asset creation and creator discovery, generates channel-ready drafts for Zora, Farcaster, and X, and packages ideas into premium creator briefs. The project is deployed publicly, uses Builder Code ${grantBrief.builderCode}, and keeps the workflow approval-first, non-custodial, and outside trading execution.`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  const generatedAt = new Date().toISOString();

  if (wantsJson(req, "/base-grant")) {
    res.status(200).json({
      ok: true,
      service: "zora-genesis",
      generatedAt,
      grantBrief,
      applicationCopy: renderApplicationCopy(),
    });
    return;
  }

  const body = `
    <section class="hero">
      <div>
        <div class="eyebrow">Base Builder Grant Proof Page</div>
        <h1>Live agent for Base creator asset discovery.</h1>
        <p class="lead">${escapeHtml(grantBrief.oneLiner)}</p>
        <p>${tags(grantBrief.baseFit)}</p>
        <p>
          <a class="button primary" href="/agent/opportunities">Open radar</a>
          <a class="button" href="/agent/monetization">Revenue model</a>
          <a class="button" href="/agent/security">Safety tools</a>
          <a class="button" href="${productionUrl}">Production app</a>
        </p>
      </div>
      <div class="stat">
        <strong>${escapeHtml(grantBrief.builderCode)}</strong>
        <span>Base Builder Code</span>
        <p><code>base:app_id ${escapeHtml(grantBrief.baseAppId)}</code></p>
      </div>
    </section>

    <section class="section">
      <h2>What the agent already does</h2>
      <div class="grid two">
        <article class="card highlight">
          <h3>Signal to asset workflow</h3>
          <p>Zora Genesis reads the current Base/Zora builder focus, scores opportunities, then turns the best angle into draft posts, image direction, and a Zora-ready brief.</p>
        </article>
        <article class="card">
          <h3>Approval-first publishing</h3>
          <p>The agent can prepare posts for Zora, Farcaster, and X, but the product stance is human approval before public distribution or minting.</p>
        </article>
      </div>
    </section>

    <section class="section">
      <h2>Shipped product surfaces</h2>
      <div class="grid">
        <article class="card"><h3>Opportunity Radar</h3>${list(["Base/Zora signal ranking", "Grant-friendly builder areas", "Risk notes for sensitive categories"])}<p><a href="/agent/opportunities">Open radar</a></p></article>
        <article class="card"><h3>Monetization</h3>${list(["Free previews", "Pro Creator and Builder Studio tiers", "Premium brief and setup service experiments"])}<p><a href="/agent/monetization">Open revenue plan</a></p></article>
        <article class="card"><h3>Safety Tools</h3>${list(["Contract risk radar", "Transaction firewall", "No autonomous financial execution"])}<p><a href="/agent/firewall">Open firewall</a></p></article>
      </div>
    </section>

    <section class="section">
      <h2>Public proof links</h2>
      <div class="grid">
        ${proof("Base proof contract", grantBrief.baseProofContract, `https://basescan.org/address/${grantBrief.baseProofContract}`)}
        ${proof("Zora asset contract", grantBrief.zoraAsset, `https://basescan.org/address/${grantBrief.zoraAsset}`)}
        ${proof("Latest X post", grantBrief.latestXPost, `https://x.com/mygregoryfun/status/${grantBrief.latestXPost}`)}
      </div>
    </section>

    <section class="section">
      <h2>User connection flow</h2>
      <div class="grid two">
        <article class="card highlight">
          <h3>Public first</h3>
          ${list(grantBrief.userFlow.slice(0, 1))}
          <p>The grant reviewer can inspect the product immediately without creating an account.</p>
        </article>
        <article class="card">
          <h3>Wallet when value becomes personal</h3>
          ${list(grantBrief.userFlow.slice(1))}
        </article>
      </div>
    </section>

    <section class="section">
      <h2>Base grant fit</h2>
      <div class="grid two">
        <article class="card">
          <h3>Why Base</h3>
          ${list(grantBrief.shipped)}
        </article>
        <article class="card">
          <h3>Safety boundaries</h3>
          ${list(grantBrief.safety)}
        </article>
      </div>
    </section>

    <section class="section">
      <h2>Monetization path</h2>
      <div class="band">
        ${list(grantBrief.monetization)}
      </div>
    </section>

    <section class="section">
      <h2>Next development milestones</h2>
      <div class="band">
        ${list(grantBrief.roadmap)}
      </div>
    </section>

    <section class="section">
      <h2>Application copy</h2>
      <pre>${escapeHtml(renderApplicationCopy())}</pre>
    </section>
  `;

  res.setHeader("content-type", "text/html; charset=utf-8");
  res.status(200).send(page("Zora Genesis Base Grant Proof", body));
}
