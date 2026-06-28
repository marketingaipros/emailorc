import { isValidOutlookRecipientEmail } from "./microsoft/graph";
import { normalizeRole } from "./roles";

export type LeadEmailStatus = "Valid" | "Missing" | "Malformed";
export type LeadSortField = "name" | "company" | "email" | "source" | "importedAt" | "status";
export type LeadSortDirection = "asc" | "desc";
export type DraftSortField = "updatedAt" | "name" | "company" | "status" | "emailReadiness";
export type DraftEligibilityStatus = "draft_ready" | "not_draft_ready";
export type LifecycleReason =
  | "duplicate"
  | "wrong_source"
  | "test_demo_cleanup"
  | "bad_source_data"
  | "out_of_scope"
  | "compliance_or_dnc"
  | "operational_correction"
  | "other";

export const LEAD_PAGE_SIZES = [50, 100, 250] as const;
export const LIFECYCLE_REASON_LABELS: Record<LifecycleReason, string> = {
  duplicate: "Duplicate import or lead",
  wrong_source: "Wrong file or wrong source",
  test_demo_cleanup: "Test/demo cleanup",
  bad_source_data: "Bad or incomplete source data",
  out_of_scope: "Client/account no longer in scope",
  compliance_or_dnc: "Compliance or do-not-contact concern",
  operational_correction: "Operational correction",
  other: "Other",
};

export function leadEmailStatus(email: unknown): LeadEmailStatus {
  const value = String(email || "").trim();
  if (!value || isPlaceholderValue(value)) return "Missing";
  return isValidOutlookRecipientEmail(value) ? "Valid" : "Malformed";
}

export function isPlaceholderValue(input: unknown) {
  const value = String(input || "").trim();
  if (!value) return true;
  return /^(not found|n\/a|na|null|none|unknown|missing|undefined)$/i.test(value);
}

export function isLikelyScrapedNavigationName(input: unknown) {
  const value = String(input || "").trim();
  if (!value) return false;
  if (value.length > 72) return true;
  return /\b(toggle navigation|read our blog|home about|meet dr|with decades of experience)\b/i.test(value);
}

export function cleanLeadDisplayValue(input: unknown) {
  const value = String(input || "").trim();
  if (isPlaceholderValue(value) || isLikelyScrapedNavigationName(value)) return "";
  return value;
}

export function leadValidationIssues(input: {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  validationStatus?: unknown;
}) {
  const issues: string[] = [];
  if (!cleanLeadDisplayValue(input.name)) issues.push("Missing or invalid contact name");
  if (!cleanLeadDisplayValue(input.company)) issues.push("Missing business/practice");
  const emailStatus = leadEmailStatus(input.email);
  if (emailStatus === "Missing") issues.push("Missing email");
  if (emailStatus === "Malformed") issues.push("Malformed email");
  if (String(input.validationStatus || "").toUpperCase().includes("NEEDS")) issues.push("Needs review");
  return Array.from(new Set(issues));
}

export function draftEligibility(input: {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  product?: unknown;
  validationStatus?: unknown;
  doNotContact?: unknown;
  archivedAt?: unknown;
}) {
  const missing: string[] = [];
  if (!cleanLeadDisplayValue(input.name)) missing.push("valid contact name");
  if (!cleanLeadDisplayValue(input.company)) missing.push("business/practice name");
  if (!cleanLeadDisplayValue(input.product)) missing.push("product/current plan");
  const emailStatus = leadEmailStatus(input.email);
  if (emailStatus === "Missing") missing.push("valid email");
  if (emailStatus === "Malformed") missing.push("valid email");
  if (input.doNotContact) missing.push("not marked do-not-contact");
  if (input.archivedAt || String(input.validationStatus || "").toUpperCase() === "ARCHIVED") missing.push("active lead");
  if (String(input.validationStatus || "").toUpperCase().includes("NEEDS")) missing.push("validation review complete");
  return {
    status: missing.length ? "not_draft_ready" as DraftEligibilityStatus : "draft_ready" as DraftEligibilityStatus,
    ready: missing.length === 0,
    missing,
    label: missing.length ? "Not Draft Ready" : "Draft Ready",
    reason: missing.length ? `Missing: ${missing.join(", ")}` : "Eligible for Email Drafts.",
    emailStatus,
  };
}

