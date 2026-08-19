import { z } from "zod";

export const GeneratedPostSchema = z.object({
  title: z.string().trim().min(1).max(120),
  post: z.string().trim().min(1).max(1000),
  hashtags: z.array(
    z.string().trim().regex(/^#[\p{L}\p{N}_]+$/u, "Hashtags must start with #"),
  ).max(3),
});

export type GeneratedPost = z.infer<typeof GeneratedPostSchema>;

export type PublishChannel = "x" | "farcaster" | "zora";

export type PublishStatus = "published" | "skipped";

export type PublishResult = {
  status: PublishStatus;
  platform: string;
  reason?: string;
  data?: unknown;
};

export type OpportunityAction =
  | "create-zora-asset"
  | "draft-launchpad-concept"
  | "build-consumer-app"
  | "track-prediction-market-narrative"
  | "observe-agent-commerce"
  | "observe-defi-signal";

export type Opportunity = {
  id: string;
  title: string;
  area: string;
  score: number;
  confidence: "low" | "medium" | "high";
  whyNow: string;
  suggestedAction: OpportunityAction;
  zoraAssetIdea?: string;
  builderNote: string;
  riskNote: string;
};

export type MonetizationTier = {
  id: string;
  name: string;
  priceUsdMonthly: number;
  audience: string;
  included: string[];
  limits: string[];
};

export type MonetizationProduct = {
  id: string;
  name: string;
  model: "subscription" | "pay-per-brief" | "service";
  baseFit: string[];
  revenueHypothesis: string;
  userValue: string;
  implementationNote: string;
  safetyBoundary: string;
};

export type MonetizationPlan = {
  positioning: string;
  freeValue: string[];
  tiers: MonetizationTier[];
  products: MonetizationProduct[];
  nextExperiment: string;
  riskNote: string;
};

export type GrowthChannel = {
  id: string;
  name: string;
  audience: string;
  freeTactic: string;
  proofToShare: string;
  cadence: string;
};

export type GrowthPlan = {
  positioning: string;
  primaryCta: string;
  primaryCtaUrl: string;
  weeklyLoop: string[];
  channels: GrowthChannel[];
  samplePosts: {
    x: string;
    farcaster: string;
    facebook: string;
  };
  safetyBoundary: string;
};

export type BaseBuilderCodeAttribution = {
  builderCode: string;
  valid: boolean;
  app: string;
  attribution: string;
  usage: string[];
  integrationTargets: string[];
  safetyBoundary: string;
};
