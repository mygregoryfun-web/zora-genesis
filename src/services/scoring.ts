export function scoreSignals(data: any) {
  const scores = [];

  // Base activity
  if (data?.trends?.base?.activity === "high") {
    scores.push({
      signal: "Base activity spike",
      score: 9
    });
  }

  // Zora minting
  if (data?.trends?.zora?.mintVolume === "rising") {
    scores.push({
      signal: "Zora mint volume rising",
      score: 8
    });
  }

  // Market sentiment
  if (data?.trends?.market?.sentiment === "bullish") {
    scores.push({
      signal: "Bullish market sentiment",
      score: 7
    });
  }

  if (data?.trends?.baseBuilderFocus?.priority === "high") {
    scores.push({
      signal: "Base builder focus on new asset creation",
      score: 9
    });
  }

  if (data?.trends?.baseBuilderFocus?.zoraFit?.includes("token launchpads")) {
    scores.push({
      signal: "Token launchpad opportunity for Zora creators",
      score: 8
    });
  }

  if (data?.trends?.baseBuilderFocus?.zoraFit?.includes("consumer apps")) {
    scores.push({
      signal: "Consumer app demand for onchain creator assets",
      score: 8
    });
  }

  // ETH move
  if (data?.market?.ethChange24h > 3) {
    scores.push({
      signal: "ETH strong upward move",
      score: 8
    });
  }

  // sort by importance
  return scores.sort((a, b) => b.score - a.score);
}
