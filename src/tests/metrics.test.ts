import assert from "node:assert/strict";
import test from "node:test";
import { generateMetrics } from "../services/metrics.js";

test("generates public proof metrics for Base grant review", () => {
  const metrics = generateMetrics();

  assert.equal(metrics.status, "live");
  assert.ok(metrics.activeChannels.includes("Zora"));
  assert.ok(metrics.activeChannels.includes("Farcaster"));
  assert.ok(metrics.activeChannels.includes("X"));
  assert.ok(metrics.publicProofs.some((proof) => proof.label === "Base Builder Code" && proof.value === "bc_lk15eqwc"));
  assert.ok(metrics.publicProofs.some((proof) => proof.label === "Latest X post" && proof.url?.includes("x.com")));
});
