import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

function envName(input?: string) {
  return String(input || process.env.APP_ENV || "demo").toLowerCase();
}

export async function POST(request: Request) {
  const db = await getD1Database();
  const body = await request.json().catch(() => ({}));
  const orgId = body.organization_id || "org_demo";
  const userId = body.user_id || "user_super_admin";
  const environment = envName(body.environment);
  const batchId = createId("batch");
  const rows = Array.isArray(body.records) ? body.records : [];

  if (!db) {
    return NextResponse.json({ status: "local", message: "Database unavailable in local dev; browser fallback active.", batch_id: batchId });
  }

  try {
    const statements = [
      db.prepare(`
        INSERT INTO import_batches (id, organization_id, user_id, environment, file_name, source_type, mapping_json, offer_id, playbook_name, total_records)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(batchId, orgId, userId, environment, body.file_name || "upload.csv", "CSV", JSON.stringify(body.mapping || {}), body.offer_id || null, body.playbook_name || null, rows.length),
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
        needs_review: needsReview,
        failed: 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", error: error.message || "Could not save import." }, { status: 500 });
  }
}
