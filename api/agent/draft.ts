import { createSocialDraft } from "../../src/services/social-draft.js";
import { CREDIT_COSTS, publicSession, requireCredits } from "../../src/services/auth.js";

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
    const includeImage = req.body?.includeImage;
    const cost = CREDIT_COSTS.text + (includeImage === false ? 0 : CREDIT_COSTS.image);
    const session = await requireCredits(req, res, cost, includeImage === false ? "tekst" : "tekst in sliko");
    if (!session) return;

    res.status(200).json({
      ok: true,
      session: publicSession(session),
      draft: await createSocialDraft({
        topic: req.body?.topic,
        language: req.body?.language,
        tone: req.body?.tone,
        length: req.body?.length,
        imageStyle: req.body?.imageStyle,
        includeImage,
      }),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
