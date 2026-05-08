import { NextResponse } from "next/server";
import { createId, getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

function rowToModel(row: any) {
  return {
    id: row.task_name,
    taskName: row.task_label || row.task_name,
    selectedModel: row.selected_model,
    purpose: row.purpose || "",
    temperature: Number(row.temperature ?? 0.7),
    maxLength: Number(row.max_output_length ?? 2000),
    costMode: row.cost_mode || "Balanced",
    active: Boolean(row.is_active),
    fallbackModel: row.fallback_model || "",
    notes: row.notes || "",
    lastUpdated: row.updated_at,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org_id") || "org_demo";
  const db = await getD1Database();

  if (!db) {
    return NextResponse.json({
      status: "local",
      models: [],
      message: "Model settings persistence requires Cloudflare D1. Localhost uses UI defaults unless saved in browser state.",
    });
  }

  const { results } = await db.prepare(`
    SELECT * FROM brain_settings
    WHERE organization_id = ?
    ORDER BY task_name
  `).bind(orgId).all();

  return NextResponse.json({
    status: "success",
    models: (results || []).map(rowToModel),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const orgId = body.organization_id || "org_demo";
  const userId = body.user_id || "user_super_admin";
  const models = Array.isArray(body.models) ? body.models : [];
  const db = await getD1Database();

  if (!db) {
    return NextResponse.json({
      status: "error",
      error_code: "missing_database_binding",
      message: "Model settings can only be persisted in Cloudflare demo/test-live environments.",
    }, { status: 400 });
  }

  if (!models.length) {
    return NextResponse.json({ status: "error", message: "No model settings provided." }, { status: 400 });
  }

  const statements = models.map((model: any) => db.prepare(`
    INSERT INTO brain_settings (
      id, organization_id, task_name, selected_model, purpose, temperature,
      max_output_length, cost_mode, is_active, fallback_model, notes, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(organization_id, task_name)
    DO UPDATE SET
      selected_model = excluded.selected_model,
      purpose = excluded.purpose,
      temperature = excluded.temperature,
      max_output_length = excluded.max_output_length,
      cost_mode = excluded.cost_mode,
      is_active = excluded.is_active,
      fallback_model = excluded.fallback_model,
      notes = excluded.notes,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    createId("brain"),
    orgId,
    model.id || model.taskName,
    model.selectedModel,
    model.purpose || "",
    Number(model.temperature ?? 0.7),
    Number(model.maxLength ?? 2000),
    model.costMode || "Balanced",
    model.active === false ? 0 : 1,
    model.fallbackModel || null,
    model.notes || ""
  ));

  statements.push(db.prepare(`
    INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
    VALUES (?, ?, ?, 'SAVE_MODEL_SETTINGS', 'BRAIN_SETTINGS', ?, ?)
  `).bind(createId("audit"), userId, orgId, orgId, JSON.stringify({ model_count: models.length })));

  await db.batch(statements);

  return NextResponse.json({
    status: "success",
    active_model_count: models.filter((model: any) => model.active !== false).length,
    message: "Model settings saved and set active.",
  });
}
