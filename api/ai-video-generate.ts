import { createRunwayImageToVideoTask, type RunwayVideoInput } from "../src/services/runway-video.js";
import { CREDIT_COSTS, publicSession, requireCredits } from "../src/services/auth.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const session = await requireCredits(req, res, CREDIT_COSTS.video, "video");
    if (!session) return;
    const task = await createRunwayImageToVideoTask(req.body as RunwayVideoInput);
    res.status(200).json({ ok: true, session: publicSession(session), task });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Video generation failed",
    });
  }
}
