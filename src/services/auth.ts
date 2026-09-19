import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

export type UserRole = "owner" | "user";

export type StudioSession = {
  emailVerified?: boolean;
  email: string;
  role: UserRole;
  credits: number;
  createdAt: string;
  updatedAt: string;
};

export const CREDIT_COSTS = {
  text: 5,
  rewrite: 3,
  image: 15,
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
  accountStatus?: string;
  totalSpent: number;
  loginCount: number;
  lastLoginAt: string;
};

type UserStore = {
  users: Record<string, UserRecord>;
};

export type StoredDraft = {
  id: string;
  email: string;
  topic: string;
  title: string;
  text: string;
  draft: unknown;
  createdAt: string;
  updatedAt: string;
};

function hasSupabase() {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
}

export function storageMode() {
  return hasSupabase() ? "supabase" : "temporary";
}

export async function currentSession(req: any): Promise<StudioSession | null> {
  const session = await getSession(req);
  if (!session || session.role === "owner") return session;
  const user = hasSupabase() ? await getSupabaseUser(session.email) : readStore().users[session.email];
  return user ? { ...user, role: session.role, emailVerified: session.emailVerified } : null;
}

async function accountRestriction(email: string): Promise<string | null> {
  if (!hasSupabase()) return null;
  const rows = await supabaseFetch("studio_account_restrictions", {}, `?email=eq.${encodeURIComponent(email)}&select=status&limit=1`);
  return Array.isArray(rows) && rows[0] ? String(rows[0].status) : null;
}

export async function manageUserForAdmin(actor: StudioSession, input: { email?: unknown; confirmation?: unknown; operation?: unknown }) {
  if (actor.role !== "owner") throw new Error("Admin access required.");
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) throw new Error("Invalid email.");
  if (email === actor.email || email === config.ownerEmail) throw new Error("Admin accounts cannot be blocked or deleted.");
  if (!["block", "unblock", "delete"].includes(String(input.operation))) throw new Error("Invalid operation.");
  if (input.operation === "delete" && normalizeEmail(input.confirmation) !== email) throw new Error("Confirm deletion by entering the user's email.");
  if (!hasSupabase()) throw new Error("User management requires Supabase and the account-management migration.");
  await supabaseFetch("rpc/studio_manage_account", { method: "POST", body: JSON.stringify({ p_email: email, p_operation: input.operation, p_actor: actor.email, p_protected: config.ownerEmail }) });
}

function supabaseEndpoint(table: string, query = "") {
  return `${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}${query}`;
}

