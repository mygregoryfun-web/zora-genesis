import { neynar } from "./neynar.js";
import { config } from "../config.js";
type GeneratedPost = {
  title: string;
  post: string;
  hashtags: string[];
};
export async function postToFarcaster(post: GeneratedPost) {
  const text = `${post.title}

${post.post}

${post.hashtags.join(" ")}`;

  if (config.skipPost) {
    console.log("SKIP_POST enabled; not sending to Farcaster.");
    console.log(text);
    return null;
  }

  if (!config.neynarApiKey || !config.signerUuid) {
    console.log("Farcaster credentials not configured; skipping Farcaster.");
    return null;
  }

  try {
    const res = await neynar.post("/farcaster/cast", {
      signer_uuid: config.signerUuid,
      text,
    });

    console.log("📡 Posted to Farcaster:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("❌ Neynar error:", err?.response?.data || err.message);
    throw err;
  }
}
