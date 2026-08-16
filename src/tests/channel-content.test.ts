import assert from "node:assert/strict";
import test from "node:test";
import { preparePostForChannel } from "../services/channel-content.js";

const basePost = {
  title: "Base and Zora creator opportunity",
  post: "Base activity is high and Zora mint volume is rising. Low transaction costs make small experiments easier for creators and builders.",
  hashtags: ["#BaseInnovation", "#ZoraCreators", "#NFTMarket"],
};

test("prepares concise X content with fewer hashtags", () => {
  const post = preparePostForChannel(basePost, "x");

  assert.ok(post.title.length <= 72);
  assert.ok(post.post.length <= 190);
  assert.ok(post.hashtags.length <= 2);
  assert.match(post.post, /creator asset pulse|asset pulse|launch/i);
});

test("prepares Zora content as an asset-ready brief", () => {
  const post = preparePostForChannel(basePost, "zora");

  assert.ok(post.post.length <= 900);
  assert.match(post.post, /Zora-ready creator asset brief/);
  assert.ok(post.hashtags.length <= 3);
});
