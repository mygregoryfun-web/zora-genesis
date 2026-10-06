import assert from "node:assert/strict";
import test from "node:test";
import { artifactGuide, artifactKind } from "../services/facebook-ai.js";

test("detects requested artifact type from conversational studio input", () => {
  assert.equal(artifactKind("Napiši eno lepo pesem o Viktoriji"), "poem");
  assert.equal(artifactKind("Napiši odgovor na to vprašanje"), "reply");
  assert.equal(artifactKind("Oglas za studio za Facebook in Instagram"), "ad");
  assert.equal(artifactKind("Kratek X post o studiu"), "x-post");
});

test("poem guide prevents social-post drift", () => {
  const guide = artifactGuide("poem");
  assert.match(guide, /Write a real poem/);
  assert.match(guide, /not a Facebook discussion post/);
});