function fromSupabaseUser(row: any): UserRecord {
  return {
    email: row.email,
    role: row.role,
    credits: Number(row.credits ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalSpent: Number(row.total_spent ?? 0),
    loginCount: Number(row.login_count ?? 0),
    lastLoginAt: row.last_login_at,
  };
}

function toSupabaseUser(user: UserRecord) {
  return {
    email: user.email,
    role: user.role,
    credits: user.credits,
    total_spent: user.totalSpent,
    login_count: user.loginCount,
    last_login_at: user.lastLoginAt,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

function fromSupabaseDraft(row: any): StoredDraft {
  return {
    id: row.id,
    email: row.email,
    topic: row.topic ?? "",
    title: row.title ?? "",
    text: row.text ?? "",
    draft: row.draft ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function supabaseFetch(table: string, init: RequestInit = {}, query = "") {
  const response = await fetch(supabaseEndpoint(table, query), {
    ...init,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase ${table} request failed: ${response.status} ${detail}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function getSupabaseUser(email: string): Promise<UserRecord | null> {
  const rows = await supabaseFetch(
    "studio_users",
    { method: "GET" },
    `?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
  );
  return Array.isArray(rows) && rows[0] ? fromSupabaseUser(rows[0]) : null;
}

async function upsertSupabaseUser(user: UserRecord): Promise<UserRecord> {
  const rows = await supabaseFetch(
    "studio_users",
    { method: "POST", body: JSON.stringify(toSupabaseUser(user)), headers: { Prefer: "resolution=merge-duplicates,return=representation" } },
    "?on_conflict=email",
  );
  return Array.isArray(rows) && rows[0] ? fromSupabaseUser(rows[0]) : user;
}

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

export async function listUsers() {
  if (hasSupabase()) {
    const rows = await supabaseFetch("studio_users", { method: "GET" }, "?select=*&order=updated_at.desc");
    const restrictions = await supabaseFetch("studio_account_restrictions", {}, "?select=email,status");
    return Array.isArray(rows) ? rows.map(row => ({ ...fromSupabaseUser(row), accountStatus: Array.isArray(restrictions) ? restrictions.find(item => item.email === row.email)?.status ?? "active" : "active" })) : [];
  }

  return Object.values(readStore().users).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function updateUserForAdmin(input: {
  email?: unknown;
  role?: unknown;
  credits?: unknown;
}) {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    throw new Error("Vpiši veljaven e-mail uporabnika.");
  }

  const role: UserRole = input.role === "owner" ? "owner" : "user";
  const credits = Math.max(0, Math.floor(Number(input.credits ?? 0)));
  if (!Number.isFinite(credits)) {
    throw new Error("Krediti morajo biti število.");
  }

  const now = new Date().toISOString();

  if (hasSupabase()) {
    const existing = await getSupabaseUser(email);
    if (!existing) {
      throw new Error("Uporabnik s tem e-mailom še ne obstaja.");
    }

    return upsertSupabaseUser({
      ...existing,
      role,
      credits,
      updatedAt: now,
    });
  }

  const store = readStore();
  const existing = store.users[email];
  if (!existing) {
    throw new Error("Uporabnik s tem e-mailom še ne obstaja.");
  }

  const updated: UserRecord = {
    ...existing,
    role,
    credits,
    updatedAt: now,
  };
  store.users[email] = updated;
  writeStore(store);
  return updated;
}

export async function addCreditsToUser(emailInput: unknown, creditsInput: unknown) {
  const email = normalizeEmail(emailInput);
  if (!isValidEmail(email)) {
    throw new Error("Vpiši veljaven e-mail uporabnika.");
  }

  const addedCredits = Math.max(0, Math.floor(Number(creditsInput ?? 0)));
  if (!Number.isFinite(addedCredits) || addedCredits <= 0) {
    throw new Error("Krediti morajo biti pozitivno število.");
  }

  const now = new Date().toISOString();

  if (hasSupabase()) {
    const existing = await getSupabaseUser(email);
    if (!existing) {
      throw new Error("Uporabnik s tem e-mailom še ne obstaja.");
    }

    return upsertSupabaseUser({
      ...existing,
      credits: existing.credits + addedCredits,
      updatedAt: now,
    });
  }

  const store = readStore();
  const existing = store.users[email];
  if (!existing) {
    throw new Error("Uporabnik s tem e-mailom še ne obstaja.");
  }

  const updated: UserRecord = {
    ...existing,
    credits: existing.credits + addedCredits,
    updatedAt: now,
  };
  store.users[email] = updated;
  writeStore(store);
  return updated;
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

export async function loginSession(emailInput: unknown, ownerCodeInput?: unknown): Promise<StudioSession> {
  const session = createSession(emailInput, ownerCodeInput);
  if (await accountRestriction(session.email)) throw new Error("Račun je blokiran ali izbrisan. Obrni se na skrbnika.");
  if (session.role === "owner") {
    return session;
  }

  if (hasSupabase()) {
    const existing = await getSupabaseUser(session.email);
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
    return upsertSupabaseUser(stored);
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

export async function getSession(req: any): Promise<StudioSession | null> {
  const session = decodeSession(parseCookies(req.headers?.cookie).get(COOKIE_NAME));
  if (!session || await accountRestriction(session.email)) return null;
  if (session.role !== "owner" && session.emailVerified !== true) return null;
  return session;
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

export async function requireCredits(req: any, res: any, cost: number, label: string) {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ ok: false, error: "Najprej se prijavi z e-mailom.", code: "AUTH_REQUIRED" });
    return null;
  }

  const store = hasSupabase() ? emptyStore() : readStore();
  const stored = session.role === "owner"
    ? null
    : hasSupabase()
      ? await getSupabaseUser(session.email)
      : store.users[session.email];
  const effectiveSession: StudioSession = stored
    ? {
        email: stored.email,
        role: session.role,
        credits: stored.credits,
        emailVerified: session.emailVerified,
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
    const existing = stored ?? undefined;
    const record = {
      ...toRecord(updated, existing),
      totalSpent: (existing?.totalSpent ?? 0) + cost,
      updatedAt: updated.updatedAt,
    };
    if (hasSupabase()) {
      await upsertSupabaseUser(record);
    } else {
      store.users[updated.email] = record;
      writeStore(store);
    }
  }
  setSessionCookie(res, updated);
  return updated;
}

export async function listDraftsForSession(session: StudioSession) {
  if (session.role !== "owner" && hasSupabase()) {
    const rows = await supabaseFetch(
      "studio_drafts",
      { method: "GET" },
      `?email=eq.${encodeURIComponent(session.email)}&select=*&order=updated_at.desc&limit=50`,
    );
    return Array.isArray(rows) ? rows.map(fromSupabaseDraft) : [];
  }

  return [];
}

export async function deleteDraftForSession(session: StudioSession, id: unknown) {
  if (!hasSupabase()) throw new Error("Supabase is not configured.");
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid draft ID.");
  await supabaseFetch("studio_drafts", { method: "DELETE" }, `?id=eq.${encodeURIComponent(id)}&email=eq.${encodeURIComponent(session.email)}`);
}

export async function saveDraftForSession(session: StudioSession, input: {
  topic?: unknown;
  title?: unknown;
  text?: unknown;
  draft?: unknown;
}) {
  if (!hasSupabase()) {
    throw new Error("Supabase is not configured yet.");
  }

  if (session.role === "owner") {
    throw new Error("Owner drafts are not stored in the shared user library.");
  }

  const now = new Date().toISOString();
  const row = {
    email: session.email,
    topic: String(input.topic ?? "").slice(0, 500),
    title: String(input.title ?? "").slice(0, 200),
    text: String(input.text ?? ""),
    draft: input.draft ?? null,
    updated_at: now,
  };

  const rows = await supabaseFetch("studio_drafts", { method: "POST", body: JSON.stringify(row) });
  return Array.isArray(rows) && rows[0] ? fromSupabaseDraft(rows[0]) : null;
}
