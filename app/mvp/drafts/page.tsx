"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, RefreshCw, Copy, ChevronDown, ChevronUp, ShieldAlert, AlertTriangle } from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";
import {
  ACCOUNT_CONTEXT_KEY,
  DEFAULT_OFFERS,
  DEFAULT_VOICE_MEMORY,
  LEARNING_LOG_KEY,
  OFFER_LIBRARY_KEY,
  VOICE_MEMORY_KEY,
  loadJson,
  loadJsonArray,
  type AccountContextSaveMode,
  type AiContextUsed,
  type LearningLogItem,
  type ManualAccountContext,
  type OfferItem,
  type VoiceMemory,
} from "@/lib/brain-context";

type ApprovalStatus = "Pending Review" | "Approved" | "Regenerate";
const DRAFT_STORAGE_KEY = "emailorcGeneratedDrafts";
const DRAFT_STATE_KEY = "emailorcDraftState";
const QA_APPROVAL_THRESHOLD = 90;
const INTERNAL_SUBJECT_WORDS = ["upsell", "campaign", "lead magnet", "strategy"];
const FEEDBACK_REASONS = ["Too Generic", "Does Not Match Company", "Does Not Match Offer", "Wrong Pain Point", "Bad Subject Line", "Bad CTA", "Does Not Sound Human", "Too Salesy", "Too Long", "Too Vague", "Internal Language in Final Copy", "Use This Example as Style Reference", "Other"];
const LEARNING_OPTIONS = ["Remember this style", "Avoid this phrase", "Avoid this structure", "Improve offer alignment", "Improve renewal context", "Improve company-specific language", "Make future emails more human", "Use this as a preferred example", "One-time feedback only"];
const EMPTY_ACCOUNT_CONTEXT: ManualAccountContext = {
  rawText: "",
  currentPlan: "",
  currentProduct: "",
  renewalMonth: "",
  renewalDate: "",
  businessDescription: "",
  industry: "",
  painPoints: "",
  operationalNotes: "",
  crmNotes: "",
  websiteResearchNotes: "",
  recommendedUpsell: "",
  personalizationAngle: "",
  sourceOfInformation: "",
  confidenceLevel: "",
  saveMode: "contact",
};

interface Draft {
  id: number | string;
  name: string;
  company: string;
  product: string;
  subject1: string;
  subject2: string;
  previewText: string;
  body: string;
  cta: string;
  personalization: string[];
  qaScore: number;
  spamRisk: "Low" | "Medium" | "High";
  status: ApprovalStatus;
  expanded: boolean;
  revisionCount?: number;
  qaIssues?: string[];
  revisionsMade?: string[];
  sourceIndex?: number;
  aiContext?: AiContextUsed;
  customFields?: Record<string, string>;
  offerName?: string;
  campaignPlaybook?: string;
  accountContext?: Partial<ManualAccountContext>;
}

const SPAM_COLOR: Record<string, string> = {
  Low:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High:   "bg-red-50 text-red-700 border-red-200",
};

