import { createSession, isValidEmail, publicSession, setSessionCookie } from "../../src/services/auth.js";

export const config = { maxDuration: 10 };

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    res.status(400).json({ ok: false, error: "Vpiši veljaven e-mail." });
    return;
  }

  const session = createSession(email);
  setSessionCookie(res, session);
  res.status(200).json({ ok: true, session: publicSession(session) });
}
