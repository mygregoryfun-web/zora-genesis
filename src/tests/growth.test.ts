import test from "node:test";
import assert from "node:assert/strict";
import { generateGrowthPlan } from "../services/growth.js";

test("generates a free growth plan for Base/Zora distribution", () => {
  const plan = generateGrowthPlan();

  assert.ok(plan.channels.some((channel) => channel.id === "base-builders"));
  assert.ok(plan.channels.some((channel) => channel.id === "farcaster"));
  assert.ok(plan.channels.some((channel) => channel.id === "x"));
  assert.ok(plan.primaryCta.toLowerCase().includes("premium"));
  assert.ok(plan.samplePosts.x.length <= 280);
});

test("growth plan avoids financial promises", () => {
  const serialized = JSON.stringify(generateGrowthPlan()).toLowerCase();

  assert.equal(serialized.includes("guaranteed profit"), false);
  assert.equal(serialized.includes("yield promise"), false);
  assert.equal(serialized.includes("investment advice"), false);
});
