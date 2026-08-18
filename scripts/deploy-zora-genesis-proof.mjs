import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { createPublicClient, createWalletClient, formatEther, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import solc from "solc";

const networkArg = process.argv.find((arg) => arg.startsWith("--network="));
const network = networkArg?.split("=")[1] ?? "base";
const chain = network === "base-sepolia" ? baseSepolia : network === "base" ? base : null;

if (!chain) {
  throw new Error("Unsupported network. Use --network=base or --network=base-sepolia.");
}

const confirmationFlag = chain.id === base.id ? "--confirm-mainnet" : "--confirm-testnet";
const shouldDeploy = process.argv.includes(confirmationFlag);

const contractPath = path.resolve("contracts/ZoraGenesisProof.sol");
const source = await fs.readFile(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "ZoraGenesisProof.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors?.filter((error) => error.severity === "error") ?? [];

if (errors.length > 0) {
  throw new Error(errors.map((error) => error.formattedMessage).join("\n"));
}

const compiled = output.contracts["ZoraGenesisProof.sol"].ZoraGenesisProof;
const abi = compiled.abi;
const bytecode = `0x${compiled.evm.bytecode.object}`;

console.log(`Compiled ZoraGenesisProof for ${chain.name} (chain ${chain.id}).`);

if (!shouldDeploy) {
  console.log(`Compile check only. Re-run with ${confirmationFlag} --network=${network} to deploy.`);
  process.exit(0);
}

const privateKey = process.env.WALLET_PRIVATE_KEY;
const rpcUrl = chain.id === base.id
  ? process.env.BASE_RPC_URL
  : process.env.BASE_SEPOLIA_RPC_URL;

if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error("WALLET_PRIVATE_KEY must be set to a 0x-prefixed EVM private key.");
}

if (!rpcUrl) {
  const variable = chain.id === base.id ? "BASE_RPC_URL" : "BASE_SEPOLIA_RPC_URL";
  throw new Error(`${variable} must be set.`);
}

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});
const walletClient = createWalletClient({
  account,
  chain,
  transport: http(rpcUrl),
});

const balance = await publicClient.getBalance({ address: account.address });
const rpcChainId = await publicClient.getChainId();
if (rpcChainId !== chain.id) {
  throw new Error(`RPC chain mismatch: expected ${chain.id}, received ${rpcChainId}.`);
}

console.log(`Deploying ZoraGenesisProof on ${chain.name}`);
console.log("Builder wallet:", account.address);
console.log("Balance ETH:", formatEther(balance));

const estimatedGas = await publicClient.estimateGas({
  account: account.address,
  data: bytecode,
});

console.log("Estimated gas:", estimatedGas.toString());
const fees = await publicClient.estimateFeesPerGas();
const maxFeePerGas = fees.maxFeePerGas ?? fees.gasPrice;
if (maxFeePerGas) {
  const maximumCost = estimatedGas * maxFeePerGas;
  console.log("Estimated maximum cost ETH:", formatEther(maximumCost));
  if (balance < maximumCost) {
    throw new Error("Wallet balance is lower than the estimated maximum deployment cost.");
  }
}

const hash = await walletClient.deployContract({
  abi,
  bytecode,
});

console.log("Transaction:", hash);

const receipt = await publicClient.waitForTransactionReceipt({ hash });

console.log("Contract:", receipt.contractAddress);
const explorerUrl = `${chain.blockExplorers?.default.url}/address/${receipt.contractAddress}`;
console.log("Explorer:", explorerUrl);

const deployment = {
  contract: "ZoraGenesisProof",
  chainId: chain.id,
  network,
  address: receipt.contractAddress,
  transactionHash: hash,
  deployer: account.address,
  explorerUrl,
  deployedAt: new Date().toISOString(),
};
const deploymentDirectory = path.resolve("deployments");
await fs.mkdir(deploymentDirectory, { recursive: true });
const artifactPath = path.join(deploymentDirectory, `zora-genesis-proof.${network}.json`);
await fs.writeFile(artifactPath, `${JSON.stringify(deployment, null, 2)}\n`, "utf8");
console.log("Deployment artifact:", artifactPath);
