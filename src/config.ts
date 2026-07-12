const bool = (name: string) => process.env[name] === "true";

export const config = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  model: process.env.MODEL ?? "openai/gpt-4o-mini",
  imageModel: process.env.IMAGE_MODEL ?? "gpt-image-1",
  creatorName: process.env.ZORA_CREATOR_NAME ?? "Fun Gregory",
  creatorWalletAddress: process.env.ZORA_CREATOR_WALLET_ADDRESS ?? "",
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY ?? "",
  baseRpcUrl: process.env.BASE_RPC_URL ?? "",
  zoraCurrency: process.env.ZORA_CURRENCY ?? "ZORA",
  dryRun: bool("DRY_RUN"),
  skipAI: bool("SKIP_AI") || bool("DRY_RUN"),
  skipImage: bool("SKIP_IMAGE") || bool("DRY_RUN"),

  neynarApiKey: process.env.NEYNAR_API_KEY ?? "",
  signerUuid: process.env.NEYNAR_SIGNER_UUID ?? "",
  xBearerToken: process.env.X_BEARER_TOKEN ?? "",
  skipPost: bool("SKIP_POST") || bool("DRY_RUN"),

  port: Number(process.env.PORT ?? 3000),
  agentEndpoint: process.env.AGENT_ENDPOINT ?? "",
  agentPublicUrl: process.env.AGENT_PUBLIC_URL ?? "",
  agentRunToken: process.env.AGENT_RUN_TOKEN ?? "",
  agentAllowedUserId: process.env.AGENT_ALLOWED_USER_ID ?? "",
};

export function validateRuntimeConfig() {
  if (!config.openRouterApiKey && !config.skipAI) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  if (!config.skipPost) {
    const farcasterConfigured = Boolean(config.neynarApiKey && config.signerUuid);
    const xConfigured = Boolean(config.xBearerToken);
    const zoraConfigured = Boolean(config.creatorWalletAddress && config.walletPrivateKey && config.baseRpcUrl);

    if (!farcasterConfigured && !xConfigured && !zoraConfigured) {
      throw new Error("Missing publishing credentials: configure NEYNAR_API_KEY + NEYNAR_SIGNER_UUID, X_BEARER_TOKEN, or Zora wallet settings");
    }
  }
}
