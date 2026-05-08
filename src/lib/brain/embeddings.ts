import { createHash } from "node:crypto";
import { createId, getD1Database } from "@/lib/cloudflare-db";
import { getOpenRouterKey, safeErrorMessage } from "@/lib/brain/openrouter";

export const EMBEDDING_MODELS = [
  { provider: "OpenAI", displayName: "Text Embedding 3 Small", modelId: "text-embedding-3-small", purpose: "Low-cost knowledge search, Brain Center retrieval, document chunk search.", dimensions: 1536, costMode: "Economy" },
  { provider: "OpenAI", displayName: "Text Embedding 3 Large", modelId: "text-embedding-3-large", purpose: "Higher-quality retrieval for approved knowledge, offers, objections, campaign playbooks, and longer documents.", dimensions: 3072, costMode: "Quality" },
  { provider: "OpenRouter", displayName: "Text Embedding 3 Small", modelId: "text-embedding-3-small", purpose: "Diagnostic option if OpenRouter exposes embeddings for this key.", dimensions: 1536, costMode: "Economy" },
  { provider: "OpenRouter", displayName: "Text Embedding 3 Large", modelId: "text-embedding-3-large", purpose: "Diagnostic option if OpenRouter exposes embeddings for this key.", dimensions: 3072, costMode: "Quality" },
];

export function localEmbedding(text: string, dimensions = 256) {
  const vector = Array.from({ length: dimensions }, () => 0);
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    const hash = createHash("sha256").update(token).digest();
    const index = hash.readUInt16BE(0) % dimensions;
    const sign = hash[2] % 2 === 0 ? 1 : -1;
    vector[index] += sign;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

export function cosineSimilarity(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / ((Math.sqrt(normA) || 1) * (Math.sqrt(normB) || 1));
}

export async function createEmbedding(params: { provider: string; modelId: string; text: string; orgId?: string | null }) {
  const provider = params.provider || "OpenAI";
  const model = params.modelId || "text-embedding-3-small";
  const input = params.text.slice(0, 24000);

  if (provider === "Disabled") throw new Error("Embedding provider is disabled.");
  if (provider === "Local / Future") {
    const embedding = localEmbedding(input, 256);
    return { embedding, dimensions: embedding.length, tokenCount: Math.ceil(input.length / 4), modelUsed: "local-demo-embedding", provider: "Local / Future" };
  }

  const endpoint = provider === "OpenRouter" ? "https://openrouter.ai/api/v1/embeddings" : "https://api.openai.com/v1/embeddings";
  const apiKey = provider === "OpenRouter"
    ? (await getOpenRouterKey(params.orgId || undefined)).key
    : String(process.env.OPENAI_API_KEY || "").trim();

  if (!apiKey) throw new Error(`${provider} embedding API key is not configured.`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://emailorc-account-growth-demo.dwhitesvp.workers.dev",
      "X-Title": "EmailORC Account Growth Command Center",
    },
    body: JSON.stringify({ model, input }),
  });
  const data: any = await response.json().catch(async () => ({ error: { message: await response.text().catch(() => "Provider error") } }));
  if (!response.ok || data?.error?.message) throw new Error(data?.error?.message || `${provider} embedding failed (${response.status}).`);
  const embedding = data?.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || !embedding.length) throw new Error(`${provider} returned no embedding vector.`);
  return { embedding, dimensions: embedding.length, tokenCount: data?.usage?.total_tokens ?? Math.ceil(input.length / 4), modelUsed: model, provider };
}

export async function upsertKnowledgeEmbedding(params: { orgId: string; userId?: string; sourceType: string; sourceId: string; title: string; content: string; provider: string; modelId: string; sourceFile?: string }) {
  const db = await getD1Database();
  if (!db) throw new Error("missing_database_binding: Embeddings require Cloudflare D1 storage.");
  const result = await createEmbedding({ provider: params.provider, modelId: params.modelId, text: params.content, orgId: params.orgId });
  const knowledgeId = params.sourceId || createId("knowledge");
  const embeddingId = createId("embedding");
  await db.batch([
    db.prepare(`
      INSERT INTO knowledge_items (id, organization_id, type, title, content, status, source_file, embedding_status, embedding_model_id, last_indexed_at, chunks_indexed, updated_at)
      VALUES (?, ?, ?, ?, ?, 'Approved', ?, 'Indexed', ?, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET title = excluded.title, content = excluded.content, source_file = excluded.source_file, embedding_status = 'Indexed', embedding_model_id = excluded.embedding_model_id, last_indexed_at = CURRENT_TIMESTAMP, chunks_indexed = 1, updated_at = CURRENT_TIMESTAMP
    `).bind(knowledgeId, params.orgId, params.sourceType, params.title, params.content, params.sourceFile || null, result.modelUsed),
    db.prepare(`DELETE FROM knowledge_embeddings WHERE knowledge_item_id = ?`).bind(knowledgeId),
    db.prepare(`
      INSERT INTO knowledge_embeddings (id, organization_id, knowledge_item_id, provider, model_id, dimensions, embedding_json, chunk_index, source_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).bind(embeddingId, params.orgId, knowledgeId, result.provider, result.modelUsed, result.dimensions, JSON.stringify(result.embedding), params.sourceType),
  ]);
  return { ...result, embeddingId, knowledgeId };
}

export { safeErrorMessage };
