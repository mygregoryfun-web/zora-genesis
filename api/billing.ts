import { claimPaymentForSession } from "../src/services/billing.js";
import { getSession, publicSession, setSessionCookie } from "../src/services/auth.js";

export const config = { maxDuration: 20 };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const session = getSession(req);
  if (!session) {
    res.status(401).json({ ok: false, error: "Najprej se prijavi v Studio." });
    return;
  }

  try {
    const result = await claimPaymentForSession(session, req.body ?? {});
    const updatedSession = {
      email: result.user.email,
      role: result.user.role,
      credits: result.user.credits,
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt,
    };
    setSessionCookie(res, updatedSession);
    res.status(200).json({
      ok: true,
      addedCredits: result.addedCredits,
      product: result.product,
      payment: result.payment,
      session: publicSession(updatedSession),
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
