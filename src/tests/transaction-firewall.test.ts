import test from "node:test";
import assert from "node:assert/strict";
import { inspectTransaction, inspectTransactionHash } from "../services/transaction-firewall.js";

test("rejects malformed transaction input before RPC", async () => {
  await assert.rejects(() => inspectTransaction({ to: "bad" }), /Invalid transaction destination/);
  await assert.rejects(() => inspectTransaction({ to: "0x0000000000000000000000000000000000000001", data: "0x123" }), /even-length hexadecimal/);
});

test("rejects malformed transaction hash before RPC", async () => {
  await assert.rejects(() => inspectTransactionHash({ hash: "0x123" }), /Invalid transaction hash/);
});
