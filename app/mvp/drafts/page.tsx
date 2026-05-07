"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, RefreshCw, Copy, ChevronDown, ChevronUp, ShieldAlert, AlertTriangle } from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";

type ApprovalStatus = "Pending Review" | "Approved" | "Regenerate";
const DRAFT_STORAGE_KEY = "emailorcGeneratedDrafts";
const DRAFT_STATE_KEY = "emailorcDraftState";
const QA_APPROVAL_THRESHOLD = 90;

interface Draft {
  id: number;
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
  const [activeSubject, setActiveSubject] = useState<Record<number, 1 | 2>>({});
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);

  function buildQaIssues(draft: Draft) {
    const issues = [...(draft.qaIssues || [])];
    if (draft.subject1.trim().toLowerCase() === draft.subject2.trim().toLowerCase()) issues.push("Duplicate subject lines");
    if (draft.qaScore < QA_APPROVAL_THRESHOLD) issues.push("QA score below threshold");
    if (draft.spamRisk === "High") issues.push("Spam risk is high");
    if (!draft.name || !draft.company || !draft.body || !draft.subject1 || !draft.subject2) issues.push("Draft missing required fields");
    return Array.from(new Set(issues));
  }

  function approvalBlockReason(draft: Draft) {
    const role = localStorage.getItem("userRole") || "VIEWER";
    if (draft.status === "Approved") return "Draft already approved";
    if (!["SUPER_ADMIN", "CLIENT_ADMIN", "REVIEWER"].includes(role)) return "User does not have approval permission";
    if (!draft.name || !draft.company || !draft.body || !draft.subject1 || !draft.subject2) return "Draft missing required fields";
    if (draft.subject1.trim().toLowerCase() === draft.subject2.trim().toLowerCase()) return "Duplicate subject lines";
    if (draft.qaScore < QA_APPROVAL_THRESHOLD) return "QA score below threshold";
    if (!["Low", "Medium"].includes(draft.spamRisk)) return "Draft spam risk is too high";
    return "";
  }

  function persistAllDrafts(nextDrafts: Draft[]) {
    localStorage.setItem(DRAFT_STATE_KEY, JSON.stringify(Object.fromEntries(nextDrafts.map((draft) => [String(draft.id), draft]))));
    const uploaded = nextDrafts
      .filter((draft) => draft.id >= 1000)
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
      }));
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(uploaded));
  }

  useEffect(() => {
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
        cta: "Schedule a 15-minute discovery call",
        personalization: ["Contact Name", "Company Name", "Current Product"],
        qaScore: duplicateSubjects ? Math.min(Number(row._score || 0), 89) : row._score || 0,
        spamRisk: row._spam === "Blocked" ? "High" : row._spam || "Low",
        status: row._status === "Approved" && !duplicateSubjects ? "Approved" : "Pending Review",
        expanded: false,
        revisionCount: row._revision_count || 0,
        qaIssues: duplicateSubjects ? ["Duplicate subject lines"] : row._qa_issues || [],
        revisionsMade: row._revisions_made || [],
        sourceIndex: index,
      };
      });
      const mergedUploaded = uploaded.map((draft: Draft) => ({ ...draft, ...(stateById[String(draft.id)] || {}) }));
      setDrafts([...mergedUploaded, ...demoDrafts]);
    } catch {
      setDrafts(DEMO_DRAFTS);
    }
  }, []);

  const toggle = (id: number) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, expanded: !d.expanded } : d)));

  const approve = async (id: number) => {
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

  const regenerate = async (id: number) => {
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

  const subjectFor = (d: Draft) => activeSubject[d.id] === 2 ? d.subject2 : d.subject1;

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
                        onClick={() => setActiveSubject((prev) => ({ ...prev, [draft.id]: n as 1 | 2 }))}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors text-left
                          ${(activeSubject[draft.id] ?? 1) === n
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
