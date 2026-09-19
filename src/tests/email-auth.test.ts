import assert from "node:assert/strict";
import test from "node:test";
import { config } from "../config.js";
import { sendEmailCode, verifyEmailCode } from "../services/email-auth.js";
import { createSession, encodeSession, getSession } from "../services/auth.js";

test("email OTP requires a confirmed matching email from Supabase", async () => {
  const old = { url: config.supabaseUrl, key: config.supabaseServiceRoleKey, secret: config.authSecret, fetch: globalThis.fetch };
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "test"; config.authSecret = "test-secret";
  try {
    let result: any = { access_token: "test", user: { email: "member@example.com", email_confirmed_at: "2026-09-14T00:00:00Z" } };
    globalThis.fetch = async (url, init) => {
      if (String(url).includes("studio_account_restrictions")) return new Response("[]");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.email, "member@example.com");
      assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer test");
      if (String(url).endsWith("/verify")) { assert.equal(body.type, "email"); assert.equal(body.token, "123456"); }
      return new Response(JSON.stringify(result));
    };
    await sendEmailCode("member@example.com");
    assert.equal(await verifyEmailCode("member@example.com", "123456"), "member@example.com");
    result = { access_token: "test", user: { email: "other@example.com", email_confirmed_at: "2026-09-14" } };
    await assert.rejects(verifyEmailCode("member@example.com", "123456"), /verification failed/);
    result = { access_token: "test", user: { email: "member@example.com" } };
    await assert.rejects(verifyEmailCode("member@example.com", "123456"), /verification failed/);
    await assert.rejects(verifyEmailCode("member@example.com", "invalid"));
    const session = createSession("member@example.com");
    assert.equal(await getSession({ headers: { cookie: `zg_session=${encodeSession(session)}` } }), null);
    assert.equal((await getSession({ headers: { cookie: `zg_session=${encodeSession({ ...session, emailVerified: true })}` } }))?.email, session.email);
  } finally { config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; config.authSecret = old.secret; globalThis.fetch = old.fetch; }
});

test("email verification fails closed when the provider rejects the code", async () => {
  const old = { url: config.supabaseUrl, key: config.supabaseServiceRoleKey, secret: config.authSecret, fetch: globalThis.fetch };
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "test"; config.authSecret = "test";
  try { globalThis.fetch = async () => new Response("{}", { status: 403 }); await assert.rejects(verifyEmailCode("member@example.com", "123456"), /invalid or has expired/); }
  finally { config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; config.authSecret = old.secret; globalThis.fetch = old.fetch; }
});
