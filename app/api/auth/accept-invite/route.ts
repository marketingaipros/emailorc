import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = await getD1Database();
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!db) return NextResponse.json({ valid: false, error: "Invite validation requires Cloudflare D1." }, { status: 503 });
  const invite = await db.prepare(`
    SELECT it.*, u.first_name, u.last_name, u.email, o.name AS organization_name
    FROM invite_tokens it
    JOIN users u ON u.id = it.user_id
    LEFT JOIN organizations o ON o.id = it.organization_id
    WHERE it.token = ?
  `).bind(token).first();
  if (!invite) return NextResponse.json({ valid: false, error: "Invite token not found." }, { status: 404 });
  if (invite.accepted_at) return NextResponse.json({ valid: false, error: "Invite already accepted." }, { status: 400 });
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await db.prepare("UPDATE invite_tokens SET status = 'EXPIRED' WHERE token = ?").bind(token).run();
    await db.prepare("UPDATE users SET invite_status = 'EXPIRED', invite_error = 'Invite expired' WHERE id = ?").bind(invite.user_id).run();
    return NextResponse.json({ valid: false, error: "Invite expired." }, { status: 400 });
  }
  return NextResponse.json({
    valid: true,
    email: invite.email,
    firstName: invite.first_name,
    lastName: invite.last_name,
    organizationName: invite.organization_name,
    expiresAt: invite.expires_at,
  });
}

export async function POST(request: Request) {
  const db = await getD1Database();
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (!db) return NextResponse.json({ success: false, error: "Invite acceptance requires Cloudflare D1." }, { status: 503 });
  if (!token || password.length < 8) return NextResponse.json({ success: false, error: "Invite token and password are required." }, { status: 400 });

  const invite = await db.prepare("SELECT * FROM invite_tokens WHERE token = ?").bind(token).first();
  if (!invite) return NextResponse.json({ success: false, error: "Invite token not found." }, { status: 404 });
  if (invite.accepted_at) return NextResponse.json({ success: false, error: "Invite already accepted." }, { status: 400 });
  if (new Date(invite.expires_at).getTime() < Date.now()) return NextResponse.json({ success: false, error: "Invite expired." }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  const acceptedAt = new Date().toISOString();
  await db.batch([
    db.prepare("UPDATE users SET password_hash = ?, status = 'ACTIVE', invite_status = 'ACCEPTED', invite_accepted_at = ?, require_password_reset = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(passwordHash, acceptedAt, invite.user_id),
    db.prepare("UPDATE invite_tokens SET status = 'ACCEPTED', accepted_at = ? WHERE token = ?")
      .bind(acceptedAt, token),
  ]);

  return NextResponse.json({ success: true, message: "Invite accepted. You can now log in." });
}
