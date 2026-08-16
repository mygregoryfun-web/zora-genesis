import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import solc from "solc";

const privateKey = process.env.WALLET_PRIVATE_KEY;
const rpcUrl = process.env.BASE_RPC_URL;
const shouldDeploy = process.argv.includes("--confirm-mainnet");

if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error("WALLET_PRIVATE_KEY must be set to a 0x-prefixed EVM private key.");
}

if (!rpcUrl) {
  throw new Error("BASE_RPC_URL must be set.");
}

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

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
});
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(rpcUrl),
});

const balance = await publicClient.getBalance({ address: account.address });
console.log("Deploying ZoraGenesisProof on Base");
console.log("Builder wallet:", account.address);
console.log("Balance ETH:", Number(balance) / 1e18);

const estimatedGas = await publicClient.estimateGas({
  account: account.address,
  data: bytecode,
});

console.log("Estimated gas:", estimatedGas.toString());

if (!shouldDeploy) {
  console.log("Dry run only. Re-run with --confirm-mainnet to deploy on Base mainnet.");
  process.exit(0);
}

const hash = await walletClient.deployContract({
  abi,
  bytecode,
});

console.log("Transaction:", hash);

const receipt = await publicClient.waitForTransactionReceipt({ hash });

console.log("Contract:", receipt.contractAddress);
console.log("BaseScan:", `https://basescan.org/address/${receipt.contractAddress}`);
