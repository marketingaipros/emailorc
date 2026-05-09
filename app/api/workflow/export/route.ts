import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const db = await getD1Database();
  const body = await request.json().catch(() => ({}));
  const orgId = body.organization_id || "org_demo";
  const userId = body.user_id || "user_super_admin";
  const environment = String(body.environment || process.env.APP_ENV || "demo").toLowerCase().replaceAll("_", "-");
  const format = body.format || "CSV";

  if (!db) return NextResponse.json({ status: "local", rows: [], export_batch_id: createId("export") });

  const result = await db.prepare(`
    WITH ranked AS (
      SELECT
        d.*,
        l.contact_name,
        l.contact_email,
        l.company,
        l.product,
        l.do_not_contact,
        ROW_NUMBER() OVER (
          PARTITION BY COALESCE(d.lead_id, l.contact_email)
          ORDER BY d.version DESC, d.updated_at DESC, d.created_at DESC
        ) as rn
      FROM drafts d
      LEFT JOIN leads l ON l.id = d.lead_id
      WHERE d.organization_id = ?
        AND d.environment = ?
        AND d.approval_status = 'APPROVED'
        AND d.archived = 0
        AND COALESCE(l.do_not_contact, 0) = 0
    )
    SELECT * FROM ranked WHERE rn = 1
  `).bind(orgId, environment).all();

  const seenEmails = new Set<string>();
  const rows = (result.results || []).filter((row: any) => {
    const email = String(row.contact_email || "").toLowerCase();
    if (!email) return true;
    if (seenEmails.has(email)) return false;
    seenEmails.add(email);
    return true;
  }).map((row: any) => ({
    draft_id: row.id,
    record_id: row.lead_id,
    name: row.contact_name || "",
    company: row.company || "",
    email: row.contact_email || "",
    subject: row.subject || "",
    subject_2: row.subject_line_2 || "",
    body: row.body || "",
    qa_score: row.qa_score || "",
    status: "Approved",
  }));

  const exportBatchId = createId("export");
  const exportKey = rows.map((row: any) => `${orgId}:${row.record_id}:${row.draft_id}`).join("|") || `${orgId}:${environment}:empty`;
  await db.batch([
    db.prepare(`
      INSERT OR IGNORE INTO export_batches (id, organization_id, user_id, environment, format, record_count, export_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(exportBatchId, orgId, userId, environment, format, rows.length, exportKey),
    db.prepare(`
      INSERT INTO analytics_events (id, organization_id, user_id, environment, event_name, metadata)
      VALUES (?, ?, ?, ?, 'EXPORT_COMPLETED', ?)
    `).bind(createId("evt"), orgId, userId, environment, JSON.stringify({ exportBatchId, rows: rows.length, format })),
  ]);

  return NextResponse.json({ status: "success", rows, export_batch_id: exportBatchId, duplicate_emails_removed: seenEmails.size < (result.results || []).length });
}
