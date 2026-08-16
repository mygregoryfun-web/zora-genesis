import assert from "node:assert/strict";
import test from "node:test";
import { formatForX } from "../services/x.js";

test("keeps X posts under the character limit", () => {
  const formatted = formatForX({
    title: "Exploring New Asset Creation on Base",
    post: "Base is seeing significant activity with low transaction costs, making it useful for builders focused on new asset creation. Zora is positioned inside this dynamic where creators are actively minting assets. A launchpad-lite flow could help creators publish, price, and distribute new assets without turning the experience into a trading product.",
    hashtags: ["#Base", "#Zora", "#CreatorAssets"],
  });

  assert.ok(formatted.length <= 280);
  assert.match(formatted, /#Base #Zora #CreatorAssets$/);
});

test("does not add an ellipsis when the full X post already fits", () => {
  const formatted = formatForX({
    title: "Base creator signal",
    post: "Low transaction costs make small creator asset experiments easier to test.",
    hashtags: ["#Base", "#Zora"],
  });

  assert.equal(
    formatted,
    "Base creator signal\n\nLow transaction costs make small creator asset experiments easier to test.\n\n#Base #Zora",
  );
});
