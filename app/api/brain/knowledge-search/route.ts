import { NextResponse } from "next/server";
import { createEmbedding, cosineSimilarity, safeErrorMessage } from "@/lib/brain/embeddings";
import { getD1Database } from "@/lib/cloudflare-db";
import { logBrainUsage } from "@/lib/brain/openrouter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const orgId = body.organization_id || "org_demo";
  const userId = body.user_id || "user_super_admin";
  const provider = String(body.provider || "OpenAI");
  const modelId = String(body.model_id || "text-embedding-3-small");
  try {
    const db = await getD1Database();
    if (!db) throw new Error("missing_database_binding: Knowledge search requires Cloudflare D1 storage.");
    const query = String(body.query || "");
    const topK = Math.max(1, Math.min(10, Number(body.top_k || 5)));
    const types = Array.isArray(body.knowledge_types) ? body.knowledge_types.map(String) : [];
    const queryEmbedding = await createEmbedding({ provider, modelId, text: query, orgId });
    const { results } = await db.prepare(`
      SELECT ke.embedding_json, ki.id, ki.type, ki.title, ki.content, ki.source_file
      FROM knowledge_embeddings ke
      JOIN knowledge_items ki ON ki.id = ke.knowledge_item_id
      WHERE ke.organization_id = ?
    `).bind(orgId).all();
    const matches = (results || [])
      .filter((row: any) => !types.length || types.includes(row.type))
      .map((row: any) => {
        const vector = JSON.parse(row.embedding_json || "[]");
        const score = cosineSimilarity(queryEmbedding.embedding, vector);
        return { source_type: row.type, source_id: row.id, title: row.title, snippet: String(row.content || "").slice(0, 280), source_file: row.source_file, relevance_score: Number(score.toFixed(4)) };
      })
      .sort((a: any, b: any) => b.relevance_score - a.relevance_score)
      .slice(0, topK);
    await logBrainUsage({ orgId, userId, action: "KNOWLEDGE_SEARCH", provider: queryEmbedding.provider, model: queryEmbedding.modelUsed, creditsCharged: 1, success: true, promptTokens: queryEmbedding.tokenCount });
    return NextResponse.json({ success: true, matched_items: matches, relevance_scores: matches.map((m: any) => m.relevance_score), snippets: matches.map((m: any) => m.snippet) });
  } catch (error) {
    const safe = safeErrorMessage(error);
    await logBrainUsage({ orgId, userId, action: "KNOWLEDGE_SEARCH", provider, model: modelId, creditsCharged: 0, success: false, errorMessage: safe });
    return NextResponse.json({ success: false, error: safe, matched_items: [], credits_charged: 0 }, { status: 502 });
  }
}
