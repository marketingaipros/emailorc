import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createId } from "./cloudflare-db";
import { normalizeRole, type NormalizedRole } from "./roles";

export const SESSION_COOKIE_NAME = "emailorc_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  userId: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  organizationId: string | null;
  organizationName?: string | null;
  role: NormalizedRole;
  environmentMode?: "demo" | "test-live" | "production" | null;
};

type LocalSession = SessionUser & {
  sessionId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
};

const localSessions = new Map<string, LocalSession>();

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function expiresAtFromNow() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createOpaqueSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function readSessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProductionRuntime(),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProductionRuntime(),
    path: "/",
    maxAge: 0,
  });
}

export async function createServerSession(db: D1Database | null, user: SessionUser) {
  const normalizedRole = normalizeRole(user.role);
  if (!normalizedRole) throw new Error("Cannot create a session for an unrecognized role.");

  const token = createOpaqueSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = expiresAtFromNow();
  const sessionId = createId("session");

  if (db) {
    await db.prepare(`
      INSERT INTO app_sessions (
        id,
        token_hash,
        user_id,
        organization_id,
        role,
        expires_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(sessionId, tokenHash, user.userId, user.organizationId, normalizedRole, expiresAt).run();
  } else if (!isProductionRuntime()) {
    localSessions.set(tokenHash, {
      ...user,
      role: normalizedRole,
      sessionId,
      tokenHash,
      expiresAt,
      revokedAt: null,
    });
  } else {
    throw new Error("Server session storage is unavailable.");
  }

  return { token, tokenHash, sessionId, expiresAt };
}

export async function revokeServerSession(db: D1Database | null, token: string | null) {
  if (!token) return;
  const tokenHash = hashSessionToken(token);

  if (db) {
    try {
      await db.prepare(`
        UPDATE app_sessions
        SET revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE token_hash = ?
      `).bind(tokenHash).run();
    } catch {
      // Cookie clearing should still complete if D1 session storage is unavailable.
    }
    return;
  }

  const session = localSessions.get(tokenHash);
  if (session) {
    localSessions.set(tokenHash, { ...session, revokedAt: new Date().toISOString() });
  }
}

export async function lookupServerSession(db: D1Database | null, token: string | null) {
  if (!token) return null;
  const tokenHash = hashSessionToken(token);

  if (db) {
    const row: any = await db.prepare(`
        SELECT
          s.id AS session_id,
          s.user_id,
          s.organization_id,
          s.role AS session_role,
          s.expires_at,
          s.revoked_at,
          u.email,
          u.first_name,
          u.last_name,
          m.role AS membership_role,
          o.name AS organization_name,
          o.environment AS environment_mode
        FROM app_sessions s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN memberships m ON m.user_id = s.user_id
          AND m.organization_id = s.organization_id
          AND m.status = 'ACTIVE'
        LEFT JOIN organizations o ON o.id = s.organization_id
        WHERE s.token_hash = ?
        LIMIT 1
      `).bind(tokenHash).first().catch(() => null);

    if (!row || row.revoked_at || new Date(row.expires_at).getTime() <= Date.now()) return null;

    const role = normalizeRole(row.membership_role || row.session_role);
    if (!role) return null;

    return {
      sessionId: row.session_id,
      userId: row.user_id,
      email: row.email || null,
      firstName: row.first_name || null,
      lastName: row.last_name || null,
      organizationId: row.organization_id || null,
      organizationName: row.organization_name || null,
      role,
      environmentMode: row.environment_mode || null,
      expiresAt: row.expires_at,
      sessionSource: "d1_app_sessions" as const,
    };
  }

  const session = localSessions.get(tokenHash);
  if (!session || session.revokedAt || new Date(session.expiresAt).getTime() <= Date.now()) return null;

  return {
    sessionId: session.sessionId,
    userId: session.userId,
    email: session.email,
    firstName: session.firstName || null,
    lastName: session.lastName || null,
    organizationId: session.organizationId,
    organizationName: session.organizationName || null,
    role: session.role,
    environmentMode: session.environmentMode || null,
    expiresAt: session.expiresAt,
    sessionSource: "local_dev_memory" as const,
  };
}

export function resetLocalSessionsForTests() {
  localSessions.clear();
}
