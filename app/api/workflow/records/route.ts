import { NextResponse } from "next/server";
import { createId, getD1Database } from "../../../../src/lib/cloudflare-db";
import {
  leadEmailStatus,
  leadSortSql,
  canManageLifecycle,
  cleanLeadDisplayValue,
  draftEligibility,
  leadValidationIssues,
  normalizeLeadPage,
  normalizeLeadPageSize,
  normalizeLifecycleNote,
  normalizeLifecycleReason,
  normalizeLeadSortDirection,
  normalizeLeadSortField,
  safeJsonParse,
  sourceLabel,
} from "../../../../src/lib/lead-management";
import { requireWorkflowOrganization } from "../../../../src/lib/workflow-auth";

export const dynamic = "force-dynamic";

function normalizeStatus(row: any) {
  const standard = safeJsonParse(row.standard_fields_json);
  const name = cleanLeadDisplayValue(row.contact_name || standard["Full Name"] || standard["Decision Maker"]);
  const rawEmail = row.contact_email || standard.Email || "";
  const company = cleanLeadDisplayValue(row.company || row.business_name || standard["Company Name"] || standard["Business Name"]);
  if (row.do_not_contact) return "Do Not Contact";
  if (leadEmailStatus(rawEmail) === "Missing") return "Missing Email";
  if (leadEmailStatus(rawEmail) === "Malformed") return "Needs Review";
  if (!company) return "Missing Company";
  if (!name) return "Needs Review";
  if (String(row.validation_status || "").toUpperCase().includes("NEEDS")) return "Needs Review";
  return "Ready";
}

function envName(input?: string | null) {
  return String(input || process.env.APP_ENV || "demo").toLowerCase().replaceAll("_", "-");
}

async function hasColumn(db: any, table: string, column: string) {
  const result = await db.prepare(`PRAGMA table_info(${table})`).all();
  return (result.results || []).some((row: any) => row.name === column);
}

