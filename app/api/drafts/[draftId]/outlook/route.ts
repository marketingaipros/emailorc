import { NextResponse } from "next/server";
import { createId, getD1Database } from "../../../../../src/lib/cloudflare-db";
import { requireWorkflowOrganization } from "../../../../../src/lib/workflow-auth";
import { MICROSOFT_ENCRYPTION_CONFIG_ERROR } from "../../../../../src/lib/microsoft/crypto";
import {
  getMicrosoftConnection,
  getUsableMicrosoftAccessToken,
  writeMicrosoftAudit,
} from "../../../../../src/lib/microsoft/connections";
import { postMicrosoftGraphDraft, validateOutlookDraftInput } from "../../../../../src/lib/microsoft/graph";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { draftId: string };
};

export async function POST(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => ({}));
  const workflowAuth = await requireWorkflowOrganization(request, body.organization_id);
  if (workflowAuth.response) return workflowAuth.response;

  const db = await getD1Database();
  if (!db) return NextResponse.json({ error: "Outlook draft creation requires D1 storage." }, { status: 503 });

  const orgId = workflowAuth.organizationId;
  const currentUser = workflowAuth.currentUser;
  const draftId = String(context.params.draftId || "").trim();
  if (!draftId) return NextResponse.json({ error: "Draft is required." }, { status: 400 });

  const row: any = await db.prepare(`
    SELECT
      d.id,
      d.subject,
      d.subject_line_2,
      d.body,
      d.approval_status,
      d.archived,
      l.contact_email,
      l.contact_name
    FROM drafts d
    LEFT JOIN leads l ON l.id = d.lead_id
    WHERE d.id = ? AND d.organization_id = ?
    LIMIT 1
  `).bind(draftId, orgId).first().catch(() => null);

  if (!row) return NextResponse.json({ error: "Draft was not found." }, { status: 404 });
  if (row.approval_status !== "APPROVED" || Number(row.archived || 0) === 1) {
    await writeMicrosoftAudit({
      db,
      currentUser,
      action: "OUTLOOK_DRAFT_CREATE_FAILED",
      targetType: "DRAFT",
      targetId: draftId,
      metadata: { provider: "microsoft_outlook", category: "draft_not_approved" },
    }).catch(() => null);
    return NextResponse.json({ error: "Only approved drafts can be created in Outlook." }, { status: 400 });
  }

  const draftInput = {
    recipientEmail: String(row.contact_email || body.recipient_email || ""),
    recipientName: String(row.contact_name || body.recipient_name || ""),
    subject: String(row.subject || row.subject_line_2 || body.subject || ""),
    body: String(row.body || body.body || ""),
  };
  const validation = validateOutlookDraftInput(draftInput);
  if (validation) {
    await writeMicrosoftAudit({
      db,
      currentUser,
      action: "OUTLOOK_DRAFT_CREATE_FAILED",
      targetType: "DRAFT",
      targetId: draftId,
      metadata: { provider: "microsoft_outlook", category: "invalid_draft_input" },
    }).catch(() => null);
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const connection = await getMicrosoftConnection(db, currentUser);
  if (!connection || connection.reconnectRequiredAt) {
    await writeMicrosoftAudit({
      db,
      currentUser,
      action: "OUTLOOK_DRAFT_CREATE_FAILED",
      targetType: "DRAFT",
      targetId: draftId,
      metadata: { provider: "microsoft_outlook", category: "reconnect_required" },
    }).catch(() => null);
    return NextResponse.json({ error: "Reconnect Outlook before creating a draft." }, { status: 409 });
  }

  const deliveryId = createId("outlook_delivery");
  try {
    const accessToken = await getUsableMicrosoftAccessToken({ db, connection });
    const graphDraft = await postMicrosoftGraphDraft({ accessToken, draft: draftInput });

    await db.batch([
      db.prepare(`
        INSERT INTO outlook_draft_deliveries (
          id,
          emailorc_draft_id,
          organization_id,
          user_id,
          connection_id,
          provider,
          provider_message_id,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'microsoft_outlook', ?, 'CREATED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(emailorc_draft_id, connection_id)
        DO UPDATE SET provider_message_id = excluded.provider_message_id, status = 'CREATED', error_category = NULL, updated_at = CURRENT_TIMESTAMP
      `).bind(deliveryId, draftId, orgId, currentUser.userId, connection.id, graphDraft.id || null),
      db.prepare(`
        UPDATE integration_connections
        SET last_success_at = CURRENT_TIMESTAMP, reconnect_required_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(connection.id),
      db.prepare(`
        INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
        VALUES (?, ?, ?, 'OUTLOOK_DRAFT_CREATED', 'DRAFT', ?, ?)
      `).bind(createId("audit"), currentUser.userId, orgId, draftId, JSON.stringify({
        provider: "microsoft_outlook",
        deliveryId,
        providerMessageId: graphDraft.id || null,
        status: "CREATED",
      })),
    ]);

    return NextResponse.json({
      status: "created",
      draftId,
      provider: "microsoft_outlook",
      providerMessageId: graphDraft.id || null,
    });
  } catch (error) {
    const category = error instanceof Error && error.message === MICROSOFT_ENCRYPTION_CONFIG_ERROR
      ? "configuration_required"
      : error instanceof Error && error.message === "reconnect_required"
        ? "reconnect_required"
        : "graph_create_failed";
    await db.batch([
      db.prepare(`
        INSERT INTO outlook_draft_deliveries (
          id,
          emailorc_draft_id,
          organization_id,
          user_id,
          connection_id,
          provider,
          status,
          error_category,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'microsoft_outlook', 'FAILED', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(emailorc_draft_id, connection_id)
        DO UPDATE SET status = 'FAILED', error_category = excluded.error_category, updated_at = CURRENT_TIMESTAMP
      `).bind(deliveryId, draftId, orgId, currentUser.userId, connection.id, category),
      db.prepare(`
        INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
        VALUES (?, ?, ?, 'OUTLOOK_DRAFT_CREATE_FAILED', 'DRAFT', ?, ?)
      `).bind(createId("audit"), currentUser.userId, orgId, draftId, JSON.stringify({
        provider: "microsoft_outlook",
        category,
      })),
    ]).catch(() => null);

    return NextResponse.json({
      error: category === "configuration_required"
        ? "Microsoft encryption configuration is required."
        : category === "reconnect_required"
          ? "Reconnect Outlook before creating a draft."
          : "Could not create Outlook draft.",
    }, { status: category === "reconnect_required" ? 409 : category === "configuration_required" ? 503 : 502 });
  }
}
