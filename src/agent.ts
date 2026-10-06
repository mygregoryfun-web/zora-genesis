import "dotenv/config";

import { config, validateRuntimeConfig } from "./config.js";
import { loadPosts, savePost } from "./services/memory.js";
import { generateFacebookPost } from "./services/facebook-ai.js";
import { loadFacebookPosts, saveFacebookPost } from "./services/facebook-memory.js";
import { postToFacebook } from "./services/facebook.js";
import { generatePost } from "./services/ai.js";
import { fetchMarketData } from "./services/market.js";
import { fetchTrends } from "./services/trends.js";
import { scoreSignals } from "./services/scoring.js";
import { shouldPost } from "./services/decision.js";
import { postToFarcaster } from "./services/farcaster.js";
import { generateImageForPost } from "./services/image.js";
import { postToInstagram } from "./services/instagram.js";
import { postToZora } from "./services/poster.js";
import { uploadImageForSocialEmbed } from "./services/social-image.js";
import { postToX } from "./services/x.js";
import { describeChannelResult, publishedChannels } from "./services/publishing.js";
import { preparePostForChannel } from "./services/channel-content.js";

let running = false;

const knownChannels = new Set(["facebook", "instagram", "x", "zora", "farcaster"]);
const defaultChannels = ["facebook", "instagram", "x"];
const cryptoChannels = new Set(["zora", "farcaster"]);

function selectedChannelNames() {
  const unknownChannels = config.publishChannels.filter((channel) => !knownChannels.has(channel));
  if (unknownChannels.length > 0) {
    throw new Error(`Unknown PUBLISH_CHANNELS value: ${unknownChannels.join(", ")}`);
  }

  const selected = config.publishChannels.length > 0
    ? config.publishChannels
    : defaultChannels;

  if (selected.length === 0) {
    throw new Error("No publishing channels selected.");
  }

  return selected;
}

function isSocialOnlyMode(channels: string[]) {
  return channels.every((channel) => !cryptoChannels.has(channel));
}

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

  const selectedChannels = selectedChannelNames();
  const socialOnlyMode = isSocialOnlyMode(selectedChannels);

  if (socialOnlyMode) {
    console.log("Social publishing mode: Facebook, Instagram, and X content.");
    console.log("");

    const memory = loadFacebookPosts();
    console.log(`Loaded ${memory.length} previous Facebook/social posts.`);
    console.log("");

    const post = await generateFacebookPost({ memory });
    console.log("🔥 GENERATED SOCIAL POST:\n");
    console.log(post);
    console.log("");

    const image = await generateImageForPost(post).catch((err) => {
      const reason = err instanceof Error ? err.message : String(err);
      console.error("Image generation failed; continuing without image:", reason);
      return null;
    });
    const needsPublicImage = selectedChannels.some((channel) => channel === "facebook" || channel === "instagram");
    const socialImage = needsPublicImage
      ? await uploadImageForSocialEmbed(image).catch((err) => {
          const reason = err instanceof Error ? err.message : String(err);
          console.error("Social image upload failed; continuing without public image URL:", reason);
          return null;
        })
      : null;

    const channels = [
      { name: "Facebook", publish: () => postToFacebook(preparePostForChannel(post, "facebook"), socialImage?.url) },
      { name: "Instagram", publish: () => postToInstagram(preparePostForChannel(post, "instagram"), socialImage?.url) },
      { name: "X", publish: () => postToX(preparePostForChannel(post, "x"), image) },
    ].filter((channel) => selectedChannels.includes(channel.name.toLowerCase()));

    if (config.publishChannels.length > 0) {
      console.log("Selected publishing channels:", channels.map((channel) => channel.name).join(", "));
    }

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
      console.log("Post not saved to memory because publishing was skipped.");
      return;
    }

    if (publishedChannels(channelResults).length === 0) {
      throw new Error("The post was not published to any channel; memory was not updated.");
    }

    saveFacebookPost(post);

    console.log("Social post saved to memory.");
    return;
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
  const needsFarcasterEmbed = selectedChannels.includes("farcaster");
  const socialImage = needsFarcasterEmbed
    ? await uploadImageForSocialEmbed(image).catch((err) => {
        const reason = err instanceof Error ? err.message : String(err);
        console.error("Social image upload failed; continuing without Farcaster image embed:", reason);
        return null;
      })
    : null;

  const channels = [
    { name: "Zora", publish: () => postToZora(preparePostForChannel(post, "zora"), image) },
    { name: "Farcaster", publish: () => postToFarcaster(preparePostForChannel(post, "farcaster"), socialImage?.url) },
    { name: "X", publish: () => postToX(preparePostForChannel(post, "x"), image) },
  ].filter((channel) => selectedChannels.includes(channel.name.toLowerCase()));

  if (config.publishChannels.length > 0) {
    console.log("Selected publishing channels:", channels.map((channel) => channel.name).join(", "));
  }

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
