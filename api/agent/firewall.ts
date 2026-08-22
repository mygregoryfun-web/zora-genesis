import { inspectTransaction, inspectTransactionHash, type TransactionFirewallReport } from "../../src/services/transaction-firewall.js";
import type { SecurityNetwork } from "../../src/services/contract-security.js";
import { escapeHtml, page, wantsJson } from "../../src/services/html.js";

export const config = { maxDuration: 30 };

function form() {
  return `
    <section class="hero">
      <div>
        <div class="eyebrow">Transaction Firewall</div>
        <h1>Preveri transakcijo pred podpisom.</h1>
        <p class="lead">Prilepi ciljni naslov pogodbe na omrežju Base in calldata iz denarnice ali aplikacije. Stran ne poveže denarnice, ne zahteva podpisa in ne izvede transakcije.</p>
      </div>
      <div class="stat"><strong>Samo branje</strong><span>brez podpisa</span></div>
    </section>

    <section class="section">
      <div class="grid two">
        <article class="card highlight">
          <h2>Quick check</h2>
          <p>Najlažje: prilepi Base transaction hash iz BaseScan, denarnice ali aplikacije. Agent sam prebere ciljni naslov, calldata, pošiljatelja in vrednost.</p>
          <form method="get" action="/agent/firewall">
            <label>Transaction hash
              <input name="tx" required placeholder="0x...64 znakov">
              <small>Primer: hash že pripravljene ali že poslane transakcije na Base.</small>
            </label>
            <label>Omrežje
              <select name="network">
                <option value="base">Base</option>
                <option value="base-sepolia">Base Sepolia</option>
              </select>
            </label>
            <button type="submit">Preveri transaction hash</button>
          </form>
        </article>

        <article class="card">
          <h2>Advanced calldata input</h2>
          <form method="get" action="/agent/firewall">
            <label>Ciljni naslov pogodbe
              <input name="to" required placeholder="0x...">
              <small>Polje to oziroma contract interaction iz pripravljene transakcije.</small>
            </label>
            <label>Calldata
              <textarea name="data" rows="5" placeholder="0x"></textarea>
              <small>Šestnajstiški podatki transakcije, ki se začnejo z 0x. Če jih nimaš, jih ne vpisuj na pamet.</small>
            </label>
            <label>Naslov pošiljatelja
              <input name="from" placeholder="0x...">
              <small>Priporočeno za natančnejšo simulacijo.</small>
            </label>
            <label>Vrednost v wei
              <input name="valueWei" value="0">
            </label>
            <label>Omrežje
              <select name="network">
                <option value="base">Base</option>
                <option value="base-sepolia">Base Sepolia</option>
              </select>
            </label>
            <button type="submit">Preveri transakcijo</button>
          </form>
        </article>

        <article class="card">
          <h2>Kaj vneseš</h2>
          <ul>
            <li><strong>Transaction hash</strong>: najlažja pot, če ga imaš iz BaseScan ali denarnice.</li>
            <li><strong>Ciljni naslov pogodbe</strong>: polje <code>to</code> iz transakcije.</li>
            <li><strong>Calldata</strong>: polje <code>data</code>, začne se z <code>0x</code>.</li>
            <li><strong>From</strong>: tvoj wallet naslov, priporočeno za simulacijo.</li>
          </ul>
        </article>

        <article class="card">
          <h2>Kaj agent preveri</h2>
          <ul>
            <li>ali je calldata veljaven</li>
            <li>ali pogodba obstaja na izbranem omrežju</li>
            <li>ali simulacija uspe ali pade</li>
            <li>ali so prisotni varnostni opozorilni znaki</li>
          </ul>
          <p class="warn"><strong>Pomembno:</strong> rezultat zmanjša tveganje, vendar ni jamstvo, da je pogodba varna.</p>
        </article>
      </div>
    </section>
  `;
}

function result(report: TransactionFirewallReport) {
  const findings = report.findings.length
    ? report.findings.map((item) => `
      <article class="card">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.evidence)}</p>
        <p class="warn">${escapeHtml(item.recommendation)}</p>
      </article>
    `).join("")
    : '<article class="card"><p>No selected warning was detected. This is not a safety guarantee.</p></article>';

  return `
    <section class="hero">
      <div>
        <div class="eyebrow">Transaction Firewall</div>
        <h1>${escapeHtml(report.recommendation.toUpperCase())}</h1>
        <p class="lead">Destination ${escapeHtml(report.to)} · action ${escapeHtml(report.decodedAction ?? "native transfer")}</p>
      </div>
      <div class="stat"><strong>${report.riskScore}/100</strong><span>risk score</span></div>
    </section>
    <section class="section"><h2>Findings</h2><div class="grid two">${findings}</div></section>
    <section class="section"><div class="band"><strong>Simulation:</strong> ${report.simulation.success ? "completed without revert" : escapeHtml(report.simulation.error ?? "not completed")}</div></section>
    <section class="section"><a class="button" href="/agent/firewall">Check another transaction</a></section>
  `;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const url = new URL(req.url ?? "/agent/firewall", "https://zora-genesis-t1j9.vercel.app");
  const tx = String(req.query?.tx ?? url.searchParams.get("tx") ?? "");
  const to = String(req.query?.to ?? url.searchParams.get("to") ?? "");

  if (!to && !tx) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(page("Transaction Firewall", form()));
  }

  try {
    const network = String(req.query?.network ?? url.searchParams.get("network") ?? "base") as SecurityNetwork;
    const report = tx
      ? await inspectTransactionHash({ hash: tx, network })
      : await inspectTransaction({
          to,
          data: String(req.query?.data ?? url.searchParams.get("data") ?? "0x"),
          from: String(req.query?.from ?? url.searchParams.get("from") ?? "") || undefined,
          valueWei: String(req.query?.valueWei ?? url.searchParams.get("valueWei") ?? "0"),
          network,
        });

    if (wantsJson(req, "/agent/firewall")) {
      return res.status(200).json({ ok: true, service: "zora-genesis", report });
    }

    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(page("Transaction Firewall Result", result(report)));
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Inspection failed" });
  }
}