export function normalizeDraftSortField(input: unknown): DraftSortField {
  const value = String(input || "");
  if (["updatedAt", "name", "company", "status", "emailReadiness"].includes(value)) {
    return value as DraftSortField;
  }
  return "updatedAt";
}

export function searchDrafts<T extends {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  rawEmail?: unknown;
}>(drafts: T[], query: unknown) {
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) return drafts;
  return drafts.filter((draft) => [
    draft.name,
    draft.company,
    draft.email,
    draft.rawEmail,
  ].some((value) => String(value || "").toLowerCase().includes(needle)));
}

export function sortDrafts<T extends {
  name?: unknown;
  company?: unknown;
  status?: unknown;
  emailStatus?: unknown;
  updatedAt?: unknown;
  createdAt?: unknown;
}>(drafts: T[], field: DraftSortField, direction: LeadSortDirection = "asc") {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...drafts].sort((a, b) => {
    const value = (draft: T) => {
      switch (field) {
        case "name":
          return String(draft.name || "").toLowerCase();
        case "company":
          return String(draft.company || "").toLowerCase();
        case "status":
          return String(draft.status || "").toLowerCase();
        case "emailReadiness":
          return String(draft.emailStatus || "").toLowerCase();
        case "updatedAt":
        default:
          return String(draft.updatedAt || draft.createdAt || "");
      }
    };
    const left = value(a);
    const right = value(b);
    if (left < right) return -1 * multiplier;
    if (left > right) return 1 * multiplier;
    return 0;
  });
}

export function normalizeLeadPageSize(input: unknown) {
  const parsed = Number(input);
  return LEAD_PAGE_SIZES.includes(parsed as any) ? parsed : 50;
}

export function normalizeLeadPage(input: unknown) {
  const parsed = Number(input);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export function normalizeLeadSortField(input: unknown): LeadSortField {
  const value = String(input || "");
  if (["name", "company", "email", "source", "importedAt", "status"].includes(value)) {
    return value as LeadSortField;
  }
  return "importedAt";
}

export function normalizeLeadSortDirection(input: unknown): LeadSortDirection {
  return String(input || "").toLowerCase() === "asc" ? "asc" : "desc";
}

export function leadSortSql(field: LeadSortField) {
  switch (field) {
    case "name":
      return "LOWER(COALESCE(l.contact_name, json_extract(l.standard_fields_json, '$.\"Full Name\"'), ''))";
    case "company":
      return "LOWER(COALESCE(l.company, l.business_name, json_extract(l.standard_fields_json, '$.\"Company Name\"'), json_extract(l.standard_fields_json, '$.\"Business Name\"'), ''))";
    case "email":
      return "LOWER(COALESCE(l.contact_email, json_extract(l.standard_fields_json, '$.Email'), ''))";
    case "source":
      return "LOWER(COALESCE(ib.file_name, json_extract(l.standard_fields_json, '$.\"Lead Source\"'), 'manual entry'))";
    case "status":
      return "LOWER(COALESCE(l.validation_status, ''))";
    case "importedAt":
    default:
      return "COALESCE(ib.created_at, l.created_at)";
  }
}

export function safeJsonParse(input: unknown) {
  try {
    return JSON.parse(String(input || "{}"));
  } catch {
    return {};
  }
}

export function sourceLabel(row: any, standard: Record<string, any>) {
  if (row.source_kind === "demo_fallback" || standard["Lead Source"] === "Demo fallback") {
    return "Demo fallback";
  }
  if (row.import_batch_id) {
    return row.file_name ? `Import: ${row.file_name}` : `Import batch ${row.import_batch_id}`;
  }
  return standard["Lead Source"] || standard.Source || "Manual entry";
}

export function normalizeLifecycleReason(input: unknown): LifecycleReason | null {
  const value = String(input || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return Object.prototype.hasOwnProperty.call(LIFECYCLE_REASON_LABELS, value) ? (value as LifecycleReason) : null;
}

export function normalizeLifecycleNote(input: unknown) {
  return String(input || "").trim().slice(0, 240);
}

export function canManageLifecycle(role: unknown) {
  const normalized = normalizeRole(role);
  return normalized === "super_admin" || normalized === "client_admin";
}
