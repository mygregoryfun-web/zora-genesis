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
