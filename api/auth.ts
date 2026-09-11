import {
  clearSessionCookie,
  createSession,
  getSession,
  isValidEmail,
  publicSession,
  setSessionCookie,
} from "../src/services/auth.js";

export const config = { maxDuration: 10 };

export default function handler(req: any, res: any) {
  const action = String(req.query?.action ?? "").toLowerCase();

  if (req.method === "GET" && action === "status") {
    res.status(200).json({ ok: true, session: publicSession(getSession(req)) });
    return;
  }

  if (req.method === "POST" && action === "login") {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      res.status(400).json({ ok: false, error: "Vpiši veljaven e-mail." });
      return;
    }

    const session = createSession(email);
    setSessionCookie(res, session);
    res.status(200).json({ ok: true, session: publicSession(session) });
    return;
  }

  if (req.method === "POST" && action === "logout") {
    clearSessionCookie(res);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(404).json({ ok: false, error: "Unknown auth action." });
}
