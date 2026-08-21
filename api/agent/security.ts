import { scanContractSecurity, type SecurityNetwork } from "../../src/services/contract-security.js";
import { escapeHtml, list, page, wantsJson } from "../../src/services/html.js";

export const config = { maxDuration: 30 };

function scanForm() {
  return `
    <section class="hero">
      <div>
        <div class="eyebrow">Contract Safety Radar</div>
        <h1>Check a Base contract before you trust it.</h1>
        <p class="lead">Read-only screening for owner, mint, blacklist, fee, pause, and proxy warning signals. No wallet connection is required.</p>
      </div>
      <div class="stat"><strong>Free</strong><span>no wallet required</span></div>
    </section>

    <section class="section">
      <div class="grid two">
        <article class="card">
          <h2>Contract input</h2>
          <form method="get" action="/agent/security">
            <label>Contract address
              <input name="address" required placeholder="0x...">
            </label>
            <label>Network
              <select name="network">
                <option value="base">Base</option>
                <option value="base-sepolia">Base Sepolia</option>
              </select>
            </label>
            <button type="submit">Scan contract</button>
          </form>
        </article>

        <article class="card">
          <h2>Creator safety use case</h2>
          <p>Use this before writing about, promoting, or building around an unknown Base asset. It is a warning layer, not a full audit.</p>
          <p><a class="button" href="/agent/firewall">Open Transaction Firewall</a></p>
        </article>
      </div>
    </section>
  `;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const url = new URL(req.url ?? "/agent/security", "https://zora-genesis-t1j9.vercel.app");
  const address = String(req.query?.address ?? url.searchParams.get("address") ?? "");
  const network = String(req.query?.network ?? url.searchParams.get("network") ?? "base") as SecurityNetwork;

  if (!address) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(page("Zora Genesis Contract Safety", scanForm()));
  }

  if (!["base", "base-sepolia"].includes(network)) {
    return res.status(400).json({ ok: false, error: "network must be base or base-sepolia." });
  }

  try {
    const report = await scanContractSecurity({ address, network });
    if (wantsJson(req, "/agent/security")) {
      return res.status(200).json({ ok: true, service: "zora-genesis", report });
    }

    const findings = report.findings.length
      ? report.findings.map((f) => `
        <article class="card">
          <h3>${escapeHtml(f.title)}</h3>
          <p>${escapeHtml(f.evidence)}</p>
          <p class="warn">${escapeHtml(f.recommendation)}</p>
        </article>
      `).join("")
      : '<article class="card"><p>No selected warning selectors were detected. This does not prove the contract is safe.</p></article>';

    const body = `
      <section class="hero">
        <div>
          <div class="eyebrow">Contract Safety Radar</div>
          <h1>${escapeHtml(report.token.name ?? report.address)}</h1>
          <p class="lead">Evidence-based Base contract screening. This is a warning tool, not a verdict or audit.</p>
        </div>
        <div class="stat"><strong>${report.riskScore}/100</strong><span>${escapeHtml(report.classification)} risk</span></div>
      </section>
      <section class="section"><h2>Findings</h2><div class="grid two">${findings}</div></section>
      <section class="section"><h2>Important limitations</h2><div class="band">${list(report.limitations)}</div></section>
      <section class="section"><a class="button" href="/agent/security">Scan another contract</a></section>
    `;

    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(page("Zora Genesis Contract Safety", body));
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Scan failed" });
  }
}
