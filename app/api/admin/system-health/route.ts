import { NextResponse } from "next/server";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

const TABLES = ["organizations", "users", "leads", "drafts", "usage_logs", "import_batches", "export_batches", "analytics_events"];

export async function GET(request: Request) {
  const db = await getD1Database();
  const { searchParams } = new URL(request.url);
  const environment = (searchParams.get("environment") || process.env.APP_ENV || "demo").toLowerCase();
  const orgId = searchParams.get("organization_id") || "org_demo";

  if (!db) {
    return NextResponse.json({ database_connected: false, active_environment: environment, counts: {}, last_database_write: null, last_database_read: new Date().toISOString() });
  }

  const counts: Record<string, number> = {};
  for (const table of TABLES) {
    try {
      const hasEnv = ["leads", "drafts", "usage_logs", "import_batches", "export_batches", "analytics_events"].includes(table);
      const result: any = hasEnv
        ? await db.prepare(`SELECT COUNT(*) as count FROM ${table} WHERE organization_id = ? AND environment = ?`).bind(orgId, environment).first()
        : await db.prepare(`SELECT COUNT(*) as count FROM ${table}`).first();
      counts[table] = Number(result?.count || 0);
    } catch {
      counts[table] = -1;
    }
  }

  const lastWrite: any = await db.prepare(`
    SELECT MAX(created_at) as ts FROM (
      SELECT created_at FROM usage_logs WHERE organization_id = ? AND environment = ?
      UNION ALL SELECT created_at FROM import_batches WHERE organization_id = ? AND environment = ?
      UNION ALL SELECT created_at FROM export_batches WHERE organization_id = ? AND environment = ?
      UNION ALL SELECT created_at FROM analytics_events WHERE organization_id = ? AND environment = ?
    )
  `).bind(orgId, environment, orgId, environment, orgId, environment, orgId, environment).first().catch(() => null);

  return NextResponse.json({
    database_connected: true,
    active_environment: environment,
    counts,
    last_database_write: lastWrite?.ts || null,
    last_database_read: new Date().toISOString(),
  });
}
