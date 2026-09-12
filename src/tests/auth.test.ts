import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { config } from "../config.js";
import { createSession, decodeSession, encodeSession, loginSession, publicSession, updateUserForAdmin } from "../services/auth.js";

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
