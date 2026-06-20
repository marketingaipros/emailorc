export const STANDARD_IMPORT_FIELDS = [
  "Source Row ID",
  "First Name",
  "Last Name",
  "Full Name",
  "Decision Maker",
  "Business Name",
  "Company Name",
  "Email",
  "Phone",
  "Website",
  "Industry",
  "Customer Type",
  "Current Product",
  "Current Service",
  "Current Plan",
  "Renewal Date",
  "Days to Renew",
  "Account Status",
  "Last Contact Date",
  "Notes",
  "Pain Point",
  "Upsell Offer",
  "Offer Type",
  "Lead Source",
  "Do Not Contact",
  "Owner / Account Manager",
] as const;

export type StandardImportField = (typeof STANDARD_IMPORT_FIELDS)[number];
export type ImportMapping = Record<string, string>;
export type MappedImportRecord = {
  standard: Record<string, string>;
  custom: Record<string, string>;
};

export const IMPORT_FIELD_ALIASES: Record<StandardImportField, string[]> = {
  "Source Row ID": ["id", "row id", "source id", "source row id", "source_row_id", "record id"],
  "First Name": ["first", "first name", "firstname", "first_name"],
  "Last Name": ["last", "last name", "lastname", "last_name"],
  "Full Name": ["name", "full name", "contact name", "customer name", "full_name"],
  "Decision Maker": ["decision maker", "dm", "contact", "primary contact", "decision_maker"],
  "Business Name": ["business", "business name", "account", "business_name"],
  "Company Name": ["company", "company name", "organization", "account name", "company_name"],
  Email: ["email", "email address", "contact email", "email_address", "contact_email"],
  Phone: ["phone", "phone number", "mobile", "phone_number"],
  Website: ["website", "url", "domain"],
  Industry: ["industry", "vertical"],
  "Customer Type": ["customer type", "client type", "segment", "customer_type"],
  "Current Product": ["current product", "product", "current_product"],
  "Current Service": ["current service", "service", "current_service"],
  "Current Plan": ["current plan", "plan", "current_plan"],
  "Renewal Date": ["renewal date", "renewal", "renewal_date"],
  "Days to Renew": ["days to renew", "days until renewal", "days_to_renew"],
  "Account Status": ["account status", "status", "account_status"],
  "Last Contact Date": ["last contact", "last contact date", "last_contact_date"],
  Notes: ["notes", "account notes"],
  "Pain Point": ["pain", "pain point", "challenge", "pain_point"],
  "Upsell Offer": ["upsell", "upsell offer", "offer", "upsell_offer"],
  "Offer Type": ["offer type", "offer_type"],
  "Lead Source": ["lead source", "source", "lead_source"],
  "Do Not Contact": ["do not contact", "dnc", "opt out", "unsubscribe", "do_not_contact"],
  "Owner / Account Manager": ["owner", "account manager", "rep", "owner_account_manager"],
};

export type ImportValidationIssue = {
  level: "error" | "warning";
  code: "MISSING_REQUIRED_HEADER" | "MISSING_REQUIRED_VALUE" | "MISSING_IDENTITY" | "MISSING_RENEWAL_CONTEXT";
  message: string;
  field?: string;
  rowIndex?: number;
};

export type ImportValidationResult = {
  valid: boolean;
  errors: ImportValidationIssue[];
  warnings: ImportValidationIssue[];
};

export function normalizeImportHeader(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferImportMapping(headers: string[]) {
  return Object.fromEntries(headers.map((header) => {
    const normalized = normalizeImportHeader(header);
    const match = STANDARD_IMPORT_FIELDS.find((field) =>
      IMPORT_FIELD_ALIASES[field].some((alias) => normalized === normalizeImportHeader(alias))
    );
    return [header, match || "Ignore column"];
  }));
}

export function mapImportRecord(row: Record<string, any>, mapping: ImportMapping): MappedImportRecord {
  const standard: Record<string, string> = {};
  const custom: Record<string, string> = {};

  Object.entries(mapping).forEach(([header, target]) => {
    if (!target || target === "Ignore column") return;
    const value = String(row[header] ?? "").trim();
    if (!value) return;
    if ((STANDARD_IMPORT_FIELDS as readonly string[]).includes(target)) standard[target] = value;
    else custom[target] = value;
  });

  return { standard, custom };
}

function hasMappedField(mapping: ImportMapping, field: StandardImportField) {
  return Object.values(mapping).includes(field);
}

function rowEmail(row: any) {
  return String(row?._standard_fields?.Email || row?._email || row?.Email || row?.email || "").trim();
}

function rowIdentity(row: any) {
  return String(
    row?._standard_fields?.["Company Name"]
    || row?._standard_fields?.["Business Name"]
    || row?._standard_fields?.["Full Name"]
    || row?._standard_fields?.["Decision Maker"]
    || row?._company
    || row?._name
    || ""
  ).trim();
}

function rowRenewalContext(row: any) {
  return String(
    row?._standard_fields?.["Renewal Date"]
    || row?._standard_fields?.["Days to Renew"]
    || row?.["Renewal Date"]
    || row?.["Days to Renew"]
    || ""
  ).trim();
}

export function validateImportRows(params: {
  mapping: ImportMapping;
  records: any[];
  requireEmailHeader?: boolean;
}): ImportValidationResult {
  const errors: ImportValidationIssue[] = [];
  const warnings: ImportValidationIssue[] = [];
  const records = Array.isArray(params.records) ? params.records : [];

  if ((params.requireEmailHeader ?? true) && !hasMappedField(params.mapping, "Email")) {
    errors.push({
      level: "error",
      code: "MISSING_REQUIRED_HEADER",
      field: "Email",
      message: "Email is required. Map one uploaded column to Email before importing.",
    });
  }

  records.forEach((row, index) => {
    if (!rowEmail(row)) {
      errors.push({
        level: "error",
        code: "MISSING_REQUIRED_VALUE",
        field: "Email",
        rowIndex: index + 1,
        message: `Row ${index + 1} is missing Email. Add an email address or remove the row before importing.`,
      });
    }
    if (!rowIdentity(row)) {
      warnings.push({
        level: "warning",
        code: "MISSING_IDENTITY",
        field: "Business_Name_or_Decision_Maker",
        rowIndex: index + 1,
        message: `Row ${index + 1} is missing a company, business, full name, or decision maker. It can import, but will need review.`,
      });
    }
    if (!rowRenewalContext(row)) {
      warnings.push({
        level: "warning",
        code: "MISSING_RENEWAL_CONTEXT",
        field: "Renewal_Date_or_Days_to_Renew",
        rowIndex: index + 1,
        message: `Row ${index + 1} is missing Renewal Date or Days to Renew. It can import, but renewal timing will need review.`,
      });
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

export function formatImportValidationSummary(result: ImportValidationResult) {
  const firstError = result.errors[0]?.message;
  if (firstError) return firstError;
  const firstWarning = result.warnings[0]?.message;
  return firstWarning || "Import validation passed.";
}
