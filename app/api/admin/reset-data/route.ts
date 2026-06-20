import { NextResponse } from "next/server";
import { createId, getD1Database } from "../../../../src/lib/cloudflare-db";
import { requireSuperAdmin } from "../../../../src/lib/admin-auth";

export const dynamic = "force-dynamic";

const RESET_TABLES = ["approvals", "drafts", "leads", "export_batches", "analytics_events", "import_batches", "account_intelligence"];

export async function POST(request: Request) {
  const admin = await requireSuperAdmin(request);
  if (admin.response) return admin.response;

  const db = await getD1Database();
  if (!db) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  const body = await request.json();
  const resetType = String(body.reset_type || "");
  const environment = String(body.environment || process.env.APP_ENV || "demo").toLowerCase().replace("_", "-");
  const orgId = body.organization_id || null;
  const typed = String(body.confirmation || "");
  const includeUsageLogs = Boolean(body.include_usage_logs);
  const includeBrain = Boolean(body.include_brain);

  if (!body.confirmed) return NextResponse.json({ error: "Confirmation checkbox is required." }, { status: 400 });
  if (resetType === "factory" && typed !== "RESET ALL DATA") return NextResponse.json({ error: "Full Factory Reset requires typing RESET ALL DATA." }, { status: 400 });
  if (resetType === "live-test" && typed !== "RESET LIVE TEST") return NextResponse.json({ error: "Type RESET LIVE TEST to confirm." }, { status: 400 });
  if (resetType !== "factory" && resetType !== "live-test" && typed !== "RESET DATA") return NextResponse.json({ error: "Type RESET DATA to confirm." }, { status: 400 });

  const counts: Record<string, number> = {};
  const statements: any[] = [];
  const addDelete = async (table: string, sql: string, binds: any[]) => {
    const countSql = sql.replace(/^DELETE FROM/i, "SELECT COUNT(*) as count FROM");
    const count: any = await db.prepare(countSql).bind(...binds).first().catch(() => ({ count: 0 }));
    counts[table] = Number(count?.count || 0);
    statements.push(db.prepare(sql).bind(...binds));
  };

  if (resetType === "factory") {
    for (const table of ["usage_logs", "account_intelligence", "approvals", "drafts", "leads", "export_batches", "analytics_events", "import_batches", "knowledge_embeddings", "knowledge_items", "brain_settings", "campaign_playbooks", "learning_log", "offer_library"]) {
      await addDelete(table, `DELETE FROM ${table}`, []);
    }
  } else {
    const tables = [...RESET_TABLES, ...(includeUsageLogs ? ["usage_logs"] : []), ...(includeBrain ? ["knowledge_embeddings", "knowledge_items", "brain_settings", "campaign_playbooks", "learning_log", "offer_library"] : [])];
    for (const table of tables) {
      if (resetType === "organization") {
        if (!orgId) return NextResponse.json({ error: "Organization is required for organization reset." }, { status: 400 });
        await addDelete(table, `DELETE FROM ${table} WHERE organization_id = ?`, [orgId]);
      } else if (resetType === "live-test") {
        if (!orgId) return NextResponse.json({ error: "Organization is required for Live Test reset." }, { status: 400 });
        if (["account_intelligence", "knowledge_embeddings", "knowledge_items", "brain_settings", "campaign_playbooks", "learning_log", "offer_library"].includes(table)) {
          await addDelete(table, `DELETE FROM ${table} WHERE organization_id = ?`, [orgId]);
        } else {
          await addDelete(table, `DELETE FROM ${table} WHERE organization_id = ? AND environment = ?`, [orgId, "live-test"]);
        }
      } else if (table === "account_intelligence" || table === "knowledge_embeddings" || table === "knowledge_items" || table === "brain_settings" || table === "campaign_playbooks" || table === "learning_log" || table === "offer_library") {
        counts[table] = 0;
      } else {
        await addDelete(table, `DELETE FROM ${table} WHERE environment = ?`, [environment]);
      }
    }
  }

  statements.push(db.prepare(`
    INSERT INTO reset_audit (id, actor_user_id, organization_id, environment, reset_type, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(createId("reset"), admin.currentUser.userId, orgId, environment, resetType, JSON.stringify({ counts, includeUsageLogs, includeBrain })));
  statements.push(db.prepare(`
    INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
    VALUES (?, ?, ?, 'RESET_DATA', 'SYSTEM', ?, ?)
  `).bind(createId("audit"), admin.currentUser.userId, orgId, resetType, JSON.stringify({ environment, counts })));

  await db.batch(statements);
  return NextResponse.json({ success: true, reset_type: resetType, counts, message: "Reset completed. Users, organizations, plans, and system configuration were kept." });
}
