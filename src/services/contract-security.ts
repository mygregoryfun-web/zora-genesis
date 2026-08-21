import {
  createPublicClient,
  getAddress,
  http,
  isAddress,
  parseAbi,
  toFunctionSelector,
  type Address,
  type Hex,
} from "viem";
import { base, baseSepolia } from "viem/chains";

export type SecurityNetwork = "base" | "base-sepolia";
export type RiskSeverity = "info" | "low" | "medium" | "high";

export interface ContractFinding {
  id: string;
  severity: RiskSeverity;
  title: string;
  evidence: string;
  recommendation: string;
}

export interface ContractSecurityReport {
  address: Address;
  network: SecurityNetwork;
  generatedAt: string;
  classification: "low" | "caution" | "high" | "critical";
  riskScore: number;
  contract: boolean;
  token: {
    name: string | null;
    symbol: string | null;
    decimals: number | null;
    totalSupply: string | null;
    owner: Address | null;
  };
  proxy: { detected: boolean; implementation: Address | null };
  findings: ContractFinding[];
  limitations: string[];
  disclaimer: string;
}

const tokenAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function owner() view returns (address)",
]);

const implementationSlot =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as Hex;

const controls = [
  { id: "mint", signature: "mint(address,uint256)", severity: "high", title: "Owner-controlled minting may exist", recommendation: "Verify the supply policy and the role allowed to mint." },
  { id: "blacklist", signature: "blacklist(address)", severity: "high", title: "Address blacklisting may exist", recommendation: "Confirm whether the owner can prevent selected holders from transferring or selling." },
  { id: "set-blacklist", signature: "setBlacklist(address,bool)", severity: "high", title: "Configurable blacklist may exist", recommendation: "Inspect access control and blacklist history before interacting." },
  { id: "pause", signature: "pause()", severity: "medium", title: "Transfers or contract activity may be pausable", recommendation: "Identify the pause authority and whether it is a multisig or timelock." },
  { id: "set-tax", signature: "setTax(uint256)", severity: "high", title: "Token tax may be changeable", recommendation: "Check maximum tax bounds and recent owner transactions." },
  { id: "set-fees", signature: "setFees(uint256,uint256)", severity: "high", title: "Buy/sell fees may be changeable", recommendation: "Check fee caps; unrestricted fees can make a token impossible to sell." },
  { id: "upgrade", signature: "upgradeTo(address)", severity: "high", title: "Implementation may be upgradeable", recommendation: "Review the proxy administrator, implementation and upgrade delay." },
] as const;

function containsSelector(bytecode: Hex, signature: string) {
  return bytecode.toLowerCase().includes(toFunctionSelector(signature).slice(2).toLowerCase());
}

async function safeRead<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch {
    return null;
  }
}

function implementationFromSlot(value: Hex | undefined): Address | null {
  if (!value || /^0x0+$/.test(value)) return null;
  const candidate = `0x${value.slice(-40)}`;
  return isAddress(candidate) ? getAddress(candidate) : null;
}

export async function scanContractSecurity(input: {
  address: string;
  network?: SecurityNetwork;
  rpcUrl?: string;
}): Promise<ContractSecurityReport> {
  if (!isAddress(input.address)) throw new Error("Invalid EVM contract address.");

  const address = getAddress(input.address);
  const network = input.network ?? "base";
  const chain = network === "base-sepolia" ? baseSepolia : base;
  const rpcUrl = input.rpcUrl || (network === "base-sepolia" ? process.env.BASE_SEPOLIA_RPC_URL : process.env.BASE_RPC_URL);
  const client = createPublicClient({ chain, transport: http(rpcUrl || chain.rpcUrls.default.http[0]) });
  const bytecode = await client.getBytecode({ address });
  const contract = Boolean(bytecode && bytecode !== "0x");

  const emptyToken = { name: null, symbol: null, decimals: null, totalSupply: null, owner: null };
  if (!contract || !bytecode) {
    return {
      address, network, generatedAt: new Date().toISOString(), classification: "critical", riskScore: 100,
      contract: false, token: emptyToken, proxy: { detected: false, implementation: null },
      findings: [{ id: "no-code", severity: "high", title: "No deployed contract code", evidence: "eth_getCode returned empty bytecode for this address on the selected network.", recommendation: "Check the address and network. Do not treat an EOA as a token contract." }],
      limitations: ["No token or trading simulation was possible because no contract code was found."],
      disclaimer: "Automated screening is not a security audit or proof that a token is safe or fraudulent.",
    };
  }

  const [name, symbol, decimals, totalSupply, owner, slot] = await Promise.all([
    safeRead(() => client.readContract({ address, abi: tokenAbi, functionName: "name" })),
    safeRead(() => client.readContract({ address, abi: tokenAbi, functionName: "symbol" })),
    safeRead(() => client.readContract({ address, abi: tokenAbi, functionName: "decimals" })),
    safeRead(() => client.readContract({ address, abi: tokenAbi, functionName: "totalSupply" })),
    safeRead(() => client.readContract({ address, abi: tokenAbi, functionName: "owner" })),
    safeRead(() => client.getStorageAt({ address, slot: implementationSlot })),
  ]);

  const findings: ContractFinding[] = [];
  for (const control of controls) {
    if (containsSelector(bytecode, control.signature)) {
      findings.push({ ...control, evidence: `Runtime bytecode contains selector ${toFunctionSelector(control.signature)} for ${control.signature}.` });
    }
  }

  const implementation = implementationFromSlot(slot ?? undefined);
  if (implementation && !findings.some((item) => item.id === "upgrade")) {
    findings.push({ id: "proxy", severity: "high", title: "Upgradeable proxy detected", evidence: `EIP-1967 implementation slot points to ${implementation}.`, recommendation: "Audit both proxy and implementation, and identify who controls upgrades." });
  }

  if (owner && owner !== "0x0000000000000000000000000000000000000000") {
    findings.push({ id: "owner", severity: "medium", title: "Active owner authority detected", evidence: `owner() returned ${owner}.`, recommendation: "Check whether this address is a multisig/timelock and review its recent actions." });
  }

  const weights: Record<RiskSeverity, number> = { info: 0, low: 8, medium: 18, high: 30 };
  const riskScore = Math.min(100, findings.reduce((sum, finding) => sum + weights[finding.severity], 0));
  const classification = riskScore >= 75 ? "critical" : riskScore >= 45 ? "high" : riskScore >= 20 ? "caution" : "low";

  return {
    address, network, generatedAt: new Date().toISOString(), classification, riskScore, contract: true,
    token: {
      name: typeof name === "string" ? name : null,
      symbol: typeof symbol === "string" ? symbol : null,
      decimals: typeof decimals === "number" ? decimals : null,
      totalSupply: typeof totalSupply === "bigint" ? totalSupply.toString() : null,
      owner: owner && isAddress(owner) ? getAddress(owner) : null,
    },
    proxy: { detected: Boolean(implementation), implementation },
    findings,
    limitations: [
      "Function selectors are warning signals, not proof that the function is reachable, malicious or unrestricted.",
      "This version does not yet simulate buys/sells, measure DEX liquidity, inspect holder concentration or verify source code.",
    ],
    disclaimer: "Automated screening is not a security audit or proof that a token is safe or fraudulent. Never rely on this score alone.",
  };
}
