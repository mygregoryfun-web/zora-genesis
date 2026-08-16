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
    capabilities: number[];
  };
};

export function getAgentProfile(): AgentProfile {
  return {
    version: "1.0.0",
    type: 1,
    display_name: "Zora Genesis",
    alias: "zora-genesis",
    bio: "Autonomous AI agent for Base, Zora, new asset creation, consumer crypto and creator economy.",
    base_account: process.env.ACCOUNT_ID,
    aiAgent: {
      type: 1,
      creator: "Fun Gregory",
      model: process.env.MODEL ?? "openai/gpt-4o-mini",
      capabilities: [
        0,
        1,
        8,
        9,
        17,
        18,
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
      baseBuilderCode: process.env.BASE_BUILDER_CODE ?? "bc_lk15eqwc",
      publicUrl: process.env.AGENT_PUBLIC_URL,
    },
  };
}
