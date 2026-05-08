import { NextResponse } from "next/server";
import { getD1Database } from "@/lib/cloudflare-db";
import { createInviteForD1 } from "@/lib/admin/invite-service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = await getD1Database();
  if (!db) return NextResponse.json({ error: "Invite links require Cloudflare D1 storage." }, { status: 503 });

  const user = await db.prepare(`
    SELECT u.id, u.email, u.first_name, m.organization_id, o.name AS organization_name
    FROM users u
    LEFT JOIN memberships m ON m.user_id = u.id
    LEFT JOIN organizations o ON o.id = m.organization_id
    WHERE u.id = ?
    LIMIT 1
  `).bind(params.id).first();

  if (!user?.id || !user.email || !user.organization_id) {
    return NextResponse.json({ error: "User or organization missing for invite." }, { status: 404 });
  }

  const invite = await createInviteForD1({
    db,
    request,
    userId: user.id,
    organizationId: user.organization_id,
    organizationName: user.organization_name,
    email: user.email,
    firstName: user.first_name,
  });

  return NextResponse.json({ success: true, ...invite });
}
