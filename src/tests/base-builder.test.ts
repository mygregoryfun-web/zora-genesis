import assert from "node:assert/strict";
import test from "node:test";
import { buildBuilderCodeAttribution, isValidBaseBuilderCode } from "../services/base-builder.js";

test("accepts the configured Base Builder Code format", () => {
  assert.equal(isValidBaseBuilderCode("bc_lk15eqwc"), true);
});

test("rejects invalid Base Builder Code formats", () => {
  assert.equal(isValidBaseBuilderCode("0x76fdaea4f579a7d27925053b485739d981eaf3e44e5d407bf456a1037b113b1f"), false);
  assert.equal(isValidBaseBuilderCode("lk15eqwc"), false);
});

test("builds attribution metadata without transaction authority", () => {
  const attribution = buildBuilderCodeAttribution("bc_lk15eqwc");

  assert.equal(attribution.builderCode, "bc_lk15eqwc");
  assert.equal(attribution.valid, true);
  assert.ok(attribution.integrationTargets.includes("Base app analytics"));
  assert.match(attribution.safetyBoundary, /does not custody funds/);
});
