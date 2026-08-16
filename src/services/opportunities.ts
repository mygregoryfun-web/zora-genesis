import type { Opportunity } from "../types.js";

type OpportunityInput = {
  trends: any;
  market: any;
};

function confidence(score: number): Opportunity["confidence"] {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function opportunity(input: Omit<Opportunity, "confidence">): Opportunity {
  return {
    ...input,
    confidence: confidence(input.score),
  };
}

export function generateOpportunities({ trends, market }: OpportunityInput): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const builderFocus = trends?.baseBuilderFocus;
  const zoraFit: string[] = builderFocus?.zoraFit ?? [];
  const areas: string[] = builderFocus?.areas ?? [];
  const baseIsActive = trends?.base?.activity === "high";
  const zoraMintingIsRising = trends?.zora?.mintVolume === "rising";
  const creatorMarketIsBullish = trends?.market?.topic === "creator economy";
  const ethChange = Number(market?.ethChange24h ?? 0);

  if (zoraFit.includes("new asset creation")) {
    opportunities.push(opportunity({
      id: "zora-new-asset-pulse",
      title: "Zora asset pulse for Base creator narratives",
      area: "new asset creation",
      score: 88 + (zoraMintingIsRising ? 4 : 0),
      whyNow: "Base builder focus is leaning toward new asset creation while Zora creator activity is active.",
      suggestedAction: "create-zora-asset",
      zoraAssetIdea: "A recurring Zora content coin series that turns strong Base creator-economy signals into collectible market notes.",
      builderNote: "Ship a simple loop: detect signal, generate cover art, mint/launch asset, distribute through Farcaster and X.",
      riskNote: "Keep it as cultural/creator analysis, not investment advice.",
    }));
  }

  if (zoraFit.includes("token launchpads")) {
    opportunities.push(opportunity({
      id: "creator-launchpad-lite",
      title: "Launchpad-lite flow for creator assets",
      area: "token launchpads",
      score: 82 + (baseIsActive ? 5 : 0),
      whyNow: "Base grant themes include token launchpads, and Zora already gives creators a natural asset creation surface.",
      suggestedAction: "draft-launchpad-concept",
      zoraAssetIdea: "A guided launch flow: idea, image, description, coin metadata, launch post, and distribution checklist.",
      builderNote: "Build this as an assistant workflow before trying to build a full launchpad marketplace.",
      riskNote: "Avoid promising returns, price targets, or liquidity outcomes.",
    }));
  }

  if (zoraFit.includes("consumer apps")) {
    opportunities.push(opportunity({
      id: "consumer-creator-discovery",
      title: "Consumer discovery app for onchain creator assets",
      area: "consumer apps",
      score: 78 + (creatorMarketIsBullish ? 5 : 0),
      whyNow: "Consumer apps are a Base focus area, and creator assets need simpler discovery for non-technical users.",
      suggestedAction: "build-consumer-app",
      zoraAssetIdea: "A daily feed of creator assets with plain-language context, share cards, and one-click Zora/Farcaster routes.",
      builderNote: "Start with a public endpoint and lightweight UI before adding personalization.",
      riskNote: "Rank cultural relevance and creator activity, not expected financial performance.",
    }));
  }

  if (areas.includes("commerce agents") || areas.includes("x402 implementations")) {
    opportunities.push(opportunity({
      id: "x402-creator-agent",
      title: "x402 commerce agent for premium creator insights",
      area: "agents / x402 commerce",
      score: 74,
      whyNow: "Base builders are exploring agent commerce and x402 implementations, which can fit paid creator workflows.",
      suggestedAction: "observe-agent-commerce",
      zoraAssetIdea: "Paid micro-access to premium asset briefs or launch checklists, settled through an x402-style payment flow.",
      builderNote: "Prototype the paid access gate only after the free opportunity endpoint is useful.",
      riskNote: "Do not gate safety-critical or financial advice behind payments.",
    }));
  }

  if (areas.some((area) => area.includes("defi")) || areas.includes("autonomous trading agents")) {
    opportunities.push(opportunity({
      id: "defi-context-layer",
      title: "DeFi context layer for creator market timing",
      area: "DeFi / autonomous trading observation",
      score: 68 + (ethChange > 3 ? 5 : 0),
      whyNow: "DeFi and autonomous trading are active builder themes, but Zora Genesis should treat them as context rather than execution.",
      suggestedAction: "observe-defi-signal",
      builderNote: "Use DeFi data only to explain market context around creator activity.",
      riskNote: "No autonomous trading, leverage, looping, lending recommendations, or yield promises.",
    }));
  }

  return opportunities
    .map((item) => ({ ...item, score: Math.min(100, item.score) }))
    .sort((a, b) => b.score - a.score);
}
