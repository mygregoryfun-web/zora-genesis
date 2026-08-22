import { inspectTransaction, inspectTransactionHash, type TransactionFirewallReport } from "../../src/services/transaction-firewall.js";
import type { SecurityNetwork } from "../../src/services/contract-security.js";
import { escapeHtml, page, wantsJson } from "../../src/services/html.js";

export const config = { maxDuration: 30 };

type Language = "en" | "es";

function languageTabs(lang: Language) {
  return `
    <section class="section">
      <div class="band">
        <a class="button ${lang === "en" ? "primary" : ""}" href="/agent/firewall?lang=en">English</a>
        <a class="button ${lang === "es" ? "primary" : ""}" href="/agent/firewall?lang=es">Espanol</a>
      </div>
    </section>
  `;
}

function form(lang: Language) {
  if (lang === "es") {
    return `
      ${languageTabs(lang)}
      <section class="hero">
        <div>
          <div class="eyebrow">Transaction Firewall</div>
          <h1>Revisa una transaccion antes de firmar.</h1>
          <p class="lead">Pega un hash de transaccion de Base o campos avanzados de la transaccion. Esta pagina no conecta una billetera, no solicita firma y no ejecuta la transaccion.</p>
        </div>
        <div class="stat"><strong>Solo lectura</strong><span>sin firma</span></div>
      </section>

      <section class="section">
        <div class="grid two">
          <article class="card highlight">
            <h2>Revision rapida</h2>
            <p>La forma mas simple: pega un hash de transaccion de BaseScan, tu billetera o la aplicacion. El agente lee automaticamente el destino, calldata, remitente y valor.</p>
            <form method="get" action="/agent/firewall">
              <input type="hidden" name="lang" value="es">
              <label>Transaction hash
                <input name="tx" required placeholder="0x...64 caracteres">
                <small>Hash de una transaccion preparada o ya enviada en Base.</small>
              </label>
              <label>Red
                <select name="network">
                  <option value="base">Base</option>
                  <option value="base-sepolia">Base Sepolia</option>
                </select>
              </label>
              <button type="submit">Revisar transaction hash</button>
            </form>
          </article>

          <article class="card">
            <h2>Entrada avanzada de calldata</h2>
            <form method="get" action="/agent/firewall">
              <input type="hidden" name="lang" value="es">
              <label>Direccion del contrato destino
                <input name="to" required placeholder="0x...">
                <small>El campo <code>to</code> de la interaccion preparada.</small>
              </label>
              <label>Calldata
                <textarea name="data" rows="5" placeholder="0x"></textarea>
                <small>Datos hexadecimales de la transaccion que empiezan con <code>0x</code>.</small>
              </label>
              <label>Direccion del remitente
                <input name="from" placeholder="0x...">
                <small>Recomendado para una simulacion mas precisa.</small>
              </label>
              <label>Valor en wei
                <input name="valueWei" value="0">
              </label>
              <label>Red
                <select name="network">
                  <option value="base">Base</option>
                  <option value="base-sepolia">Base Sepolia</option>
                </select>
              </label>
              <button type="submit">Revisar transaccion</button>
            </form>
          </article>

          <article class="card">
            <h2>Que ingresar</h2>
            <ul>
              <li><strong>Transaction hash</strong>: la opcion mas facil si lo tienes desde BaseScan o una billetera.</li>
              <li><strong>Contrato destino</strong>: el campo <code>to</code> de la transaccion.</li>
              <li><strong>Calldata</strong>: el campo <code>data</code>, empieza con <code>0x</code>.</li>
              <li><strong>From</strong>: tu direccion de billetera, recomendada para simulacion.</li>
            </ul>
          </article>

          <article class="card">
            <h2>Que revisa el agente</h2>
            <ul>
              <li>si el calldata es valido</li>
              <li>si el contrato existe en la red seleccionada</li>
              <li>si la simulacion funciona o revierte</li>
              <li>si aparecen senales de riesgo seleccionadas</li>
            </ul>
            <p class="warn"><strong>Importante:</strong> el resultado reduce el riesgo, pero no garantiza que el contrato sea seguro.</p>
          </article>
        </div>
      </section>
    `;
  }

  return `
    ${languageTabs(lang)}
    <section class="hero">
      <div>
        <div class="eyebrow">Transaction Firewall</div>
        <h1>Check a transaction before signing.</h1>
        <p class="lead">Paste a Base transaction hash or advanced transaction fields. This page does not connect a wallet, request a signature, or execute a transaction.</p>
      </div>
      <div class="stat"><strong>Read only</strong><span>no signature</span></div>
    </section>

    <section class="section">
      <div class="grid two">
        <article class="card highlight">
          <h2>Quick check</h2>
          <p>Easiest path: paste a Base transaction hash from BaseScan, your wallet, or the app. The agent reads the destination, calldata, sender, and value automatically.</p>
          <form method="get" action="/agent/firewall">
            <input type="hidden" name="lang" value="en">
            <label>Transaction hash
              <input name="tx" required placeholder="0x...64 characters">
              <small>A prepared or already submitted Base transaction hash.</small>
            </label>
            <label>Network
              <select name="network">
                <option value="base">Base</option>
                <option value="base-sepolia">Base Sepolia</option>
              </select>
            </label>
            <button type="submit">Check transaction hash</button>
          </form>
        </article>

        <article class="card">
          <h2>Advanced calldata input</h2>
          <form method="get" action="/agent/firewall">
            <input type="hidden" name="lang" value="en">
            <label>Destination contract address
              <input name="to" required placeholder="0x...">
              <small>The <code>to</code> field from the prepared contract interaction.</small>
            </label>
            <label>Calldata
              <textarea name="data" rows="5" placeholder="0x"></textarea>
              <small>Hex transaction data beginning with <code>0x</code>. Do not guess this value.</small>
            </label>
            <label>Sender address
              <input name="from" placeholder="0x...">
              <small>Recommended for a more accurate simulation.</small>
            </label>
            <label>Value in wei
              <input name="valueWei" value="0">
            </label>
            <label>Network
              <select name="network">
                <option value="base">Base</option>
                <option value="base-sepolia">Base Sepolia</option>
              </select>
            </label>
            <button type="submit">Check transaction</button>
          </form>
        </article>

        <article class="card">
          <h2>What to enter</h2>
          <ul>
            <li><strong>Transaction hash</strong>: the easiest option if you have it from BaseScan or a wallet.</li>
            <li><strong>Destination contract</strong>: the transaction <code>to</code> field.</li>
            <li><strong>Calldata</strong>: the transaction <code>data</code> field beginning with <code>0x</code>.</li>
            <li><strong>From</strong>: your wallet address, recommended for simulation.</li>
          </ul>
        </article>

        <article class="card">
          <h2>What the agent checks</h2>
          <ul>
            <li>whether calldata is valid</li>
            <li>whether the contract exists on the selected network</li>
            <li>whether simulation succeeds or reverts</li>
            <li>whether selected security warning signs are present</li>
          </ul>
          <p class="warn"><strong>Important:</strong> the result reduces risk, but it is not a guarantee that the contract is safe.</p>
        </article>
      </div>
    </section>
  `;
}

