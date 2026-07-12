import { File } from "node:buffer";
import { config } from "../config.js";
import type { GeneratedImage } from "./image.js";

type GeneratedPost = {
  title: string;
  post: string;
  hashtags: string[];
};

async function optionalImport<T>(moduleName: string): Promise<T | null> {
  try {
    const load = new Function("moduleName", "return import(moduleName)");
    return (await load(moduleName)) as T;
  } catch {
    return null;
  }
}

function symbolFromName(name: string) {
  return name
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()
    .padEnd(3, "Z");
}

export async function postToZora(post: GeneratedPost, image: GeneratedImage | null) {
  const coinName = `${config.creatorName}: ${post.title}`.slice(0, 64);

  if (config.skipPost) {
    console.log("\nZora publishing skipped.");
    console.log("CREATOR:", config.creatorName);
    console.log("COIN:", coinName);
    console.log("POST:", post.post);
    console.log("IMAGE:", image ? `${image.filename} generated` : "not generated");
    return null;
  }

  if (!config.creatorWalletAddress || !config.walletPrivateKey || !config.baseRpcUrl) {
    console.log("Zora wallet settings not configured; skipping Zora.");
    return null;
  }

  if (!image) {
    console.log("Generated image missing; skipping Zora.");
    return null;
  }

  const coins = await optionalImport<any>("@zoralabs/coins-sdk");
  const viem = await optionalImport<any>("viem");
  const accounts = await optionalImport<any>("viem/accounts");
  const chains = await optionalImport<any>("viem/chains");

  if (!coins || !viem || !accounts || !chains) {
    console.log("Zora SDK dependencies not installed; skipping Zora.");
    return null;
  }

  const creator = config.creatorWalletAddress as `0x${string}`;
  const { createMetadataParameters } = await coins
    .createMetadataBuilder()
    .withName(coinName)
    .withSymbol(symbolFromName(config.creatorName))
    .withDescription(`${post.post}\n\nPublished by ${config.creatorName}. ${post.hashtags.join(" ")}`)
    .withImage(new File([image.buffer], image.filename, { type: image.mimeType }))
    .upload(coins.createZoraUploaderForCreator(creator));

  const account = accounts.privateKeyToAccount(config.walletPrivateKey as `0x${string}`);
  const chain = chains.base;
  const publicClient = viem.createPublicClient({
    chain,
    transport: viem.http(config.baseRpcUrl),
  });
  const walletClient = viem.createWalletClient({
    account,
    chain,
    transport: viem.http(config.baseRpcUrl),
  });

  const result = await coins.createCoin({
    call: {
      ...createMetadataParameters,
      creator,
      currency: coins.CreateConstants.ContentCoinCurrencies[config.zoraCurrency] ?? coins.CreateConstants.ContentCoinCurrencies.ZORA,
      chainId: chain.id,
      startingMarketCap: coins.CreateConstants.StartingMarketCaps.LOW,
    },
    walletClient,
    publicClient,
  });

  console.log("Posted to Zora:", {
    hash: result.hash,
    address: result.address,
    creator: config.creatorName,
  });

  return {
    success: true,
    platform: "zora",
    hash: result.hash,
    address: result.address,
    timestamp: new Date().toISOString(),
  };
}
