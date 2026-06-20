import { NextResponse } from "next/server";
import { requireBrainOrganization } from "../../../../src/lib/brain-auth";
import { createId, getD1Database } from "../../../../src/lib/cloudflare-db";
import { DEFAULT_APP_MINDSET, DEFAULT_BUSINESS_KNOWLEDGE, DEFAULT_OFFERS, DEFAULT_VOICE_MEMORY } from "../../../../src/lib/brain-context";
import { generateSageRenewalDraft } from "../../../../src/lib/sage-renewal-generator";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = body.current_draft || {};
    const draftId = String(body.draft_id || current.id || "");
    const auth = await requireBrainOrganization(request, body.organization_id);
    if (auth.response) return auth.response;
    const orgId = auth.organizationId;
    const userId = auth.currentUser.userId;
    const company = String(current.company || current._company || "Company");
    const name = String(current.name || current._name || "there");
    const product = String(current.product || current._product || "your current plan");
    const revisionCount = Number(current.revisionCount || current._revision_count || 0) + 1;
    const accountContext = body.account_context || current.accountContext || current._account_context || current.aiContext?.orc?.accountContext || {};

    if (!draftId) return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });

    const generated = generateSageRenewalDraft({
      id: draftId,
      standard: {
        "Full Name": name,
        "Company Name": company,
        Email: String(current.email || current._email || ""),
        "Current Product": accountContext.currentProduct || product,
        "Current Plan": accountContext.currentPlan || "",
        "Renewal Date": accountContext.renewalDate || current.aiContext?.orc?.fields?.["Renewal Date"] || "",
        "Days to Renew": current.aiContext?.orc?.fields?.["Days to Renew"] || "",
        Industry: accountContext.industry || current.aiContext?.orc?.fields?.Industry || "",
        "Pain Point": accountContext.painPoints || current.aiContext?.orc?.fields?.["Pain Point"] || current.aiContext?.sentinel?.valueOutcome || "",
        "Upsell Offer": accountContext.recommendedUpsell || current.offerName || current.aiContext?.offerUsed || "",
        "Do Not Contact": "No",
      },
      custom: current.customFields || {},
      rowIndex: revisionCount,
      businessKnowledge: DEFAULT_BUSINESS_KNOWLEDGE,
      appMindset: DEFAULT_APP_MINDSET,
      offer: DEFAULT_OFFERS[0],
      playbookName: current.campaignPlaybook || current.aiContext?.campaignPlaybookUsed || "Renewal Upsell",
      existingBodies: [],
      liveModelUsed: false,
      modelName: "Sage renewal ORC/SENTINEL/SCRIBE/LEXI regeneration",
      voiceMemory: DEFAULT_VOICE_MEMORY,
      accountContext,
    });

    const updatedDraft = {
      ...current,
      subject1: generated._subject,
      subject2: generated._subject2,
      previewText: generated._preview,
      body: generated._body,
      cta: generated._cta,
      qaScore: generated._score,
      spamRisk: generated._spam,
      status: generated._status === "Pending Review" ? "Pending Review" : "Regenerate",
      revisionCount,
      qaIssues: generated._qa_issues,
      revisionsMade: [
        ...generated._revisions_made,
        "Regenerated from the Sage renewal workflow",
      ],
      aiContext: { ...(generated._ai_context || {}), revisionCount },
      accountContext,
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
