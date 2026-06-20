import { NextResponse } from "next/server";
import { getD1Database } from "./cloudflare-db";
import { lookupServerSession, readSessionToken } from "./server-session";
import { permissionsForRole, roleLabel, type NormalizedRole } from "./roles";

export type CurrentUser = {
  sessionId: string;
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string;
  organizationId: string | null;
  organizationName: string | null;
  role: NormalizedRole;
  roleLabel: string;
  environmentMode: string | null;
  expiresAt: string;
  sessionSource: "d1_app_sessions" | "local_dev_memory";
  permissions: ReturnType<typeof permissionsForRole>;
};

export function unauthenticatedResponse(message = "Authentication required.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function getCurrentUser(request: Request): Promise<CurrentUser | null> {
  const db = await getD1Database();
  const token = readSessionToken(request);
  const session = await lookupServerSession(db, token);
  if (!session) return null;

  const name = `${session.firstName || ""} ${session.lastName || ""}`.trim();

  return {
    sessionId: session.sessionId,
    userId: session.userId,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    name,
    organizationId: session.organizationId,
    organizationName: session.organizationName,
    role: session.role,
    roleLabel: roleLabel(session.role),
    environmentMode: session.environmentMode,
    expiresAt: session.expiresAt,
    sessionSource: session.sessionSource,
    permissions: permissionsForRole(session.role),
  };
}
