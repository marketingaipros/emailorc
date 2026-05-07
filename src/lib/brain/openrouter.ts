import { prisma } from "@/lib/prisma";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export type ModelMode = "Economy" | "Balanced" | "Quality" | "Enterprise";

export const MODELS_BY_MODE: Record<ModelMode, string[]> = {
  Economy: ["openai/gpt-4o-mini", "google/gemini-flash-1.5"],
  Balanced: ["openai/gpt-4o-mini", "anthropic/claude-3.5-haiku"],
  Quality: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"],
  Enterprise: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o"],
};

export const TEST_CHAT_TASKS: Record<string, string> = {
  "General Test": "Answer clearly and briefly as a helpful business assistant.",
  "ORC Intake Test": "Act as ORC. Validate and normalize the request, then explain what fields are required.",
  "SENTINEL Strategy Test": "Act as SENTINEL. Provide a concise outreach strategy with risk controls.",
  "SCRIBE Writing Test": "Act as SCRIBE. Write polished email copy that avoids hype.",
  "LEXI QA Test": "Act as LEXI. Score the response quality from 0 to 100 and explain the score.",
  "Reply Classification Test": "Classify the reply intent and sentiment, then give a recommended next action.",
  "Reply Drafting Test": "Draft a concise professional reply.",
};

export function safeErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "Provider error");
  return raw
    .replace(/sk-or-v1-[A-Za-z0-9_-]+/g, "sk-or-v1-••••••••")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ••••••••")
    .slice(0, 240);
}

export function normalizeMode(mode: unknown): ModelMode {
  if (mode === "Economy" || mode === "Quality" || mode === "Enterprise") return mode;
  return "Balanced";
}

export function pickModel(mode: ModelMode, selectedModel?: string) {
  const cleaned = String(selectedModel || "").trim();
  return cleaned || MODELS_BY_MODE[mode][0];
}

async function deriveCryptoKey(secret: string) {
  const data = new TextEncoder().encode(secret.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", data, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptSecret(value: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "emailorc-local-dev-secret";
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveCryptoKey(secret);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value));
  return `${Buffer.from(iv).toString("base64")}.${Buffer.from(encrypted).toString("base64")}`;
}

export async function decryptSecret(value: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "emailorc-local-dev-secret";
  const [ivPart, encryptedPart] = value.split(".");
  if (!ivPart || !encryptedPart) return "";
  const key = await deriveCryptoKey(secret);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Uint8Array.from(Buffer.from(ivPart, "base64")) },
    key,
    Buffer.from(encryptedPart, "base64")
  );
  return new TextDecoder().decode(decrypted);
}

