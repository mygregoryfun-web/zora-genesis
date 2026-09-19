import { config } from "../config.js";
import { isValidEmail } from "./auth.js";

async function authRequest(path: string, body: unknown) {
  const missing = [
    !config.supabaseUrl && "SUPABASE_URL",
    !config.supabaseServiceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    !config.authSecret && "AUTH_SECRET",
  ].filter(Boolean);
  if (missing.length) throw new Error(`Email authentication is not configured. Missing: ${missing.join(", ")}.`);
  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("Too many attempts. Wait before trying again.");
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new Error(path === "verify"
        ? "The verification code is invalid or has expired. Request a new code."
        : "The verification email could not be sent. Check the Supabase Auth email settings.");
    }
    throw new Error("Email sign-in is temporarily unavailable. Try again shortly.");
  }
  return response.json() as Promise<any>;
}

export async function sendEmailCode(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) throw new Error("Invalid email.");
  await authRequest("otp", { email: normalizedEmail, create_user: true });
}

export async function verifyEmailCode(email: string, code: unknown): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail) || typeof code !== "string" || !/^\d{6,10}$/.test(code.trim())) throw new Error("Enter the numeric code from your email.");
  const result = await authRequest("verify", { type: "email", email: normalizedEmail, token: code.trim() });
  const verifiedEmail = String(result.user?.email ?? "").toLowerCase();
  if (!result.access_token || !result.user?.email_confirmed_at || verifiedEmail !== normalizedEmail) throw new Error("Email verification failed.");
  return verifiedEmail;
}
