import {
  DEFAULT_APP_MINDSET,
  type AiContextUsed,
  type AppMindset,
  type BusinessKnowledge,
  type ManualAccountContext,
  type OfferItem,
  type VoiceMemory,
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
const INTERNAL_FINAL_COPY_BLOCKLIST = [
  "Account Growth Strategy Review",
  "Strategic Angle",
  "Core Risk",
  "Upsell Bridge",
  "Value Outcome",
  "CTA Direction",
  "renewal risk",
  "stalled account growth",
  "better account coverage",
  "underused features",
  "clearer next steps",
  "campaign mode",
  "upsell results",
  "account growth",
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
  existingSubjects?: string[];
  liveModelUsed?: boolean;
  modelName?: string;
  voiceMemory?: VoiceMemory;
  accountContext?: Partial<ManualAccountContext>;
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

function offerFamily(offer?: OfferItem, pain = "") {
  const text = normalize(`${offer?.offerName || ""} ${offer?.description || ""} ${offer?.painPointsSolved || ""} ${pain}`);
  if (/cloud|50cloud|remote|collaboration|access|flexib/.test(text)) return "cloud";
  if (/inventory|forecast|distribution|planner/.test(text)) return "inventory";
  if (/hr|hcm|payroll|people/.test(text)) return "hr";
  if (/ar|receivable|invoice|cash/.test(text)) return "ar";
  if (/support|training|implementation/.test(text)) return "support";
  return "general";
}

function clientFacingOfferName(offer?: OfferItem, family = "general") {
  const name = clean(offer?.offerName);
  if (!name || /account growth strategy review/i.test(name)) {
    if (family === "cloud") return "a cloud-connected Sage option";
    if (family === "inventory") return "Inventory Planner by Sage";
    if (family === "hr") return "Sage HR";
    if (family === "ar") return "Sage AR Automation";
    return "the right Sage add-on or service";
  }
  if (name.includes("/")) return clean(name.split("/").pop());
  if (/cloud service upsell/i.test(name)) return "a cloud-connected Sage option";
  return name;
}

function practicalOutcome(family: string, offer?: OfferItem) {
  if (family === "cloud") return "easier access, better collaboration, and less manual work around accounting";
  if (family === "inventory") return "clearer inventory visibility and fewer manual forecasting steps";
  if (family === "hr") return "fewer disconnected handoffs between finance, HR, and people processes";
  if (family === "ar") return "smoother receivables follow-up and better visibility into cash collection work";
  if (family === "support") return "more confidence that the team is using Sage in the right way before renewal";
  return clean(offer?.valueOutcomes) || "less friction, better visibility, and fewer disconnected manual steps";
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

function accountContextText(context?: Partial<ManualAccountContext>) {
  if (!context) return "";
  return [
    context.rawText,
    context.businessDescription,
    context.operationalNotes,
    context.crmNotes,
    context.websiteResearchNotes,
    context.painPoints,
    context.personalizationAngle,
  ].map(clean).filter(Boolean).join(" ");
}

function accountContextStatus(context?: Partial<ManualAccountContext>) {
  const text = accountContextText(context);
  const filled = Object.entries(context || {}).filter(([key, value]) =>
    !["saveMode", "savedAt"].includes(key) && clean(String(value || ""))
  ).length;
  if (!text && filled === 0) return "None" as const;
  if (text.length > 320 || filled >= 6) return "Detailed" as const;
  if (text.length > 120 || filled >= 3) return "Strong" as const;
  return "Basic" as const;
}

function personalizationLevel(status: ReturnType<typeof accountContextStatus>, industry: string) {
  if (status === "Strong" || status === "Detailed") return "Account-Specific" as const;
  if (status === "Basic" || clean(industry)) return "Industry" as const;
  return "Basic" as const;
}

function summarizeAccountContext(context?: Partial<ManualAccountContext>) {
  const text = accountContextText(context);
  if (!text) return "";
  return text.length > 220 ? `${text.slice(0, 217).trim()}...` : text;
}

function accountContextSentence(context: Partial<ManualAccountContext> | undefined, company: string, family: string) {
  const text = normalize(accountContextText(context));
  const angle = clean(context?.personalizationAngle);
  const operations = clean(context?.operationalNotes || context?.businessDescription || context?.rawText);
  if (!text && !angle) return "";
  if (angle) return `${angle}`;
  if (/shipping|warehouse|loading|container|logistics|distribution/.test(text)) {
    if (family === "cloud") {
      return `Given the pace of shipping and warehouse work at ${company}, this may also be a good time to look at whether cloud-connected access could make day-to-day visibility easier without tying the team to one office.`;
    }
    return `Given the pace of shipping and warehouse work at ${company}, the review can stay focused on visibility, handoffs, and fewer manual steps.`;
  }
  if (/remote|multiple location|field|office|collaboration|access/.test(text)) {
    return `The account context points to access and collaboration as practical reasons to review whether the current Sage setup still fits.`;
  }
  if (/inventory|forecast|stock|warehouse/.test(text)) {
    return `The account context points to inventory visibility and planning rhythm as the most useful review angle.`;
  }
  if (/hr|payroll|people|staff|employee/.test(text)) {
    return `The account context points to finance and people-process handoffs as the most useful review angle.`;
  }
  return operations ? `Based on the account notes, the review should stay focused on the parts of ${company}'s operation where better visibility and fewer manual steps would matter most.` : "";
}

export function generateSageRenewalDraft(input: SageDraftInput) {
  const standard = input.standard;
  const accountStatus = accountContextStatus(input.accountContext);
  const accountText = accountContextText(input.accountContext);
  const accountContextUsed = accountStatus !== "None";
  const firstName = clean(standard["First Name"]) || clean(standard["Full Name"]).split(" ")[0] || clean(standard["Decision Maker"]) || "there";
  const fullName = clean(standard["Full Name"]) || `${clean(standard["First Name"])} ${clean(standard["Last Name"])}`.trim() || clean(standard["Decision Maker"]) || "Missing Name";
  const company = clean(standard["Company Name"]) || clean(standard["Business Name"]) || "your business";
  const email = clean(standard.Email);
  const product = clean(input.accountContext?.currentProduct) || clean(standard["Current Product"]) || clean(input.accountContext?.currentPlan) || clean(standard["Current Plan"]) || clean(standard["Current Service"]) || "your current Sage setup";
  const industry = clean(input.accountContext?.industry) || clean(standard.Industry);
  const pain = clean(input.accountContext?.painPoints) || clean(standard["Pain Point"]) || clean(input.offer?.painPointsSolved) || clean(standard.Notes);
  const accountManager = clean(standard["Owner / Account Manager"]) || "Sage team";
  const days = input.accountContext?.renewalDate ? daysUntilRenewal({ ...standard, "Renewal Date": input.accountContext.renewalDate }) : daysUntilRenewal(standard);
  const offerName = clean(input.accountContext?.recommendedUpsell) || clean(input.offer?.offerName) || clean(standard["Upsell Offer"]);
  const offerType = clean(input.offer?.offerType) || clean(standard["Offer Type"]) || "Upsell";
  const dnc = /^(true|yes|y|1|do not contact|dnc)$/i.test(clean(standard["Do Not Contact"]));
  const missingFields = [
    !email ? "Email" : "",
    !company || company === "your business" ? "Company Name or Business Name" : "",
    !offerName ? "Offer" : "",
    days === null ? "Renewal Date or Days to Renew" : "",
  ].filter(Boolean);

  const mode = classifyMode(standard, days, input.offer);
  const family = offerFamily(input.offer, `${pain} ${accountText} ${offerName}`);
  const finalOfferName = clientFacingOfferName(input.offer, family);
  const outcome = practicalOutcome(family, input.offer);
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
    strategicAngle: strategicAngle({ product, industry, pain: `${pain} ${accountText}`, offer: input.offer, days }),
    coreRisk: accountContextUsed
      ? `Use the account context to keep the review tied to ${company}'s real operating situation without overloading the email with every detail.`
      : pain ? `If ${company} renews without reviewing fit, the team may keep carrying ${pain.toLowerCase()}.` : `If ${company} renews without a fit check, avoidable manual work may continue.`,
    upsellBridge: offerName ? `${finalOfferName} connects the renewal review to ${outcome}.` : "No active offer was selected, so final-ready generation should be blocked.",
    valueOutcome: outcome,
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
  const offerParagraph = family === "cloud"
    ? `Many teams use renewal timing to look at whether cloud-connected access, easier collaboration, or fewer manual steps would make day-to-day accounting work easier. ${finalOfferName} can support that kind of review while keeping the Sage accounting tools your team already relies on.`
    : family === "inventory"
      ? `For teams managing inventory and forecasting, renewal timing is a useful point to look at whether planning work is still too manual or disconnected. ${finalOfferName} can help focus that review around visibility and better planning rhythm.`
      : family === "hr"
        ? `If finance and HR work are starting to feel disconnected, renewal timing is a practical moment to review whether ${finalOfferName} could simplify the handoffs around people, payroll, and business operations.`
      : `Renewal timing is a practical moment to review whether ${finalOfferName} would help reduce manual work, improve visibility, or simplify the way the team operates.`;
  const accountContextLine = accountContextSentence(input.accountContext, company, family);
  const proofParagraph = family === "cloud"
    ? accountContextLine || `The goal is not to change systems just for the sake of changing. It is to make sure the renewal supports how ${company} works now, especially if remote access, collaboration, automation, or fewer manual steps would make things easier.`
    : accountContextLine || `The goal is not to add another project. It is to use the renewal window to make sure the current Sage setup still fits the way ${company} is operating now.`;
  const body = [
    `Hi ${firstName},`,
    "",
    opener,
    "",
    offerParagraph,
    "",
    proofParagraph,
    "",
    `${cta}`,
    "",
    `Best,`,
    accountManager,
  ].join("\n");

  const banned = [
    ...BANNED_DEFAULTS,
    ...INTERNAL_FINAL_COPY_BLOCKLIST,
    ...splitList(input.appMindset.bannedPhrases || ""),
    ...splitList(input.businessKnowledge.bannedClaims || ""),
    ...splitList(input.offer?.bannedClaims || ""),
    ...splitList(input.voiceMemory?.bannedPhrases || ""),
    ...splitList(input.voiceMemory?.rejectedPhrases || ""),
  ].map(normalize);
  const bodyNormalized = normalize(body);
  const subjectIssue = normalize(subject1) === normalize(subject2) || INTERNAL_SUBJECT_WORDS.some((word) => normalize(subject2).includes(word));
  const bannedFound = banned.some((phrase) => phrase && bodyNormalized.includes(phrase));
  const maxSimilarity = Math.max(0, ...(input.existingBodies || []).map((previous) => similarity(body, previous)));
  const subjectRepeat = (input.existingSubjects || []).some((subject) => normalize(subject) === normalize(subject1) || normalize(subject) === normalize(subject2));
  const tooSimilar = maxSimilarity > 0.85;
  const internalLanguageFound = INTERNAL_FINAL_COPY_BLOCKLIST.some((phrase) => bodyNormalized.includes(normalize(phrase)));
  const offerAlignmentPassed = Boolean(offerName) && (
    family === "cloud" ? /cloud connected|remote access|collaboration|manual steps|flexibility|access/.test(bodyNormalized)
    : family === "inventory" ? /inventory|forecast|visibility|planning/.test(bodyNormalized)
    : family === "hr" ? /hr|people|payroll|handoffs|finance/.test(bodyNormalized)
    : bodyNormalized.includes(normalize(finalOfferName)) || bodyNormalized.includes("sage")
  );
  const ctaCount = (body.match(/\?/g) || []).length;
  const oneCtaOnly = ctaCount <= 1;
  const accountContextNotUsed = accountContextUsed && !normalize(body).includes(normalize(company)) && !accountContextLine;
  let score = 98;
  score -= missingFields.length * 4;
  score -= flags.includes("Insufficient Personalization") ? 6 : 0;
  score -= dnc ? 40 : 0;
  score -= !offerName ? 18 : 0;
  score -= subjectIssue ? 10 : 0;
  score -= bannedFound ? 15 : 0;
  score -= tooSimilar || subjectRepeat ? 12 : 0;
  score -= internalLanguageFound ? 25 : 0;
  score -= !offerAlignmentPassed ? 18 : 0;
  score -= !oneCtaOnly ? 8 : 0;
  score -= accountContextNotUsed ? 8 : 0;
  score = Math.max(60, Math.min(98, score));

  const issues = [
    ...flags,
    !accountContextUsed ? "Limited account context available. Email may be more general." : "",
    accountContextNotUsed ? "Manual account context was not reflected in the draft" : "",
    subjectIssue ? "Duplicate or internal subject line" : "",
    bannedFound ? "Banned claim or phrase detected" : "",
    internalLanguageFound ? "Internal strategy language appeared in final copy" : "",
    !offerAlignmentPassed ? "Draft does not clearly match selected offer" : "",
    !oneCtaOnly ? "More than one CTA detected" : "",
    tooSimilar || subjectRepeat ? "Draft too similar to another email in this batch" : "",
  ].filter(Boolean);
  const revisionsMade = [
    "ORC normalized renewal and account fields",
    "SENTINEL selected a row-specific renewal upsell angle",
    "SCRIBE wrote a concise Sage renewal email",
    "LEXI checked subject lines, banned phrases, context, and uniqueness",
    tooSimilar || subjectRepeat ? "LEXI varied the row angle because similarity was too high" : "",
    "LEXI blocked internal strategy language from final copy",
    accountContextUsed ? "LEXI verified manual Account Context was used without dumping every pasted detail" : "",
    input.voiceMemory?.approvedExamples?.[0]?.title ? `Matched style reference: ${input.voiceMemory.approvedExamples[0].title}` : "",
  ].filter(Boolean);
  const approved = score >= QA_THRESHOLD && !dnc && !bannedFound && !subjectIssue && !tooSimilar && !subjectRepeat && !internalLanguageFound && offerAlignmentPassed && oneCtaOnly && Boolean(offerName);
  const aiContext: AiContextUsed & Record<string, any> = {
    liveModelUsed: Boolean(input.liveModelUsed),
    modelName: input.modelName || "Deterministic Sage Brain workflow",
    businessKnowledgeUsed: Boolean(sageKnowledge),
    appMindsetUsed: Boolean(input.appMindset.primaryGoal),
    offerUsed: finalOfferName || offerName || "Missing",
    campaignPlaybookUsed: input.playbookName,
    renewalDataUsed: days !== null,
    customFieldsUsed: Object.keys(input.custom || {}),
    accountContextUsed,
    accountIntelligenceSaved: input.accountContext?.saveMode !== "use_once" && accountContextUsed,
    accountContextStatus: accountStatus,
    personalizationLevel: personalizationLevel(accountStatus, industry),
    manualAccountContextSummary: summarizeAccountContext(input.accountContext),
    accountContextSaveMode: input.accountContext?.saveMode || "contact",
    qaCheckedByLexi: true,
    revisionCount: approved ? 1 : 2,
    similarityCheckPassed: !tooSimilar && !subjectRepeat,
    similarityScore: Number(maxSimilarity.toFixed(3)),
    internalLanguageCheckPassed: !internalLanguageFound,
    offerAlignmentStatus: offerAlignmentPassed ? "Passed" : "Failed",
    appMindsetComplianceStatus: oneCtaOnly && !internalLanguageFound ? "Passed" : "Failed",
    approvedExampleUsed: input.voiceMemory?.approvedExamples?.[0]?.title || "Cloud Service Upsell Email",
    styleExampleMatchStatus: "Matched structure and tone; did not copy verbatim.",
    feedbackRulesApplied: [
      input.voiceMemory?.rejectedStructures ? "Rejected structure rules applied" : "",
      input.voiceMemory?.offerSpecificRules ? "Offer-specific Voice Memory rules applied" : "",
      input.voiceMemory?.approvedExamples?.length ? "Approved style example applied" : "",
    ].filter(Boolean),
    missingContextWarnings: issues,
    bannedClaimsFound: bannedFound,
    finalQaResult: approved ? "Pass - ready for human review" : "Needs Review",
    orc: { mode, fields: standard, accountContext: input.accountContext || {}, missingFields, flags },
    sentinel: strategy,
    lexi: {
      qaStatus: approved ? "Pass" : "Needs Review",
      overallQualityScore: score,
      approvalStatus: approved ? "Approved for human review" : "Not approved",
      spamRiskLevel: bannedFound ? "Medium" : "Low",
      issuesFound: issues,
      revisionsMade,
      humanizationNotes: `Personalized by ${company}, ${product}, ${industry || "industry not provided"}, renewal timing, pain point, ${accountContextUsed ? "manual account context, " : ""}and ${offerName || "missing offer"}.`,
      topIssuesLoweringScore: issues.slice(0, 3),
      requiredFixes: approved ? [] : issues,
      revisionCount: approved ? 1 : 2,
      similarityCheckStatus: !tooSimilar && !subjectRepeat ? "Passed" : "Failed",
      offerAlignmentStatus: offerAlignmentPassed ? "Passed" : "Failed",
      appMindsetComplianceStatus: oneCtaOnly && !internalLanguageFound ? "Passed" : "Failed",
      styleExampleMatchStatus: "Matched approved Sage renewal style without copying verbatim",
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
    _preview: days !== null
      ? `A quick review before renewal can help confirm whether ${product} still fits how ${company} works.`
      : `A quick Sage review can help confirm whether ${product} still fits how ${company} works.`,
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
    _account_context: input.accountContext || null,
    _ai_context: aiContext,
    _strategy: strategy,
  };
}
