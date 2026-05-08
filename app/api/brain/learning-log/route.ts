import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = await getD1Database();
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("organization_id") || "org_demo";
  if (!db) return NextResponse.json({ status: "local", items: [] });
  const result = await db.prepare(`
    SELECT * FROM learning_log
    WHERE organization_id = ?
    ORDER BY created_at DESC
    LIMIT 200
  `).bind(orgId).all();
  return NextResponse.json({ status: "success", items: result.results || [] });
}

export async function POST(request: Request) {
  const db = await getD1Database();
  const body = await request.json().catch(() => ({}));
  const item = {
    feedback_id: body.feedback_id || createId("feedback"),
    organization_id: body.organization_id || "org_demo",
    user_id: body.user_id || "user_super_admin",
    source: body.source || "draft",
    related_draft_id: body.related_draft_id || null,
    related_offer_id: body.related_offer_id || null,
    related_campaign_id: body.related_campaign_id || null,
    feedback_type: body.feedback_type || "Other",
    feedback_text: body.feedback_text || "",
    suggested_rule: body.suggested_rule || "",
    status: body.status || "pending",
    created_at: body.created_at || new Date().toISOString(),
    approved_by: body.approved_by || null,
  };

  if (!db) return NextResponse.json({ status: "local", item });

  await db.prepare(`
    INSERT OR REPLACE INTO learning_log (
      id, organization_id, user_id, source_type, source_id, lesson, metadata, created_at,
      feedback_id, source, related_draft_id, related_offer_id, related_campaign_id,
      feedback_type, feedback_text, suggested_rule, status, approved_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    item.feedback_id,
    item.organization_id,
    item.user_id,
    item.source,
    item.related_draft_id,
    item.feedback_text || item.feedback_type,
    JSON.stringify(item),
    item.created_at,
    item.feedback_id,
    item.source,
    item.related_draft_id,
    item.related_offer_id,
    item.related_campaign_id,
    item.feedback_type,
    item.feedback_text,
    item.suggested_rule,
    item.status,
    item.approved_by,
  ).run();

  return NextResponse.json({ status: "success", item });
}
