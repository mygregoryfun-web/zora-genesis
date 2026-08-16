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