export async function ensureApiSecretsTable(db: D1Database) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS api_secrets (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      encrypted_value TEXT NOT NULL,
      masked_value TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, provider)
    )
  `).run();
}

export async function getOpenRouterKey(orgId?: string) {
  const serverKey = String(process.env.OPENROUTER_API_KEY || "").trim();
  if (serverKey) return { key: serverKey, source: "secret" as const };

  const db = await getD1Database();
  if (db && orgId) {
    await ensureApiSecretsTable(db);
    const row = await db.prepare(`
      SELECT encrypted_value FROM api_secrets
      WHERE organization_id = ? AND provider = 'OpenRouter'
      LIMIT 1
    `).bind(orgId).first() as { encrypted_value?: string } | null;
    if (row?.encrypted_value) {
      return { key: await decryptSecret(row.encrypted_value), source: "stored" as const };
    }
  }

  return { key: "", source: "missing" as const };
}

export async function saveOpenRouterKey(params: { orgId: string; apiKey: string }) {
  const trimmed = params.apiKey.trim();
  if (!trimmed.startsWith("sk-or-v1-") || trimmed.length < 48) {
    throw new Error("Enter a valid OpenRouter API key.");
  }

  const db = await getD1Database();
  if (!db) {
    throw new Error("API key saving is available in Cloudflare demo/test environments.");
  }

  await ensureApiSecretsTable(db);
  const masked = maskApiKey(trimmed);
  const encrypted = await encryptSecret(trimmed);
  await db.prepare(`
    INSERT INTO api_secrets (id, organization_id, provider, encrypted_value, masked_value)
    VALUES (?, ?, 'OpenRouter', ?, ?)
    ON CONFLICT(organization_id, provider)
    DO UPDATE SET encrypted_value = excluded.encrypted_value, masked_value = excluded.masked_value, updated_at = CURRENT_TIMESTAMP
  `).bind(createId("secret"), params.orgId, encrypted, masked).run();

  return masked;
}

export function maskApiKey(key: string) {
  if (!key) return "";
  return `${key.slice(0, 10)}••••${key.slice(-4)}`;
}

export async function fetchOpenRouterModels(apiKey: string) {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://emailorc-account-growth-demo.dwhitesvp.workers.dev",
      "X-Title": "EmailORC Account Growth Command Center",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(response.status === 401 ? "OpenRouter rejected this API key." : `OpenRouter models check failed (${response.status}). ${error}`);
  }

  const data = await response.json() as { data?: Array<{ id: string }> };
  return data.data?.map((model) => model.id).filter(Boolean) || [];
}

export async function sendOpenRouterChat(params: {
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}) {
  const started = Date.now();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://emailorc-account-growth-demo.dwhitesvp.workers.dev",
      "X-Title": "EmailORC Account Growth Command Center",
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: "system", content: params.systemPrompt || TEST_CHAT_TASKS["General Test"] },
        { role: "user", content: params.prompt },
      ],
      max_tokens: params.maxTokens || 160,
      temperature: 0.3,
    }),
  });

  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenRouter chat check failed (${response.status}).`);
  }

  return {
    content: data?.choices?.[0]?.message?.content || "",
    usage: data?.usage || {},
    responseTimeMs: Date.now() - started,
  };
}

export async function logBrainUsage(params: {
  orgId?: string | null;
  userId?: string | null;
  action: string;
  provider: string;
  model: string;
  modelMode?: string;
  promptTokens?: number | null;
  completionTokens?: number | null;
  estimatedApiCost?: number | null;
  creditsCharged: number;
  success: boolean;
  errorMessage?: string | null;
  environment?: string;
}) {
  const orgId = params.orgId || "org_demo";
  const userId = params.userId || "user_super_admin";
  const totalTokens = (params.promptTokens || 0) + (params.completionTokens || 0);
  const safeError = params.errorMessage ? safeErrorMessage(params.errorMessage) : null;

  const db = await getD1Database();
  if (db) {
    await db.prepare(`
      INSERT INTO usage_logs (
        id, organization_id, user_id, action, model_used, credits_charged,
        prompt_tokens, completion_tokens, total_tokens, estimated_api_cost,
        success, error_message, environment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      createId("usage"),
      orgId,
      userId,
      `${params.action}:${params.provider}:${params.modelMode || "Balanced"}`,
      params.model,
      params.creditsCharged,
      params.promptTokens || null,
      params.completionTokens || null,
      totalTokens || null,
      params.estimatedApiCost || null,
      params.success ? 1 : 0,
      safeError,
      params.environment || process.env.APP_ENV || "demo"
    ).run();
    return;
  }

  try {
    await prisma.usageLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: `${params.action}:${params.provider}:${params.modelMode || "Balanced"}`,
        modelUsed: params.model,
        creditsCharged: params.creditsCharged,
        promptTokens: params.promptTokens || null,
        completionTokens: params.completionTokens || null,
        totalTokens: totalTokens || null,
        estimatedApiCost: params.estimatedApiCost || null,
        success: params.success,
        errorMessage: safeError,
      },
    });
  } catch {
    // Usage logging must not break admin diagnostics.
  }
}
