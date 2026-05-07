import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type BrainAction = 
  | "VALIDATE_RECORD" 
  | "GENERATE_STRATEGY" 
  | "GENERATE_DRAFT" 
  | "QA_SCORE" 
  | "REVISE_DRAFT" 
  | "CLASSIFY_REPLY" 
  | "DRAFT_REPLY" 
  | "KNOWLEDGE_SEARCH";

export const CREDIT_COSTS: Record<BrainAction, number> = {
  VALIDATE_RECORD: 1,
  GENERATE_STRATEGY: 2,
  GENERATE_DRAFT: 5,
  QA_SCORE: 2,
  REVISE_DRAFT: 3,
  CLASSIFY_REPLY: 2,
  DRAFT_REPLY: 5,
  KNOWLEDGE_SEARCH: 1,
};

export async function checkAndDeductCredits(params: {
  orgId: string;
  userId: string;
  action: BrainAction;
  campaignId?: string;
  rowId?: string;
  model?: string;
}) {
  const { orgId, userId, action, campaignId, rowId, model } = params;
  const cost = CREDIT_COSTS[action];

  // 1. Get Organization
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { aiCredits: true, status: true, subscriptionStatus: true }
  });

  if (!org || org.status !== "ACTIVE") {
    throw new Error("Organization is inactive or not found.");
  }

  // 2. Check Balance
  if (org.aiCredits < cost) {
    throw new Error(`Insufficient AI Credits. This action costs ${cost} credits, but you have ${org.aiCredits} remaining.`);
  }

  // 3. Deduct Credits
  await prisma.organization.update({
    where: { id: orgId },
    data: { aiCredits: { decrement: cost } }
  });

  // 4. Log Usage (Placeholder tokens for demo, usually passed from API response)
  const log = await prisma.usageLog.create({
    data: {
      organizationId: orgId,
      userId,
      campaignId,
      campaignRowId: rowId,
      action,
      modelUsed: model || "gpt-5-mini",
      creditsCharged: cost,
      promptTokens: Math.floor(Math.random() * 1000) + 500,
      completionTokens: Math.floor(Math.random() * 500) + 100,
      totalTokens: 0, // Calculated in UI or next step
      estimatedApiCost: 0.002, // Mock cost
      success: true,
    }
  });

  return { success: true, remaining: org.aiCredits - cost, logId: log.id };
}

export async function getOrgCredits(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { aiCredits: true }
  });
  return org?.aiCredits || 0;
}
