import test from "node:test";
import assert from "node:assert/strict";
import { scanContractSecurity } from "../services/contract-security.js";

test("rejects an invalid contract address before making an RPC request", async () => {
  await assert.rejects(() => scanContractSecurity({ address: "not-an-address" }), /Invalid EVM contract address/);
});
