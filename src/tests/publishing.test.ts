import assert from "node:assert/strict";
import test from "node:test";
import { describeChannelResult, publishedChannels } from "../services/publishing.js";

test("skipped channels are not counted as published", () => {
  const results = [{
    name: "X",
    result: { status: "fulfilled", value: { status: "skipped", platform: "x" } } as const,
  }];

  assert.equal(publishedChannels(results).length, 0);
  assert.equal(describeChannelResult(results[0]!).status, "skipped");
});

test("only actual publications are counted", () => {
  const results = [
    {
      name: "Farcaster",
      result: { status: "fulfilled", value: { status: "published", platform: "farcaster" } } as const,
    },
    {
      name: "X",
      result: { status: "rejected", reason: new Error("API unavailable") } as const,
    },
  ];

  assert.equal(publishedChannels(results).length, 1);
  assert.equal(describeChannelResult(results[1]!).status, "failed");
});
