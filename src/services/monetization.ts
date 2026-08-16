import type { MonetizationPlan } from "../types.js";

export function generateMonetizationPlan(): MonetizationPlan {
  return {
    positioning: "Creator intelligence and publishing assistant for Base and Zora builders.",
    freeValue: [
      "Public Base/Zora opportunity endpoint",
      "Daily creator asset signal preview",
      "Safe channel-specific post previews",
      "Basic Zora-ready brief examples",
    ],
    tiers: [
      {
        id: "free",
        name: "Free",
        priceUsdMonthly: 0,
        audience: "Curious creators and early Base builders",
        included: [
          "3 signal previews per day",
          "X/Farcaster/Zora draft previews",
          "Public opportunity radar",
        ],
        limits: [
          "No live publishing automation",
          "No premium brief archive",
          "No custom creator workflow",
        ],
      },
      {
        id: "pro-creator",
        name: "Pro Creator",
        priceUsdMonthly: 19,
        audience: "Creators who publish regularly on Base, Zora, X, and Farcaster",
        included: [
          "Unlimited channel-ready previews",
          "Generated image prompts and cover direction",
          "Launch checklist for Zora-ready creator assets",
          "Saved brief history",
        ],
        limits: [
          "Manual approval required before publishing",
          "No trading signals or financial advice",
        ],
      },
      {
        id: "builder-studio",
        name: "Builder Studio",
        priceUsdMonthly: 49,
        audience: "Small Base teams and creator-tool builders",
        included: [
          "Narrative Radar for Base attention spikes",
          "Premium creator asset briefs",
          "Farcaster/X/Zora publishing workflow templates",
          "Webhook/API-ready brief output",
        ],
        limits: [
          "No autonomous trading execution",
          "No leverage, yield, or price-target recommendations",
        ],
      },
    ],
    products: [
      {
        id: "premium-briefs",
        name: "Premium Base/Zora creator briefs",
        model: "pay-per-brief",
        baseFit: ["x402 implementations", "consumer apps", "new asset creation", "Builder Codes attribution"],
        revenueHypothesis: "$1-$5 per premium brief or bundled inside Pro Creator.",
        userValue: "A creator gets a ready-to-edit asset concept, post copy, cover direction, and distribution checklist.",
        implementationNote: "Keep the free endpoint useful first, then gate deeper brief archives with an x402-style payment flow.",
        safetyBoundary: "Briefs explain cultural and builder signals only; no trading instructions, leverage guidance, or expected returns.",
      },
      {
        id: "done-for-you-setup",
        name: "Done-for-you Base/Zora publishing setup",
        model: "service",
        baseFit: ["agent-assisted publishing", "creator tools", "new asset creation", "Builder Codes attribution"],
        revenueHypothesis: "$250-$1,000 setup fee for small teams that want a working creator publishing workflow.",
        userValue: "A team gets configured prompts, channel flows, safe publishing controls, and a lightweight demo endpoint.",
        implementationNote: "This can generate revenue before the SaaS dashboard is mature.",
        safetyBoundary: "Service config must not custody funds or automate financial actions.",
      },
      {
        id: "studio-subscription",
        name: "Creator Intelligence Studio",
        model: "subscription",
        baseFit: ["consumer apps", "agent commerce", "creator economy"],
        revenueHypothesis: "$49/month for builders who need repeatable signal-to-content workflows.",
        userValue: "Weekly narrative radar, saved briefs, publishing drafts, and Zora asset launch checklists.",
        implementationNote: "Ship after dashboard preview/approve flow is stable.",
        safetyBoundary: "Publishing remains approval-first and non-custodial.",
      },
    ],
    nextExperiment: "Add a dashboard CTA that collects early users for Pro Creator and tests willingness to pay for premium Base/Zora briefs.",
    riskNote: "Monetization should sell workflow and creator intelligence, not trading signals, yield promises, or autonomous execution.",
  };
}
