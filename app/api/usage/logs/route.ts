import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org_id") || "org_demo";

  const db = await getD1Database();
  if (db) {
    const { results } = await db.prepare(`
      SELECT
        ul.created_at,
        ul.action,
        ul.model_used,
        ul.credits_charged,
        ul.prompt_tokens,
        ul.completion_tokens,
        ul.estimated_api_cost,
        ul.success,
        ul.error_message,
        ul.environment,
        u.email AS user_email,
        o.name AS org_name
      FROM usage_logs ul
      LEFT JOIN users u ON u.id = ul.user_id
      LEFT JOIN organizations o ON o.id = ul.organization_id
      WHERE ul.organization_id = ?
      ORDER BY ul.created_at DESC
      LIMIT 50
    `).bind(orgId).all();
    return NextResponse.json({ logs: results });
  }

  const logs = await prisma.usageLog.findMany({
    where: { organizationId: orgId },
    include: { user: true, organization: true },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  return NextResponse.json({
    logs: logs.map((log) => ({
      created_at: log.timestamp.toISOString(),
      action: log.action,
      model_used: log.modelUsed,
      credits_charged: log.creditsCharged,
      prompt_tokens: log.promptTokens,
      completion_tokens: log.completionTokens,
      estimated_api_cost: log.estimatedApiCost,
      success: log.success ? 1 : 0,
      error_message: log.errorMessage,
      environment: process.env.APP_ENV || "local",
      user_email: log.user.email,
      org_name: log.organization.name,
    })),
  });
}
