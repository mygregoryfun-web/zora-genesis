import "dotenv/config";

import { pathToFileURL } from "node:url";
import { config, validateRuntimeConfig } from "./config.js";
import { loadPosts, savePost } from "./services/memory.js";
import { generatePost } from "./services/ai.js";
import { fetchMarketData } from "./services/market.js";
import { fetchTrends } from "./services/trends.js";
import { scoreSignals } from "./services/scoring.js";
import { shouldPost } from "./services/decision.js";
import { postToFarcaster } from "./services/farcaster.js";
import { generateImageForPost } from "./services/image.js";
import { postToZora } from "./services/poster.js";
import { postToX } from "./services/x.js";

export async function runAgent() {
  validateRuntimeConfig();

  console.log("🚀 Zora Genesis AI running...\n");
  if (config.dryRun) {
    console.log("⚠️ Dry run enabled: AI generation and posting may be stubbed or skipped.");
    console.log("");
  }

  // Fetch trends
  const trends = fetchTrends();

  console.log("📈 Current trends:");
  console.log(trends);
  console.log("");

  // Fetch market data
  const market = await fetchMarketData();

  console.log("💰 Market data:");
  console.log(market);
  console.log("");

  // Score signals
  const scored = scoreSignals({
    trends,
    market
  });

  console.log("🧠 Scored signals:");
  console.log(scored);
  console.log("");

  // Load memory
  const memory = loadPosts();

  console.log(
    `🧠 Loaded ${memory.length} previous posts.`
  );
  console.log("");

  // Decision Engine
  const decision = shouldPost(
    scored,
    memory
  );

  console.log("🤖 Decision:");
  console.log(decision);

  if (decision.mode === "fresh_angle") {
    console.log(
      "🧠 AI will generate a fresh perspective."
    );
  }

  console.log("");
  if (!decision.post) {
    console.log(
      "❌ Skipping post:",
      decision.reason
    );
    return;
  }

  // Generate post
  const post = await generatePost({
    trends,
    market,
    focus: scored.slice(0, 2),
    memory
  });

  console.log("🔥 GENERATED POST:\n");
  console.log(post);
  console.log("");

  const image = await generateImageForPost(post);

  // Publish
  const publishResults = await Promise.allSettled([
    postToZora(post, image),
    postToFarcaster(post),
    postToX(post),
  ]);

  const failures = publishResults.filter((result) => result.status === "rejected");
  if (failures.length === publishResults.length) {
    throw new Error("Publishing failed on all configured channels.");
  }

  if (config.skipPost) {
    console.log("🧠 Post not saved to memory because publishing was skipped.");
    return;
  }

  // Save memory
  savePost(post);

  console.log("🧠 Post saved to memory.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAgent().catch(console.error);
}
