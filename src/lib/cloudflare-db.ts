import { randomUUID } from "node:crypto";

type MaybeD1 = D1Database | null;

export async function getD1Database(): Promise<MaybeD1> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }

  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = await mod.getCloudflareContext({ async: true });
    return (context.env as CloudflareEnv).DB ?? null;
  } catch {
    return null;
  }
}

export function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export function mapD1User(row: any) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    jobTitle: row.job_title,
    passwordHash: row.password_hash,
    status: row.status,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapD1Organization(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    plan: row.plan,
    subscriptionStatus: row.subscription_status,
    aiCredits: row.ai_credits,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
