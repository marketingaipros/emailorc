export const BUSINESS_KNOWLEDGE_KEY = "emailorcBusinessKnowledge";
export const APP_MINDSET_KEY = "emailorcAppMindset";
export const OFFER_LIBRARY_KEY = "emailorcOfferLibrary";
export const MAPPING_TEMPLATES_KEY = "emailorcMappingTemplates";
export const DEVELOPER_KNOWLEDGE_KEY = "emailorcDeveloperKnowledge";
export const VOICE_MEMORY_KEY = "emailorcVoiceMemory";
export const LEARNING_LOG_KEY = "emailorcLearningLog";
export const ACCOUNT_CONTEXT_KEY = "emailorcAccountContexts";

export type BrainStatus = "Incomplete" | "Ready";
export type ApprovalStatus = "Draft" | "Approved" | "Needs Review";
export type AccountContextSaveMode = "use_once" | "contact" | "company";
export type AccountContextStatus = "None" | "Basic" | "Strong" | "Detailed";
export type PersonalizationLevel = "Basic" | "Industry" | "Account-Specific";

export interface ManualAccountContext {
  rawText: string;
  currentPlan: string;
  currentProduct: string;
  renewalMonth: string;
  renewalDate: string;
  businessDescription: string;
  industry: string;
  painPoints: string;
  operationalNotes: string;
  crmNotes: string;
  websiteResearchNotes: string;
  recommendedUpsell: string;
  personalizationAngle: string;
  sourceOfInformation: string;
  confidenceLevel: "Low" | "Medium" | "High" | "";
  saveMode: AccountContextSaveMode;
  savedAt?: string;
}

export interface BusinessKnowledge {
  companyName: string;
  website: string;
  industry: string;
  businessDescription: string;
  productsServices: string;
  targetCustomers: string;
  idealCustomerProfile: string;
  customerPainPoints: string;
  mainValueProposition: string;
  competitiveAdvantages: string;
  approvedPositioningStatement: string;
  approvedClaims: string;
  bannedClaims: string;
  faqs: string;
  caseStudies: string;
  complianceNotes: string;
  internalTerminology: string;
  wordsToAvoid: string;
  customerObjections: string;
  preferredCtaLanguage: string;
  sourceDocumentsUsed: string;
  lastUpdated?: string;
  approvedBy?: string;
  status?: ApprovalStatus;
}

export interface AppMindset {
  primaryGoal: string;
  emailPhilosophy: string;
  salesPhilosophy: string;
  tonePrinciples: string;
  structureRules: string;
  ctaPhilosophy: string;
  personalizationRules: string;
  deliverabilityRules: string;
  qualityThreshold: string;
  humanApprovalRules: string;
  noInventedFactsRule: string;
  riskFramingRules: string;
  bannedPhrases: string;
  preferredEmailFramework: string;
  outputFormatRules: string;
  lastUpdated?: string;
  approvedBy?: string;
  status?: ApprovalStatus;
}

export interface OfferItem {
  id: string;
  offerName: string;
  offerType: string;
  description: string;
  targetSegment: string;
  bestFitCustomerType: string;
  bestFitIndustries: string;
  painPointsSolved: string;
  upsellTriggers: string;
  valueOutcomes: string;
  approvedClaims: string;
  bannedClaims: string;
  ctaOptions: string;
  discoveryCallLink: string;
  leadMagnetLink: string;
  pricingNotes: string;
  qualificationRules: string;
  redFlags: string;
  relatedCampaignPlaybooks: string;
  primaryObjections: string;
  approvedObjectionResponses: string;
  status: "Active" | "Draft" | "Approved" | "Needs Review" | "Archived";
  lastUpdated?: string;
  approvedBy?: string;
}

export interface MappingTemplate {
  id: string;
  templateName: string;
  sourceType: string;
  fieldMappings: Record<string, string>;
  customFields: string[];
  createdBy: string;
  organization: string;
  lastUsed?: string;
}

export interface DeveloperKnowledgeItem {
  id: string;
  title: string;
  type: string;
  sourceFile: string;
  summary: string;
  status: "Draft" | "Approved / Active" | "Needs Review";
  lastUpdated?: string;
  usedFor: string;
  notes: string;
  active: boolean;
}

export interface AiContextUsed {
  liveModelUsed?: boolean;
  modelName?: string;
  businessKnowledgeUsed: boolean;
  appMindsetUsed: boolean;
  offerUsed: string;
  campaignPlaybookUsed: string;
  renewalDataUsed?: boolean;
  customFieldsUsed: string[];
  accountContextUsed?: boolean;
  accountIntelligenceSaved?: boolean;
  accountContextStatus?: AccountContextStatus;
  personalizationLevel?: PersonalizationLevel;
  manualAccountContextSummary?: string;
  accountContextSaveMode?: AccountContextSaveMode;
  qaCheckedByLexi?: boolean;
  revisionCount?: number;
  similarityCheckPassed?: boolean;
  missingContextWarnings: string[];
  bannedClaimsFound: boolean;
  finalQaResult: string;
  orc?: Record<string, any>;
  sentinel?: Record<string, any>;
  lexi?: Record<string, any>;
  feedbackRulesApplied?: string[];
  approvedExampleUsed?: string;
  styleExampleMatchStatus?: string;
  offerAlignmentStatus?: string;
  appMindsetComplianceStatus?: string;
  internalLanguageCheckPassed?: boolean;
  similarityScore?: number;
}

