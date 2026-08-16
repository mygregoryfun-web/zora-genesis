export function fetchTrends() {
  return {
    base: {
      activity: "high",
      gas: "low",
      narrative: "Base ecosystem growing"
    },
    zora: {
      mintVolume: "rising",
      creators: "active"
    },
    market: {
      sentiment: "bullish",
      topic: "creator economy"
    },
    predictionMarketNarrative: {
      priority: "medium",
      source: "ForecastFDN",
      theme: "prediction market rails with perps-like UX",
      baseRelevance: [
        "prediction markets",
        "consumer apps",
        "new asset creation",
        "market signal discovery"
      ],
      zoraFit: "Use prediction-market narratives as attention signals for creator assets, not as trading instructions.",
      safetyBoundary: "Observe narratives only; do not recommend leverage, perps, liquidations, or autonomous trading."
    },
    baseBuilderFocus: {
      priority: "high",
      areas: [
        "prediction markets",
        "token launchpads",
        "new asset creation",
        "consumer apps",
        "commerce agents",
        "x402 implementations",
        "autonomous trading agents",
        "defi yield and vaults",
        "tokenized equities"
      ],
      zoraFit: [
        "new asset creation",
        "token launchpads",
        "consumer apps",
        "creator economy assets"
      ]
    }
  };
}
