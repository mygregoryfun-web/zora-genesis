/// <reference types="node" />
import "dotenv/config";
import {
  type AgentRegistrationRequest,
  RegistryBrokerClient,
  RegistryBrokerError,
  RegistryBrokerParseError,
} from "@hol-org/rb-client";

const requiredAny = (...names: string[]): string => {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }

  throw new Error(`Missing .env value: ${names.join(" or ")}`);
};

const env = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing .env value: ${name}`);
  }

  return value;
};

const client = new RegistryBrokerClient({
  apiKey: requiredAny("HOL_API_KEY", "REGISTRY_BROKER_API_KEY"),
  accountId: env("ACCOUNT_ID"),
  ledgerApiKey: process.env.LEDGER_API_KEY,
});

async function main() {
  const uaid = env("HOL_UAID");
  const payload: AgentRegistrationRequest = {
    profile: {
      version: "1.0.0",
      type: 1,
      display_name: "Zora Genesis",
      alias: "zora-genesis",
      bio: "Autonomous AI agent for Base, Zora, NFTs and creator economy.",
      base_account: env("ACCOUNT_ID"),
      uaid: env("HOL_UAID"),
      aiAgent: {
        type: 1,
        creator: "Fun Gregory",
        model: process.env.MODEL ?? "openai/gpt-4o-mini",
        capabilities: [
          "base-ecosystem-analysis",
          "zora-creator-economy-analysis",
          "market-signal-scoring",
          "farcaster-publishing",
        ],
      },
    },
    endpoint: env("AGENT_ENDPOINT"),
    protocol: "https",
    communicationProtocol: "hcs-10",
    metadata: {
      provider: "Fun Gregory",
      category: "web3-ai-agent",
      verified: false,
      nativeId: `hedera:mainnet:${env("ACCOUNT_ID")}`,
      publicUrl: process.env.AGENT_PUBLIC_URL,
    },
  };

  try {
    console.log("Updating HOL agent:");
    console.log(JSON.stringify(payload, null, 2));

    const result = await client.updateAgent(uaid, payload);
    console.log("Update result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    if (error instanceof RegistryBrokerParseError) {
      console.log("Update raw result:");
      console.log(JSON.stringify(error.rawValue, null, 2));
      const raw = error.rawValue as { success?: boolean; status?: string } | undefined;
      if (raw?.success && (raw.status === "updated" || raw.status === "duplicate")) {
        return;
      }
    }

    if (error instanceof RegistryBrokerError) {
      console.error("RegistryBrokerError:");
      console.error("Status:", error.status);
      console.error("Body:", JSON.stringify(error.body, null, 2));
      process.exit(1);
    }

    console.error(error);
    process.exit(1);
  }
}

main();
