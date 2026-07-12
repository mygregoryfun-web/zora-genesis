import axios from "axios";
import { config } from "../config.js";

type GeneratedPost = {
  title: string;
  post: string;
  hashtags: string[];
};

const MAX_POST_LENGTH = 280;

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

export async function postToX(post: GeneratedPost) {
  const text = formatForX(post);

  if (config.skipPost) {
    console.log("SKIP_POST enabled; not sending to X.");
    console.log(text);
    return null;
  }

  if (!config.xBearerToken) {
    console.log("X_BEARER_TOKEN not configured; skipping X.");
    return null;
  }

  try {
    const res = await axios.post(
      "https://api.x.com/2/tweets",
      {
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${config.xBearerToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Posted to X:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("X API error:", err?.response?.data || err.message);
    throw err;
  }
}
