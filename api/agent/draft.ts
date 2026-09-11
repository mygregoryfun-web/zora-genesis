import { createSocialDraft } from "../../src/services/social-draft.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  try {
    res.status(200).json({
      ok: true,
      draft: await createSocialDraft({
        topic: req.body?.topic,
        language: req.body?.language,
        tone: req.body?.tone,
        length: req.body?.length,
        imageStyle: req.body?.imageStyle,
        includeImage: req.body?.includeImage,
      }),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
