import "dotenv/config";

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

  const trends = fetchTrends();

  console.log("📈 Current trends:");
  console.log(trends);
  console.log("");

  const market = await fetchMarketData();

  console.log("💰 Market data:");
  console.log(market);
  console.log("");

  const scored = scoreSignals({
    trends,
    market,
  });

  console.log("🧠 Scored signals:");
  console.log(scored);
  console.log("");

  const memory = loadPosts();

  console.log(`🧠 Loaded ${memory.length} previous posts.`);
  console.log("");

  const decision = shouldPost(scored, memory);

  console.log("🤖 Decision:");
  console.log(decision);

  if (decision.mode === "fresh_angle") {
    console.log("🧠 AI will generate a fresh perspective.");
  }

  console.log("");
  if (!decision.post) {
    console.log("❌ Skipping post:", decision.reason);
    return;
  }

  const post = await generatePost({
    trends,
    market,
    focus: scored.slice(0, 2),
    memory,
  });

  console.log("🔥 GENERATED POST:\n");
  console.log(post);
  console.log("");

  const image = await generateImageForPost(post);

  const channels = [
    { name: "Zora", publish: () => postToZora(post, image) },
    { name: "Farcaster", publish: () => postToFarcaster(post) },
    { name: "X", publish: () => postToX(post) },
  ];

  const publishResults = await Promise.allSettled(
    channels.map((channel) => channel.publish())
  );

  publishResults.forEach((result, index) => {
    const channelName = channels[index]?.name ?? "Unknown";
    if (result.status === "fulfilled") {
      console.log(`✅ ${channelName} publish completed.`);
      return;
    }

    const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
    console.error(`❌ ${channelName} publish failed:`, reason);
  });

  const failures = publishResults.filter((result) => result.status === "rejected");
  if (failures.length === publishResults.length) {
    throw new Error("Publishing failed on all configured channels.");
  }

  if (config.skipPost) {
    console.log("🧠 Post not saved to memory because publishing was skipped.");
    return;
  }

  savePost(post);

  console.log("🧠 Post saved to memory.");
}
