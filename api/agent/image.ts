import { generateImageForPost, type ImageStyle } from "../../src/services/image.js";
import { CREDIT_COSTS, publicSession, requireCredits } from "../../src/services/auth.js";
import type { GeneratedPost } from "../../src/types.js";

export const config = {
  maxDuration: 60,
};

function imageToDataUrl(image: { mimeType: string; buffer: Buffer } | null) {
  if (!image) return null;
  return `data:${image.mimeType};base64,${image.buffer.toString("base64")}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const postText = String(req.body?.post ?? "").trim();
    if (!postText) {
      res.status(400).json({ ok: false, error: "Missing post text." });
      return;
    }
    const session = requireCredits(req, res, CREDIT_COSTS.image, "sliko");
    if (!session) return;

    const imageStyle: ImageStyle =
      req.body?.imageStyle === "artwork-cover" || req.body?.imageStyle === "contradictory-art"
        ? req.body.imageStyle
        : "social-editorial";

    const post: GeneratedPost = {
      title: String(req.body?.title ?? "Social post"),
      post: postText,
      hashtags: Array.isArray(req.body?.hashtags) ? req.body.hashtags : [],
    };
    const image = await generateImageForPost(post, imageStyle);

    res.status(200).json({
      ok: true,
      session: publicSession(session),
      image: image
        ? {
            prompt: image.prompt,
            filename: image.filename,
            mimeType: image.mimeType,
            dataUrl: imageToDataUrl(image),
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