const DEMO_DRAFTS: Draft[] = [
  {
    id: 1, name: "Sarah Johnson", company: "Apex Logistics", product: "Pro Plan",
    subject1: "Unlock Enterprise-Level Growth for Apex Logistics",
    subject2: "Sarah, here's a tailored upgrade path for your team",
    previewText: "We identified 3 features you're not yet leveraging that drive 40% faster results...",
    body: `Hi Sarah,\n\nI hope Q2 is off to a strong start at Apex Logistics. I wanted to reach out personally because our team identified several Enterprise Suite capabilities that align directly with the scale you're operating at on your current Pro Plan.\n\nSpecifically, advanced route optimization and multi-depot scheduling have helped logistics firms similar to yours reduce operational overhead by an average of 22%.\n\nI'd love to walk you through a 15-minute demo tailored to your workflow. Would Tuesday or Wednesday afternoon work for you?\n\nBest,\nAccount Growth Team`,
    cta: "Schedule a 15-minute demo",
    personalization: ["First Name", "Company Name", "Current Product", "Industry Benchmark"],
    qaScore: 94, spamRisk: "Low", status: "Pending Review", expanded: false,
  },
  {
    id: 2, name: "Marcus Webb", company: "Greenfield Capital", product: "Starter",
    subject1: "Marcus — Greenfield Capital is outgrowing your current plan",
    subject2: "See what Pro + Analytics unlocks for financial teams",
    previewText: "Teams at your growth stage typically see a 3x return when they upgrade...",
    body: `Hi Marcus,\n\nGreenfield Capital's continued growth is impressive — and it's exactly why I'm reaching out today. Based on your current Starter plan usage, we believe the Pro Plan with our Analytics Module would significantly accelerate your reporting capabilities and reduce time-to-insight for your portfolio team.\n\nWould you be open to a brief conversation? I can have a custom ROI estimate ready before we speak.\n\nWarm regards,\nAccount Growth Team`,
    cta: "Get your custom ROI estimate",
    personalization: ["First Name", "Company Name", "Current Product", "Usage Pattern"],
    qaScore: 88, spamRisk: "Low", status: "Approved", expanded: false,
  },
  {
    id: 3, name: "Carlos Mena", company: "Mena Retail Group", product: "Starter",
    subject1: "Carlos, your retail team is ready for Pro",
    subject2: "3 Pro features Mena Retail Group is missing out on",
    previewText: "Upgrade now and unlock inventory automation, bulk reporting, and more...",
    body: `Hi Carlos,\n\nRetail operations move fast — and your Starter plan is doing a good job keeping up. But as Mena Retail Group scales, I wanted to flag three Pro features our top retail clients rely on heavily: inventory automation rules, bulk SKU reporting, and multi-location dashboards.\n\nI'd love to show you how these apply to your specific setup. Can I send over a short 3-minute overview video?\n\nBest,\nAccount Growth Team`,
    cta: "Watch a 3-minute overview",
    personalization: ["First Name", "Company Name", "Current Product", "Industry"],
    qaScore: 81, spamRisk: "Medium", status: "Pending Review", expanded: false,
  },
];

