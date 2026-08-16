import { File } from "node:buffer";
import * as coinsSdk from "@zoralabs/coins-sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { config } from "../config.js";
import type { GeneratedImage } from "./image.js";
import type { GeneratedPost, PublishResult } from "../types.js";

function symbolFromName(name: string) {
  return name
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()
    .padEnd(3, "Z");
}

function hasValidEvmPrivateKey(value: string) {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

async function diagnoseCreateContentFailure(call: Record<string, unknown>) {
  try {
    const response = await fetch("https://api-sdk.zora.engineering/create/content", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-key": config.zoraApiKey,
      },
      body: JSON.stringify(call),
    });
    const body = await response.text();
    const detail = body.slice(0, 1000) || "Empty response";
    return `Zora create API ${response.status}: ${detail}`;
  } catch (error) {
    return `Unable to read Zora create API error: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
}

export async function postToZora(post: GeneratedPost, image: GeneratedImage | null): Promise<PublishResult> {
  const coinName = `${config.creatorName}: ${post.title}`.slice(0, 64);

  if (config.skipPost) {
    console.log("\nZora publishing skipped.");
    console.log("CREATOR:", config.creatorName);
    console.log("COIN:", coinName);
    console.log("POST:", post.post);
    console.log("IMAGE:", image ? `${image.filename} generated` : "not generated");
    return { status: "skipped", platform: "zora", reason: "SKIP_POST enabled" };
  }

  if (!config.creatorWalletAddress || !config.walletPrivateKey || !config.baseRpcUrl) {
    console.log("Zora wallet settings not configured; skipping Zora.");
    return { status: "skipped", platform: "zora", reason: "Wallet settings not configured" };
  }

  if (!hasValidEvmPrivateKey(config.walletPrivateKey)) {
    console.log("Zora SDK publishing needs a local EVM private key in WALLET_PRIVATE_KEY (0x + 64 hex characters); skipping Zora.");
    return { status: "skipped", platform: "zora", reason: "Invalid private key format" };
  }

  if (!config.zoraApiKey) {
    console.log("ZORA_API_KEY not configured; skipping Zora.");
    return { status: "skipped", platform: "zora", reason: "ZORA_API_KEY not configured" };
  }

  if (!image) {
    console.log("Generated image missing; skipping Zora.");
    return { status: "skipped", platform: "zora", reason: "Generated image missing" };
  }

  const coins = coinsSdk as any;
  coins.setApiKey(config.zoraApiKey);

  const creator = config.creatorWalletAddress as `0x${string}`;
  const { createMetadataParameters } = await coins
    .createMetadataBuilder()
    .withName(coinName)
    .withSymbol(symbolFromName(config.creatorName))
    .withDescription(`${post.post}\n\nPublished by ${config.creatorName}. ${post.hashtags.join(" ")}`)
    .withImage(new File([image.buffer], image.filename, { type: image.mimeType }))
    .upload(coins.createZoraUploaderForCreator(creator));

  const account = privateKeyToAccount(config.walletPrivateKey as `0x${string}`);
  const publicClient = createPublicClient({
    chain: base,
    transport: http(config.baseRpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(config.baseRpcUrl),
  });

  const createCall = {
    ...createMetadataParameters,
    creator,
    currency: coins.CreateConstants.ContentCoinCurrencies[config.zoraCurrency] ?? coins.CreateConstants.ContentCoinCurrencies.ZORA,
    chainId: base.id,
    startingMarketCap: coins.CreateConstants.StartingMarketCaps.LOW,
  };

  let result;
  try {
    result = await coins.createCoin({
      call: createCall,
      walletClient,
      publicClient,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Failed to create content calldata") {
      throw new Error(await diagnoseCreateContentFailure(createCall));
    }
    throw error;
  }

  console.log("Posted to Zora:", {
    hash: result.hash,
    address: result.address,
    creator: config.creatorName,
  });

  return {
    status: "published",
    platform: "zora",
    data: { hash: result.hash, address: result.address },
  };
}
