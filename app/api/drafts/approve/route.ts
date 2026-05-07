import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

const APPROVER_ROLES = new Set(["SUPER_ADMIN", "CLIENT_ADMIN", "REVIEWER"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = String(body.user_role || "");
    const draftId = String(body.draft_id || "");
    const qaScore = Number(body.qa_score || 0);
    const spamRisk = String(body.spam_risk || "");
    const subject1 = String(body.subject_line_1 || "").trim();
    const subject2 = String(body.subject_line_2 || "").trim();
    const orgId = body.organization_id || "org_demo";
    const userId = body.user_id || "user_super_admin";

    if (!draftId) return NextResponse.json({ error: "Draft missing required fields." }, { status: 400 });
    if (!APPROVER_ROLES.has(role)) return NextResponse.json({ error: "User does not have approval permission." }, { status: 403 });
    if (qaScore < 90) return NextResponse.json({ error: "QA score below threshold." }, { status: 400 });
    if (!["Low", "Medium"].includes(spamRisk)) return NextResponse.json({ error: "Draft spam risk is too high." }, { status: 400 });
    if (!subject1 || !subject2) return NextResponse.json({ error: "Draft missing required fields." }, { status: 400 });
    if (subject1.toLowerCase() === subject2.toLowerCase()) return NextResponse.json({ error: "Duplicate subject lines." }, { status: 400 });

    const db = await getD1Database();
    if (db) {
      await db.prepare(`
        INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
        VALUES (?, ?, ?, 'APPROVE_DRAFT', 'DRAFT', ?, ?)
      `).bind(createId("audit"), userId, orgId, draftId, JSON.stringify({ qaScore, spamRisk })).run();
    }

    return NextResponse.json({
      status: "approved",
      draft_id: draftId,
      approved_at: new Date().toISOString(),
      message: "Draft approved successfully.",
    });
  } catch {
    return NextResponse.json({ error: "Could not approve draft." }, { status: 500 });
  }
}
