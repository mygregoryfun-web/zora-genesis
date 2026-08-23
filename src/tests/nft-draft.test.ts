import test from "node:test";
import assert from "node:assert/strict";
import { createNftDraft } from "../services/nft-draft.js";

test("creates exactly one NFT-ready draft from article memory", () => {
  const draft = createNftDraft();
  assert.equal(draft.status, "draft-not-minted");
  assert.match(draft.image.dataUri, /^data:image\/svg\+xml;base64,/);
  assert.match(draft.tokenUri, /^data:application\/json;base64,/);
  assert.ok(draft.imagePrompt.includes(draft.sourceArticle.title));
});

test("creates a custom prompt NFT draft without minting", () => {
  const draft = createNftDraft({ prompt: "Base creator cockpit with Zora proof cards" });
  assert.equal(draft.status, "draft-not-minted");
  assert.equal(draft.generationMode, "custom-prompt");
  assert.ok(draft.imagePrompt.includes("Base creator cockpit with Zora proof cards"));
  assert.equal(draft.metadata.attributes.some((item) => item.trait_type === "Generation mode" && item.value === "Custom prompt"), true);
});

test("creates a seeded random NFT draft", () => {
  const draft = createNftDraft({ random: true, seed: "demo-seed" });
  assert.equal(draft.status, "draft-not-minted");
  assert.equal(draft.generationMode, "random-concept");
  assert.equal(draft.seed.length, 12);
});
