import { NextResponse } from "next/server";
import { createId, getD1Database } from "../../../../src/lib/cloudflare-db";
import { formatImportValidationSummary, validateImportRows } from "../../../../src/lib/import-validation";
import {
  canManageLifecycle,
  normalizeLifecycleNote,
  normalizeLifecycleReason,
} from "../../../../src/lib/lead-management";
import { requireWorkflowOrganization } from "../../../../src/lib/workflow-auth";

export const dynamic = "force-dynamic";

function envName(input?: string) {
  return String(input || process.env.APP_ENV || "demo").toLowerCase().replaceAll("_", "-");
}

async function hasColumn(db: any, table: string, column: string) {
  const result = await db.prepare(`PRAGMA table_info(${table})`).all();
  return (result.results || []).some((row: any) => row.name === column);
}

async function importLifecycleColumnsAvailable(db: any) {
  return (await hasColumn(db, "import_batches", "status")) && (await hasColumn(db, "import_batches", "archived_at"));
}

async function leadLifecycleColumnsAvailable(db: any) {
  return await hasColumn(db, "leads", "archived_at");
}

async function writeAuditLog(db: any, input: {
  actorUserId: string;
  organizationId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
}) {
  await db.prepare(`
    INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(createId("audit"), input.actorUserId, input.organizationId, input.action, input.targetType, input.targetId, JSON.stringify(input.metadata)).run();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowAuth = await requireWorkflowOrganization(request, searchParams.get("organization_id"));
    if (workflowAuth.response) return workflowAuth.response;
    const db = await getD1Database();
    if (!db) return NextResponse.json({ status: "local", imports: [] });

    const environment = envName(searchParams.get("environment") || undefined);
    const includeArchived = searchParams.get("include_archived") === "true";
    const lifecycleColumns = await importLifecycleColumnsAvailable(db);
    const leadLifecycleColumns = await leadLifecycleColumnsAvailable(db);
    const archivedSelect = lifecycleColumns
      ? "ib.status, ib.completed_at, ib.archived_at, ib.archive_reason, ib.restored_at, ib.restore_reason,"
      : "'completed' AS status, NULL AS completed_at, NULL AS archived_at, NULL AS archive_reason, NULL AS restored_at, NULL AS restore_reason,";
    const archiveFilter = lifecycleColumns && !includeArchived ? "AND ib.archived_at IS NULL AND COALESCE(ib.status, 'completed') != 'archived'" : "";
    const result = await db.prepare(`
      SELECT
        ib.id,
        ib.file_name,
        ib.source_type,
        ib.total_records,
        ib.created_at,
        ${archivedSelect}
        COUNT(l.id) AS lead_count,
        SUM(CASE WHEN ${leadLifecycleColumns ? "l.archived_at IS NOT NULL OR" : ""} UPPER(COALESCE(l.validation_status, '')) = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived_lead_count
      FROM import_batches ib
      LEFT JOIN leads l ON l.import_batch_id = ib.id AND l.organization_id = ib.organization_id AND l.environment = ib.environment
      WHERE ib.organization_id = ? AND ib.environment = ? ${archiveFilter}
      GROUP BY ib.id
      ORDER BY ib.created_at DESC
      LIMIT 50
    `).bind(workflowAuth.organizationId, environment).all();
    const audit = await db.prepare(`
      SELECT action, target_type, target_id, metadata, created_at
      FROM audit_log
      WHERE organization_id = ?
        AND action IN ('IMPORT_STAGED_CANCELED', 'IMPORT_ARCHIVED', 'IMPORT_RESTORED', 'LEAD_ARCHIVED', 'LEAD_RESTORED')
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(workflowAuth.organizationId).all();

    return NextResponse.json({
      status: "success",
      imports: result.results || [],
      audit: (audit.results || []).map((row: any) => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : {},
      })),
      environment,
      lifecycleColumns,
    });
  } catch {
    return NextResponse.json({ status: "local", imports: [], warning: "Import database table is not available." });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workflowAuth = await requireWorkflowOrganization(request, body.organization_id);
  if (workflowAuth.response) return workflowAuth.response;
  const db = await getD1Database();
  const orgId = workflowAuth.organizationId;
  const userId = workflowAuth.currentUser.userId;
  const environment = envName(body.environment);
  const batchId = createId("batch");
  const rows = Array.isArray(body.records) ? body.records : [];
  const validation = validateImportRows({
    mapping: body.mapping || {},
    records: rows,
  });

  if (!validation.valid) {
    return NextResponse.json({
      status: "error",
      error: formatImportValidationSummary(validation),
      validation,
    }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({
      status: "local",
      message: "Database unavailable in local dev; browser fallback active.",
      batch_id: batchId,
      validation,
    });
  }

  try {
    const lifecycleColumns = await importLifecycleColumnsAvailable(db);
    const batchInsert = lifecycleColumns
      ? db.prepare(`
          INSERT INTO import_batches (
            id, organization_id, user_id, environment, file_name, source_type, mapping_json,
            offer_id, playbook_name, total_records, status, completed_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(batchId, orgId, userId, environment, body.file_name || "upload.csv", "CSV", JSON.stringify(body.mapping || {}), body.offer_id || null, body.playbook_name || null, rows.length)
      : db.prepare(`
          INSERT INTO import_batches (id, organization_id, user_id, environment, file_name, source_type, mapping_json, offer_id, playbook_name, total_records)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(batchId, orgId, userId, environment, body.file_name || "upload.csv", "CSV", JSON.stringify(body.mapping || {}), body.offer_id || null, body.playbook_name || null, rows.length);
    const statements = [
      batchInsert,
      db.prepare(`
        INSERT INTO analytics_events (id, organization_id, user_id, environment, event_name, metadata)
        VALUES (?, ?, ?, ?, 'IMPORT_BATCH_CREATED', ?)
      `).bind(createId("evt"), orgId, userId, environment, JSON.stringify({ batchId, count: rows.length })),
    ];

    for (const row of rows) {
      const leadId = row._lead_id || createId("lead");
      const draftId = row._draft_id || createId("draft");
      statements.push(db.prepare(`
        INSERT OR REPLACE INTO leads (
          id, organization_id, user_id, environment, import_batch_id, source_row_id, contact_name, contact_email,
          business_name, company, product, do_not_contact, validation_status, offer_id, offer_name, playbook_name,
          standard_fields_json, custom_fields_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        leadId, orgId, userId, environment, batchId, row._standard_fields?.["Source Row ID"] || row._id || null,
        row._name || null, row._email || null, row._company || null, row._company || null, row._product || null,
        row._dnc ? 1 : 0, row._status === "Needs Revision" ? "NEEDS_REVIEW" : "VALID",
        row._offer_id || body.offer_id || null, row._ai_context?.offerUsed || body.offer_name || null,
        row._ai_context?.campaignPlaybookUsed || body.playbook_name || null,
        JSON.stringify(row._standard_fields || {}), JSON.stringify(row._custom_fields || {})
      ));
      statements.push(db.prepare(`
        INSERT OR REPLACE INTO drafts (
          id, organization_id, lead_id, subject, subject_line_2, preview_text, body, qa_score, spam_risk,
          approval_status, version, revision_count, offer_id, offer_name, playbook_name, ai_context_json, environment, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        draftId, orgId, leadId, row._subject || null, row._subject2 || null, row._preview || null, row._body || null,
        row._score || null, row._spam || "Low", row._status === "Approved" ? "APPROVED" : "PENDING",
        1, row._revision_count || 0, row._offer_id || body.offer_id || null, row._ai_context?.offerUsed || body.offer_name || null,
        row._ai_context?.campaignPlaybookUsed || body.playbook_name || null, JSON.stringify(row._ai_context || {}), environment
      ));
    }

    await db.batch(statements);
    const needsReview = rows.filter((row: any) => row._status === "Needs Revision" || row._dnc || !row._email || !row._company).length;
    return NextResponse.json({
      status: "success",
      batch_id: batchId,
      records_saved: rows.length,
      summary: {
        total_rows: rows.length,
        created: rows.length,
        updated: 0,
        duplicates: 0,
        needs_review: Math.max(needsReview, validation.warnings.length),
        failed: 0,
      },
      validation,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", error: error.message || "Could not save import." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workflowAuth = await requireWorkflowOrganization(request, body.organization_id);
  if (workflowAuth.response) return workflowAuth.response;

  const action = String(body.action || "").trim();
  const reason = normalizeLifecycleReason(body.reason);
  if (!reason) {
    return NextResponse.json({ status: "error", error: "A lifecycle reason is required." }, { status: 400 });
  }

  const db = await getD1Database();
  if (!db) return NextResponse.json({ status: "local", error: "Database unavailable." }, { status: 503 });

  const environment = envName(body.environment);
  if (action === "cancel_staged") {
    const note = normalizeLifecycleNote(body.note);
    const targetId = createId("staged_import");
    await writeAuditLog(db, {
      actorUserId: workflowAuth.currentUser.userId,
      organizationId: workflowAuth.organizationId,
      action: "IMPORT_STAGED_CANCELED",
      targetType: "STAGED_IMPORT",
      targetId,
      metadata: {
        previousState: "staged",
        nextState: "canceled",
        reason,
        note,
        fileName: String(body.file_name || "").slice(0, 120) || null,
        recordCount: Number(body.record_count || 0),
        persistedRecords: false,
      },
    });
    return NextResponse.json({ status: "success", canceled: true, targetId });
  }

  if (!canManageLifecycle(workflowAuth.currentUser.role)) {
    return NextResponse.json({ status: "error", error: "Forbidden." }, { status: 403 });
  }

  if (action === "cancel") {
    return NextResponse.json({ status: "error", error: "Completed imports cannot be canceled. Archive or restore only." }, { status: 409 });
  }
  if (action !== "archive" && action !== "restore") {
    return NextResponse.json({ status: "error", error: "Unsupported import lifecycle action." }, { status: 400 });
  }

  const batchId = String(body.id || body.batch_id || "").trim();
  if (!batchId) return NextResponse.json({ status: "error", error: "Import batch id is required." }, { status: 400 });

  const lifecycleColumns = await importLifecycleColumnsAvailable(db);
  if (!lifecycleColumns) {
    return NextResponse.json({ status: "error", error: "Import lifecycle fields are not available in this database." }, { status: 409 });
  }

  const existing = await db.prepare(`
    SELECT * FROM import_batches
    WHERE id = ? AND organization_id = ? AND environment = ?
  `).bind(batchId, workflowAuth.organizationId, environment).first() as any;
  if (!existing) return NextResponse.json({ status: "error", error: "Import batch not found." }, { status: 404 });

  const counts = await db.prepare(`
    SELECT
      COUNT(*) AS lead_count,
      SUM(CASE WHEN archived_at IS NOT NULL OR UPPER(COALESCE(validation_status, '')) = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived_lead_count
    FROM leads
    WHERE import_batch_id = ? AND organization_id = ? AND environment = ?
  `).bind(batchId, workflowAuth.organizationId, environment).first() as any;
  const previousState = existing.archived_at || existing.status === "archived" ? "archived" : "completed";
  const nextState = action === "archive" ? "archived" : "completed";
  const note = normalizeLifecycleNote(body.note);

  const update = action === "archive"
    ? db.prepare(`
        UPDATE import_batches
        SET status = 'archived', archived_at = CURRENT_TIMESTAMP, archived_by = ?, archive_reason = ?,
            restored_at = NULL, restored_by = NULL, restore_reason = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND organization_id = ? AND environment = ?
      `).bind(workflowAuth.currentUser.userId, reason, batchId, workflowAuth.organizationId, environment)
    : db.prepare(`
        UPDATE import_batches
        SET status = 'completed', archived_at = NULL, archived_by = NULL, archive_reason = NULL,
            restored_at = CURRENT_TIMESTAMP, restored_by = ?, restore_reason = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND organization_id = ? AND environment = ?
      `).bind(workflowAuth.currentUser.userId, reason, batchId, workflowAuth.organizationId, environment);
  await update.run();

  await writeAuditLog(db, {
    actorUserId: workflowAuth.currentUser.userId,
    organizationId: workflowAuth.organizationId,
    action: action === "archive" ? "IMPORT_ARCHIVED" : "IMPORT_RESTORED",
    targetType: "IMPORT_BATCH",
    targetId: batchId,
    metadata: {
      batchId,
      previousState,
      nextState,
      reason,
      note,
      affectedLeadCount: Number(counts?.lead_count || 0),
      archivedLeadCount: Number(counts?.archived_lead_count || 0),
      destructiveRollback: false,
      preservedLeadData: true,
    },
  });

  return NextResponse.json({ status: "success", archived: action === "archive", restored: action === "restore" });
}
