import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGeneratedPost } from "../services/ai.js";

test("normalizes hashtags when the model puts them inside post text", () => {
  const post = normalizeGeneratedPost({
    title: "Base Ecosystem Fuels New Asset Initiatives",
    post: "Body text\n\n#BaseInnovation #CreatorSynergy #MarketTrends",
  });

  assert.equal(post.post, "Body text");
  assert.deepEqual(post.hashtags, ["#BaseInnovation", "#CreatorSynergy", "#MarketTrends"]);
});

test("normalizes hashtags when the model returns an empty hashtags array", () => {
  const post = normalizeGeneratedPost({
    title: "Observations on Base and Zora",
    post: "Builder note on creator asset launch flows.\n\n#BaseInnovation #ZoraCreators #NFTGrowth",
    hashtags: [],
  });

  assert.equal(post.post, "Builder note on creator asset launch flows.");
  assert.deepEqual(post.hashtags, ["#BaseInnovation", "#ZoraCreators", "#NFTGrowth"]);
});

test("removes hashtags from post text when hashtags array is already present", () => {
  const post = normalizeGeneratedPost({
    title: "Navigating New Possibilities in the Base Ecosystem",
    post: "Builder note on new asset creation.\n\n#BaseBuilders #ZoraAssets #CreatorInnovation",
    hashtags: ["#BaseBuilders", "#ZoraAssets", "#CreatorInnovation"],
  });

  assert.equal(post.post, "Builder note on new asset creation.");
  assert.deepEqual(post.hashtags, ["#BaseBuilders", "#ZoraAssets", "#CreatorInnovation"]);
});

test("polishes banned generic phrases from generated post text", () => {
  const post = normalizeGeneratedPost({
    title: "Base and Zora",
    post: "The synergy between Base and Zora can open doors for specific products.",
    hashtags: ["#Base"],
  });

  assert.equal(
    post.post,
    "The connection between Base and Zora can make it cheaper for specific products.",
  );
});

test("repairs common missing spaces in model output", () => {
  const post = normalizeGeneratedPost({
    title: "Opportunities in Low-Cost Creation",
    post: "Base activity is ideal forbuilders. Consumer appstailored aroundthe creator economy can meet marketneeds.",
    hashtags: ["#Base"],
  });

  assert.equal(
    post.post,
    "Base activity is ideal for builders. Consumer apps tailored around the creator economy can meet market needs.",
  );
});

test("repairs joined words from creator asset output", () => {
  const post = normalizeGeneratedPost({
    title: "Buildingthe Future of Creator Assets",
    post: "With Base activityseeing a spike and transactioncosts remaining low, nowis the time for builders todive into new asset creation. Zora’s rising mint volumeindicates a thriving creator economy, creating useful setup for innovative consumerapps that engage with collectors. Imagine a launchpad-liteflow that simplifies onboarding for emerging creators, enabling them to mint anddistribute unique digital assets seamlessly. This intersection of Base and Zora offersa compelling opportunityfor developers focused on enhancing creator visibility andaccessibility.",
    hashtags: ["#BaseInnovation", "#ZoraCreators", "#CreatorEconomy"],
  });

  assert.equal(post.title, "Building the Future of Creator Assets");
  assert.equal(
    post.post,
    "With Base activity seeing a spike and transaction costs remaining low, now is the time for builders to dive into new asset creation. Zora’s rising mint volume indicates a thriving creator economy, creating useful setup for innovative consumer apps that engage with collectors. Imagine a launchpad-lite flow that simplifies onboarding for emerging creators, enabling them to mint and distribute unique digital assets seamlessly. This intersection of Base and Zora offers a compelling opportunity for developers focused on enhancing creator visibility and accessibility.",
  );
});