export default function DraftsPage() {
  const notice = useNotice();
  const [drafts, setDrafts] = useState<Draft[]>(DEMO_DRAFTS);
  const [activeSubject, setActiveSubject] = useState<Record<string, 1 | 2>>({});
  const [regeneratingId, setRegeneratingId] = useState<number | string | null>(null);
  const [offers, setOffers] = useState<OfferItem[]>(DEFAULT_OFFERS);
  const [feedbackDraftId, setFeedbackDraftId] = useState<number | string | null>(null);
  const [feedbackReason, setFeedbackReason] = useState(FEEDBACK_REASONS[0]);
  const [feedbackLearning, setFeedbackLearning] = useState(LEARNING_OPTIONS[3]);
  const [feedbackText, setFeedbackText] = useState("");
  const [accountContexts, setAccountContexts] = useState<Record<string, ManualAccountContext>>({});

  function accountKey(draft: Draft) {
    return `${draft.company || "company"}:${draft.name || draft.id}`.toLowerCase();
  }

  function companyKey(draft: Draft) {
    return String(draft.company || "").trim().toLowerCase();
  }

  function persistAccountContextRemote(draft: Draft, context: ManualAccountContext) {
    if (context.saveMode === "use_once") return;
    fetch("/api/account-intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: localStorage.getItem("orgId") || "org_demo",
        user_id: localStorage.getItem("userId") || "user_super_admin",
        contact_key: accountKey(draft),
        company_key: companyKey(draft),
        save_scope: context.saveMode,
        context,
      }),
    }).catch(() => {});
  }

  function draftAccountContext(draft: Draft): ManualAccountContext {
    return { ...EMPTY_ACCOUNT_CONTEXT, ...(accountContexts[accountKey(draft)] || {}), ...(draft.accountContext || {}) };
  }

  function updateAccountContext(draft: Draft, patch: Partial<ManualAccountContext>) {
    const key = accountKey(draft);
    setAccountContexts((prev) => {
      const next = { ...prev, [key]: { ...draftAccountContext(draft), ...patch } };
      localStorage.setItem(ACCOUNT_CONTEXT_KEY, JSON.stringify(next));
      return next;
    });
    setDrafts((prev) => prev.map((item) => item.id === draft.id ? { ...item, accountContext: { ...draftAccountContext(draft), ...patch } } : item));
  }

  function saveAccountContext(draft: Draft) {
    const context = { ...draftAccountContext(draft), savedAt: new Date().toISOString() };
    const key = accountKey(draft);
    const nextContexts = { ...accountContexts, [key]: context };
    setAccountContexts(nextContexts);
    localStorage.setItem(ACCOUNT_CONTEXT_KEY, JSON.stringify(nextContexts));
    persistAccountContextRemote(draft, context);
    setDrafts((prev) => {
      const next = prev.map((item) => item.id === draft.id ? { ...item, accountContext: context } : item);
      persistAllDrafts(next);
      return next;
    });
    notice.success("Account Context saved for this draft and future regeneration.", "Account Context saved");
  }

  function buildQaIssues(draft: Draft) {
    const issues = [...(draft.qaIssues || [])];
    if (draft.subject1.trim().toLowerCase() === draft.subject2.trim().toLowerCase()) issues.push("Duplicate subject lines");
    if (INTERNAL_SUBJECT_WORDS.some((word) => draft.subject2.toLowerCase().includes(word))) issues.push("Subject Line 2 uses internal language");
    if (draft.qaScore < QA_APPROVAL_THRESHOLD) issues.push("QA score below threshold");
    if (draft.spamRisk === "High") issues.push("Spam risk is high");
    if (!draft.name || !draft.company || !draft.body || !draft.subject1 || !draft.subject2) issues.push("Draft missing required fields");
    if (draft.aiContext?.missingContextWarnings?.some((warning) => /offer is missing|business knowledge is incomplete/i.test(warning))) issues.push("Required Brain context missing");
    if (draft.aiContext?.bannedClaimsFound) issues.push("Banned claim detected");
    return Array.from(new Set(issues));
  }

  function approvalBlockReason(draft: Draft) {
    const role = localStorage.getItem("userRole") || "VIEWER";
    if (draft.status === "Approved") return "Draft already approved";
    if (!["SUPER_ADMIN", "CLIENT_ADMIN", "REVIEWER"].includes(role)) return "User does not have approval permission";
    if (!draft.name || !draft.company || !draft.body || !draft.subject1 || !draft.subject2) return "Draft missing required fields";
    if (draft.subject1.trim().toLowerCase() === draft.subject2.trim().toLowerCase()) return "Duplicate subject lines";
    if (INTERNAL_SUBJECT_WORDS.some((word) => draft.subject2.toLowerCase().includes(word))) return "Subject Line 2 uses internal language";
    if (draft.aiContext?.missingContextWarnings?.some((warning) => /offer is missing/i.test(warning))) return "Required offer data is missing";
    if (draft.aiContext?.missingContextWarnings?.some((warning) => /business knowledge is incomplete/i.test(warning))) return "Required Business Knowledge is missing";
    if (draft.aiContext?.bannedClaimsFound) return "Banned claims remain";
    if (draft.qaScore < QA_APPROVAL_THRESHOLD) return "QA score below threshold";
    if (!["Low", "Medium"].includes(draft.spamRisk)) return "Draft spam risk is too high";
    return "";
  }

  function persistAllDrafts(nextDrafts: Draft[]) {
    localStorage.setItem(DRAFT_STATE_KEY, JSON.stringify(Object.fromEntries(nextDrafts.map((draft) => [String(draft.id), draft]))));
    const uploaded = nextDrafts
      .filter((draft) => Number(draft.id) >= 1000 || typeof draft.id === "string")
      .map((draft) => ({
        _id: `draft-${draft.id}`,
        _name: draft.name,
        _company: draft.company,
        _product: draft.product,
        _email: "",
        _subject: draft.subject1,
        _subject2: draft.subject2,
        _preview: draft.previewText,
        _body: draft.body,
        _score: draft.qaScore,
        _spam: draft.spamRisk,
        _status: draft.status,
        _revision_count: draft.revisionCount || 0,
        _qa_issues: buildQaIssues(draft),
        _ai_context: draft.aiContext,
        _custom_fields: draft.customFields || {},
        _account_context: draft.accountContext || accountContexts[accountKey(draft)] || null,
      }));
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(uploaded));
  }

  useEffect(() => {
    setOffers(loadJsonArray(OFFER_LIBRARY_KEY, DEFAULT_OFFERS));
    setAccountContexts(loadJson<Record<string, ManualAccountContext>>(ACCOUNT_CONTEXT_KEY, {}));
    fetch(`/api/account-intelligence?organization_id=${encodeURIComponent(localStorage.getItem("orgId") || "org_demo")}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status !== "success") return;
        const remote = Object.fromEntries((data.items || []).map((item: any) => [item.contact_key || item.company_key, item.context]));
        setAccountContexts((current) => {
          const next = { ...remote, ...current };
          localStorage.setItem(ACCOUNT_CONTEXT_KEY, JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {});
    const envConfig = JSON.parse(localStorage.getItem("envConfig") || "{}");
    fetch(`/api/workflow/drafts?organization_id=${encodeURIComponent(localStorage.getItem("orgId") || "org_demo")}&environment=${encodeURIComponent(String(envConfig.mode || "demo").toLowerCase().replace("_", "-"))}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success" && data.drafts?.length) {
          setDrafts(data.drafts);
        }
      })
      .catch(() => {});

    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    const savedState = localStorage.getItem(DRAFT_STATE_KEY);
    const stateById = savedState ? JSON.parse(savedState) : {};
    const demoDrafts = DEMO_DRAFTS.map((draft) => ({ ...draft, ...(stateById[String(draft.id)] || {}) }));
    if (!saved) {
      setDrafts(demoDrafts);
      return;
    }
    try {
      const uploaded = JSON.parse(saved).map((row: any, index: number) => {
        const subject1 = row._subject || row.subject1 || "";
        const subject2 = row._subject2 || row.subject2 || `${row._company || row.Company || "Your team"}: a softer next step`;
        const duplicateSubjects = subject1.trim().toLowerCase() === subject2.trim().toLowerCase();
        return {
        id: 1000 + index,
        name: row._name || row.Name || row.name || "Missing Name",
        company: row._company || row.Company || row.company || "Company",
        product: row._product || row["Current Product"] || row.Product || "Current Plan",
        subject1,
        subject2,
        previewText: row._preview || "",
        body: row._body || "",
        cta: row._cta || "Would it be worth a quick 10-minute review?",
        personalization: ["Contact Name", "Company Name", "Current Product", "Renewal Timing", "Offer", "Pain Point"],
        qaScore: duplicateSubjects ? Math.min(Number(row._score || 0), 89) : row._score || 0,
        spamRisk: row._spam === "Blocked" ? "High" : row._spam || "Low",
        status: row._status === "Approved" && !duplicateSubjects ? "Approved" : "Pending Review",
        expanded: false,
        revisionCount: row._revision_count || 0,
        qaIssues: duplicateSubjects ? ["Duplicate subject lines"] : row._qa_issues || [],
        revisionsMade: row._revisions_made || [],
        sourceIndex: index,
        aiContext: row._ai_context,
        customFields: row._custom_fields || {},
        accountContext: row._account_context || row.accountContext || undefined,
        offerName: row._ai_context?.offerUsed,
        campaignPlaybook: row._ai_context?.campaignPlaybookUsed,
      };
      });
      const mergedUploaded = uploaded
        .filter((draft: Draft) => !/practical next steps|unlock enterprise-level growth|pro \\+ analytics/i.test(`${draft.subject1} ${draft.body}`))
        .map((draft: Draft) => ({ ...draft, ...(stateById[String(draft.id)] || {}) }));
      setDrafts(mergedUploaded.length ? mergedUploaded : demoDrafts);
    } catch {
      setDrafts(DEMO_DRAFTS);
    }
  }, []);

  const toggle = (id: number | string) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, expanded: !d.expanded } : d)));

  const approve = async (id: number | string) => {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;
    const blockReason = approvalBlockReason(draft);
    if (blockReason) {
      notice.warning(blockReason, "Approval blocked");
      return;
    }
    try {
      const response = await fetch("/api/drafts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft_id: String(draft.id),
          qa_score: draft.qaScore,
          spam_risk: draft.spamRisk,
          subject_line_1: draft.subject1,
          subject_line_2: draft.subject2,
          user_role: localStorage.getItem("userRole"),
          user_id: localStorage.getItem("userId"),
          organization_id: localStorage.getItem("orgId"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not approve draft.");
      setDrafts((prev) => {
        const next = prev.map((d) => d.id === id ? { ...d, status: "Approved" as ApprovalStatus, qaIssues: [] } : d);
        persistAllDrafts(next);
        return next;
      });
      notice.success(data.message || "Draft approved successfully", "Draft approved");
    } catch (error: any) {
      notice.error(error.message || "Could not approve draft.", "Approval failed");
    }
  };

  const regenerate = async (id: number | string) => {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;
    setRegeneratingId(id);
    try {
      const response = await fetch("/api/brain/regenerate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft_id: String(draft.id),
          record_id: String(draft.id),
          current_draft: draft,
          qa_issues: buildQaIssues(draft),
          model_mode: "Balanced",
          organization_id: localStorage.getItem("orgId"),
          user_id: localStorage.getItem("userId"),
          account_context: draftAccountContext(draft),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not regenerate email.");
      setDrafts((prev) => {
        const next = prev.map((d) => d.id === id ? { ...d, ...data.draft, expanded: true } : d);
        persistAllDrafts(next);
        return next;
      });
      notice.success(data.message || "Email regenerated successfully.", "Draft revised");
    } catch (error: any) {
      notice.error(error.message || "Could not regenerate email.", "Regeneration failed");
    } finally {
      setRegeneratingId(null);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    notice.info("Draft copied to clipboard.", "Copied");
  };

  function saveFeedback(draft: Draft) {
    const organizationId = localStorage.getItem("orgId") || "org_demo";
    const userId = localStorage.getItem("userId") || "user_super_admin";
    const item: LearningLogItem = {
      feedback_id: `feedback-${Date.now()}`,
      organization_id: organizationId,
      user_id: userId,
      source: feedbackReason === "Use This Example as Style Reference" ? "example" : "rejection",
      related_draft_id: String(draft.id),
      related_offer_id: draft.offerName || draft.aiContext?.offerUsed,
      related_campaign_id: draft.campaignPlaybook || draft.aiContext?.campaignPlaybookUsed,
      feedback_type: feedbackReason,
      feedback_text: feedbackText.trim() || feedbackReason,
      suggested_rule: feedbackLearning,
      status: feedbackLearning === "One-time feedback only" ? "pending" : "active",
      created_at: new Date().toISOString(),
      approved_by: localStorage.getItem("userEmail") || undefined,
    };
    const currentLog = loadJsonArray<LearningLogItem>(LEARNING_LOG_KEY, []);
    localStorage.setItem(LEARNING_LOG_KEY, JSON.stringify([item, ...currentLog]));

    if (feedbackLearning !== "One-time feedback only") {
      const memory = loadJson<VoiceMemory>(VOICE_MEMORY_KEY, DEFAULT_VOICE_MEMORY);
      const text = feedbackText.trim();
      const next: VoiceMemory = { ...memory, lastUpdated: new Date().toISOString() };
      if (feedbackLearning === "Avoid this phrase") next.rejectedPhrases = [memory.rejectedPhrases, text || feedbackReason].filter(Boolean).join("\n");
      if (feedbackLearning === "Avoid this structure") next.rejectedStructures = [memory.rejectedStructures, text || feedbackReason].filter(Boolean).join("\n");
      if (feedbackLearning === "Improve offer alignment") next.offerSpecificRules = [memory.offerSpecificRules, text || `Avoid generic copy. Align ${draft.offerName || draft.aiContext?.offerUsed || "the offer"} to the customer-facing Sage product value.`].filter(Boolean).join("\n");
      if (feedbackLearning === "Improve renewal context") next.approvedDraftPatterns = [memory.approvedDraftPatterns, "Use renewal timing as the reason to review fit, not as the thing being sold."].filter(Boolean).join("\n");
      if (feedbackLearning === "Make future emails more human") next.approvedDraftPatterns = [memory.approvedDraftPatterns, "Use plain, natural paragraphs. Do not render internal strategy labels or metadata as final copy."].filter(Boolean).join("\n");
      if (feedbackLearning === "Use this as a preferred example" || feedbackReason === "Use This Example as Style Reference") {
        next.approvedExamples = [{
          id: `example-${Date.now()}`,
          title: `${draft.company} approved style example`,
          type: "Preferred Style Example",
          subjectLine1: draft.subject1,
          subjectLine2: draft.subject2,
          previewText: draft.previewText,
          emailBody: draft.body,
          cta: draft.cta,
          instruction: "Use as style reference only. Do not copy verbatim.",
          status: "Active",
          offerName: draft.offerName || draft.aiContext?.offerUsed,
          createdAt: new Date().toISOString(),
          approvedBy: localStorage.getItem("userEmail") || undefined,
        }, ...(memory.approvedExamples || [])];
      }
      localStorage.setItem(VOICE_MEMORY_KEY, JSON.stringify(next));
    }

    fetch("/api/brain/learning-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }).catch(() => {});
    setFeedbackDraftId(null);
    setFeedbackText("");
    notice.success("Feedback saved to Learning Log and Voice Memory.", "Brain feedback saved");
  }

  const subjectFor = (d: Draft) => activeSubject[String(d.id)] === 2 ? d.subject2 : d.subject1;
  const activeOffers = offers.filter((offer) => offer.status === "Active" || offer.status === "Approved");

  const approved = drafts.filter((d) => d.status === "Approved").length;
  const pending  = drafts.filter((d) => d.status === "Pending Review").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Review Upsell Strategies</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve AI-generated email drafts. Every draft requires human approval before export.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Human approval required before any email can be exported or sent.
        </div>
      </div>

      {/* Draft Cards */}
      <div className="space-y-4">
        {drafts.map((draft) => (
          (() => {
            const issues = buildQaIssues(draft);
            const blockReason = approvalBlockReason(draft);
            return (
          <div
            key={draft.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
              ${draft.status === "Approved" ? "border-emerald-300" : "border-slate-100"}`}
          >
            {/* Card Header — always visible */}
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggle(draft.id)}
            >
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                  {draft.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{draft.name}</p>
                  <p className="text-xs text-slate-400">{draft.company} · {draft.product}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* QA Score */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${draft.qaScore >= 90 ? "bg-emerald-500" : draft.qaScore >= 75 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${draft.qaScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">QA {draft.qaScore}</span>
                </div>
                {/* Spam */}
                <span className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SPAM_COLOR[draft.spamRisk]}`}>
                  Spam: {draft.spamRisk}
                </span>
                {/* Status */}
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium
                  ${draft.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {draft.status === "Approved" && <CheckCircle className="h-3 w-3" />}
                  {draft.status}
                </span>
                {draft.expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </div>
            </div>

            {/* Expanded Content */}
            {draft.expanded && (
              <div className="border-t border-slate-100 px-6 py-5 space-y-5">
                {/* Subject Line Selector */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Subject Line</p>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2].map((n) => (
                      <button
                        key={n}
                        onClick={() => setActiveSubject((prev) => ({ ...prev, [String(draft.id)]: n as 1 | 2 }))}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors text-left
                          ${(activeSubject[String(draft.id)] ?? 1) === n
                            ? "border-indigo-500 bg-indigo-50 text-indigo-800 font-medium"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"}`}
                      >
                        {n === 1 ? draft.subject1 : draft.subject2}
                      </button>
                    ))}
                  </div>
                  {issues.includes("Duplicate subject lines") && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                      <AlertTriangle className="h-4 w-4" /> Duplicate subject lines
                    </div>
                  )}
                </div>

                {/* Preview Text */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Preview Text</p>
                  <p className="text-sm text-slate-500 italic">"{draft.previewText}"</p>
                </div>

                {/* Email Body */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Email Body</p>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{draft.body}</p>
                  </div>
                </div>

                {/* CTA */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Primary CTA</p>
                  <span className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                    {draft.cta}
                  </span>
                </div>

                {/* Personalization Tags */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Personalization Used</p>
                  <div className="flex flex-wrap gap-2">
                    {draft.personalization.map((p) => (
                      <span key={p} className="rounded-md bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-0.5 text-xs font-medium">
                        {"{{"}{p}{"}}"}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-700">Account Context</p>
                      <p className="mt-1 text-xs text-blue-700/80">Paste account-specific notes before regenerating so SENTINEL and SCRIBE can write a more specific email.</p>
                    </div>
                    <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700">
                      Status: {draft.aiContext?.accountContextStatus || (draftAccountContext(draft).rawText ? "Basic" : "None")}
                    </span>
                  </div>
                  <textarea
                    value={draftAccountContext(draft).rawText}
                    onChange={(e) => updateAccountContext(draft, { rawText: e.target.value })}
                    rows={5}
                    placeholder="Paste any notes about this customer's business, current plan, renewal situation, pain points, operations, website research, CRM notes, or why the selected offer may be relevant."
                    className="mt-3 w-full rounded-lg border-blue-200 bg-white text-sm"
                  />
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                    {[
                      ["currentPlan", "Current Plan"],
                      ["currentProduct", "Current Product"],
                      ["renewalMonth", "Renewal Month"],
                      ["renewalDate", "Renewal Date"],
                      ["businessDescription", "Business Description"],
                      ["industry", "Industry"],
                      ["painPoints", "Pain Points"],
                      ["operationalNotes", "Operational Notes"],
                      ["crmNotes", "CRM Notes"],
                      ["websiteResearchNotes", "Website/Public Research Notes"],
                      ["recommendedUpsell", "Recommended Upsell"],
                      ["personalizationAngle", "Personalization Angle"],
                      ["sourceOfInformation", "Source of Information"],
                    ].map(([key, label]) => (
                      <input
                        key={key}
                        value={String(draftAccountContext(draft)[key as keyof ManualAccountContext] || "")}
                        onChange={(e) => updateAccountContext(draft, { [key]: e.target.value } as Partial<ManualAccountContext>)}
                        placeholder={label}
                        className="rounded-lg border-blue-200 bg-white text-sm"
                      />
                    ))}
                    <select
                      value={draftAccountContext(draft).confidenceLevel}
                      onChange={(e) => updateAccountContext(draft, { confidenceLevel: e.target.value as ManualAccountContext["confidenceLevel"] })}
                      className="rounded-lg border-blue-200 bg-white text-sm"
                    >
                      <option value="">Confidence Level</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <select
                      value={draftAccountContext(draft).saveMode}
                      onChange={(e) => updateAccountContext(draft, { saveMode: e.target.value as AccountContextSaveMode })}
                      className="rounded-lg border-blue-200 bg-white text-sm"
                    >
                      <option value="contact">Save to this contact/account</option>
                      <option value="use_once">Use once for this draft only</option>
                      <option value="company">Save to company/account profile for future drafts</option>
                    </select>
                    <button onClick={() => saveAccountContext(draft)} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">
                      Save Account Context
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">AI Context Used</p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Business Knowledge used</span><strong>{draft.aiContext?.businessKnowledgeUsed ? "Yes" : "No"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Live Model Used</span><strong>{draft.aiContext?.liveModelUsed ? "Yes" : "No"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Model Name</span><strong>{draft.aiContext?.modelName || "Not recorded"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">App Mindset used</span><strong>{draft.aiContext?.appMindsetUsed ? "Yes" : "No"}</strong></div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-slate-500">Offer used</span>
                      <select
                        value={draft.offerName || draft.aiContext?.offerUsed || ""}
                        onChange={(e) => setDrafts((prev) => prev.map((item) => item.id === draft.id ? { ...item, offerName: e.target.value, aiContext: { ...(item.aiContext || {} as any), offerUsed: e.target.value } } : item))}
                        className="mt-1 w-full rounded-md border-slate-200 bg-white text-xs font-bold text-slate-800"
                      >
                        {activeOffers.length === 0 && <option value="">No active offers found. Add an offer in Brain Center - Offer Library.</option>}
                        {activeOffers.map((offer) => <option key={offer.id} value={offer.offerName}>{offer.offerName} - {offer.offerType} - {offer.status} - {offer.targetSegment}</option>)}
                      </select>
                    </div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Campaign Playbook used</span><strong>{draft.aiContext?.campaignPlaybookUsed || draft.campaignPlaybook || "Not recorded"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Renewal Data Used</span><strong>{draft.aiContext?.renewalDataUsed ? "Yes" : "No"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Account Context used</span><strong>{draft.aiContext?.accountContextUsed ? "Yes" : "No"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Account Intelligence saved</span><strong>{draft.aiContext?.accountIntelligenceSaved ? "Yes" : "No"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Context status</span><strong>{draft.aiContext?.accountContextStatus || "None"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Personalization Level</span><strong>{draft.aiContext?.personalizationLevel || "Basic"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">QA Checked by LEXI</span><strong>{draft.aiContext?.qaCheckedByLexi ? "Yes" : "No"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Revision Count</span><strong>{draft.aiContext?.revisionCount ?? draft.revisionCount ?? 0}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Similarity Check Passed</span><strong className={draft.aiContext?.similarityCheckPassed === false ? "text-red-600" : "text-emerald-600"}>{draft.aiContext?.similarityCheckPassed === false ? "No" : "Yes"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Custom fields used</span><strong>{draft.aiContext?.customFieldsUsed?.join(", ") || Object.keys(draft.customFields || {}).join(", ") || "None"}</strong></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">Banned claims found</span><strong className={draft.aiContext?.bannedClaimsFound ? "text-red-600" : "text-emerald-600"}>{draft.aiContext?.bannedClaimsFound ? "Yes" : "No"}</strong></div>
                  </div>
                  {draft.aiContext?.missingContextWarnings?.length ? (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-xs font-bold text-amber-700">Missing context warnings: {draft.aiContext.missingContextWarnings.join(" · ")}</p>
                    </div>
                  ) : null}
                  <p className="mt-3 text-xs font-bold text-slate-500">Final QA result: {draft.aiContext?.finalQaResult || (draft.qaScore >= 90 ? "Pass" : "Needs Revision")}</p>
                </div>

                {draft.aiContext?.sentinel || draft.aiContext?.lexi ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-700">QA Evidence</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-indigo-950">
                      <p><strong>Why written this way:</strong> {draft.aiContext?.sentinel?.strategicAngle || "Not recorded"}</p>
                      <p><strong>Data points used:</strong> {["Company", draft.company, "Product", draft.product, draft.aiContext?.renewalDataUsed ? "Renewal timing" : "", draft.aiContext?.offerUsed].filter(Boolean).join(" · ")}</p>
                      <p><strong>Account context used:</strong> {draft.aiContext?.manualAccountContextSummary || "No manual account context saved for this draft."}</p>
                      <p><strong>Offer used:</strong> {draft.aiContext?.offerUsed || draft.offerName || "Not recorded"}</p>
                      <p><strong>App Mindset rules applied:</strong> One clear CTA, no invented facts, PAS-style flow, banned phrase check, 90+ QA threshold.</p>
                      <p><strong>LEXI issues found:</strong> {draft.aiContext?.lexi?.issuesFound?.length ? draft.aiContext.lexi.issuesFound.join(" · ") : "None"}</p>
                      <p><strong>LEXI revisions made:</strong> {draft.aiContext?.lexi?.revisionsMade?.length ? draft.aiContext.lexi.revisionsMade.join(" · ") : "None"}</p>
                      <p><strong>Final approval reason:</strong> {draft.aiContext?.lexi?.approvalStatus || draft.aiContext?.finalQaResult || "Not recorded"}</p>
                    </div>
                  </div>
                ) : null}

                {issues.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">QA issues found</p>
                    <ul className="mt-2 space-y-1 text-sm font-medium text-amber-800">
                      {issues.map((issue) => <li key={issue}>{issue}</li>)}
                    </ul>
                  </div>
                )}

                {draft.revisionsMade && draft.revisionsMade.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Revisions made</p>
                    <ul className="mt-2 space-y-1 text-sm font-medium text-emerald-800">
                      {draft.revisionsMade.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <p className="mt-2 text-xs font-bold text-emerald-700">Revision count: {draft.revisionCount || 0}</p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copy(`Subject: ${subjectFor(draft)}\n\n${draft.body}`)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" /> Copy Draft
                    </button>
                    <button
                      onClick={() => regenerate(draft.id)}
                      disabled={regeneratingId === draft.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <RefreshCw className={`h-4 w-4 ${regeneratingId === draft.id ? "animate-spin" : ""}`} /> {regeneratingId === draft.id ? "Regenerating..." : "Regenerate Email"}
                    </button>
                    <button
                      onClick={() => setFeedbackDraftId(feedbackDraftId === draft.id ? null : draft.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      Reject / Teach Brain
                    </button>
                  </div>

                  {draft.status !== "Approved" ? (
                    <button
                      onClick={() => approve(draft.id)}
                      aria-disabled={Boolean(blockReason)}
                      title={blockReason || "Approve Draft"}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                        blockReason
                          ? "bg-slate-300 text-slate-600 shadow-none cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" /> {blockReason || "Approve Draft"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
                      <CheckCircle className="h-4 w-4" /> Approved
                    </span>
                  )}
                </div>
                {feedbackDraftId === draft.id && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">What should the Brain learn from this?</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <label className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Reason</span>
                        <select value={feedbackReason} onChange={(e) => setFeedbackReason(e.target.value)} className="w-full rounded-lg border-amber-200 text-sm">
                          {FEEDBACK_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Learn Action</span>
                        <select value={feedbackLearning} onChange={(e) => setFeedbackLearning(e.target.value)} className="w-full rounded-lg border-amber-200 text-sm">
                          {LEARNING_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </label>
                      <button onClick={() => saveFeedback(draft)} className="self-end rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700">
                        Save Feedback
                      </button>
                    </div>
                    <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={3} placeholder="Example: Stop saying Account Growth Strategy Review. For Sage 50cloud, talk about cloud access, collaboration, and fewer manual accounting steps." className="mt-3 w-full rounded-lg border-amber-200 text-sm" />
                  </div>
                )}
              </div>
            )}
          </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}
