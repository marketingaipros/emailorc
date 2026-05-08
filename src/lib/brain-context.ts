export const BUSINESS_KNOWLEDGE_KEY = "emailorcBusinessKnowledge";
export const APP_MINDSET_KEY = "emailorcAppMindset";
export const OFFER_LIBRARY_KEY = "emailorcOfferLibrary";
export const MAPPING_TEMPLATES_KEY = "emailorcMappingTemplates";

export type BrainStatus = "Incomplete" | "Ready";
export type ApprovalStatus = "Draft" | "Approved" | "Needs Review";

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

export interface AiContextUsed {
  businessKnowledgeUsed: boolean;
  appMindsetUsed: boolean;
  offerUsed: string;
  campaignPlaybookUsed: string;
  customFieldsUsed: string[];
  missingContextWarnings: string[];
  bannedClaimsFound: boolean;
  finalQaResult: string;
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
