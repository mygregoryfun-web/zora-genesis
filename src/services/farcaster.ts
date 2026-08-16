import { neynar } from "./neynar.js";
import { config } from "../config.js";
import type { GeneratedPost, PublishResult } from "../types.js";

export async function postToFarcaster(post: GeneratedPost, imageUrl?: string | null): Promise<PublishResult> {
  const text = `${post.title}

${post.post}

${post.hashtags.join(" ")}`;

  if (config.skipPost) {
    console.log("SKIP_POST enabled; not sending to Farcaster.");
    console.log(text);
    return { status: "skipped", platform: "farcaster", reason: "SKIP_POST enabled" };
  }

  if (!config.neynarApiKey || !config.signerUuid) {
    console.log("Farcaster credentials not configured; skipping Farcaster.");
    return { status: "skipped", platform: "farcaster", reason: "Credentials not configured" };
  }

  try {
    const payload = {
      signer_uuid: config.signerUuid,
      text,
      ...(imageUrl ? { embeds: [{ url: imageUrl }] } : {}),
    };

    const res = await neynar.post("/farcaster/cast", payload);

    console.log("📡 Posted to Farcaster:", res.data);
    return { status: "published", platform: "farcaster", data: res.data };
  } catch (err: any) {
    console.error("❌ Neynar error:", err?.response?.data || err.message);
    throw err;
  }
}
