import { createRunwayImageToVideoTask, type RunwayVideoInput } from "../src/services/runway-video.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const task = await createRunwayImageToVideoTask(req.body as RunwayVideoInput);
    res.status(200).json({ ok: true, task });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Video generation failed",
    });
  }
}
