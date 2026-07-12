export type AgentProfile = {
  version: string;
  type: number;
  display_name: string;
  alias: string;
  bio: string;
  base_account?: string;
  aiAgent: {
    type: number;
    creator: string;
    model: string;
    capabilities: string[];
  };
};

export function getAgentProfile(): AgentProfile {
  return {
    version: "1.0.0",
    type: 1,
    display_name: "Zora Genesis",
    alias: "zora-genesis",
    bio: "Autonomous AI agent for Base, Zora, NFTs and creator economy.",
    base_account: process.env.ACCOUNT_ID,
    aiAgent: {
      type: 1,
      creator: "Fun Gregory",
      model: process.env.MODEL ?? "openai/gpt-4o-mini",
      capabilities: [
        "base-ecosystem-analysis",
        "zora-creator-economy-analysis",
        "market-signal-scoring",
        "farcaster-publishing",
        "x-publishing",
      ],
    },
  };
}

export function getRegistrationPayload() {
  return {
    profile: getAgentProfile(),
    endpoint: process.env.AGENT_ENDPOINT,
    protocol: "https",
    communicationProtocol: "hcs-10",
    metadata: {
      provider: "Fun Gregory",
      category: "web3-ai-agent",
      verified: false,
      publicUrl: process.env.AGENT_PUBLIC_URL,
    },
  };
}
