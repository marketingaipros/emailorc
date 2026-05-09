import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

type EnvironmentMode = "demo" | "test-live" | "production";

const MODE_LABELS: Record<EnvironmentMode, string> = {
  demo: "Demo Environment",
  "test-live": "Test Live Environment",
  production: "Production Environment",
};

function normalizeMode(value: unknown): EnvironmentMode {
  const raw = String(value || "").trim().toLowerCase().replaceAll("_", "-");
  if (raw === "prod" || raw === "live" || raw === "live-production") return "production";
  if (raw === "test" || raw === "testlive" || raw === "cloudflare-test") return "test-live";
  if (raw === "cloudflare-demo" || raw === "preview" || raw === "development") return "demo";
  if (raw === "production" || raw === "test-live" || raw === "demo") return raw;
  return "demo";
}

function toUiMode(mode: EnvironmentMode) {
  return mode === "test-live" ? "TEST_LIVE" : mode.toUpperCase();
}

function allowedFeatures(mode: EnvironmentMode) {
  return {
    upload_contacts: true,
    generate_drafts: true,
    export_approved_drafts: true,
    live_brain_api: mode !== "demo",
    sample_data: mode === "demo",
    auto_send: false,
    human_approval_required: true,
  };
}

async function readEnvironment(organizationId: string) {
  const appEnvironment = normalizeMode(process.env.APP_ENV || process.env.CLOUDFLARE_ENV || process.env.NODE_ENV);
  const db = await getD1Database();
  let organizationEnvironment: EnvironmentMode | null = null;
  let organizationName = "Organization";

  if (db) {
    const row: any = await db.prepare("SELECT name, environment FROM organizations WHERE id = ?")
      .bind(organizationId)
      .first()
      .catch(() => null);
    if (row?.environment) organizationEnvironment = normalizeMode(row.environment);
    if (row?.name) organizationName = row.name;
  }

  const effectiveEnvironment = organizationEnvironment || appEnvironment;
  return {
    db,
    appEnvironment,
    organizationEnvironment,
    effectiveEnvironment,
    organizationName,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organization_id") || "org_demo";
  const { db, appEnvironment, organizationEnvironment, effectiveEnvironment, organizationName } = await readEnvironment(organizationId);

  return NextResponse.json({
    database_connected: Boolean(db),
    organization_id: organizationId,
    organization_name: organizationName,
    app_environment: appEnvironment,
    organization_environment: organizationEnvironment || appEnvironment,
    effective_environment: effectiveEnvironment,
    mode: toUiMode(effectiveEnvironment),
    badge_label: MODE_LABELS[effectiveEnvironment],
    allowed_features: allowedFeatures(effectiveEnvironment),
    source_of_truth: db ? "organization.database.environment" : "app.environment.fallback",
    last_checked_at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organizationId = String(body.organization_id || "org_demo");
    const userId = String(body.user_id || "user_super_admin");
    const requestedMode = normalizeMode(body.mode || body.environment);
    const db = await getD1Database();

    if (!db) {
      return NextResponse.json({
        success: false,
        code: "missing_database_binding",
        message: "Environment can only be persisted when the database binding is available.",
      }, { status: 503 });
    }

    await db.batch([
      db.prepare("UPDATE organizations SET environment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(requestedMode, organizationId),
      db.prepare(`
        INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
        VALUES (?, ?, ?, 'UPDATE_ENVIRONMENT', 'ORGANIZATION', ?, ?)
      `).bind(createId("audit"), userId, organizationId, organizationId, JSON.stringify({ environment: requestedMode })),
    ]);

    const refreshed = await readEnvironment(organizationId);
    return NextResponse.json({
      success: true,
      organization_id: organizationId,
      app_environment: refreshed.appEnvironment,
      organization_environment: refreshed.organizationEnvironment || requestedMode,
      effective_environment: refreshed.effectiveEnvironment,
      mode: toUiMode(refreshed.effectiveEnvironment),
      badge_label: MODE_LABELS[refreshed.effectiveEnvironment],
      allowed_features: allowedFeatures(refreshed.effectiveEnvironment),
      message: `${MODE_LABELS[refreshed.effectiveEnvironment]} saved.`,
    });
  } catch {
    return NextResponse.json({
      success: false,
      code: "environment_save_failed",
      message: "Could not save environment status.",
    }, { status: 500 });
  }
}
