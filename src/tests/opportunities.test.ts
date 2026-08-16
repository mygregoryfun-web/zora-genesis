import assert from "node:assert/strict";
import test from "node:test";
import { generateOpportunities } from "../services/opportunities.js";

test("generates grant-friendly Base/Zora opportunities", () => {
  const opportunities = generateOpportunities({
    market: { ethChange24h: 1.5 },
    trends: {
      base: { activity: "high" },
      zora: { mintVolume: "rising" },
      market: { topic: "creator economy" },
      baseBuilderFocus: {
        areas: ["token launchpads", "new asset creation", "consumer apps", "commerce agents", "x402 implementations", "defi yield and vaults"],
        zoraFit: ["new asset creation", "token launchpads", "consumer apps"],
      },
    },
  });

  assert.ok(opportunities.length >= 4);
  assert.equal(opportunities[0]?.area, "new asset creation");
  assert.ok(opportunities.some((item) => item.suggestedAction === "draft-launchpad-concept"));
  assert.ok(opportunities.every((item) => item.riskNote.length > 0));
});

test("keeps DeFi and autonomous trading as observation only", () => {
  const opportunities = generateOpportunities({
    market: { ethChange24h: 5 },
    trends: {
      baseBuilderFocus: {
        areas: ["autonomous trading agents", "defi yield and vaults"],
        zoraFit: [],
      },
    },
  });

  const defi = opportunities.find((item) => item.area.includes("DeFi"));
  assert.equal(defi?.suggestedAction, "observe-defi-signal");
  assert.match(defi?.riskNote ?? "", /No autonomous trading/);
});

test("turns prediction-market jumps into narrative radar, not trading advice", () => {
  const opportunities = generateOpportunities({
    market: { ethChange24h: 0.5 },
    trends: {
      base: { activity: "high" },
      predictionMarketNarrative: {
        priority: "medium",
        theme: "prediction market rails with perps-like UX",
      },
      baseBuilderFocus: {
        areas: ["prediction markets", "consumer apps"],
        zoraFit: [],
      },
    },
  });

  const radar = opportunities.find((item) => item.id === "prediction-market-narrative-radar");

  assert.equal(radar?.suggestedAction, "track-prediction-market-narrative");
  assert.match(radar?.builderNote ?? "", /narrative velocity/);
  assert.match(radar?.riskNote ?? "", /Observation only/);
  assert.doesNotMatch(radar?.builderNote ?? "", /leverage guidance|price targets/i);
});
