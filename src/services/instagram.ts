import axios from "axios";
import { config } from "../config.js";
import type { GeneratedPost, PublishResult } from "../types.js";

function formatForInstagram(post: GeneratedPost) {
  const hashtags = post.hashtags.join(" ");
  return `${post.post}\n\n${hashtags}`.trim();
}

async function waitForContainer(containerId: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const res = await axios.get(
      `https://graph.facebook.com/${config.facebookGraphVersion}/${containerId}`,
      {
        timeout: config.requestTimeoutMs,
        params: {
          fields: "status_code",
          access_token: config.instagramAccessToken,
        },
      },
    );

    const status = res.data?.status_code;
    if (!status || status === "FINISHED") {
      return;
    }
    if (status === "ERROR" || status === "EXPIRED") {
      throw new Error(`Instagram media container failed with status ${status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

export async function postToInstagram(
  post: GeneratedPost,
  imageUrl?: string | null,
): Promise<PublishResult> {
  const caption = formatForInstagram(post);

  if (config.skipPost) {
    console.log("Instagram publishing skipped.");
    console.log(caption);
    return { status: "skipped", platform: "instagram", reason: "SKIP_POST enabled" };
  }

  if (!config.instagramUserId || !config.instagramAccessToken) {
    console.log("Instagram settings not configured; skipping Instagram.");
    return { status: "skipped", platform: "instagram", reason: "Instagram settings not configured" };
  }

  if (!imageUrl) {
    console.log("Instagram requires a public image URL; skipping Instagram.");
    return { status: "skipped", platform: "instagram", reason: "Public image URL missing" };
  }

  try {
    const containerRes = await axios.post(
      `https://graph.facebook.com/${config.facebookGraphVersion}/${config.instagramUserId}/media`,
      {
        image_url: imageUrl,
        caption,
        access_token: config.instagramAccessToken,
      },
      {
        timeout: config.requestTimeoutMs,
      },
    );
    const creationId = containerRes.data?.id;

    if (!creationId) {
      throw new Error("Instagram did not return a creation id.");
    }

    await waitForContainer(creationId);

    const publishRes = await axios.post(
      `https://graph.facebook.com/${config.facebookGraphVersion}/${config.instagramUserId}/media_publish`,
      {
        creation_id: creationId,
        access_token: config.instagramAccessToken,
      },
      {
        timeout: config.requestTimeoutMs,
      },
    );

    console.log("Posted to Instagram:", publishRes.data);
    return { status: "published", platform: "instagram", data: publishRes.data };
  } catch (error: any) {
    const detail = error.response?.data ?? error.message;
    throw new Error(`Instagram publish failed: ${JSON.stringify(detail)}`);
  }
}
