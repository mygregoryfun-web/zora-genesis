import axios from "axios";
import { config } from "../config.js";
import type { GeneratedPost } from "../types.js";

export type GeneratedImage = {
  prompt: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
};

function buildPrompt(post: GeneratedPost) {
  return [
    `Create an original photorealistic editorial image for ${config.creatorName}.`,
    "Subject: on-chain creator culture, Base, Zora, Ethereum, NFTs, and digital markets.",
    `Post title: ${post.title}`,
    `Post context: ${post.post}`,
    "Style: sophisticated crypto-native photography, cinematic natural light, no text, no logos, no watermarks.",
    "Composition: visually interesting, human-curated, suitable as a Zora artwork cover.",
  ].join("\n");
}

export async function generateImageForPost(post: GeneratedPost): Promise<GeneratedImage | null> {
  const prompt = buildPrompt(post);

  if (config.skipImage) {
    console.log("SKIP_IMAGE enabled; not generating an image.");
    return null;
  }

  if (!config.openAiApiKey) {
    console.log("OPENAI_API_KEY not configured; skipping image generation.");
    return null;
  }

  const res = await axios
    .post(
      "https://api.openai.com/v1/images/generations",
      {
        model: config.imageModel,
        prompt,
        size: "1024x1024",
        n: 1,
        output_format: "png",
      },
      {
        timeout: config.requestTimeoutMs,
        headers: {
          Authorization: `Bearer ${config.openAiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    )
    .catch((error) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message ?? error.message;
        throw new Error(`Image generation failed: ${message}`);
      }

      throw error;
    });

  const b64 = res.data?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("Image generation response did not include image data.");
  }

  return {
    prompt,
    filename: `zora-genesis-${Date.now()}.png`,
    mimeType: "image/png",
    buffer: Buffer.from(b64, "base64"),
  };
}
