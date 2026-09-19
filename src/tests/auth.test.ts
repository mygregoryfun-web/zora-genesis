import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { config } from "../config.js";
import { createSession, decodeSession, encodeSession, getSession, loginSession, manageUserForAdmin, publicSession, updateUserForAdmin } from "../services/auth.js";

test("admin updates existing Supabase users with merge-duplicates", async () => {
  const old = { url: config.supabaseUrl, key: config.supabaseServiceRoleKey, fetch: globalThis.fetch };
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "test";
  const user = { email: "member@example.com", role: "user", credits: 50, total_spent: 0, login_count: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_login_at: new Date().toISOString() };
  let updated = false;
  try {
    globalThis.fetch = async (_url, init) => {
      if (init?.method === "POST") {
        assert.equal(new Headers(init.headers).get("Prefer"), "resolution=merge-duplicates,return=representation");
        const body = JSON.parse(String(init.body));
        assert.equal(body.credits, 75); updated = true;
        return new Response(JSON.stringify([body]));
      }
      return new Response(JSON.stringify([user]));
    };
    assert.equal((await updateUserForAdmin({ email: user.email, credits: 75 })).credits, 75);
    assert.equal(updated, true);
  } finally { config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; globalThis.fetch = old.fetch; }
});

test("blocked and deleted accounts cannot log in or use an old cookie", async () => {
  const old = { url: config.supabaseUrl, key: config.supabaseServiceRoleKey, fetch: globalThis.fetch };
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "test";
  try {
    for (const status of ["blocked", "deleted"]) {
      globalThis.fetch = async (url) => { assert.ok(String(url).includes("studio_account_restrictions")); return new Response(JSON.stringify([{ status }])); };
      const session = createSession("blocked@example.com");
      assert.equal(await getSession({ headers: { cookie: `zg_session=${encodeSession(session)}` } }), null);
      await assert.rejects(loginSession(session.email), /blokiran ali izbrisan/);
    }
  } finally { config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; globalThis.fetch = old.fetch; }
});

test("account management requires admin access, protects self, and checks deletion confirmation", async () => {
  const member = createSession("member@example.com");
  await assert.rejects(manageUserForAdmin(member, { email: "target@example.com", operation: "delete", confirmation: "target@example.com" }), /Admin access/);
  const admin = { ...member, role: "owner" as const };
  await assert.rejects(manageUserForAdmin(admin, { email: admin.email, operation: "block" }), /cannot be blocked/);
  await assert.rejects(manageUserForAdmin(admin, { email: "target@example.com", operation: "delete", confirmation: "wrong@example.com" }), /Confirm deletion/);
});

test("creates a signed studio session for an email user", () => {
  const session = createSession("USER@example.com");
  const token = encodeSession(session);
  const decoded = decodeSession(token);

  assert.equal(decoded?.email, "user@example.com");
  assert.equal(decoded?.role, "user");
  assert.equal(publicSession(decoded)?.credits, session.credits);
});

test("rejects a tampered studio session token", () => {
  const session = createSession("user@example.com");
  const token = encodeSession(session);
  const tampered = `${token.slice(0, -1)}x`;

  assert.equal(decodeSession(tampered), null);
});

test("does not grant owner role without the owner login code", () => {
  process.env.OWNER_EMAIL = "owner@example.com";
  process.env.OWNER_LOGIN_CODE = "secret-code";

  const session = createSession("owner@example.com", "wrong-code");

  assert.equal(session.role, "user");
});

test("lets an admin update an existing user's credits and role", async () => {
  const previousStoreFile = config.userStoreFile;
  const previousSupabaseUrl = config.supabaseUrl;
  const previousSupabaseKey = config.supabaseServiceRoleKey;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "zg-auth-test-"));

  config.userStoreFile = path.join(tempDir, "users.json");
  config.supabaseUrl = "";
  config.supabaseServiceRoleKey = "";

  try {
    await loginSession("member@example.com");
    const updated = await updateUserForAdmin({
      email: "member@example.com",
      role: "owner",
      credits: 123,
    });

    assert.equal(updated.email, "member@example.com");
    assert.equal(updated.role, "owner");
    assert.equal(updated.credits, 123);
  } finally {
    config.userStoreFile = previousStoreFile;
    config.supabaseUrl = previousSupabaseUrl;
    config.supabaseServiceRoleKey = previousSupabaseKey;
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
