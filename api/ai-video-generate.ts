import { generateStudioVideo, VideoPurchaseRequiredError } from "../src/services/studio-video.js";
import { getSession } from "../src/services/auth.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const session = await getSession(req);
    if (!session) { res.status(401).json({ ok: false, error: "Sign in first." }); return; }
    const task = await generateStudioVideo(session, req.body);
    res.status(200).json({ ok: true, task });
  } catch (error) {
    res.status(error instanceof VideoPurchaseRequiredError ? 403 : 400).json({
      ok: false,
      code: error instanceof VideoPurchaseRequiredError ? error.code : undefined,
      error: error instanceof Error ? error.message : "Video generation failed",
    });
  }
}
