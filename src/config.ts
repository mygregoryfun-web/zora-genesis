const bool = (name: string) => process.env[name] === "true";
const list = (name: string) =>
  (process.env[name] ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

export const config = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  model: process.env.MODEL ?? "openai/gpt-4o-mini",
  imageModel: process.env.IMAGE_MODEL ?? "gpt-image-1",
  imageProvider: process.env.IMAGE_PROVIDER ?? "openai",
  comfyApiKey: process.env.COMFY_API_KEY ?? "",
  comfyWorkflowFile: process.env.COMFY_WORKFLOW_FILE ?? "config/comfy-workflow-api.json",
  comfyPromptNodeId: process.env.COMFY_PROMPT_NODE_ID ?? "",
  comfyPromptInput: process.env.COMFY_PROMPT_INPUT ?? "text",
  comfySeedNodeId: process.env.COMFY_SEED_NODE_ID ?? "",
  comfySeedInput: process.env.COMFY_SEED_INPUT ?? "seed",
  comfyTimeoutMs: Number(process.env.COMFY_TIMEOUT_MS ?? 300000),
  creatorName: process.env.ZORA_CREATOR_NAME ?? "Fun Gregory",
  publishSignature: process.env.PUBLISH_SIGNATURE ?? process.env.ZORA_CREATOR_NAME ?? "Fun Gregory",
  creatorWalletAddress: process.env.ZORA_CREATOR_WALLET_ADDRESS ?? "",
  zoraApiKey: process.env.ZORA_API_KEY ?? "",
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY ?? "",
  baseRpcUrl: process.env.BASE_RPC_URL ?? "",
  baseBuilderCode: process.env.BASE_BUILDER_CODE ?? "bc_lk15eqwc",
  zoraCurrency: process.env.ZORA_CURRENCY ?? "ZORA",
  dryRun: bool("DRY_RUN"),
  skipAI: bool("SKIP_AI") || bool("DRY_RUN"),
  skipImage: bool("SKIP_IMAGE") || bool("DRY_RUN"),

  neynarApiKey: process.env.NEYNAR_API_KEY ?? "",
  signerUuid: process.env.NEYNAR_SIGNER_UUID ?? "",
  xBearerToken: process.env.X_BEARER_TOKEN ?? "",
  xClientId: process.env.X_CLIENT_ID ?? "",
  xClientSecret: process.env.X_CLIENT_SECRET ?? "",
  xRefreshToken: process.env.X_REFRESH_TOKEN ?? "",
  xApiKey: process.env.X_API_KEY ?? "",
  xApiSecret: process.env.X_API_SECRET ?? "",
  xAccessToken: process.env.X_ACCESS_TOKEN ?? "",
  xAccessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET ?? "",
  facebookPageId: process.env.FACEBOOK_PAGE_ID ?? "",
  facebookPageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ?? "",
  facebookGraphVersion: process.env.FACEBOOK_GRAPH_VERSION ?? "v23.0",
  facebookTopic: process.env.FACEBOOK_TOPIC ?? "relationships",
  facebookMemoryFile: process.env.FACEBOOK_MEMORY_FILE ?? (process.env.VERCEL ? "/tmp/zora-genesis-facebook-posts.json" : "src/memory/facebook-posts.json"),
  skipPost: bool("SKIP_POST") || bool("DRY_RUN"),
  publishChannels: list("PUBLISH_CHANNELS"),

  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 15000),

  port: Number(process.env.PORT ?? 3000),
  agentEndpoint: process.env.AGENT_ENDPOINT ?? "",
  agentPublicUrl: process.env.AGENT_PUBLIC_URL ?? "",
  agentRunToken: process.env.AGENT_RUN_TOKEN ?? "",
  agentAllowedUserId: process.env.AGENT_ALLOWED_USER_ID ?? "",
};

export function validateRuntimeConfig() {
  if (!Number.isFinite(config.requestTimeoutMs) || config.requestTimeoutMs < 1000) {
    throw new Error("REQUEST_TIMEOUT_MS must be a number of at least 1000");
  }
  if (!config.openRouterApiKey && !config.skipAI) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  if (!config.skipPost) {
    const farcasterConfigured = Boolean(config.neynarApiKey && config.signerUuid);
    const xOAuth2Configured = Boolean(config.xBearerToken || (config.xClientId && config.xClientSecret && config.xRefreshToken));
    const xOAuth1Configured = Boolean(config.xApiKey && config.xApiSecret && config.xAccessToken && config.xAccessTokenSecret);
    const xConfigured = xOAuth2Configured || xOAuth1Configured;
    const zoraConfigured = Boolean(config.creatorWalletAddress && config.walletPrivateKey && config.baseRpcUrl && config.zoraApiKey);
    const facebookConfigured = Boolean(config.facebookPageId && config.facebookPageAccessToken);

    if (!farcasterConfigured && !xConfigured && !zoraConfigured && !facebookConfigured) {
      throw new Error("Missing publishing credentials: configure NEYNAR_API_KEY + NEYNAR_SIGNER_UUID, X_BEARER_TOKEN, Zora wallet settings, or Facebook Page settings");
    }
  }
}
