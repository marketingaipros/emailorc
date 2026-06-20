import { NextResponse } from "next/server";
import { requireBrainOrganization } from "../../../../src/lib/brain-auth";
import { createEmbedding, safeErrorMessage } from "../../../../src/lib/brain/embeddings";
import { logBrainUsage } from "../../../../src/lib/brain/openrouter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const auth = await requireBrainOrganization(request, body.organization_id);
  if (auth.response) return auth.response;
  const orgId = auth.organizationId;
  const userId = auth.currentUser.userId;
  const provider = String(body.provider || "OpenAI");
  const modelId = String(body.model_id || "text-embedding-3-small");
  try {
    const result = await createEmbedding({ provider, modelId, text: String(body.text || "AI Voice Agent for accounting firms"), orgId });
    await logBrainUsage({ orgId, userId, action: "TEST_EMBEDDING", provider: result.provider, model: result.modelUsed, creditsCharged: 0, success: true, promptTokens: result.tokenCount });
    return NextResponse.json({ success: true, dimensions: result.dimensions, model_used: result.modelUsed, provider: result.provider, token_count: result.tokenCount, status: "Success" });
  } catch (error) {
    const safe = safeErrorMessage(error);
    await logBrainUsage({ orgId, userId, action: "TEST_EMBEDDING", provider, model: modelId, creditsCharged: 0, success: false, errorMessage: safe });
    return NextResponse.json({ success: false, error: safe, credits_charged: 0, status: "Error" }, { status: 502 });
  }
}
