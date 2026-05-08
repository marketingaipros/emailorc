import { NextResponse } from "next/server";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = await getD1Database();
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("organization_id") || "org_demo";
  const environment = (searchParams.get("environment") || process.env.APP_ENV || "demo").toLowerCase();

  if (!db) return NextResponse.json({ status: "local", drafts: [] });

  const result = await db.prepare(`
    SELECT d.*, l.contact_name, l.contact_email, l.company, l.product, l.do_not_contact
    FROM drafts d
    LEFT JOIN leads l ON l.id = d.lead_id
    WHERE d.organization_id = ? AND d.environment = ? AND d.archived = 0
    ORDER BY d.updated_at DESC, d.created_at DESC
    LIMIT 500
  `).bind(orgId, environment).all();

  const drafts = (result.results || []).map((row: any, index: number) => ({
    id: row.id,
    leadId: row.lead_id,
    name: row.contact_name || "Missing Name",
    company: row.company || "Company",
    email: row.contact_email || "",
    product: row.product || "Current Plan",
    subject1: row.subject || "",
    subject2: row.subject_line_2 || "",
    previewText: row.preview_text || "",
    body: row.body || "",
    cta: "Schedule a 15-minute discovery call",
    personalization: ["Contact Name", "Company Name", "Current Product"],
    qaScore: Number(row.qa_score || 0),
    spamRisk: row.spam_risk || "Low",
    status: row.approval_status === "APPROVED" ? "Approved" : "Pending Review",
    expanded: false,
    revisionCount: Number(row.revision_count || 0),
    sourceIndex: index,
    offerName: row.offer_name,
    campaignPlaybook: row.playbook_name,
    aiContext: row.ai_context_json ? JSON.parse(row.ai_context_json) : undefined,
  }));

  return NextResponse.json({ status: "success", drafts });
}
