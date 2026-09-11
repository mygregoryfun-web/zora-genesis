import assert from "node:assert/strict";
import test from "node:test";
import { createSession, decodeSession, encodeSession, publicSession } from "../services/auth.js";

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
