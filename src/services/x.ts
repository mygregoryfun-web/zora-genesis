import { File } from "node:buffer";
import crypto from "node:crypto";
import axios from "axios";
import { config } from "../config.js";
import type { GeneratedImage } from "./image.js";
import { getXAccessToken } from "./x-auth.js";
import type { GeneratedPost, PublishResult } from "../types.js";

const MAX_POST_LENGTH = 280;
const X_MEDIA_UPLOAD_URL = "https://api.x.com/2/media/upload";
const X_CREATE_TWEET_URL = "https://api.x.com/2/tweets";

function formatForX(post: GeneratedPost) {
  const hashtags = post.hashtags.join(" ");
  const fullText = `${post.title}\n\n${post.post}\n\n${hashtags}`.trim();

  if (fullText.length <= MAX_POST_LENGTH) {
    return fullText;
  }

  const suffix = hashtags ? `\n\n${hashtags}` : "";
  const available = MAX_POST_LENGTH - suffix.length - 1;
  const body = `${post.title}\n\n${post.post}`.trim();

  return `${body.slice(0, Math.max(0, available)).trimEnd()}…${suffix}`;
}

function hasOAuth1Credentials() {
  return Boolean(config.xApiKey && config.xApiSecret && config.xAccessToken && config.xAccessTokenSecret);
}

function encodeOAuthValue(value: string) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function createOAuth1Header(method: string, url: string) {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: config.xApiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: config.xAccessToken,
    oauth_version: "1.0",
  };

  const parameterString = Object.entries(oauthParams)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeOAuthValue(key)}=${encodeOAuthValue(value)}`)
    .join("&");
  const signatureBase = [
    method.toUpperCase(),
    encodeOAuthValue(url),
    encodeOAuthValue(parameterString),
  ].join("&");
  const signingKey = `${encodeOAuthValue(config.xApiSecret)}&${encodeOAuthValue(config.xAccessTokenSecret)}`;

  oauthParams.oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  return `OAuth ${Object.entries(oauthParams)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeOAuthValue(key)}="${encodeOAuthValue(value)}"`)
    .join(", ")}`;
}

async function readJsonResponse(response: Response) {
  const body = await response.text();
  const data = body ? JSON.parse(body) : {};

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

async function uploadImageToX(image: GeneratedImage, accessToken: string) {
  const form = new FormData();
  form.append("media", new File([image.buffer], image.filename, { type: image.mimeType }));
  form.append("media_category", "tweet_image");
  form.append("media_type", image.mimeType);

  const uploadResponse = await fetch(X_MEDIA_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const uploadData = await readJsonResponse(uploadResponse);
  const mediaId = uploadData?.data?.id;

  if (!mediaId) {
    throw new Error("X media upload did not return a media id.");
  }

  const processing = uploadData?.data?.processing_info;

  if (processing) {
    await waitForXMediaProcessing(mediaId, processing, accessToken);
  }

  return mediaId as string;
}

async function waitForXMediaProcessing(
  mediaId: string,
  processing: { state?: string; check_after_secs?: number },
  accessToken: string,
) {
  let state = processing.state;
  let checkAfter = processing.check_after_secs ?? 1;

  for (let attempt = 0; state && state !== "succeeded"; attempt += 1) {
    if (attempt >= 10) {
      throw new Error("X media processing timed out.");
    }
    if (state === "failed") {
      throw new Error("X media processing failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, checkAfter * 1000));

    const statusUrl = new URL(X_MEDIA_UPLOAD_URL);
    statusUrl.searchParams.set("command", "STATUS");
    statusUrl.searchParams.set("media_id", mediaId);

    const statusResponse = await fetch(statusUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });
    const statusData = await readJsonResponse(statusResponse);
    const nextProcessing = statusData?.data?.processing_info;

    state = nextProcessing?.state;
    checkAfter = nextProcessing?.check_after_secs ?? 1;
  }
}

export async function postToX(post: GeneratedPost, image?: GeneratedImage | null): Promise<PublishResult> {
  const text = formatForX(post);

  if (config.skipPost) {
    console.log("SKIP_POST enabled; not sending to X.");
    console.log(text);
    return { status: "skipped", platform: "x", reason: "SKIP_POST enabled" };
  }

  if (hasOAuth1Credentials()) {
    if (image) {
      console.log("X OAuth 1.0a path is posting text only; image upload skipped.");
    }

    try {
      const res = await axios.post(
        X_CREATE_TWEET_URL,
        { text },
        {
          timeout: config.requestTimeoutMs,
          headers: {
            Authorization: createOAuth1Header("POST", X_CREATE_TWEET_URL),
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Posted to X:", res.data);
      return { status: "published", platform: "x", data: res.data };
    } catch (err: any) {
      console.error("X API error:", err?.response?.data || err.message);
      throw err;
    }
  }

  const accessToken = await getXAccessToken();

  if (!accessToken) {
    console.log("X access token not configured; skipping X.");
    return { status: "skipped", platform: "x", reason: "Access token not configured" };
  }

  try {
    const mediaId = image
      ? await uploadImageToX(image, accessToken).catch((err) => {
          const reason = err instanceof Error ? err.message : String(err);
          console.error("X image upload failed; posting text only:", reason);
          return null;
        })
      : null;
    const res = await axios.post(
      X_CREATE_TWEET_URL,
      {
        text,
        ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
      },
      {
        timeout: config.requestTimeoutMs,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Posted to X:", res.data);
    return { status: "published", platform: "x", data: res.data };
  } catch (err: any) {
    console.error("X API error:", err?.response?.data || err.message);
    throw err;
  }
}
