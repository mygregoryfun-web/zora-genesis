import assert from "node:assert/strict";
import test from "node:test";
import { generateMonetizationPlan } from "../services/monetization.js";

test("generates monetization tiers for creator and builder users", () => {
  const plan = generateMonetizationPlan();

  assert.ok(plan.tiers.length >= 3);
  assert.ok(plan.tiers.some((tier) => tier.id === "free" && tier.priceUsdMonthly === 0));
  assert.ok(plan.tiers.some((tier) => tier.id === "pro-creator" && tier.priceUsdMonthly > 0));
  assert.match(plan.positioning, /Creator intelligence/);
});

test("monetization avoids trading-signal promises", () => {
  const plan = generateMonetizationPlan();
  const monetizedClaims = plan.products
    .flatMap((product) => [product.revenueHypothesis, product.userValue, product.implementationNote])
    .join(" ");

  assert.match(plan.riskNote, /not trading signals/);
  assert.doesNotMatch(monetizedClaims, /guaranteed return|price target|leverage guidance|autonomous trading execution/i);
  assert.ok(plan.products.some((product) => product.baseFit.includes("x402 implementations")));
});
