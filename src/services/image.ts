import axios from "axios";
import { config } from "../config.js";
import type { GeneratedPost } from "../types.js";
import { generateImageWithComfy } from "./comfy.js";

export type GeneratedImage = {
  prompt: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
};

export type ImageStyle = "social-editorial" | "artwork-cover" | "contradictory-art";

function buildPrompt(post: GeneratedPost, imageStyle: ImageStyle = "social-editorial") {
  const socialChannels = ["facebook", "instagram", "x"];
  const socialMode =
    config.publishChannels.length > 0 &&
    config.publishChannels.every((channel) => socialChannels.includes(channel));

  if (imageStyle === "social-editorial" && socialMode) {
    return [
      `Create an original photorealistic editorial image for ${config.creatorName}.`,
      "Subject: adult relationships, trust, pride, honesty, money, betrayal, personal boundaries, and emotional maturity.",
      `Post title: ${post.title}`,
      `Post context: ${post.post}`,
      "Style: elegant, human, emotionally expressive, premium social media photography, warm but serious.",
      "Composition: clear social media image, strong first impression, no text, no logos, no watermarks.",
      "Safety: adult subjects only, fully clothed, tasteful, no explicit sexuality, no violence, no humiliating depiction.",
    ].join("\n");
  }

  if (imageStyle === "contradictory-art") {
    return [
      `Create an original photorealistic editorial image for ${config.creatorName}.`,
      "Subject: derive the actual subject from the post title and post context.",
      `Post title: ${post.title}`,
      `Post context: ${post.post}`,
      "Core concept: show a visual contradiction or inner conflict from the post, such as attraction versus consequence, beauty versus distance, pride versus truth, money versus captivity, freedom versus control, elegance versus temptation.",
      "Style: sophisticated editorial art photography, cinematic natural light, subtle symbolic tension, emotionally intelligent, no text, no logos, no watermarks.",
      "Composition: visually striking but tasteful, one clear human-centered scene, with contrast in posture, light, distance, reflection, or environment.",
      "Safety: adult subjects only, fully clothed, tasteful, elegant, no explicit sexuality, no fetish framing, no humiliating depiction.",
      "Avoid: technology-finance, trading, and market-interface imagery.",
    ].join("\n");
  }

  return [
    `Create an original photorealistic editorial image for ${config.creatorName}.`,
    "Subject: derive the actual subject from the post title and post context. Do not include technology-finance, trading, or market-interface imagery.",
    `Post title: ${post.title}`,
    `Post context: ${post.post}`,
    "Style: sophisticated editorial photography, cinematic natural light, premium creator-artwork feel, no text, no logos, no watermarks.",
    "Composition: visually interesting, human-curated, suitable as a social artwork cover while staying faithful to the post subject.",
    "Safety: adult subjects only, fully clothed, tasteful, elegant, no explicit sexuality, no fetish framing, no humiliating depiction.",
  ].join("\n");
}

export async function generateImageForPost(post: GeneratedPost, imageStyle: ImageStyle = "social-editorial"): Promise<GeneratedImage | null> {
  const prompt = buildPrompt(post, imageStyle);

  if (config.skipImage) {
    console.log("SKIP_IMAGE enabled; not generating an image.");
    return null;
  }

  if (config.imageProvider.toLowerCase() === "comfy") {
    try {
      return await generateImageWithComfy(prompt);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`Comfy image generation failed; falling back to OpenAI: ${reason}`);
    }
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
