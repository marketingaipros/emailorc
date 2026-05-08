import { randomUUID } from "node:crypto";
import { createId } from "@/lib/cloudflare-db";
import { inviteUrl, sendInviteEmail } from "@/lib/email/invites";

export async function createInviteForD1(params: {
  db: any;
  request: Request;
  userId: string;
  organizationId: string;
  organizationName?: string;
  email: string;
  firstName?: string;
}) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const url = inviteUrl(token, params.request);
  const emailResult = await sendInviteEmail({
    to: params.email,
    firstName: params.firstName,
    organizationName: params.organizationName,
    inviteUrl: url,
    expiresAt,
  });
  const inviteStatus = emailResult.sent ? "SENT" : "CREATED";
  const sentAt = emailResult.sent ? new Date().toISOString() : null;
  const safeError = emailResult.sent ? null : emailResult.safeError || "email_provider_not_configured";

  await params.db.batch([
    params.db.prepare(`
      INSERT INTO invite_tokens (
        id, user_id, organization_id, email, token, invite_url, status, email_provider,
        email_accepted, safe_error, expires_at, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      createId("invite"),
      params.userId,
      params.organizationId,
      params.email,
      token,
      url,
      inviteStatus,
      emailResult.provider,
      emailResult.sent ? 1 : 0,
      safeError,
      expiresAt,
      sentAt,
    ),
    params.db.prepare(`
      UPDATE users
      SET status = 'INVITED',
          invite_status = ?,
          invite_token = ?,
          invite_expires_at = ?,
          invite_sent_at = ?,
          invite_error = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(emailResult.sent ? "SENT" : "FAILED", token, expiresAt, sentAt, safeError, params.userId),
    params.db.prepare(`
      INSERT INTO audit_log (id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'USER', ?, ?)
    `).bind(
      createId("audit"),
      emailResult.sent ? "SEND_INVITE" : "CREATE_MANUAL_INVITE",
      params.userId,
      JSON.stringify({ email: params.email, organizationId: params.organizationId, inviteUrl: url, provider: emailResult.provider, safeError }),
    ),
  ]);

  return {
    email_sent: emailResult.sent,
    invite_status: emailResult.sent ? "SENT" : "FAILED",
    invite_url: url,
    invite_expires_at: expiresAt,
    email_provider: emailResult.provider,
    safe_error: safeError,
    message: emailResult.sent ? "Invite email sent." : "Invite link created. Email delivery is not configured yet.",
  };
}
