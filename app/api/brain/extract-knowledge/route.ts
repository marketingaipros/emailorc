import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FIELD_LABELS: Record<string, string[]> = {
  business_knowledge: [
    "Company Name", "Website", "Industry", "Business Description", "Primary Products / Services",
    "Target Customers", "Ideal Customer Profile", "Customer Pain Points", "Main Value Proposition",
    "Competitive Advantages", "Approved Positioning Statement", "Approved Claims", "Banned Claims",
    "FAQs", "Case Studies / Proof Points", "Common Customer Objections", "Compliance Notes",
    "Internal Terminology", "Words to Avoid", "Preferred CTA Language", "Source Documents Used",
  ],
  app_mindset: [
    "Primary Goal of the App", "Email Philosophy", "Sales Philosophy", "Tone Principles",
    "Email Structure Rules", "CTA Philosophy", "Personalization Rules", "Deliverability Rules",
    "Quality Threshold", "Human Approval Rules", "No Invented Facts Rule", "Risk-Framing Rules",
    "Banned Phrases", "Preferred Email Framework", "Output Format Rules",
  ],
  offer_library: [
    "Offer Name", "Offer Type", "Description", "Target Segment", "Best-Fit Customer Type",
    "Best-Fit Industries", "Pain Points Solved", "Upsell Triggers", "Value Outcomes",
    "Approved Claims", "Banned Claims", "CTA Options", "Discovery Call Link", "Lead Magnet Link",
    "Pricing Notes", "Qualification Rules", "Red Flags", "Related Campaign Playbooks",
    "Primary Objections", "Approved Objection Responses",
  ],
};

function normalizeTarget(target: string) {
  const raw = target.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
  if (raw.includes("offer")) return "offer_library";
  if (raw.includes("mindset")) return "app_mindset";
  if (raw.includes("business") || raw.includes("knowledge")) return "business_knowledge";
  return "business_knowledge";
}

function scoreTarget(text: string, target: string) {
  const haystack = text.toLowerCase();
  return FIELD_LABELS[target].reduce((score, label) => {
    const words = label.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 3);
    return score + words.filter((word) => haystack.includes(word)).length;
  }, 0);
}

function autoDetect(text: string) {
  return Object.keys(FIELD_LABELS).sort((a, b) => scoreTarget(text, b) - scoreTarget(text, a))[0];
}

function findValue(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exact = new RegExp(`${escaped}\\s*[:=-]\\s*([^\\n]+(?:\\n(?![A-Z][A-Za-z /-]{2,40}\\s*[:=-]).+)*)`, "i").exec(text);
  if (exact?.[1]) return exact[1].trim().slice(0, 1200);

  const words = label.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 3);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const line = lines.find((candidate) => words.some((word) => candidate.toLowerCase().includes(word)));
  return line ? line.slice(0, 600) : "";
}

function confidenceFor(value: string, label: string) {
  if (!value) return "Low";
  if (value.toLowerCase().startsWith(label.toLowerCase())) return "High";
  return value.length > 80 ? "Medium" : "Low";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const fileName = String(body.uploaded_file_reference?.name || body.file_name || "uploaded file");
  const text = String(body.uploaded_file_reference?.text || body.file_text || "");
  const requestedTarget = String(body.extraction_target || "Auto-detect");
  const recommendedSection = requestedTarget.toLowerCase().includes("auto") ? autoDetect(text) : normalizeTarget(requestedTarget);
  const labels = FIELD_LABELS[recommendedSection] || FIELD_LABELS.business_knowledge;

  if (!text.trim()) {
    return NextResponse.json({
      extracted_fields: [],
      confidence_by_field: {},
      source_snippets: {},
      missing_fields: labels,
      recommended_section: recommendedSection,
      warnings: ["No readable text was found. For PDF/DOCX/XLSX, upload extracted text or a CSV export in this demo build."],
    });
  }

  const extracted = labels.map((label) => {
    const value = findValue(text, label);
    return {
      field: label,
      extracted_value: value,
      confidence: confidenceFor(value, label),
      source_snippet: value ? value.slice(0, 180) : "",
      action: value ? "Accept" : "Reject",
    };
  });

  const missing = extracted.filter((item) => !item.extracted_value).map((item) => item.field);
  const warnings = [
    missing.length ? `${missing.length} recommended fields were not found.` : "",
    /guaranteed|free money|replace all staff/i.test(text) ? "Potential unsupported or banned claims need review." : "",
  ].filter(Boolean);

  return NextResponse.json({
    extracted_fields: extracted,
    confidence_by_field: Object.fromEntries(extracted.map((item) => [item.field, item.confidence])),
    source_snippets: Object.fromEntries(extracted.map((item) => [item.field, item.source_snippet])),
    missing_fields: missing,
    recommended_section: recommendedSection,
    warnings,
    file_name: fileName,
  });
}
