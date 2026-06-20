import { NextResponse } from "next/server";
import { getD1Database } from "../../../../src/lib/cloudflare-db";
import { requireWorkflowOrganization } from "../../../../src/lib/workflow-auth";

export const dynamic = "force-dynamic";

function normalizeStatus(row: any) {
  if (row.do_not_contact) return "Do Not Contact";
  if (!row.contact_email) return "Missing Email";
  if (!row.company && !row.business_name) return "Missing Company";
  if (String(row.validation_status || "").toUpperCase().includes("NEEDS")) return "Needs Review";
  return "Ready";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowAuth = await requireWorkflowOrganization(request, searchParams.get("organization_id"));
    if (workflowAuth.response) return workflowAuth.response;
    const db = await getD1Database();
    const orgId = workflowAuth.organizationId;
    const environment = String(searchParams.get("environment") || process.env.APP_ENV || "demo").toLowerCase().replace("_", "-");

    if (!db) return NextResponse.json({ status: "local", records: [] });

    const result = await db.prepare(`
      SELECT
        l.*,
        ib.file_name,
        ib.created_at AS imported_at
      FROM leads l
      LEFT JOIN import_batches ib ON ib.id = l.import_batch_id
      WHERE l.organization_id = ? AND l.environment = ?
      ORDER BY l.updated_at DESC, l.created_at DESC
      LIMIT 1000
    `).bind(orgId, environment).all();

    const records = (result.results || []).map((row: any, index: number) => {
      const standard = JSON.parse(row.standard_fields_json || "{}");
      const custom = JSON.parse(row.custom_fields_json || "{}");
      return {
        id: row.id,
        displayId: index + 1,
        name: row.contact_name || standard["Full Name"] || standard["First Name"] || "Missing Name",
        company: row.company || row.business_name || standard["Company Name"] || standard["Business Name"] || "",
        email: row.contact_email || standard.Email || "",
        product: row.product || standard["Current Product"] || standard["Current Plan"] || "",
        renewal: standard["Renewal Date"] || standard["Renewal Month"] || "",
        industry: standard.Industry || custom.Industry || "",
        owner: standard["Owner / Account Manager"] || "",
        status: normalizeStatus(row),
        confidence: normalizeStatus(row) === "Ready" ? 90 : 0,
        upsell: row.offer_name || standard["Upsell Offer"] || "",
        environment: row.environment,
        importBatchId: row.import_batch_id,
        sourceFile: row.file_name,
        importedAt: row.imported_at,
        standardFields: standard,
        customFields: custom,
      };
    });

    return NextResponse.json({ status: "success", records, environment });
  } catch {
    return NextResponse.json({ status: "local", records: [], warning: "Records database table is not available." });
  }
}
