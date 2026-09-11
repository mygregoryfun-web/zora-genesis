import { rewriteSocialPost } from "../../src/services/social-rewrite.js";
import { CREDIT_COSTS, publicSession, requireCredits } from "../../src/services/auth.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const post = String(req.body?.post ?? "").trim();
    if (!post) {
      res.status(400).json({ ok: false, error: "Missing post text." });
      return;
    }
    const session = requireCredits(req, res, CREDIT_COSTS.rewrite, "izboljšavo teksta");
    if (!session) return;

    res.status(200).json({
      ok: true,
      session: publicSession(session),
      post: await rewriteSocialPost({
        title: req.body?.title,
        post,
        hashtags: Array.isArray(req.body?.hashtags) ? req.body.hashtags : [],
        action: req.body?.action,
        language: req.body?.language,
      }),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