export interface ApprovedStyleExample {
  id: string;
  title: string;
  type: "Preferred Style Example" | "Offer-Specific Example" | "Campaign-Specific Example" | "Sage Renewal Example";
  subjectLine1: string;
  subjectLine2: string;
  previewText: string;
  emailBody: string;
  cta: string;
  instruction: string;
  status: "Draft" | "Approved" | "Active";
  offerName?: string;
  createdAt?: string;
  approvedBy?: string;
}

export interface VoiceMemory {
  preferredOpenings: string;
  preferredCtas: string;
  preferredSubjectLineStyle: string;
  bannedPhrases: string;
  rejectedPhrases: string;
  rejectedStructures: string;
  offerSpecificRules: string;
  companySpecificRules: string;
  approvedDraftPatterns: string;
  approvedExamples: ApprovedStyleExample[];
  lastUpdated?: string;
}

export interface LearningLogItem {
  feedback_id: string;
  organization_id: string;
  user_id: string;
  source: "draft" | "edit" | "rejection" | "manual" | "example";
  related_draft_id?: string;
  related_offer_id?: string;
  related_campaign_id?: string;
  feedback_type: string;
  feedback_text: string;
  suggested_rule: string;
  status: "pending" | "approved" | "rejected" | "active";
  created_at: string;
  approved_by?: string;
}

export const DEFAULT_BUSINESS_KNOWLEDGE: BusinessKnowledge = {
  companyName: "",
  website: "",
  industry: "",
  businessDescription: "",
  productsServices: "",
  targetCustomers: "",
  idealCustomerProfile: "",
  customerPainPoints: "",
  mainValueProposition: "",
  competitiveAdvantages: "",
  approvedPositioningStatement: "",
  approvedClaims: "",
  bannedClaims: "",
  faqs: "",
  caseStudies: "",
  complianceNotes: "",
  internalTerminology: "",
  wordsToAvoid: "",
  customerObjections: "",
  preferredCtaLanguage: "",
  sourceDocumentsUsed: "",
  status: "Draft",
};

export const DEFAULT_APP_MINDSET: AppMindset = {
  primaryGoal: "Turn customer/account records into approved, client-ready upsell outreach.",
  emailPhilosophy: "Every email should be useful, specific, commercially relevant, and easy to act on.",
  salesPhilosophy: "Do not sell the product first. Sell the business outcome, risk reduction, efficiency gain, workload relief, or opportunity being missed.",
  tonePrinciples: "Professional, practical, human, confident, and low-pressure.",
  structureRules: "Use a natural PAS-style flow: Problem -> Impact -> Solution -> Low-friction CTA.",
  ctaPhilosophy: "Use one clear CTA only. Keep it low-friction.",
  personalizationRules: "Use only verified data from the customer record, Business Knowledge, Offer Library, or approved campaign playbook.",
  deliverabilityRules: "Avoid hype, exaggerated urgency, spam-heavy language, all caps, excessive punctuation, and multiple CTAs.",
  qualityThreshold: "Minimum QA score: 90/100.",
  humanApprovalRules: "Every draft must be reviewed and approved before export or send.",
  noInventedFactsRule: "Never invent details, results, customer facts, savings, or relationship history.",
  riskFramingRules: "Use practical risk framing: missed opportunities, manual workload, delayed follow-up, compliance exposure, operational friction.",
  bannedPhrases: "I hope this finds you well, just checking in, exclusive offer inside, unlock more value, act now, guaranteed, free money",
  preferredEmailFramework: "PAS: Problem -> Impact -> Solution -> CTA.",
  outputFormatRules: "Subject Line 1, Subject Line 2, Preview Text, Email Body, CTA, Personalization Used, QA Score, Approval Status.",
  status: "Approved",
};

