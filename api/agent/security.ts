import { scanContractSecurity, type SecurityNetwork } from "../../src/services/contract-security.js";
import { escapeHtml, list, page, wantsJson } from "../../src/services/html.js";

export const config = { maxDuration: 30 };

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const url = new URL(req.url ?? "/agent/security", "https://zora-genesis-t1j9.vercel.app");
  const address = String(req.query?.address ?? url.searchParams.get("address") ?? "");
  const network = String(req.query?.network ?? url.searchParams.get("network") ?? "base") as SecurityNetwork;
  if (!address) {
    const body = `<section class="hero"><div><div class="eyebrow">Contract Safety Radar</div><h1>Check a Base contract before you trust it.</h1><p class="lead">Read-only screening for owner, mint, blacklist, fee, pause and proxy warning signals.</p></div><div class="stat"><strong>Free</strong><span>no wallet required</span></div></section><section class="section"><article class="card"><form method="get" action="/agent/security"><p><label>Contract address<br><input name="address" required placeholder="0x…" style="width:100%;padding:12px"></label></p><p><label>Network <select name="network"><option value="base">Base</option><option value="base-sepolia">Base Sepolia</option></select></label></p><button type="submit" style="padding:12px 18px">Scan contract</button></form><p><a href="/agent/firewall">Already have transaction calldata? Open Transaction Firewall.</a></p></article></section>`;
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(page("Zora Genesis Contract Safety", body));
  }
  if (!["base", "base-sepolia"].includes(network)) return res.status(400).json({ ok: false, error: "network must be base or base-sepolia." });

  try {
    const report = await scanContractSecurity({ address, network });
    if (wantsJson(req, "/agent/security")) return res.status(200).json({ ok: true, service: "zora-genesis", report });

    const body = `<section class="hero"><div><div class="eyebrow">Contract Safety Radar</div><h1>${escapeHtml(report.token.name ?? report.address)}</h1><p class="lead">Evidence-based Base contract screening. This is a warning tool, not a verdict or audit.</p></div><div class="stat"><strong>${report.riskScore}/100</strong><span>${escapeHtml(report.classification)} risk</span></div></section>
      <section class="section"><h2>Findings</h2><div class="grid two">${report.findings.length ? report.findings.map((f) => `<article class="card"><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.evidence)}</p><p class="warn">${escapeHtml(f.recommendation)}</p></article>`).join("") : '<article class="card"><p>No selected warning selectors were detected. This does not prove the contract is safe.</p></article>'}</div></section>
      <section class="section"><h2>Important limitations</h2><div class="band">${list(report.limitations)}</div></section>`;
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(page("Zora Genesis Contract Safety", body));
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Scan failed" });
  }
}
