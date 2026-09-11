import { getSession, publicSession } from "../../src/services/auth.js";

export const config = { maxDuration: 10 };

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  res.status(200).json({ ok: true, session: publicSession(getSession(req)) });
}
