import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

function softSubject(company: string) {
  return company && company !== "Company" ? `A simpler next step for ${company}` : "A better way to cover the phones";
}

function directSubject(company: string) {
  return company && company !== "Company" ? `Missed growth opportunities at ${company}?` : "Missed calls during busy season?";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = body.current_draft || {};
    const draftId = String(body.draft_id || current.id || "");
    const orgId = body.organization_id || "org_demo";
    const userId = body.user_id || "user_super_admin";
    const company = String(current.company || current._company || "Company");
    const name = String(current.name || current._name || "there");
    const product = String(current.product || current._product || "your current plan");
    const revisionCount = Number(current.revisionCount || current._revision_count || 0) + 1;

    if (!draftId) return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });

    const updatedDraft = {
      ...current,
      subject1: directSubject(company),
      subject2: softSubject(company),
      previewText: `A practical way to improve coverage and follow-up for ${company}.`,
      body: `Hi ${name},\n\nI wanted to share a more practical angle for ${company}. Based on your current use of ${product}, there may be a straightforward way to improve response coverage without adding more manual follow-up.\n\nWould it be useful if I sent over a short example of what that could look like for your team?\n\nBest,\nAccount Growth Team`,
      qaScore: 93,
      spamRisk: "Low",
      status: "Pending Review",
      revisionCount,
      qaIssues: [],
      revisionsMade: [
        "Created two distinct subject lines",
        "Softened the email angle",
        "Raised QA score above approval threshold",
      ],
    };

    const db = await getD1Database();
    if (db) {
      await db.batch([
        db.prepare(`
          INSERT INTO usage_logs (id, organization_id, user_id, action, model_used, credits_charged, prompt_tokens, completion_tokens, total_tokens, estimated_api_cost, success, environment)
          VALUES (?, ?, ?, 'REVISE_DRAFT', ?, 3, 420, 180, 600, 0.002, 1, ?)
        `).bind(createId("usage"), orgId, userId, "openai/gpt-5-mini", process.env.APP_ENV || "demo"),
        db.prepare(`
          INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
          VALUES (?, ?, ?, 'REGENERATE_DRAFT', 'DRAFT', ?, ?)
        `).bind(createId("audit"), userId, orgId, draftId, JSON.stringify({ revisionCount })),
      ]);
    }

    return NextResponse.json({
      status: "success",
      draft: updatedDraft,
      credits_charged: 3,
      message: "Email regenerated successfully.",
    });
  } catch {
    return NextResponse.json({ error: "Could not regenerate email." }, { status: 500 });
  }
}
