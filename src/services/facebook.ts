import axios from "axios";
import { config } from "../config.js";
import type { GeneratedPost, PublishResult } from "../types.js";

function formatForFacebook(post: GeneratedPost) {
  const hashtags = post.hashtags.join(" ");
  return `${post.post}\n\n${hashtags}`.trim();
}

export async function postToFacebook(post: GeneratedPost): Promise<PublishResult> {
  const message = formatForFacebook(post);

  if (config.skipPost) {
    console.log("Facebook publishing skipped.");
    console.log(message);
    return { status: "skipped", platform: "facebook", reason: "SKIP_POST enabled" };
  }

  if (!config.facebookPageId || !config.facebookPageAccessToken) {
    console.log("Facebook Page settings not configured; skipping Facebook.");
    return { status: "skipped", platform: "facebook", reason: "Facebook Page settings not configured" };
  }

  const url = `https://graph.facebook.com/${config.facebookGraphVersion}/${config.facebookPageId}/feed`;

  try {
    const res = await axios.post(
      url,
      {
        message,
        access_token: config.facebookPageAccessToken,
      },
      {
        timeout: config.requestTimeoutMs,
      }
    );

    console.log("Posted to Facebook:", res.data);
    return { status: "published", platform: "facebook", data: res.data };
  } catch (error: any) {
    const detail = error.response?.data ?? error.message;
    throw new Error(`Facebook publish failed: ${JSON.stringify(detail)}`);
  }
}
