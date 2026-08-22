import { createPublicClient, decodeFunctionData, getAddress, http, isAddress, parseAbi, type Address, type Hex } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { ContractFinding, SecurityNetwork } from "./contract-security.js";

const approvalAbi = parseAbi([
  "function approve(address spender,uint256 amount) returns (bool)",
  "function setApprovalForAll(address operator,bool approved)",
  "function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)",
]);
const maxUint256 = (1n << 256n) - 1n;

export interface TransactionFirewallReport {
  network: SecurityNetwork;
  to: Address;
  from: Address | null;
  valueWei: string;
  selector: string;
  simulation: { attempted: boolean; success: boolean | null; error: string | null };
  decodedAction: string | null;
  riskScore: number;
  recommendation: "allow-with-review" | "warn" | "block";
  findings: ContractFinding[];
  disclaimer: string;
}

function chainForNetwork(network: SecurityNetwork) {
  return network === "base-sepolia" ? baseSepolia : base;
}

function rpcUrlForNetwork(network: SecurityNetwork) {
  return network === "base-sepolia" ? process.env.BASE_SEPOLIA_RPC_URL : process.env.BASE_RPC_URL;
}

function compactError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.split("\n")[0]?.slice(0, 240) || "Simulation failed";
}

export async function inspectTransactionHash(input: {
  hash: string;
  network?: SecurityNetwork;
  rpcUrl?: string;
}): Promise<TransactionFirewallReport> {
  if (!/^0x[0-9a-fA-F]{64}$/.test(input.hash)) throw new Error("Invalid transaction hash.");

  const network = input.network ?? "base";
  const chain = chainForNetwork(network);
  const client = createPublicClient({ chain, transport: http(input.rpcUrl || rpcUrlForNetwork(network) || chain.rpcUrls.default.http[0]) });
  const transaction = await client.getTransaction({ hash: input.hash as Hex });

  if (!transaction.to) throw new Error("Contract creation transactions are not supported by the firewall yet.");

  return inspectTransaction({
    to: transaction.to,
    data: transaction.input,
    from: transaction.from,
    valueWei: transaction.value.toString(),
    network,
    rpcUrl: input.rpcUrl,
  });
}

export async function inspectTransaction(input: {
  to: string;
  data?: string;
  valueWei?: string;
  from?: string;
  network?: SecurityNetwork;
  rpcUrl?: string;
}): Promise<TransactionFirewallReport> {
  if (!isAddress(input.to)) throw new Error("Invalid transaction destination address.");
  if (input.from && !isAddress(input.from)) throw new Error("Invalid sender address.");
  const data = (input.data || "0x") as Hex;
  if (!/^0x(?:[0-9a-fA-F]{2})*$/.test(data)) throw new Error("Transaction data must be even-length hexadecimal bytes beginning with 0x.");
  let value: bigint;
  try { value = BigInt(input.valueWei || "0"); } catch { throw new Error("valueWei must be a non-negative integer."); }
  if (value < 0n) throw new Error("valueWei must be a non-negative integer.");

  const network = input.network ?? "base";
  const chain = chainForNetwork(network);
  const rpcUrl = input.rpcUrl || rpcUrlForNetwork(network);
  const client = createPublicClient({ chain, transport: http(rpcUrl || chain.rpcUrls.default.http[0]) });
  const to = getAddress(input.to);
  const from = input.from ? getAddress(input.from) : null;
  const findings: ContractFinding[] = [];
  let decodedAction: string | null = null;

  if (data !== "0x") {
    try {
      const decoded = decodeFunctionData({ abi: approvalAbi, data });
      decodedAction = decoded.functionName;
      if (decoded.functionName === "approve") {
        const [spender, amount] = decoded.args;
        const unlimited = amount === maxUint256;
        findings.push({ id: unlimited ? "unlimited-approval" : "token-approval", severity: unlimited ? "high" : "medium", title: unlimited ? "Unlimited token approval" : "Token spending approval", evidence: `${spender} would be allowed to spend ${unlimited ? "the maximum possible amount" : amount.toString()} on behalf of the wallet.`, recommendation: unlimited ? "Block unless the spender is explicitly trusted; prefer the exact required amount." : "Confirm the spender and amount, then revoke the approval when no longer needed." });
      } else if (decoded.functionName === "setApprovalForAll") {
        const [operator, approved] = decoded.args;
        if (approved) findings.push({ id: "nft-approval-all", severity: "high", title: "Operator access to every NFT in a collection", evidence: `${operator} would receive setApprovalForAll permission.`, recommendation: "Block unless this is the intended, trusted marketplace operator." });
      } else if (decoded.functionName === "permit") {
        const [, spender, amount, deadline] = decoded.args;
        findings.push({ id: "permit", severity: amount === maxUint256 ? "high" : "medium", title: "Off-chain token permit", evidence: `${spender} receives a permit for ${amount.toString()} until timestamp ${deadline.toString()}.`, recommendation: "Verify spender, amount, chain and deadline before signing." });
      }
    } catch {
      decodedAction = data.length >= 10 ? `unknown:${data.slice(0, 10)}` : "unknown";
      findings.push({ id: "unknown-call", severity: "medium", title: "Unrecognized contract call", evidence: `Function selector ${data.slice(0, 10)} was not decoded by the firewall.`, recommendation: "Do not sign blind calldata; verify the function in a trusted explorer or decoded wallet preview." });
    }
  }

  if (value > 0n) findings.push({ id: "native-value", severity: "medium", title: "Transaction sends native ETH", evidence: `The call sends ${value.toString()} wei.`, recommendation: "Confirm the displayed ETH value matches the intended payment." });

  let simulation: TransactionFirewallReport["simulation"];
  try {
    await client.call({ account: from ?? undefined, to, data, value });
    simulation = { attempted: true, success: true, error: null };
  } catch (error) {
    const reason = compactError(error);
    simulation = { attempted: true, success: false, error: reason };
    findings.push({ id: "simulation-revert", severity: "high", title: "Transaction simulation failed", evidence: reason, recommendation: "Block the transaction until the revert or RPC limitation is understood." });
  }

  const weights = { info: 0, low: 8, medium: 25, high: 50 } as const;
  const riskScore = Math.min(100, findings.reduce((sum, finding) => sum + weights[finding.severity], 0));
  return { network, to, from, valueWei: value.toString(), selector: data.slice(0, 10), simulation, decodedAction, riskScore, recommendation: riskScore >= 50 ? "block" : riskScore >= 20 ? "warn" : "allow-with-review", findings, disclaimer: "Simulation and decoding reduce risk but cannot guarantee safety, future contract behavior or economic outcome." };
}
