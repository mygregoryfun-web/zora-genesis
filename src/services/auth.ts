import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

export type UserRole = "owner" | "user";

export type StudioSession = {
  email: string;
  role: UserRole;
  credits: number;
  createdAt: string;
  updatedAt: string;
};

export const CREDIT_COSTS = {
  text: 5,
  rewrite: 3,
  image: 25,
  video: 25,
} as const;

const COOKIE_NAME = "zg_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  return config.authSecret || "zora-genesis-local-dev-secret";
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function normalizeEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

type UserRecord = StudioSession & {
  totalSpent: number;
  loginCount: number;
  lastLoginAt: string;
};

type UserStore = {
  users: Record<string, UserRecord>;
};

function emptyStore(): UserStore {
  return { users: {} };
}

function readStore(): UserStore {
  try {
    if (!fs.existsSync(config.userStoreFile)) {
      return emptyStore();
    }
    const parsed = JSON.parse(fs.readFileSync(config.userStoreFile, "utf8")) as UserStore;
    return parsed && typeof parsed === "object" && parsed.users ? parsed : emptyStore();
  } catch {
    return emptyStore();
  }
}

function writeStore(store: UserStore) {
  try {
    fs.mkdirSync(path.dirname(config.userStoreFile), { recursive: true });
    fs.writeFileSync(config.userStoreFile, JSON.stringify(store, null, 2));
  } catch {
    // Serverless storage can be read-only or temporary. The signed cookie still keeps the current session usable.
  }
}

function toRecord(session: StudioSession, existing?: UserRecord): UserRecord {
  return {
    ...session,
    totalSpent: existing?.totalSpent ?? 0,
    loginCount: existing?.loginCount ?? 0,
    lastLoginAt: existing?.lastLoginAt ?? session.createdAt,
  };
}

export function listUsers() {
  return Object.values(readStore().users).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cookieOptions(maxAge = COOKIE_MAX_AGE) {
  return [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    process.env.VERCEL ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

function parseCookies(header: unknown) {
  const cookies = new Map<string, string>();
  String(header ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const index = part.indexOf("=");
      if (index > 0) {
        cookies.set(part.slice(0, index), decodeURIComponent(part.slice(index + 1)));
      }
    });
  return cookies;
}

export function createSession(emailInput: unknown, ownerCodeInput?: unknown): StudioSession {
  const email = normalizeEmail(emailInput);
  const ownerCode = String(ownerCodeInput ?? "");
  const ownerCodeMatches = Boolean(config.ownerLoginCode && ownerCode === config.ownerLoginCode);
  const role: UserRole = config.ownerEmail && email === config.ownerEmail && ownerCodeMatches ? "owner" : "user";
  const now = new Date().toISOString();

  return {
    email,
    role,
    credits: role === "owner" ? 999999 : Math.max(0, config.trialCredits),
    createdAt: now,
    updatedAt: now,
  };
}

export function loginSession(emailInput: unknown, ownerCodeInput?: unknown): StudioSession {
  const session = createSession(emailInput, ownerCodeInput);
  if (session.role === "owner") {
    return session;
  }

  const store = readStore();
  const existing = store.users[session.email];
  const now = new Date().toISOString();
  const stored: UserRecord = existing
    ? {
        ...existing,
        loginCount: existing.loginCount + 1,
        lastLoginAt: now,
        updatedAt: now,
      }
    : {
        ...toRecord(session),
        loginCount: 1,
        lastLoginAt: now,
      };

  store.users[session.email] = stored;
  writeStore(store);
  return stored;
}

export function encodeSession(session: StudioSession) {
  const payload = base64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(value: unknown): StudioSession | null {
  const token = String(value ?? "");
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as StudioSession;
    if (!isValidEmail(session.email) || typeof session.credits !== "number") {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function getSession(req: any): StudioSession | null {
  return decodeSession(parseCookies(req.headers?.cookie).get(COOKIE_NAME));
}

export function setSessionCookie(res: any, session: StudioSession) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(encodeSession(session))}; ${cookieOptions()}`);
}

export function clearSessionCookie(res: any) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${cookieOptions(0)}`);
}

export function publicSession(session: StudioSession | null) {
  if (!session) {
    return null;
  }

  return {
    email: session.email,
    role: session.role,
    credits: session.role === "owner" ? "unlimited" : session.credits,
    costs: CREDIT_COSTS,
  };
}

export function requireCredits(req: any, res: any, cost: number, label: string) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ ok: false, error: "Najprej se prijavi z e-mailom.", code: "AUTH_REQUIRED" });
    return null;
  }

  const store = readStore();
  const stored = session.role === "owner" ? null : store.users[session.email];
  const effectiveSession: StudioSession = stored
    ? {
        email: stored.email,
        role: stored.role,
        credits: stored.credits,
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
      }
    : session;

  if (effectiveSession.role !== "owner" && effectiveSession.credits < cost) {
    res.status(402).json({
      ok: false,
      error: `Premalo kreditov za ${label}.`,
      code: "INSUFFICIENT_CREDITS",
      session: publicSession(effectiveSession),
    });
    return null;
  }

  const updated: StudioSession = {
    ...effectiveSession,
    credits: effectiveSession.role === "owner" ? effectiveSession.credits : effectiveSession.credits - cost,
    updatedAt: new Date().toISOString(),
  };
  if (updated.role !== "owner") {
    const existing = store.users[updated.email];
    store.users[updated.email] = {
      ...toRecord(updated, existing),
      totalSpent: (existing?.totalSpent ?? 0) + cost,
      updatedAt: updated.updatedAt,
    };
    writeStore(store);
  }
  setSessionCookie(res, updated);
  return updated;
}
