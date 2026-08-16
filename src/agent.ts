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
import { uploadImageForSocialEmbed } from "./services/social-image.js";
import { postToX } from "./services/x.js";
import { describeChannelResult, publishedChannels } from "./services/publishing.js";

let running = false;

export async function runAgent() {
  if (running) {
    throw new Error("Agent is already running in this process.");
  }

  running = true;
  try {
    return await runAgentOnce();
  } finally {
    running = false;
  }
}

async function runAgentOnce() {
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

  const image = await generateImageForPost(post).catch((err) => {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("Image generation failed; continuing without image:", reason);
    return null;
  });
  const socialImage = await uploadImageForSocialEmbed(image).catch((err) => {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("Social image upload failed; continuing without Farcaster image embed:", reason);
    return null;
  });

  const channels = [
    { name: "Zora", publish: () => postToZora(post, image) },
    { name: "Farcaster", publish: () => postToFarcaster(post, socialImage?.url) },
    { name: "X", publish: () => postToX(post, image) },
  ];

  const publishResults = await Promise.allSettled(
    channels.map((channel) => channel.publish())
  );

  const channelResults = publishResults.map((result, index) => ({
    name: channels[index]?.name ?? "Unknown",
    result,
  }));

  channelResults.map(describeChannelResult).forEach(({ name, status, reason }) => {
    if (status === "published") console.log(`✅ ${name} published.`);
    else if (status === "skipped") console.log(`⏭️ ${name} skipped: ${reason ?? "not configured"}`);
    else console.error(`❌ ${name} publish failed: ${reason}`);
  });

  if (config.skipPost) {
    console.log("🧠 Post not saved to memory because publishing was skipped.");
    return;
  }

  if (publishedChannels(channelResults).length === 0) {
    throw new Error("The post was not published to any channel; memory was not updated.");
  }

  savePost(post);

  console.log("🧠 Post saved to memory.");
}
