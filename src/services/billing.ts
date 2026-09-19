import { createPublicClient, decodeEventLog, getAddress, http, isAddress, parseAbi, type Hex } from "viem";
import { base } from "viem/chains";
import { config } from "../config.js";
import { addCreditsToUser, type StudioSession } from "./auth.js";

export const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 1_000_000n;

const transferAbi = parseAbi([
  "event Transfer(address indexed from,address indexed to,uint256 value)",
]);

export type BillingProduct = {
  id: string;
  name: string;
  priceUsdc: number;
  credits: number;
  kind: "credits" | "subscription";
};

export const BILLING_PRODUCTS: BillingProduct[] = [
  { id: "creator", name: "Creator", priceUsdc: 19, credits: 250, kind: "subscription" },
  { id: "studio", name: "Studio", priceUsdc: 49, credits: 800, kind: "subscription" },
  { id: "agency", name: "Agency", priceUsdc: 149, credits: 3000, kind: "subscription" },
  { id: "credits-100", name: "100 kreditov", priceUsdc: 9, credits: 100, kind: "credits" },
  { id: "credits-300", name: "300 kreditov", priceUsdc: 24, credits: 300, kind: "credits" },
  { id: "credits-1000", name: "1000 kreditov", priceUsdc: 69, credits: 1000, kind: "credits" },
];

type PaymentRecord = {
  tx_hash: string;
  email: string;
  product_id: string;
  amount_usdc: number;
  credits: number;
  from_address: string;
  to_address: string;
  status: string;
  created_at: string;
};

function productById(id: unknown) {
  const product = BILLING_PRODUCTS.find((item) => item.id === String(id ?? ""));
  if (!product) {
    throw new Error("Izbrani paket ne obstaja.");
  }
  return product;
}

function requireBillingWallet() {
  if (!isAddress(config.billingWalletAddress)) {
    throw new Error("Billing wallet ni nastavljen.");
  }
  return getAddress(config.billingWalletAddress);
}

function amountToUsdcUnits(amount: number) {
  return BigInt(amount) * USDC_DECIMALS;
}

function supabaseEndpoint(table: string, query = "") {
  return `${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}${query}`;
}

function hasSupabase() {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
}

async function supabaseFetch(table: string, init: RequestInit = {}, query = "") {
  if (!hasSupabase()) {
    throw new Error("Za avtomatsko knjiženje plačil mora biti nastavljen Supabase.");
  }

  const response = await fetch(supabaseEndpoint(table, query), {
    ...init,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase ${table} request failed: ${response.status} ${detail}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function existingPayment(txHash: string) {
  const rows = await supabaseFetch(
    "studio_payments",
    { method: "GET" },
    `?tx_hash=eq.${encodeURIComponent(txHash)}&select=*&limit=1`,
  );
  return Array.isArray(rows) && rows[0] ? rows[0] as PaymentRecord : null;
}

async function savePayment(record: PaymentRecord) {
  const rows = await supabaseFetch(
    "studio_payments",
    { method: "POST", body: JSON.stringify(record) },
  );
  return Array.isArray(rows) && rows[0] ? rows[0] as PaymentRecord : record;
}

async function updatePaymentStatus(txHash: string, status: "confirmed" | "needs_review") {
  const rows = await supabaseFetch(
    "studio_payments",
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    `?tx_hash=eq.${encodeURIComponent(txHash)}`,
  );
  return Array.isArray(rows) && rows[0] ? rows[0] as PaymentRecord : null;
}

export function billingProductsPublic() {
  return BILLING_PRODUCTS.map((product) => ({ ...product }));
}

export function paymentUriForProduct(productId: string) {
  const product = productById(productId);
  const receiver = requireBillingWallet();
  const amount = amountToUsdcUnits(product.priceUsdc).toString();
  return `ethereum:${USDC_BASE_ADDRESS}@8453/transfer?address=${receiver}&uint256=${amount}`;
}

export async function claimPaymentForSession(session: StudioSession, input: {
  txHash?: unknown;
  productId?: unknown;
}) {
  if (session.role === "owner") {
    throw new Error("Admin račun ne potrebuje kupovanja kreditov.");
  }

  const product = productById(input.productId);
  const receiver = requireBillingWallet();
  const txHash = String(input.txHash ?? "").trim().toLowerCase();
  if (!/^0x[0-9a-f]{64}$/.test(txHash)) {
    throw new Error("Vpiši veljaven transaction hash.");
  }

  const used = await existingPayment(txHash);
  if (used?.status === "needs_review") {
    throw new Error("Ta transaction hash je že zabeležen, vendar potrebuje ročen pregled. Piši skrbniku.");
  }
  if (used) {
    throw new Error("Ta transaction hash je že bil uporabljen za dodajanje kreditov.");
  }

  const client = createPublicClient({
    chain: base,
    transport: http(config.baseRpcUrl || base.rpcUrls.default.http[0]),
  });
  const receipt = await client.getTransactionReceipt({ hash: txHash as Hex });
  if (receipt.status !== "success") {
    throw new Error("Transakcija ni uspešno potrjena.");
  }

  const expectedAmount = amountToUsdcUnits(product.priceUsdc);
  let matched: { from: string; value: bigint } | null = null;

  for (const log of receipt.logs) {
    if (getAddress(log.address) !== getAddress(USDC_BASE_ADDRESS)) {
      continue;
    }

    try {
      const rawLog = log as unknown as { data: Hex; topics: [Hex, ...Hex[]] };
      const decoded = decodeEventLog({ abi: transferAbi, data: rawLog.data, topics: rawLog.topics }) as {
        eventName: string;
        args: { from: string; to: string; value: bigint };
      };
      if (decoded.eventName !== "Transfer") {
        continue;
      }

      const from = getAddress(String(decoded.args.from));
      const to = getAddress(String(decoded.args.to));
      const value = BigInt(decoded.args.value.toString());

      if (to === receiver && value >= expectedAmount) {
        matched = { from, value };
        break;
      }
    } catch {
      // Ignore unrelated logs.
    }
  }

  if (!matched) {
    throw new Error("V tej transakciji nisem našel pravega USDC plačila na billing wallet.");
  }

  const payment = await savePayment({
    tx_hash: txHash,
    email: session.email,
    product_id: product.id,
    amount_usdc: product.priceUsdc,
    credits: product.credits,
    from_address: matched.from,
    to_address: receiver,
    status: "verified",
    created_at: new Date().toISOString(),
  });

  let updatedUser;
  try {
    updatedUser = await addCreditsToUser(session.email, product.credits);
  } catch (error) {
    await updatePaymentStatus(txHash, "needs_review").catch(() => null);
    throw error;
  }

  const confirmedPayment = await updatePaymentStatus(txHash, "confirmed") ?? payment;

  return {
    payment: confirmedPayment,
    product,
    addedCredits: product.credits,
    user: updatedUser,
  };
}