function result(report: TransactionFirewallReport, lang: Language) {
  const resultText = lang === "es"
    ? {
        destination: "Destino",
        action: "accion",
        nativeTransfer: "transferencia nativa",
        riskScore: "puntaje de riesgo",
        findings: "Hallazgos",
        simulation: "Simulacion",
        simulationSuccess: "completada sin revertir",
        simulationFailed: "no completada",
        checkAnother: "Revisar otra transaccion",
        noWarnings: "No se detecto ninguna advertencia seleccionada. Esto no es una garantia de seguridad.",
      }
    : {
        destination: "Destination",
        action: "action",
        nativeTransfer: "native transfer",
        riskScore: "risk score",
        findings: "Findings",
        simulation: "Simulation",
        simulationSuccess: "completed without revert",
        simulationFailed: "not completed",
        checkAnother: "Check another transaction",
        noWarnings: "No selected warning was detected. This is not a safety guarantee.",
      };
  const findings = report.findings.length
    ? report.findings.map((item) => `
      <article class="card">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.evidence)}</p>
        <p class="warn">${escapeHtml(item.recommendation)}</p>
      </article>
    `).join("")
    : `<article class="card"><p>${resultText.noWarnings}</p></article>`;

  return `
    ${languageTabs(lang)}
    <section class="hero">
      <div>
        <div class="eyebrow">Transaction Firewall</div>
        <h1>${escapeHtml(report.recommendation.toUpperCase())}</h1>
        <p class="lead">${resultText.destination} ${escapeHtml(report.to)} · ${resultText.action} ${escapeHtml(report.decodedAction ?? resultText.nativeTransfer)}</p>
      </div>
      <div class="stat"><strong>${report.riskScore}/100</strong><span>${resultText.riskScore}</span></div>
    </section>
    <section class="section"><h2>${resultText.findings}</h2><div class="grid two">${findings}</div></section>
    <section class="section"><div class="band"><strong>${resultText.simulation}:</strong> ${report.simulation.success ? resultText.simulationSuccess : escapeHtml(report.simulation.error ?? resultText.simulationFailed)}</div></section>
    <section class="section"><a class="button" href="/agent/firewall?lang=${lang}">${resultText.checkAnother}</a></section>
  `;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const url = new URL(req.url ?? "/agent/firewall", "https://zora-genesis-t1j9.vercel.app");
  const lang = String(req.query?.lang ?? url.searchParams.get("lang") ?? "en") === "es" ? "es" : "en";
  const tx = String(req.query?.tx ?? url.searchParams.get("tx") ?? "");
  const to = String(req.query?.to ?? url.searchParams.get("to") ?? "");

  if (!to && !tx) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(page("Transaction Firewall", form(lang)));
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
    return res.status(200).send(page("Transaction Firewall Result", result(report, lang)));
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Inspection failed" });
  }
}
