import { getStudioVideo } from "../src/services/studio-video.js";
import { getSession } from "../src/services/auth.js";

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const session = await getSession(req);
    if (!session) { res.status(401).json({ ok: false, error: "Sign in first." }); return; }
    const id = String(req.query?.id ?? "");
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw new Error("Invalid task ID.");
    const task = await getStudioVideo(session, id);
    res.status(200).json({ ok: true, task });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Video task lookup failed",
    });
  }
}