export const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: "offer-growth-ops",
    offerName: "Account Growth Strategy Review",
    offerType: "Upsell",
    description: "A short review that identifies practical next-step opportunities for an existing account.",
    targetSegment: "Existing customers with expansion potential",
    bestFitCustomerType: "Client Admin",
    bestFitIndustries: "Professional services, operations, SaaS, account-based teams",
    painPointsSolved: "Missed follow-up, underused features, renewal risk, stalled account growth",
    upsellTriggers: "Renewal window, usage plateau, support volume increase, new team members",
    valueOutcomes: "Clearer next steps, better account coverage, reduced manual follow-up",
    approvedClaims: "Can help teams identify practical growth opportunities and reduce missed follow-up.",
    bannedClaims: "Guaranteed revenue, instant growth, replaces your sales team",
    ctaOptions: "Schedule a 15-minute strategy review",
    discoveryCallLink: "",
    leadMagnetLink: "",
    pricingNotes: "",
    qualificationRules: "Has email and company/name, is not do-not-contact, has a relevant offer trigger.",
    redFlags: "Do-not-contact, no email, no business/name, unsupported claims required.",
    relatedCampaignPlaybooks: "Expansion Outreach, Renewal Save, Usage Lift",
    primaryObjections: "Too busy, not a priority, already have a process, unsure about value.",
    approvedObjectionResponses: "Acknowledge the concern, keep the ask small, and offer a practical example or short review.",
    status: "Active",
  },
];

export const DEFAULT_DEVELOPER_KNOWLEDGE: DeveloperKnowledgeItem[] = [
  {
    id: "dev-openrouter-api-guide",
    title: "OpenRouter API Integration Guide",
    type: "API Documentation",
    sourceFile: [
      "context7.com_llmstxt_openrouter_ai_llms-full_txt_llms.txt_tokens=10000.pdf",
      "context7.com_websites_openrouter_ai_llms.txt_tokens=10000.pdf",
    ].join(", "),
    summary: "Technical reference for OpenRouter key verification, model list checks, chat completions, response parsing, usage diagnostics, and safe error handling. This is developer/API knowledge only and is excluded from sales email generation context.",
    status: "Approved / Active",
    lastUpdated: new Date().toISOString(),
    usedFor: "OpenRouter API connection, Model Test Chat, model list sync, API key verification, response parsing, usage/credit diagnostics, error handling",
    notes: "Use GET /api/v1/key for key checks, GET /api/v1/models for model availability, and POST /api/v1/chat/completions with choices[0].message.content parsing for live model verification.",
    active: true,
  },
];

export const DEFAULT_VOICE_MEMORY: VoiceMemory = {
  preferredOpenings: "With your Sage renewal coming up; As your renewal window approaches; Before the renewal is finalized",
  preferredCtas: "Would it be worth a quick 10-minute review?; Would you be open to a quick fit check before renewal?; Reply with a good time, or I can send over a few options.",
  preferredSubjectLineStyle: "Short, customer-facing, renewal-aware, practical. Avoid internal words like upsell, strategy, campaign, and account growth.",
  bannedPhrases: "Account Growth Strategy Review, Strategic Angle, Core Risk, Upsell Bridge, Value Outcome, CTA Direction, renewal risk, stalled account growth, better account coverage, missed follow-up, underused features, clearer next steps, campaign mode, upsell results, account growth",
  rejectedPhrases: "",
  rejectedStructures: "Do not write 'If [company] renews without reviewing fit...' in final copy. Do not paste internal strategy fields into the email body.",
  offerSpecificRules: "For Sage cloud-connected upgrades, emphasize cloud-connected access, flexibility, collaboration, less manual work, and keeping accounting tools the customer already relies on.",
  companySpecificRules: "",
  approvedDraftPatterns: "Renewal timing -> useful fit review -> selected Sage offer/value angle -> practical outcome -> low-friction CTA.",
  approvedExamples: [
    {
      id: "voice-example-cloud-service-upsell",
      title: "Cloud Service Upsell Email",
      type: "Sage Renewal Example",
      subjectLine1: "Before your Sage renewal",
      subjectLine2: "Is cloud access worth reviewing?",
      previewText: "A quick review before renewal can help confirm whether your current Sage setup still fits how your team works.",
      emailBody: `Hi {{First Name}},

With your Sage renewal coming up, this is a good time to confirm whether your current setup still fits how your business operates day to day.

Many teams are looking for easier access, less manual work, and fewer limits around where and how they manage accounting. A cloud-connected Sage option can help give your team more flexibility while keeping the accounting tools they already rely on.

The goal is not to change systems just for the sake of changing. It is to make sure your renewal supports the way your business is working now — especially if remote access, collaboration, automation, or fewer manual steps would make things easier.

Would it be worth a quick 10-minute review to see whether a cloud-connected option makes sense before your renewal is finalized?`,
      cta: "Reply with a good time, or I can send over a few options.",
      instruction: "Use this as a style reference, not copy to duplicate. Future Sage cloud/service upsell emails should follow this level of clarity, structure, tone, and renewal relevance.",
      status: "Active",
      offerName: "Cloud Service Upsell / Sage cloud-connected upgrade",
      createdAt: new Date().toISOString(),
    },
  ],
};

export function contextStatus(value: Record<string, string>, requiredKeys: string[]): BrainStatus {
  return requiredKeys.every((key) => value[key]?.trim()) ? "Ready" : "Incomplete";
}

export function splitList(value = "") {
  return value.split(/,|\n/).map((item) => item.trim()).filter(Boolean);
}

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback as any, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function loadJsonArray<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
