import assert from "node:assert/strict";
import test from "node:test";
import { config } from "../config.js";
import { sendEmailCode, verifyEmailCode, verifySupabaseAccessToken } from "../services/email-auth.js";
import { createSession, encodeSession, getSession } from "../services/auth.js";

test("email OTP requires a confirmed matching email from Supabase", async () => {
  const old = { appUrl: config.appUrl, authRedirectUrl: config.authRedirectUrl, url: config.supabaseUrl, key: config.supabaseServiceRoleKey, secret: config.authSecret, fetch: globalThis.fetch };
  config.appUrl = "https://fun-studio-gregory.vercel.app";
  config.authRedirectUrl = "https://fun-studio-gregory.vercel.app/studio?lang=sl";
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "sb_secret_test"; config.authSecret = "test-secret";
  try {
    let result: any = { access_token: "test", user: { email: "member@example.com", email_confirmed_at: "2026-09-14T00:00:00Z" } };
    globalThis.fetch = async (url, init) => {
      if (String(url).includes("studio_account_restrictions")) return new Response("[]");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.email, "member@example.com");
      assert.equal((init?.headers as Record<string, string>).Authorization, undefined);
      assert.equal((init?.headers as Record<string, string>).apikey, "sb_secret_test");
      if (String(url).includes("/otp")) assert.equal(new URL(String(url)).searchParams.get("redirect_to"), "https://fun-studio-gregory.vercel.app/studio?lang=sl");
      if (String(url).endsWith("/verify")) { assert.equal(body.type, "email"); assert.equal(body.token, "123456"); }
      return new Response(JSON.stringify(result));
    };
    await sendEmailCode("member@example.com");
    assert.equal(await verifyEmailCode("member@example.com", "123456"), "member@example.com");
    result = { access_token: "test", user: { email: "other@example.com", email_confirmed_at: "2026-09-14" } };
    await assert.rejects(verifyEmailCode("member@example.com", "123456"), /Potrditev e-maila ni uspela/);
    result = { access_token: "test", user: { email: "member@example.com" } };
    await assert.rejects(verifyEmailCode("member@example.com", "123456"), /Potrditev e-maila ni uspela/);
    await assert.rejects(verifyEmailCode("member@example.com", "invalid"));
    const session = createSession("member@example.com");
    assert.equal(await getSession({ headers: { cookie: `zg_session=${encodeSession(session)}` } }), null);
    assert.equal((await getSession({ headers: { cookie: `zg_session=${encodeSession({ ...session, emailVerified: true })}` } }))?.email, session.email);
  } finally { config.appUrl = old.appUrl; config.authRedirectUrl = old.authRedirectUrl; config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; config.authSecret = old.secret; globalThis.fetch = old.fetch; }
});

test("email verification fails closed when the provider rejects the code", async () => {
  const old = { appUrl: config.appUrl, authRedirectUrl: config.authRedirectUrl, url: config.supabaseUrl, key: config.supabaseServiceRoleKey, secret: config.authSecret, fetch: globalThis.fetch };
  config.appUrl = "https://fun-studio-gregory.vercel.app";
  config.authRedirectUrl = "https://fun-studio-gregory.vercel.app/studio?lang=sl";
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "test"; config.authSecret = "test";
  try { globalThis.fetch = async () => new Response("{}", { status: 403 }); await assert.rejects(verifyEmailCode("member@example.com", "123456"), /ni veljavna ali je potekla/); }
  finally { config.appUrl = old.appUrl; config.authRedirectUrl = old.authRedirectUrl; config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; config.authSecret = old.secret; globalThis.fetch = old.fetch; }
});

test("creates an email session from a verified Supabase link token", async () => {
  const old = { url: config.supabaseUrl, key: config.supabaseServiceRoleKey, secret: config.authSecret, fetch: globalThis.fetch };
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "sb_secret_test"; config.authSecret = "test-secret";
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(String(url), "https://database.example/auth/v1/user");
      assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer supabase-access-token-for-test");
      assert.equal((init?.headers as Record<string, string>).apikey, "sb_secret_test");
      return new Response(JSON.stringify({ email: "member@example.com", email_confirmed_at: "2026-09-19T00:00:00Z" }));
    };
    assert.equal(await verifySupabaseAccessToken("supabase-access-token-for-test"), "member@example.com");
  } finally { config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; config.authSecret = old.secret; globalThis.fetch = old.fetch; }
});
