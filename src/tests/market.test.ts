import assert from "node:assert/strict";
import test from "node:test";
import { fallbackMarketData } from "../services/market.js";

test("fallback market data never invents a current ETH price", () => {
  const market = fallbackMarketData("fallback");

  assert.equal(market.ethPrice, null);
  assert.equal(market.ethChange24h, null);
  assert.equal(market.available, false);
  assert.equal(market.source, "fallback");
});
