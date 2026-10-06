import { config } from "../config.js";
import { isValidEmail } from "./auth.js";

function authUrl(path: string) {
  const url = new URL(`${config.supabaseUrl.replace(/\/$/, "")}/auth/v1/${path}`);
  if (path === "otp") url.searchParams.set("redirect_to", config.authRedirectUrl);
  return url;
}

async function authRequest(path: string, body: unknown) {
  const missing = [
    !config.supabaseUrl && "SUPABASE_URL",
    !config.supabaseServiceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    !config.authSecret && "AUTH_SECRET",
  ].filter(Boolean);
  if (missing.length) throw new Error(`E-mail prijava ni nastavljena. Manjka: ${missing.join(", ")}.`);
  const headers: Record<string, string> = {
    apikey: config.supabaseServiceRoleKey,
    "Content-Type": "application/json",
  };
  if (!config.supabaseServiceRoleKey.startsWith("sb_")) {
    headers.Authorization = `Bearer ${config.supabaseServiceRoleKey}`;
  }
  const response = await fetch(authUrl(path), {
    method: "POST",
    headers,
    body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("Too many attempts. Wait before trying again.");
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new Error(path === "verify"
        ? "Potrditvena koda ni veljavna ali je potekla. Zahtevaj novo kodo."
        : "Potrditvenega e-maila ni bilo mogoče poslati. Preveri Supabase Auth nastavitve.");
    }
    throw new Error("Email sign-in is temporarily unavailable. Try again shortly.");
  }
  return response.json() as Promise<any>;
}

export async function sendEmailCode(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) throw new Error("E-mail ni veljaven.");
  await authRequest("otp", { email: normalizedEmail, create_user: true });
}

export async function verifyEmailCode(email: string, code: unknown): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail) || typeof code !== "string" || !/^\d{6,10}$/.test(code.trim())) throw new Error("Vpiši številčno kodo iz e-maila.");
  const result = await authRequest("verify", { type: "email", email: normalizedEmail, token: code.trim() });
  const verifiedEmail = String(result.user?.email ?? "").toLowerCase();
  if (!result.access_token || !result.user?.email_confirmed_at || verifiedEmail !== normalizedEmail) throw new Error("Potrditev e-maila ni uspela.");
  return verifiedEmail;
}

export async function verifySupabaseAccessToken(accessToken: unknown): Promise<string> {
  if (typeof accessToken !== "string" || accessToken.length < 20 || accessToken.length > 4096) throw new Error("Invalid Supabase session.");
  const missing = [
    !config.supabaseUrl && "SUPABASE_URL",
    !config.supabaseServiceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    !config.authSecret && "AUTH_SECRET",
  ].filter(Boolean);
  if (missing.length) throw new Error(`E-mail prijava ni nastavljena. Manjka: ${missing.join(", ")}.`);

  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Supabase e-mail povezava ni veljavna ali je potekla.");

  const user = await response.json() as any;
  const email = String(user?.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email) || !user?.email_confirmed_at) throw new Error("Supabase e-mail povezava ni potrjena.");
  return email;
}
