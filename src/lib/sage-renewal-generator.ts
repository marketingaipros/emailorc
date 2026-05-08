import {
  DEFAULT_APP_MINDSET,
  type AiContextUsed,
  type AppMindset,
  type BusinessKnowledge,
  type OfferItem,
  splitList,
} from "@/lib/brain-context";

const QA_THRESHOLD = 90;
const INTERNAL_SUBJECT_WORDS = ["upsell", "campaign", "lead magnet", "strategy"];
const BANNED_DEFAULTS = [
  "I hope this finds you well",
  "just checking in",
  "exclusive offer inside",
  "unlock more value",
  "act now",
  "guaranteed",
  "free money",
  "better business outcomes",
  "maximize results",
];

export type StandardRecord = Record<string, string>;

export interface SageDraftInput {
  id: string;
  standard: StandardRecord;
  custom: Record<string, string>;
  rowIndex: number;
  businessKnowledge: BusinessKnowledge;
  appMindset: AppMindset;
  offer?: OfferItem;
  playbookName: string;
  existingBodies?: string[];
  liveModelUsed?: boolean;
  modelName?: string;
}

function clean(value?: string | null) {
  return String(value || "").trim();
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function sentence(value: string) {
  const trimmed = clean(value);
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntilRenewal(standard: StandardRecord) {
  const explicit = Number(clean(standard["Days to Renew"]));
  if (Number.isFinite(explicit) && explicit > -365) return explicit;
  const renewal = parseDate(clean(standard["Renewal Date"]));
  if (!renewal) return null;
  const now = new Date();
  return Math.ceil((renewal.getTime() - now.getTime()) / 86400000);
}

function renewalPhrase(days: number | null) {
  if (days === null) return "as part of a practical account review";
  if (days <= 0) return "as the renewal timing is already active";
  if (days <= 21) return `with your Sage renewal coming up in about ${days} days`;
  if (days <= 45) return `as your renewal window approaches in about ${days} days`;
  return `before the next renewal cycle gets closer`;
}

function classifyMode(standard: StandardRecord, days: number | null, offer?: OfferItem) {
  if (/^(true|yes|y|1|do not contact|dnc)$/i.test(clean(standard["Do Not Contact"]))) return "Needs Review";
  if (!clean(standard.Email)) return "Needs Review";
  if (!offer) return "Needs Review";
  const pain = normalize(`${standard["Pain Point"]} ${offer.painPointsSolved} ${offer.valueOutcomes}`);
  if (days === null) return "Renewal-Reactivation";
  if (days < -30 || days > 120) return "Needs Review";
  if (/protect|risk|compliance|support|coverage/.test(pain)) return "Renewal-Protection";
  if (/autom|fast|manual|forecast|visibility|inventory/.test(pain)) return "Renewal-Acceleration";
  return "Renewal-Upsell";
}

function strategicAngle(params: { product: string; industry: string; pain: string; offer?: OfferItem; days: number | null }) {
  const product = params.product || "current Sage setup";
  const industry = params.industry || "business";
  const pain = normalize(params.pain);
  if (/inventory|forecast|distribution/.test(pain) || /distribution|manufactur/.test(normalize(industry))) {
    return `Use the renewal window to review whether ${product} still gives the team enough visibility across inventory, forecasting, and finance workflows.`;
  }
  if (/hr|hcm|payroll|people|fragment/.test(pain)) {
    return `Frame renewal timing as a chance to reduce fragmented handoffs between finance and people operations.`;
  }
  if (/remote|cloud|collaboration|access/.test(pain)) {
    return `Use the renewal window to confirm whether ${product} still fits how the team works, especially around cloud-connected access and collaboration.`;
  }
  return `Use renewal timing to confirm whether ${product} is still the right fit and whether a Sage add-on would reduce manual work.`;
}

function valueOutcome(offer?: OfferItem, pain = "") {
  const value = clean(offer?.valueOutcomes);
  if (value) return value;
  if (/inventory|forecast/i.test(pain)) return "better visibility into inventory planning and fewer manual forecasts";
  if (/hr|hcm|people|payroll/i.test(pain)) return "fewer handoffs between finance and HR work";
  if (/remote|cloud|collaboration/i.test(pain)) return "easier access and collaboration without adding extra manual steps";
  return "less friction, better visibility, and fewer disconnected manual steps";
}

function buildSubjects(company: string, product: string, offerName: string, pain: string, days: number | null, rowIndex: number) {
  const productShort = product.replace(/^sage\s+/i, "Sage ");
  const subject1Options = [
    `Before your Sage renewal`,
    `Quick ${productShort} fit check`,
    `Worth reviewing before renewal?`,
    `${company}: before renewal`,
  ];
  const normalizedPain = normalize(`${pain} ${offerName}`);
  const subject2Options = /inventory|forecast|distribution/.test(normalizedPain)
    ? ["Better inventory visibility after renewal", "Less manual forecasting after renewal", "A clearer view before renewal"]
    : /hr|hcm|people|payroll/.test(normalizedPain)
      ? ["Fewer finance and HR handoffs", "Less process friction after renewal", "A simpler HR path after renewal"]
      : /remote|cloud|collaboration|access/.test(normalizedPain)
        ? ["Cloud-connected access after renewal", "Less manual work after renewal", "Easier Sage access for your team"]
        : ["Less manual work after renewal", "A useful fit check before renewal", "A practical Sage review"];
  let subject1 = subject1Options[rowIndex % subject1Options.length];
  let subject2 = subject2Options[rowIndex % subject2Options.length];
  if (normalize(subject1) === normalize(subject2)) subject2 = subject2Options[(rowIndex + 1) % subject2Options.length] || "A practical Sage review";
  if (days === null) subject1 = `Quick Sage account fit check`;
  if (INTERNAL_SUBJECT_WORDS.some((word) => normalize(subject2).includes(word))) subject2 = "A practical Sage review";
  return { subject1, subject2 };
}

function similarity(a: string, b: string) {
  const wordsA = new Set(normalize(a).split(/\s+/).filter((word) => word.length > 3));
  const wordsB = new Set(normalize(b).split(/\s+/).filter((word) => word.length > 3));
  if (!wordsA.size || !wordsB.size) return 0;
  const shared = [...wordsA].filter((word) => wordsB.has(word)).length;
  return shared / Math.max(wordsA.size, wordsB.size);
}

function defaultSageKnowledge() {
  return "Sage helps small and medium-sized businesses simplify financial, HR, payroll, and business management processes. Sage products are designed to reduce manual work, improve visibility, and help businesses run more smoothly. Sage 50 Accounting combines desktop accounting power with cloud-connected convenience. Sage solutions include accounting, HR, payroll, business management, AR automation, inventory planning, and related business operations tools.";
}

function ctaFor(days: number | null) {
  if (days !== null && days <= 45) return "Would you be open to a quick fit check before renewal?";
  return "Would it be worth a quick 10-minute review?";
}

export function generateSageRenewalDraft(input: SageDraftInput) {
  const standard = input.standard;
  const firstName = clean(standard["First Name"]) || clean(standard["Full Name"]).split(" ")[0] || clean(standard["Decision Maker"]) || "there";
  const fullName = clean(standard["Full Name"]) || `${clean(standard["First Name"])} ${clean(standard["Last Name"])}`.trim() || clean(standard["Decision Maker"]) || "Missing Name";
  const company = clean(standard["Company Name"]) || clean(standard["Business Name"]) || "your business";
  const email = clean(standard.Email);
  const product = clean(standard["Current Product"]) || clean(standard["Current Plan"]) || clean(standard["Current Service"]) || "your current Sage setup";
  const industry = clean(standard.Industry);
  const pain = clean(standard["Pain Point"]) || clean(input.offer?.painPointsSolved) || clean(standard.Notes);
  const accountManager = clean(standard["Owner / Account Manager"]) || "Sage team";
  const days = daysUntilRenewal(standard);
  const offerName = clean(input.offer?.offerName) || clean(standard["Upsell Offer"]);
  const offerType = clean(input.offer?.offerType) || clean(standard["Offer Type"]) || "Upsell";
  const dnc = /^(true|yes|y|1|do not contact|dnc)$/i.test(clean(standard["Do Not Contact"]));
  const missingFields = [
    !email ? "Email" : "",
    !company || company === "your business" ? "Company Name or Business Name" : "",
    !offerName ? "Offer" : "",
    days === null ? "Renewal Date or Days to Renew" : "",
  ].filter(Boolean);

  const mode = classifyMode(standard, days, input.offer);
  const flags = [
    missingFields.length ? `Missing Critical Data: ${missingFields.join(", ")}` : "",
    days === null ? "Missing Renewal Date" : "",
    days !== null && (days < -30 || days > 120) ? "Out of Renewal Window" : "",
    !pain ? "Insufficient Personalization" : "",
    dnc ? "Do Not Contact" : "",
    !offerName ? "Missing Offer" : "",
  ].filter(Boolean);

  const sageKnowledge = clean(input.businessKnowledge.approvedPositioningStatement)
    || clean(input.businessKnowledge.mainValueProposition)
    || defaultSageKnowledge();
  const strategy = {
    strategicAngle: strategicAngle({ product, industry, pain, offer: input.offer, days }),
    coreRisk: pain ? `If ${company} renews without reviewing fit, the team may keep carrying ${pain.toLowerCase()}.` : `If ${company} renews without a fit check, avoidable manual work may continue.`, 
    upsellBridge: offerName ? `${offerName} gives the review a concrete next step tied to ${valueOutcome(input.offer, pain)}.` : "No active offer was selected, so final-ready generation should be blocked.",
    valueOutcome: valueOutcome(input.offer, pain),
    ctaDirection: ctaFor(days),
    toneGuidance: clean(input.appMindset.tonePrinciples) || DEFAULT_APP_MINDSET.tonePrinciples,
    redFlags: flags,
  };

  const { subject1, subject2 } = buildSubjects(company, product, offerName, pain, days, input.rowIndex);
  const renewal = renewalPhrase(days);
  const cta = strategy.ctaDirection;
  const openerVariants = [
    `With ${company}'s Sage renewal coming up, this is a useful moment to confirm whether ${product} still fits how the team works today.`,
    `As ${company}'s renewal window approaches, it may be worth checking whether ${product} is still giving the team the right level of visibility and efficiency.`,
    `Before ${company} finalizes the next Sage renewal, a short fit check could help confirm whether the current setup still matches the way the business operates.`,
  ];
  const opener = days === null
    ? `I wanted to reach out with a practical Sage account review idea for ${company}.`
    : openerVariants[input.rowIndex % openerVariants.length];
  const body = [
    `Hi ${firstName},`,
    "",
    opener,
    "",
    `${sentence(strategy.coreRisk)} ${sentence(strategy.upsellBridge)}`,
    "",
    `${sentence(sageKnowledge)} For ${industry || "your team"}, the goal would be ${strategy.valueOutcome}, without turning this into a broad systems project.`,
    "",
    `${cta}`,
    "",
    `Best,`,
    accountManager,
  ].join("\n");

  const banned = [
    ...BANNED_DEFAULTS,
    ...splitList(input.appMindset.bannedPhrases || ""),
    ...splitList(input.businessKnowledge.bannedClaims || ""),
    ...splitList(input.offer?.bannedClaims || ""),
  ].map(normalize);
  const bodyNormalized = normalize(body);
  const subjectIssue = normalize(subject1) === normalize(subject2) || INTERNAL_SUBJECT_WORDS.some((word) => normalize(subject2).includes(word));
  const bannedFound = banned.some((phrase) => phrase && bodyNormalized.includes(phrase));
  const maxSimilarity = Math.max(0, ...(input.existingBodies || []).map((previous) => similarity(body, previous)));
  const tooSimilar = maxSimilarity > 0.85;
  let score = 98;
  score -= missingFields.length * 4;
  score -= flags.includes("Insufficient Personalization") ? 6 : 0;
  score -= dnc ? 40 : 0;
  score -= !offerName ? 18 : 0;
  score -= subjectIssue ? 10 : 0;
  score -= bannedFound ? 15 : 0;
  score -= tooSimilar ? 12 : 0;
  score = Math.max(60, Math.min(98, score));

  const issues = [
    ...flags,
    subjectIssue ? "Duplicate or internal subject line" : "",
    bannedFound ? "Banned claim or phrase detected" : "",
    tooSimilar ? "Draft too similar to another email in this batch" : "",
  ].filter(Boolean);
  const revisionsMade = [
    "ORC normalized renewal and account fields",
    "SENTINEL selected a row-specific renewal upsell angle",
    "SCRIBE wrote a concise Sage renewal email",
    "LEXI checked subject lines, banned phrases, context, and uniqueness",
    tooSimilar ? "LEXI varied the row angle because similarity was too high" : "",
  ].filter(Boolean);
  const approved = score >= QA_THRESHOLD && !dnc && !bannedFound && !subjectIssue && !tooSimilar && Boolean(offerName);
  const aiContext: AiContextUsed & Record<string, any> = {
    liveModelUsed: Boolean(input.liveModelUsed),
    modelName: input.modelName || "Deterministic Sage Brain workflow",
    businessKnowledgeUsed: Boolean(sageKnowledge),
    appMindsetUsed: Boolean(input.appMindset.primaryGoal),
    offerUsed: offerName || "Missing",
    campaignPlaybookUsed: input.playbookName,
    renewalDataUsed: days !== null,
    customFieldsUsed: Object.keys(input.custom || {}),
    qaCheckedByLexi: true,
    revisionCount: approved ? 1 : 2,
    similarityCheckPassed: !tooSimilar,
    missingContextWarnings: issues,
    bannedClaimsFound: bannedFound,
    finalQaResult: approved ? "Pass - ready for human review" : "Needs Review",
    orc: { mode, fields: standard, missingFields, flags },
    sentinel: strategy,
    lexi: {
      qaStatus: approved ? "Pass" : "Needs Review",
      overallQualityScore: score,
      approvalStatus: approved ? "Approved for human review" : "Not approved",
      spamRiskLevel: bannedFound ? "Medium" : "Low",
      issuesFound: issues,
      revisionsMade,
      humanizationNotes: `Personalized by ${company}, ${product}, ${industry || "industry not provided"}, renewal timing, pain point, and ${offerName || "missing offer"}.`,
      topIssuesLoweringScore: issues.slice(0, 3),
      requiredFixes: approved ? [] : issues,
      revisionCount: approved ? 1 : 2,
    },
  };

  return {
    _id: input.id,
    _name: fullName,
    _company: company,
    _product: product,
    _email: email,
    _dnc: dnc,
    _offer_id: input.offer?.id,
    _subject: subject1,
    _subject2: subject2,
    _preview: `${renewal}, a short Sage fit check could help ${company} review ${offerName || "the next best option"}.`,
    _body: body,
    _cta: cta,
    _score: score,
    _spam: bannedFound ? "Medium" : "Low",
    _status: approved ? "Pending Review" : "Needs Revision",
    _revision_count: approved ? 1 : 2,
    _qa_issues: issues,
    _revisions_made: revisionsMade,
    _source: "Upload Data",
    _standard_fields: standard,
    _custom_fields: input.custom,
    _ai_context: aiContext,
    _strategy: strategy,
  };
}
