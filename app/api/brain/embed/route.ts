import { NextResponse } from "next/server";
import { safeErrorMessage, upsertKnowledgeEmbedding } from "@/lib/brain/embeddings";
import { logBrainUsage } from "@/lib/brain/openrouter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const orgId = body.organization_id || "org_demo";
  const userId = body.user_id || "user_super_admin";
  const provider = String(body.provider || "OpenAI");
  const modelId = String(body.embedding_model_id || body.model_id || "text-embedding-3-small");
  try {
    const result = await upsertKnowledgeEmbedding({
      orgId,
      userId,
      sourceType: String(body.source_type || "Developer Knowledge"),
      sourceId: String(body.source_id || ""),
      title: String(body.title || body.source_type || "Knowledge item"),
      content: String(body.text || ""),
      provider,
      modelId,
      sourceFile: body.source_file || null,
    });
    await logBrainUsage({ orgId, userId, action: "CREATE_EMBEDDING", provider: result.provider, model: result.modelUsed, creditsCharged: 1, success: true, promptTokens: result.tokenCount });
    return NextResponse.json({ success: true, embedding_id: result.embeddingId, knowledge_item_id: result.knowledgeId, dimensions: result.dimensions, model_used: result.modelUsed, provider: result.provider, token_count: result.tokenCount });
  } catch (error) {
    const safe = safeErrorMessage(error);
    await logBrainUsage({ orgId, userId, action: "CREATE_EMBEDDING", provider, model: modelId, creditsCharged: 0, success: false, errorMessage: safe });
    return NextResponse.json({ success: false, error: safe, credits_charged: 0 }, { status: 502 });
  }
}
