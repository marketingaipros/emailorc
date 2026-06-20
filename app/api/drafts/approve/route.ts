import { NextResponse } from "next/server";
import { createId, getD1Database } from "../../../../src/lib/cloudflare-db";
import { validateDraftApproval } from "../../../../src/lib/draft-approval";
import { requireWorkflowOrganization } from "../../../../src/lib/workflow-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workflowAuth = await requireWorkflowOrganization(request, body.organization_id);
    if (workflowAuth.response) return workflowAuth.response;
    const orgId = workflowAuth.organizationId;
    const userId = workflowAuth.currentUser.userId;
    const approval = validateDraftApproval({
      userRole: workflowAuth.currentUser.role,
      draftId: body.draft_id,
      qaScore: body.qa_score,
      spamRisk: body.spam_risk,
      subjectLine1: body.subject_line_1,
      subjectLine2: body.subject_line_2,
    });

    if ("error" in approval) return NextResponse.json({ error: approval.error }, { status: approval.status });

    const db = await getD1Database();
    if (db) {
      await db.batch([
      db.prepare(`
        UPDATE drafts
        SET approval_status = 'APPROVED', approved_by_user_id = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND organization_id = ?
      `).bind(userId, approval.draftId, orgId),
      db.prepare(`
        INSERT INTO approvals (id, organization_id, user_id, draft_id, environment, approval_status, qa_score)
        VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)
      `).bind(createId("approval"), orgId, userId, approval.draftId, process.env.APP_ENV || "demo", approval.qaScore),
      db.prepare(`
        INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
        VALUES (?, ?, ?, 'APPROVE_DRAFT', 'DRAFT', ?, ?)
      `).bind(createId("audit"), userId, orgId, approval.draftId, JSON.stringify({ qaScore: approval.qaScore, spamRisk: approval.spamRisk })),
      ]);
    }

    return NextResponse.json({
      status: "approved",
      draft_id: approval.draftId,
      approved_at: new Date().toISOString(),
      message: "Draft approved successfully.",
    });
  } catch {
    return NextResponse.json({ error: "Could not approve draft." }, { status: 500 });
  }
}
