import { NextResponse } from "next/server";
import { getD1Database } from "../../../../src/lib/cloudflare-db";
import {
  cleanLeadDisplayValue,
  draftEligibility,
  leadEmailStatus,
  leadValidationIssues,
  safeJsonParse,
  sourceLabel,
} from "../../../../src/lib/lead-management";
import { requireWorkflowOrganization } from "../../../../src/lib/workflow-auth";

export const dynamic = "force-dynamic";

async function hasColumn(db: any, table: string, column: string) {
  const result = await db.prepare(`PRAGMA table_info(${table})`).all();
  return (result.results || []).some((row: any) => row.name === column);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowAuth = await requireWorkflowOrganization(request, searchParams.get("organization_id"));
    if (workflowAuth.response) return workflowAuth.response;
    const db = await getD1Database();
    const orgId = workflowAuth.organizationId;
    const environment = (searchParams.get("environment") || process.env.APP_ENV || "demo").toLowerCase().replaceAll("_", "-");

    if (!db) return NextResponse.json({ status: "local", drafts: [] });
    const leadArchiveColumns = await hasColumn(db, "leads", "archived_at");

    const result = await db.prepare(`
      WITH ranked AS (
        SELECT
          d.*,
          l.contact_name,
          l.contact_email,
          l.company,
          l.business_name,
          l.product,
          l.do_not_contact,
          l.validation_status,
          l.import_batch_id,
          l.source_row_id,
          l.standard_fields_json,
          l.custom_fields_json,
          ib.file_name,
          ib.source_type,
          ib.created_at AS imported_at,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE(d.lead_id, l.contact_email, d.id)
            ORDER BY d.version DESC, d.updated_at DESC, d.created_at DESC
          ) AS rn
        FROM drafts d
        LEFT JOIN leads l ON l.id = d.lead_id
        LEFT JOIN import_batches ib ON ib.id = l.import_batch_id
        WHERE d.organization_id = ? AND d.environment = ? AND d.archived = 0
      )
      SELECT * FROM ranked
      WHERE rn = 1
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 500
    `).bind(orgId, environment).all();

    const drafts = (result.results || []).map((row: any, index: number) => {
      const standard = safeJsonParse(row.standard_fields_json);
      const email = row.contact_email || standard.Email || "";
      const rawName = row.contact_name || standard["Full Name"] || standard["Decision Maker"] || "";
      const rawCompany = row.company || row.business_name || standard["Company Name"] || standard["Business Name"] || "";
      const name = cleanLeadDisplayValue(rawName);
      const company = cleanLeadDisplayValue(rawCompany);
      const validationIssues = leadValidationIssues({ name: rawName, email, company: rawCompany, validationStatus: row.validation_status });
      return {
        id: row.id,
        leadId: row.lead_id,
        name: name || "Missing contact",
        rawName,
        company: company || "Missing business/practice",
        rawCompany,
        email: leadEmailStatus(email) === "Valid" ? email : "",
        rawEmail: email,
        emailStatus: leadEmailStatus(email),
        product: row.product || "Current Plan",
        subject1: row.subject || "",
        subject2: row.subject_line_2 || "",
        previewText: row.preview_text || "",
        body: row.body || "",
        cta: "Schedule a 15-minute discovery call",
        personalization: ["Contact Name", "Company Name", "Current Product"],
        qaScore: Number(row.qa_score || 0),
        spamRisk: row.spam_risk || "Low",
        status: row.approval_status === "APPROVED" ? "Approved" : "Pending Review",
        isD1Backed: true,
        source: "d1",
        storageSource: "d1",
        expanded: false,
        revisionCount: Number(row.revision_count || 0),
        sourceIndex: index,
        offerName: row.offer_name,
        campaignPlaybook: row.playbook_name,
        aiContext: row.ai_context_json ? JSON.parse(row.ai_context_json) : undefined,
        importBatchId: row.import_batch_id,
        sourceRowId: row.source_row_id,
        sourceFile: row.file_name,
        sourceLabel: sourceLabel(row, standard),
        importedAt: row.imported_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        validationIssues,
        hasValidationProblems: validationIssues.length > 0,
        draftEligibility: draftEligibility({
          name: rawName,
          email,
          company: rawCompany,
          product: row.product,
          validationStatus: row.validation_status,
          doNotContact: row.do_not_contact,
        }),
      };
    });

    const leadOnlyResult = await db.prepare(`
      SELECT
        l.*,
        ib.file_name,
        ib.source_type,
        ib.created_at AS imported_at
      FROM leads l
      LEFT JOIN import_batches ib ON ib.id = l.import_batch_id
      LEFT JOIN drafts d ON d.lead_id = l.id AND d.organization_id = l.organization_id AND d.environment = l.environment AND d.archived = 0
      WHERE l.organization_id = ?
        AND l.environment = ?
        AND d.id IS NULL
        ${leadArchiveColumns ? "AND COALESCE(l.archived_at, '') = ''" : ""}
        AND UPPER(COALESCE(l.validation_status, '')) != 'ARCHIVED'
      ORDER BY l.updated_at DESC, l.created_at DESC
      LIMIT 250
    `).bind(orgId, environment).all();

    const draftReadyLeads = (leadOnlyResult.results || []).map((row: any, index: number) => {
      const standard = safeJsonParse(row.standard_fields_json);
      const email = row.contact_email || standard.Email || "";
      const rawName = row.contact_name || standard["Full Name"] || standard["Decision Maker"] || "";
      const rawCompany = row.company || row.business_name || standard["Company Name"] || standard["Business Name"] || "";
      const product = row.product || standard["Current Product"] || standard["Current Plan"] || "";
      const name = cleanLeadDisplayValue(rawName);
      const company = cleanLeadDisplayValue(rawCompany);
      const validationIssues = leadValidationIssues({ name: rawName, email, company: rawCompany, validationStatus: row.validation_status });
      const eligibility = draftEligibility({
        name: rawName,
        email,
        company: rawCompany,
        product,
        validationStatus: row.validation_status,
        doNotContact: row.do_not_contact,
        archivedAt: row.archived_at,
      });
      if (!eligibility.ready) return null;
      return {
        id: `lead-ready-${row.id}`,
        leadId: row.id,
        name: name || "Missing contact",
        rawName,
        company: company || "Missing business/practice",
        rawCompany,
        email: leadEmailStatus(email) === "Valid" ? email : "",
        rawEmail: email,
        emailStatus: leadEmailStatus(email),
        product,
        subject1: `${name || "Hello"} - a practical next step for ${company || "your team"}`,
        subject2: `${company || "Your team"}: review ${product || "your current plan"}`,
        previewText: "Draft-ready lead. Save or refresh the lead from Records to create a D1 draft row for approval.",
        body: "This lead is draft-ready but does not yet have a saved draft row. Open the lead in Records and save it to create the reviewable D1 draft.",
        cta: "Create review draft from Records",
        personalization: ["Contact Name", "Company Name", "Current Product"],
        qaScore: 0,
        spamRisk: "Low",
        status: "Pending Review",
        isD1Backed: false,
        source: "lead_ready",
        storageSource: "lead",
        expanded: false,
        revisionCount: 0,
        sourceIndex: drafts.length + index,
        importBatchId: row.import_batch_id,
        sourceRowId: row.source_row_id,
        sourceFile: row.file_name,
        sourceLabel: sourceLabel(row, standard),
        importedAt: row.imported_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        validationIssues,
        hasValidationProblems: validationIssues.length > 0,
        draftEligibility: eligibility,
        draftReadyLeadOnly: true,
      };
    }).filter(Boolean);

    return NextResponse.json({ status: "success", drafts: [...drafts, ...draftReadyLeads] });
  } catch {
    return NextResponse.json({ status: "local", drafts: [], warning: "Draft database table is not available in this local environment." });
  }
}
