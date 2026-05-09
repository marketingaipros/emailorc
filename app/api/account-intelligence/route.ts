import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

function safeKey(value: string | null) {
  return String(value || "").trim().toLowerCase().slice(0, 240);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const organizationId = safeKey(url.searchParams.get("organization_id")) || "org_demo";
  const db = await getD1Database();
  if (!db) return NextResponse.json({ status: "success", items: [] });

  const rows = await db.prepare(`
    SELECT contact_key, company_key, save_scope, context_json, updated_at
    FROM account_intelligence
    WHERE organization_id = ?
    ORDER BY updated_at DESC
    LIMIT 500
  `).bind(organizationId).all();

  const items = (rows.results || []).map((row: any) => ({
    contact_key: row.contact_key,
    company_key: row.company_key,
    save_scope: row.save_scope,
    context: JSON.parse(row.context_json || "{}"),
    updated_at: row.updated_at,
  }));

  return NextResponse.json({ status: "success", items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organizationId = safeKey(body.organization_id) || "org_demo";
    const userId = safeKey(body.user_id) || "user_super_admin";
    const contactKey = safeKey(body.contact_key);
    const companyKey = safeKey(body.company_key);
    const saveScope = ["use_once", "contact", "company"].includes(body.save_scope) ? body.save_scope : "contact";
    const context = body.context || {};

    if (!contactKey && !companyKey) {
      return NextResponse.json({ error: "Missing contact or company key." }, { status: 400 });
    }

    const db = await getD1Database();
    if (!db) {
      return NextResponse.json({ status: "success", stored: "browser-only", message: "Account Context saved locally. Database binding is not available." });
    }

    await db.prepare(`
      INSERT INTO account_intelligence (id, organization_id, user_id, contact_key, company_key, save_scope, context_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(organization_id, contact_key, company_key, save_scope)
      DO UPDATE SET user_id = excluded.user_id, context_json = excluded.context_json, updated_at = CURRENT_TIMESTAMP
    `).bind(
      createId("acctctx"),
      organizationId,
      userId,
      contactKey,
      companyKey,
      saveScope,
      JSON.stringify(context),
    ).run();

    return NextResponse.json({ status: "success", stored: "database", message: "Account Context saved." });
  } catch {
    return NextResponse.json({ error: "Could not save Account Context." }, { status: 500 });
  }
}
