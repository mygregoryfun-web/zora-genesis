import { getRunwayTask } from "../src/services/runway-video.js";

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const id = String(req.query.id ?? "");
    const task = await getRunwayTask(id);
    res.status(200).json({ ok: true, task });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Video task lookup failed",
    });
  }
}
