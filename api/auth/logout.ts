import { clearSessionCookie } from "../../src/services/auth.js";

export const config = { maxDuration: 10 };

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}
