import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";
import { PLAN_CREDITS, planIdForName, trialEndDate } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getD1Database();
    if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });

    const body = await request.json();
    const plan = String(body.plan || "Trial");
    const credits = Number(body.credits ?? PLAN_CREDITS[plan] ?? 100);
    const creditsUsed = Number(body.credits_used ?? 0);
    const status = String(body.status || (plan === "Trial" ? "TRIAL_ACTIVE" : "ACTIVE"));
    const trialEnd = body.trial_end_date || (plan === "Trial" ? trialEndDate(Number(body.trial_days || 14)) : null);
    const planId = planIdForName(plan);

    await db.batch([
      db.prepare(`
        UPDATE organizations
        SET plan = ?, subscription_status = ?, ai_credits = ?, credits_used = ?, credits_remaining = ?, trial_end_date = COALESCE(?, trial_end_date), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(plan, status, credits, creditsUsed, Math.max(0, credits - creditsUsed), trialEnd, body.organization_status || null, params.id),
      db.prepare(`
        INSERT INTO subscriptions (id, organization_id, plan_id, status, trial_start_date, trial_end_date, credits_included, credits_used, credits_remaining, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(organization_id)
        DO UPDATE SET plan_id = excluded.plan_id, status = excluded.status, trial_end_date = excluded.trial_end_date, credits_included = excluded.credits_included, credits_used = excluded.credits_used, credits_remaining = excluded.credits_remaining, updated_at = CURRENT_TIMESTAMP
      `).bind(createId("sub"), params.id, planId, status, trialEnd, credits, creditsUsed, Math.max(0, credits - creditsUsed)),
      db.prepare(`
        INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
        VALUES (?, ?, ?, 'UPDATE_ORGANIZATION_PLAN', 'ORGANIZATION', ?, ?)
      `).bind(createId("audit"), body.actor_user_id || null, params.id, params.id, JSON.stringify({ plan, credits, status })),
    ]);

    return NextResponse.json({ success: true, plan, status, credits_remaining: Math.max(0, credits - creditsUsed), message: "Organization plan updated." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Could not update organization plan." }, { status: 500 });
  }
}
