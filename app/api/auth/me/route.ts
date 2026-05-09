import { NextResponse } from "next/server";
import { getD1Database } from "@/lib/cloudflare-db";
import { normalizeRole, permissionsForRole, roleLabel } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const email = searchParams.get("email");
  const fallbackRole = normalizeRole(searchParams.get("role"));
  try {
    const db = await getD1Database();

    if (!db) {
      return NextResponse.json({
        user_id: userId || null,
        email: email || null,
        role: fallbackRole,
        role_label: roleLabel(fallbackRole),
        organization_id: searchParams.get("organization_id") || null,
        organization_name: null,
        permissions: permissionsForRole(fallbackRole),
        session_source: "local_fallback",
      });
    }

    const row: any = await db.prepare(`
      SELECT
        u.id AS user_id,
        u.email,
        m.role,
        m.organization_id,
        o.name AS organization_name
      FROM users u
      LEFT JOIN memberships m ON m.user_id = u.id AND m.status = 'ACTIVE'
      LEFT JOIN organizations o ON o.id = m.organization_id
      WHERE (? IS NOT NULL AND u.id = ?) OR (? IS NOT NULL AND u.email = ?)
      ORDER BY CASE WHEN m.role = 'SUPER_ADMIN' THEN 0 ELSE 1 END
      LIMIT 1
    `).bind(userId, userId, email, email).first();

    if (!row) {
      return NextResponse.json({ error: "Current user was not found." }, { status: 404 });
    }

    const normalizedRole = normalizeRole(row.role);
    return NextResponse.json({
      user_id: row.user_id,
      email: row.email,
      role: normalizedRole,
      role_label: roleLabel(normalizedRole),
      organization_id: row.organization_id,
      organization_name: row.organization_name,
      permissions: permissionsForRole(normalizedRole),
      session_source: "d1_membership",
    });
  } catch {
    return NextResponse.json({
      user_id: userId || null,
      email: email || null,
      role: fallbackRole,
      role_label: roleLabel(fallbackRole),
      organization_id: searchParams.get("organization_id") || null,
      organization_name: null,
      permissions: permissionsForRole(fallbackRole),
      session_source: "local_fallback_error",
    });
  }
}
