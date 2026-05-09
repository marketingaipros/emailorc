import { NextResponse } from "next/server";
import { getD1Database } from "@/lib/cloudflare-db";
import { daysRemaining, estimateEmailsRemaining } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = await getD1Database();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organization_id") || "org_demo";

    if (!db) {
      return NextResponse.json({
        plan: "Trial",
        subscription_status: "Trial Active",
        credits_included: 100,
        credits_used: 0,
        credits_remaining: 100,
        estimated_emails_remaining: 10,
        trial_days_remaining: 14,
      });
    }

    const row: any = await db.prepare(`
      SELECT
        o.id,
        o.name AS organization_name,
        o.plan,
        o.subscription_status,
        o.ai_credits,
        o.credits_used,
        o.credits_remaining,
        o.trial_end_date,
        s.credits_included,
        s.credits_used AS sub_credits_used,
        s.credits_remaining AS sub_credits_remaining,
        s.trial_end_date AS sub_trial_end
      FROM organizations o
      LEFT JOIN subscriptions s ON s.organization_id = o.id
      WHERE o.id = ?
    `).bind(orgId).first();

    const creditsIncluded = Number(row?.credits_included ?? row?.ai_credits ?? 100);
    const creditsUsed = Number(row?.sub_credits_used ?? row?.credits_used ?? 0);
    const creditsRemaining = Number(row?.sub_credits_remaining ?? row?.credits_remaining ?? Math.max(0, creditsIncluded - creditsUsed));
    const trialEnd = row?.sub_trial_end || row?.trial_end_date;

    return NextResponse.json({
      organization_id: orgId,
      organization_name: row?.organization_name || "Organization",
      plan: row?.plan || "Trial",
      subscription_status: String(row?.subscription_status || "TRIAL_ACTIVE").replaceAll("_", " "),
      credits_included: creditsIncluded,
      credits_used: creditsUsed,
      credits_remaining: creditsRemaining,
      estimated_emails_remaining: estimateEmailsRemaining(creditsRemaining),
      trial_days_remaining: daysRemaining(trialEnd),
      trial_ends_at: trialEnd,
    });
  } catch {
    return NextResponse.json({
      plan: "Trial",
      subscription_status: "Trial Active",
      credits_included: 100,
      credits_used: 0,
      credits_remaining: 100,
      estimated_emails_remaining: 10,
      trial_days_remaining: 14,
      warning: "Billing database table is not available in this local environment.",
    });
  }
}