async function leadArchiveColumnsAvailable(db: any) {
  return (await hasColumn(db, "leads", "archived_at")) && (await hasColumn(db, "leads", "archive_reason"));
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

function normalizeLead(row: any, index: number) {
  const standard = safeJsonParse(row.standard_fields_json);
  const custom = safeJsonParse(row.custom_fields_json);
  const rawEmail = row.contact_email || standard.Email || "";
  const rawName = row.contact_name || standard["Full Name"] || standard["Decision Maker"] || standard["First Name"];
  const rawCompany = row.company || row.business_name || standard["Company Name"] || standard["Business Name"];
  const name = cleanLeadDisplayValue(rawName);
  const company = cleanLeadDisplayValue(rawCompany);
  const emailStatus = leadEmailStatus(rawEmail);
  const validationIssues = leadValidationIssues({ name: rawName, email: rawEmail, company: rawCompany, validationStatus: row.validation_status });
  const readiness = draftEligibility({
    name: rawName,
    email: rawEmail,
    company: rawCompany,
    product: row.product || standard["Current Product"] || standard["Current Plan"],
    validationStatus: row.validation_status,
    doNotContact: row.do_not_contact,
    archivedAt: row.archived_at,
  });
  return {
    id: row.id,
    displayId: index + 1,
    name: name || "Missing contact",
    rawName: rawName || "",
    company: company || "Missing business/practice",
    rawCompany: rawCompany || "",
    email: emailStatus === "Valid" ? rawEmail : "",
    rawEmail,
    emailStatus,
    draftReadiness: readiness.status,
    draftReadinessLabel: readiness.label,
    draftReadinessReason: readiness.reason,
    draftReadinessMissing: readiness.missing,
    product: row.product || standard["Current Product"] || standard["Current Plan"] || "",
    renewal: standard["Renewal Date"] || standard["Renewal Month"] || "",
    industry: standard.Industry || custom.Industry || "",
    owner: standard["Owner / Account Manager"] || "",
    status: normalizeStatus(row),
    confidence: normalizeStatus(row) === "Ready" ? 90 : 0,
    upsell: row.offer_name || standard["Upsell Offer"] || "",
    environment: row.environment,
    importBatchId: row.import_batch_id,
    sourceRowId: row.source_row_id,
    sourceFile: row.file_name,
    sourceType: row.source_type,
    sourceLabel: sourceLabel(row, standard),
    validationIssues,
    hasValidationProblems: validationIssues.length > 0,
    importedAt: row.imported_at || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    archiveReason: row.archive_reason,
    restoredAt: row.restored_at,
    restoreReason: row.restore_reason,
    standardFields: standard,
    customFields: custom,
  };
}

async function ensureDraftForReadyLead(db: any, input: {
  leadId: string;
  organizationId: string;
  environment: string;
  actorUserId: string;
  name: string;
  company: string;
  product: string;
  upsell: string;
}) {
  const existing = await db.prepare(`
    SELECT id
    FROM drafts
    WHERE lead_id = ? AND organization_id = ? AND environment = ? AND archived = 0
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 1
  `).bind(input.leadId, input.organizationId, input.environment).first() as any;
  const subject = `${input.name || "Hello"} - a practical next step for ${input.company}`;
  const subject2 = `${input.company}: review ${input.product || "your current plan"}`;
  const preview = `A safe internal test draft for ${input.company}.`;
  const body = [
    `Hi ${input.name || "there"},`,
    "",
    `I wanted to follow up with a practical review of ${input.company}'s current ${input.product || "plan"} setup.`,
    input.upsell ? `One possible next step is ${input.upsell}, but this draft should be reviewed and approved before any mailbox action.` : "This draft should be reviewed and approved before any mailbox action.",
    "",
    "Would it be useful to schedule a short review?",
    "",
    "Best,",
    "Account Growth Team",
  ].join("\n");
  const aiContext = {
    source: "manual_lead_draft_ready_fixture",
    accountContextStatus: "Manual lead",
    finalQaResult: "Needs Review",
    missingContextWarnings: [],
  };
  if (existing?.id) {
    await db.prepare(`
      UPDATE drafts
      SET subject = ?, subject_line_2 = ?, preview_text = ?, body = ?, qa_score = 90,
          spam_risk = 'Low', approval_status = CASE WHEN approval_status = 'APPROVED' THEN approval_status ELSE 'PENDING' END,
          offer_name = ?, ai_context_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND organization_id = ? AND environment = ?
    `).bind(subject, subject2, preview, body, input.upsell || null, JSON.stringify(aiContext), existing.id, input.organizationId, input.environment).run();
    return existing.id;
  }
  const draftId = createId("draft");
  await db.prepare(`
    INSERT INTO drafts (
      id, organization_id, lead_id, subject, subject_line_2, preview_text, body,
      qa_score, spam_risk, approval_status, offer_name, ai_context_json,
      environment, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 90, 'Low', 'PENDING', ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(draftId, input.organizationId, input.leadId, subject, subject2, preview, body, input.upsell || null, JSON.stringify(aiContext), input.environment).run();
  await db.prepare(`
    INSERT INTO analytics_events (id, organization_id, user_id, environment, event_name, metadata)
    VALUES (?, ?, ?, ?, 'MANUAL_LEAD_DRAFT_READY', ?)
  `).bind(createId("evt"), input.organizationId, input.actorUserId, input.environment, JSON.stringify({ leadId: input.leadId, draftId })).run();
  return draftId;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowAuth = await requireWorkflowOrganization(request, searchParams.get("organization_id"));
    if (workflowAuth.response) return workflowAuth.response;
    const db = await getD1Database();
    const orgId = workflowAuth.organizationId;
    const environment = envName(searchParams.get("environment"));
    const page = normalizeLeadPage(searchParams.get("page"));
    const pageSize = normalizeLeadPageSize(searchParams.get("page_size"));
    const sort = normalizeLeadSortField(searchParams.get("sort"));
    const direction = normalizeLeadSortDirection(searchParams.get("direction"));
    const offset = (page - 1) * pageSize;

    if (!db) return NextResponse.json({ status: "local", records: [], total: 0, page, pageSize });

    const includeArchived = searchParams.get("include_archived") === "true";
    const archiveColumns = await leadArchiveColumnsAvailable(db);
    const activeFilter = archiveColumns
      ? " AND l.archived_at IS NULL AND UPPER(COALESCE(l.validation_status, '')) != 'ARCHIVED'"
      : " AND UPPER(COALESCE(l.validation_status, '')) != 'ARCHIVED'";
    const whereSql = `l.organization_id = ? AND l.environment = ?${includeArchived ? "" : activeFilter}`;
    const countResult = await db.prepare(`
      SELECT COUNT(*) AS total
      FROM leads l
      WHERE ${whereSql}
    `).bind(orgId, environment).first() as any;
    const total = Number(countResult?.total || 0);
    const result = await db.prepare(`
      SELECT
        l.*,
        ib.file_name,
        ib.source_type,
        ib.created_at AS imported_at
      FROM leads l
      LEFT JOIN import_batches ib ON ib.id = l.import_batch_id
      WHERE ${whereSql}
      ORDER BY ${leadSortSql(sort)} ${direction.toUpperCase()}, l.updated_at DESC, l.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(orgId, environment, pageSize, offset).all();

    const records = (result.results || []).map((row: any, index: number) => normalizeLead(row, offset + index));

    return NextResponse.json({ status: "success", records, environment, total, page, pageSize, sort, direction });
  } catch {
    return NextResponse.json({ status: "local", records: [], warning: "Records database table is not available." });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workflowAuth = await requireWorkflowOrganization(request, body.organization_id);
  if (workflowAuth.response) return workflowAuth.response;
  const db = await getD1Database();
  if (!db) return NextResponse.json({ status: "local", error: "Database unavailable." }, { status: 503 });

  const email = String(body.email || "").trim();
  if (leadEmailStatus(email) !== "Valid") {
    return NextResponse.json({ status: "error", error: "A valid email is required to add a lead manually." }, { status: 400 });
  }
  const name = String(body.name || "").trim();
  const company = String(body.company || "").trim();
  if (!name && !company) {
    return NextResponse.json({ status: "error", error: "Name or business/practice name is required." }, { status: 400 });
  }

  const environment = envName(body.environment);
  const standardFields = {
    "Full Name": name,
    "Company Name": company,
    Email: email,
    "Current Product": String(body.product || "").trim(),
    "Renewal Date": String(body.renewal || "").trim(),
    Industry: String(body.industry || "").trim(),
    "Owner / Account Manager": String(body.owner || "").trim(),
    "Upsell Offer": String(body.upsell || "").trim(),
    "Lead Source": "Manual entry",
    "Source Timestamp": new Date().toISOString(),
  };
  const leadId = createId("lead");

  await db.prepare(`
    INSERT INTO leads (
      id, organization_id, user_id, environment, source_row_id, contact_name, contact_email,
      business_name, company, product, do_not_contact, validation_status, offer_name,
      standard_fields_json, custom_fields_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'VALID', ?, ?, '{}', CURRENT_TIMESTAMP)
  `).bind(
    leadId,
    workflowAuth.organizationId,
    workflowAuth.currentUser.userId,
    environment,
    "manual-entry",
    name || null,
    email,
    company || null,
    company || null,
    standardFields["Current Product"] || null,
    standardFields["Upsell Offer"] || null,
    JSON.stringify(standardFields),
  ).run();

  const readiness = draftEligibility({
    name,
    email,
    company,
    product: standardFields["Current Product"],
    validationStatus: "VALID",
  });
  let draftId: string | null = null;
  if (readiness.ready) {
    draftId = await ensureDraftForReadyLead(db, {
      leadId,
      organizationId: workflowAuth.organizationId,
      environment,
      actorUserId: workflowAuth.currentUser.userId,
      name,
      company,
      product: standardFields["Current Product"],
      upsell: standardFields["Upsell Offer"],
    });
  }

  await db.prepare(`
    INSERT INTO analytics_events (id, organization_id, user_id, environment, event_name, metadata)
    VALUES (?, ?, ?, ?, 'LEAD_MANUAL_CREATED', ?)
  `).bind(createId("evt"), workflowAuth.organizationId, workflowAuth.currentUser.userId, environment, JSON.stringify({ leadId })).run();

  return NextResponse.json({ status: "success", leadId, draftId, draftReadiness: readiness });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workflowAuth = await requireWorkflowOrganization(request, body.organization_id);
  if (workflowAuth.response) return workflowAuth.response;
  const db = await getD1Database();
  if (!db) return NextResponse.json({ status: "local", error: "Database unavailable." }, { status: 503 });

  const leadId = String(body.id || "").trim();
  if (!leadId) return NextResponse.json({ status: "error", error: "Lead id is required." }, { status: 400 });
  const environment = envName(body.environment);
  const existing = await db.prepare(`
    SELECT * FROM leads
    WHERE id = ? AND organization_id = ? AND environment = ?
  `).bind(leadId, workflowAuth.organizationId, environment).first() as any;
  if (!existing) return NextResponse.json({ status: "error", error: "Lead not found." }, { status: 404 });

  if (body.action === "archive" || body.action === "restore") {
    if (!canManageLifecycle(workflowAuth.currentUser.role)) {
      return NextResponse.json({ status: "error", error: "Forbidden." }, { status: 403 });
    }
    const reason = normalizeLifecycleReason(body.reason);
    if (!reason) {
      return NextResponse.json({ status: "error", error: "A lifecycle reason is required." }, { status: 400 });
    }
    const note = normalizeLifecycleNote(body.note);
    const archiveColumns = await leadArchiveColumnsAvailable(db);
    const action = body.action === "archive" ? "archive" : "restore";
    const previousState = existing.archived_at || String(existing.validation_status || "").toUpperCase() === "ARCHIVED" ? "archived" : "active";
    const nextState = action === "archive" ? "archived" : "active";
    const update = action === "archive"
      ? archiveColumns
        ? db.prepare(`
            UPDATE leads
            SET archived_at = CURRENT_TIMESTAMP, archived_by = ?, archive_reason = ?,
                restored_at = NULL, restored_by = NULL, restore_reason = NULL,
                validation_status = CASE WHEN UPPER(COALESCE(validation_status, '')) = 'ARCHIVED' THEN 'VALID' ELSE validation_status END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND organization_id = ? AND environment = ?
          `).bind(workflowAuth.currentUser.userId, reason, leadId, workflowAuth.organizationId, environment)
        : db.prepare(`
            UPDATE leads
            SET validation_status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND organization_id = ? AND environment = ?
          `).bind(leadId, workflowAuth.organizationId, environment)
      : archiveColumns
        ? db.prepare(`
            UPDATE leads
            SET archived_at = NULL, archived_by = NULL, archive_reason = NULL,
                restored_at = CURRENT_TIMESTAMP, restored_by = ?, restore_reason = ?,
                validation_status = CASE WHEN UPPER(COALESCE(validation_status, '')) = 'ARCHIVED' THEN 'VALID' ELSE validation_status END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND organization_id = ? AND environment = ?
          `).bind(workflowAuth.currentUser.userId, reason, leadId, workflowAuth.organizationId, environment)
        : db.prepare(`
            UPDATE leads
            SET validation_status = 'VALID', updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND organization_id = ? AND environment = ?
          `).bind(leadId, workflowAuth.organizationId, environment);

    await update.run();
    await writeAuditLog(db, {
      actorUserId: workflowAuth.currentUser.userId,
      organizationId: workflowAuth.organizationId,
      action: action === "archive" ? "LEAD_ARCHIVED" : "LEAD_RESTORED",
      targetType: "LEAD",
      targetId: leadId,
      metadata: {
        leadId,
        importBatchId: existing.import_batch_id || null,
        sourceRowId: existing.source_row_id || null,
        previousState,
        nextState,
        reason,
        note,
        archiveColumns,
        preservedDraftRelations: true,
        preservedSourceLinkage: true,
      },
    });
    return NextResponse.json({ status: "success", archived: action === "archive", restored: action === "restore" });
  }

  const email = String(body.email || "").trim();
  if (leadEmailStatus(email) !== "Valid") {
    return NextResponse.json({ status: "error", error: "A valid email is required before saving lead changes." }, { status: 400 });
  }
  const name = String(body.name || "").trim();
  const company = String(body.company || "").trim();
  if (!name && !company) {
    return NextResponse.json({ status: "error", error: "Name or business/practice name is required." }, { status: 400 });
  }

  const standard = {
    ...safeJsonParse(existing.standard_fields_json),
    "Full Name": name,
    "Company Name": company,
    Email: email,
    "Current Product": String(body.product || "").trim(),
    "Renewal Date": String(body.renewal || "").trim(),
    Industry: String(body.industry || "").trim(),
    "Owner / Account Manager": String(body.owner || "").trim(),
    "Upsell Offer": String(body.upsell || "").trim(),
    "Edited Timestamp": new Date().toISOString(),
  };

  await db.batch([
    db.prepare(`
      UPDATE leads
      SET contact_name = ?, contact_email = ?, business_name = ?, company = ?, product = ?,
          offer_name = ?, validation_status = 'VALID', standard_fields_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND organization_id = ? AND environment = ?
    `).bind(name || null, email, company || null, company || null, standard["Current Product"] || null, standard["Upsell Offer"] || null, JSON.stringify(standard), leadId, workflowAuth.organizationId, environment),
    db.prepare(`
      INSERT INTO analytics_events (id, organization_id, user_id, environment, event_name, metadata)
      VALUES (?, ?, ?, ?, 'LEAD_UPDATED', ?)
    `).bind(createId("evt"), workflowAuth.organizationId, workflowAuth.currentUser.userId, environment, JSON.stringify({ leadId, sourcePreserved: Boolean(existing.import_batch_id || existing.source_row_id) })),
  ]);

  const readiness = draftEligibility({
    name,
    email,
    company,
    product: standard["Current Product"],
    validationStatus: "VALID",
  });
  let draftId: string | null = null;
  if (readiness.ready) {
    draftId = await ensureDraftForReadyLead(db, {
      leadId,
      organizationId: workflowAuth.organizationId,
      environment,
      actorUserId: workflowAuth.currentUser.userId,
      name,
      company,
      product: standard["Current Product"],
      upsell: standard["Upsell Offer"],
    });
  }

  return NextResponse.json({ status: "success", leadId, draftId, draftReadiness: readiness });
}
