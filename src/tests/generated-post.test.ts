import assert from "node:assert/strict";
import test from "node:test";
import { GeneratedPostSchema } from "../types.js";

test("accepts a valid generated post", () => {
  const result = GeneratedPostSchema.parse({
    title: "Creator activity is rising",
    post: "A concise observation based on supplied signals.",
    hashtags: ["#Base", "#Zora"],
  });

  assert.equal(result.hashtags.length, 2);
});

test("rejects malformed model output", () => {
  assert.throws(() => GeneratedPostSchema.parse({
    title: "",
    post: "Text",
    hashtags: ["Base", "#Zora", "#ETH", "#NFT"],
  }));
});
