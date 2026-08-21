import { inspectTransaction, type TransactionFirewallReport } from "../../src/services/transaction-firewall.js";
import type { SecurityNetwork } from "../../src/services/contract-security.js";
import { escapeHtml, page, wantsJson } from "../../src/services/html.js";

export const config = { maxDuration: 30 };

function form() {
  return `<section class="hero"><div><div class="eyebrow">Transaction Firewall</div><h1>Decode and simulate before signing.</h1><p class="lead">Paste a Base transaction destination and calldata. No wallet connection, signature or transaction is requested.</p></div><div class="stat"><strong>Read only</strong><span>no signing</span></div></section><section class="section"><article class="card"><form method="get" action="/agent/firewall"><p><label>Contract address<br><input name="to" required placeholder="0x…" style="width:100%;padding:12px"></label></p><p><label>Calldata<br><textarea name="data" rows="5" placeholder="0x" style="width:100%;padding:12px"></textarea></label></p><p><label>Sender address (recommended for accurate simulation)<br><input name="from" placeholder="0x…" style="width:100%;padding:12px"></label></p><p><label>Value in wei<br><input name="valueWei" value="0" style="width:100%;padding:12px"></label></p><p><label>Network <select name="network"><option value="base">Base</option><option value="base-sepolia">Base Sepolia</option></select></label></p><button type="submit" style="padding:12px 18px">Inspect transaction</button></form></article></section>`;
}

function result(report: TransactionFirewallReport) {
  const findings = report.findings.length ? report.findings.map((item) => `<article class="card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.evidence)}</p><p class="warn">${escapeHtml(item.recommendation)}</p></article>`).join("") : '<article class="card"><p>No selected warning was detected. This is not a safety guarantee.</p></article>';
  return `<section class="hero"><div><div class="eyebrow">Transaction Firewall</div><h1>${escapeHtml(report.recommendation.toUpperCase())}</h1><p class="lead">Destination ${escapeHtml(report.to)} · action ${escapeHtml(report.decodedAction ?? "native transfer")}</p></div><div class="stat"><strong>${report.riskScore}/100</strong><span>risk score</span></div></section><section class="section"><h2>Findings</h2><div class="grid two">${findings}</div></section><section class="section"><div class="band"><strong>Simulation:</strong> ${report.simulation.success ? "completed without revert" : escapeHtml(report.simulation.error ?? "not completed")}</div></section>`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const url = new URL(req.url ?? "/agent/firewall", "https://zora-genesis-t1j9.vercel.app");
  const to = String(req.query?.to ?? url.searchParams.get("to") ?? "");
  if (!to) { res.setHeader("content-type", "text/html; charset=utf-8"); return res.status(200).send(page("Transaction Firewall", form())); }
  try {
    const report = await inspectTransaction({ to, data: String(req.query?.data ?? url.searchParams.get("data") ?? "0x"), from: String(req.query?.from ?? url.searchParams.get("from") ?? "") || undefined, valueWei: String(req.query?.valueWei ?? url.searchParams.get("valueWei") ?? "0"), network: String(req.query?.network ?? url.searchParams.get("network") ?? "base") as SecurityNetwork });
    if (wantsJson(req, "/agent/firewall")) return res.status(200).json({ ok: true, service: "zora-genesis", report });
    res.setHeader("content-type", "text/html; charset=utf-8"); return res.status(200).send(page("Transaction Firewall Result", result(report)));
  } catch (error) { return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Inspection failed" }); }
}
