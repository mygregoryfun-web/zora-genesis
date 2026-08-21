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
