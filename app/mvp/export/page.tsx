"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Edit3,
  FileSpreadsheet,
  FileText,
  Mail,
  MessageSquare,
  RefreshCw,
  Save,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";
import { ACCOUNT_CONTEXT_KEY, type ManualAccountContext } from "@/lib/brain-context";

const DRAFT_STORAGE_KEY = "emailorcGeneratedDrafts";
const DRAFT_STATE_KEY = "emailorcDraftState";

type ExportDraft = {
  id: string;
  name: string;
  company: string;
  email: string;
  subject1: string;
  subject2: string;
  previewText: string;
  body: string;
  cta: string;
  qaScore: number;
  spamRisk: string;
  status: string;
  offerName: string;
  campaignPlaybook: string;
  accountContext?: ManualAccountContext;
  aiContext?: any;
  _raw: any;
};

const EXPORT_OPTIONS = [
  { id: "approved-csv", label: "Approved Drafts", description: "One latest approved draft per contact", format: "CSV", color: "bg-emerald-100", icon: <CheckCircle className="h-5 w-5 text-emerald-600" /> },
  { id: "approved-excel", label: "Approved Drafts", description: "Formatted spreadsheet with subject + body columns", format: "Excel", color: "bg-emerald-100", icon: <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> },
  { id: "crm-import", label: "CRM-Ready Import", description: "Salesforce / CRM compatible flat-file format", format: "CRM CSV", color: "bg-blue-100", icon: <FileText className="h-5 w-5 text-blue-600" /> },
  { id: "mail-merge", label: "Outlook Mail Merge", description: "Mail merge format for Microsoft 365 / Outlook", format: "Outlook CSV", color: "bg-blue-100", icon: <Mail className="h-5 w-5 text-blue-600" /> },
  { id: "needs-review", label: "Needs Review List", description: "Records flagged for human review before outreach", format: "CSV", color: "bg-amber-100", icon: <Users className="h-5 w-5 text-amber-600" /> },
  { id: "dnc-list", label: "Do Not Contact List", description: "DNC list for compliance and suppression upload", format: "CSV", color: "bg-red-100", icon: <XCircle className="h-5 w-5 text-red-600" /> },
  { id: "reply-followup", label: "Reply Follow-Up List", description: "Customers who replied and need follow-up", format: "CSV", color: "bg-violet-100", icon: <MessageSquare className="h-5 w-5 text-violet-600" /> },
];

function normalizeEnvironment() {
  const envConfig = JSON.parse(localStorage.getItem("envConfig") || "{}");
  return String(envConfig.mode || "demo").toLowerCase().replace("_", "-");
}

function demoDataAllowed() {
  return normalizeEnvironment() === "demo";
}

function contextKeyForDraft(draft: ExportDraft) {
  return String(draft.email || draft.company || draft.id).trim().toLowerCase();
}

function normalizeDraft(row: any): ExportDraft {
  const id = String(row.id || row._id || row.recordId || row._record_id || row.email || row._email || crypto.randomUUID());
  return {
    id,
    name: String(row.name || row._name || row["Full Name"] || "Contact"),
    company: String(row.company || row._company || row["Company Name"] || row["Business Name"] || "Company"),
    email: String(row.email || row._email || row.Email || ""),
    subject1: String(row.subject1 || row._subject || row.subject || ""),
    subject2: String(row.subject2 || row._subject2 || ""),
    previewText: String(row.previewText || row._preview || ""),
    body: String(row.body || row._body || ""),
    cta: String(row.cta || row._cta || ""),
    qaScore: Number(row.qaScore || row._score || row.qa_score || 0),
    spamRisk: String(row.spamRisk || row._spam || "Low"),
    status: String(row.status || row._status || "Pending Review"),
    offerName: String(row.offerName || row.aiContext?.offerUsed || row._offer || "No offer selected"),
    campaignPlaybook: String(row.campaignPlaybook || row.aiContext?.campaignPlaybookUsed || "Renewal Upsell"),
    accountContext: row.accountContext || row._account_context,
    aiContext: row.aiContext || row._ai_context,
    _raw: row,
  };
}

function loadLocalDrafts() {
  const savedRows = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "[]");
  const savedState = Object.values(JSON.parse(localStorage.getItem(DRAFT_STATE_KEY) || "{}") as Record<string, any>);
  const merged = [...savedRows, ...savedState].map(normalizeDraft);
  return Array.from(new Map(merged.map((draft) => [draft.id, draft])).values());
}

function saveDraftToStorage(updated: ExportDraft) {
  const rows = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "[]");
  const nextRows = rows.map((row: any) => {
    const id = String(row.id || row._id || row.email || row._email || "");
    if (id !== updated.id) return row;
    return {
      ...row,
      subject1: updated.subject1,
      subject2: updated.subject2,
      previewText: updated.previewText,
      body: updated.body,
      cta: updated.cta,
      qaScore: updated.qaScore,
      status: updated.status,
      offerName: updated.offerName,
      accountContext: updated.accountContext,
      aiContext: updated.aiContext,
      _subject: updated.subject1,
      _subject2: updated.subject2,
      _preview: updated.previewText,
      _body: updated.body,
      _cta: updated.cta,
      _score: updated.qaScore,
      _status: updated.status,
    };
  });
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextRows));
}

export default function ExportCenterPage() {
  const notice = useNotice();
  const [exported, setExported] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ExportDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [contextText, setContextText] = useState("");
  const [contextDirty, setContextDirty] = useState<Record<string, boolean>>({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [role, setRole] = useState("VIEWER");
  const [plan, setPlan] = useState("Trial");

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "VIEWER");
    const localDrafts = demoDataAllowed() ? loadLocalDrafts() : [];
    setDrafts(localDrafts);
    setSelectedDraftId(localDrafts[0]?.id || "");

    fetch(`/api/workflow/drafts?organization_id=${encodeURIComponent(localStorage.getItem("orgId") || "org_demo")}&environment=${encodeURIComponent(normalizeEnvironment())}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status !== "success") return;
        const remoteDrafts = (data.drafts || []).map(normalizeDraft);
        setDrafts(remoteDrafts);
        setSelectedDraftId(remoteDrafts[0]?.id || "");
      })
      .catch(() => {});

    fetch(`/api/billing/current-plan?organization_id=${encodeURIComponent(localStorage.getItem("orgId") || "org_demo")}`)
      .then((res) => res.json())
      .then((data) => setPlan(data.plan || "Trial"))
      .catch(() => setPlan(localStorage.getItem("userPlan") || "Trial"));
  }, []);

  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === selectedDraftId) || drafts[0],
    [drafts, selectedDraftId],
  );

  useEffect(() => {
    if (!selectedDraft) {
      setContextText("");
      return;
    }
    const saved = JSON.parse(localStorage.getItem(ACCOUNT_CONTEXT_KEY) || "{}");
    const savedContext = selectedDraft.accountContext || saved[contextKeyForDraft(selectedDraft)] || {};
    setContextText(savedContext.rawText || "");
  }, [selectedDraft?.id]);

  const roleAllowsExport = ["SUPER_ADMIN", "CLIENT_ADMIN", "EDITOR", "REVIEWER"].includes(role);
  const planAllowsExport = true; // Trial is intentionally allowed for controlled testing.

  const approvedDrafts = drafts.filter((draft) => draft.status === "Approved" && draft.qaScore >= 90);

  const exportBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (!roleAllowsExport) blockers.push("Your role does not allow export.");
    if (!planAllowsExport) blockers.push("Your plan does not include export.");
    if (!approvedDrafts.length) blockers.push("Draft must be approved before export.");
    if (Object.values(contextDirty).some(Boolean)) blockers.push("Context changed. Regenerate draft before export.");
    return blockers;
  }, [approvedDrafts.length, contextDirty, planAllowsExport, roleAllowsExport]);

  const saveContext = (mode: "contact" | "use_once" | "delete") => {
    if (!selectedDraft) return;
    const key = contextKeyForDraft(selectedDraft);
    const saved = JSON.parse(localStorage.getItem(ACCOUNT_CONTEXT_KEY) || "{}");
    const nextContext: ManualAccountContext = {
      ...(selectedDraft.accountContext || {}),
      rawText: mode === "delete" ? "" : contextText,
      currentPlan: selectedDraft.accountContext?.currentPlan || "",
      currentProduct: selectedDraft.accountContext?.currentProduct || "",
      renewalMonth: selectedDraft.accountContext?.renewalMonth || "",
      renewalDate: selectedDraft.accountContext?.renewalDate || "",
      businessDescription: selectedDraft.accountContext?.businessDescription || "",
      industry: selectedDraft.accountContext?.industry || "",
      painPoints: selectedDraft.accountContext?.painPoints || "",
      operationalNotes: selectedDraft.accountContext?.operationalNotes || "",
      crmNotes: selectedDraft.accountContext?.crmNotes || "",
      websiteResearchNotes: selectedDraft.accountContext?.websiteResearchNotes || "",
      recommendedUpsell: selectedDraft.accountContext?.recommendedUpsell || "",
      personalizationAngle: selectedDraft.accountContext?.personalizationAngle || "",
      sourceOfInformation: selectedDraft.accountContext?.sourceOfInformation || "Export Prep",
      confidenceLevel: selectedDraft.accountContext?.confidenceLevel || "Medium",
      saveMode: mode === "use_once" ? "use_once" : "contact",
      savedAt: new Date().toISOString(),
    };

    if (mode === "delete") delete saved[key];
    else saved[key] = nextContext;
    localStorage.setItem(ACCOUNT_CONTEXT_KEY, JSON.stringify(saved));

    setDrafts((previous) => previous.map((draft) => (
      draft.id === selectedDraft.id ? { ...draft, accountContext: mode === "delete" ? undefined : nextContext } : draft
    )));
    setContextDirty((previous) => ({ ...previous, [selectedDraft.id]: true }));

    if (mode !== "use_once") {
      fetch("/api/account-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: localStorage.getItem("orgId") || "org_demo",
          user_id: localStorage.getItem("userId") || "user_super_admin",
          contact_key: selectedDraft.email || selectedDraft.id,
          company_key: selectedDraft.company,
          save_scope: "contact",
          context: mode === "delete" ? { rawText: "", deleted: true } : nextContext,
        }),
      }).catch(() => null);
    }

    notice.info(mode === "delete" ? "Context removed. Regenerate before export." : "Context saved. Regenerate before export.", "Context changed");
  };

  const regenerateWithUpdatedContext = async () => {
    if (!selectedDraft) return;
    setIsRegenerating(true);
    try {
      const response = await fetch("/api/brain/regenerate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft_id: selectedDraft.id,
          record_id: selectedDraft.id,
          organization_id: localStorage.getItem("orgId") || "org_demo",
          user_id: localStorage.getItem("userId") || "user_super_admin",
          current_draft: selectedDraft._raw,
          account_context: {
            ...(selectedDraft.accountContext || {}),
            rawText: contextText,
            saveMode: "contact",
          },
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== "success") throw new Error(data.error || "Could not regenerate draft.");
      const updated = normalizeDraft({ ...selectedDraft._raw, ...data.draft });
      setDrafts((previous) => previous.map((draft) => draft.id === selectedDraft.id ? updated : draft));
      saveDraftToStorage(updated);
      setContextDirty((previous) => ({ ...previous, [selectedDraft.id]: false }));
      notice.success("Draft regenerated with updated context.", "Draft updated");
    } catch (error) {
      notice.error(error instanceof Error ? error.message : "Could not regenerate draft.", "Regenerate failed");
    } finally {
      setIsRegenerating(false);
    }
  };

  const exportFile = async (id: string, format: string) => {
    if (exportBlockers.length) {
      notice.warning(exportBlockers[0], "Export blocked");
      return;
    }

    setExporting(id);
    try {
      const environment = normalizeEnvironment();
      const apiRows = await fetch("/api/workflow/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: localStorage.getItem("orgId") || "org_demo",
          user_id: localStorage.getItem("userId") || "user_super_admin",
          environment,
          format,
        }),
      }).then((response) => response.json()).catch(() => ({ rows: [] }));

      const fallbackRows = Array.from(new Map(approvedDrafts
        .filter((row) => !row._raw?._dnc)
        .map((row) => [String(row.email || row.id).toLowerCase(), row])).values());
      const sourceRows = apiRows.rows?.length ? apiRows.rows.map((row: any) => ({
        name: row.name, company: row.company, email: row.email, subject: row.subject, body: row.body, qa_score: row.qa_score, status: row.status,
      })) : fallbackRows.map((row) => ({
        name: row.name,
        company: row.company,
        email: row.email,
        subject: row.subject1,
        body: row.body,
        qa_score: row.qaScore,
        status: plan === "Trial" ? "Approved - Trial Export" : "Approved",
      }));

      const headers = ["name", "company", "email", "subject", "body", "qa_score", "status"];
      const csv = [
        headers.join(","),
        ...sourceRows.map((row: any) => [
          row.name || "",
          row.company || "",
          row.email || "",
          row.subject || "",
          row.body || "",
          row.qa_score || "",
          row.status || "",
        ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${id}.${format === "Excel" ? "csv" : "csv"}`;
      link.click();
      URL.revokeObjectURL(url);
      setExported((previous) => new Set([...previous, id]));
      if (apiRows.duplicate_emails_removed) notice.warning("Duplicate emails were removed from this export.", "Duplicates removed");
      notice.success(`${format} export completed.`, "Export completed");
    } catch {
      notice.error("Export failed. Please try again.", "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Export Center</h1>
        <p className="text-sm text-slate-500 mt-1">Review approved drafts, adjust account context, and prepare final export files.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <Download className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Trial and paid users can test the full approved-draft export flow.</span> Export is blocked only when role, plan, approval, QA, or context rules fail.
        </p>
      </div>

      {exportBlockers.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-amber-800">
            <AlertTriangle className="h-4 w-4" /> Export needs attention
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {exportBlockers.map((blocker) => (
              <span key={blocker} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700 border border-amber-100">{blocker}</span>
            ))}
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Draft Review / Export Prep</h2>
            <p className="text-xs text-slate-500 mt-1">Editors can review drafts and update context before final export.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Role: {role.replace("_", " ")} | Plan: {plan}</span>
        </div>

        {!drafts.length ? (
          <div className="p-8 text-center">
            <Mail className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-700">No drafts found yet.</p>
            <p className="text-xs text-slate-500 mt-1">Generate a draft first, then return here to review context and export approved drafts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
            <div className="border-r border-slate-100 bg-slate-50/60 p-3 space-y-2">
              {drafts.map((draft) => (
                <button
                  key={draft.id}
                  onClick={() => setSelectedDraftId(draft.id)}
                  className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${selectedDraft?.id === draft.id ? "border-indigo-200 bg-white shadow-sm" : "border-transparent hover:bg-white"}`}
                >
                  <p className="text-xs font-black text-slate-900 truncate">{draft.company}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{draft.email || draft.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${draft.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{draft.status}</span>
                    <span className="text-[10px] font-bold text-slate-400">QA {draft.qaScore || 0}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedDraft && (
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    ["Contact", selectedDraft.name],
                    ["Company", selectedDraft.company],
                    ["Offer Used", selectedDraft.offerName],
                    ["Campaign", selectedDraft.campaignPlaybook],
                    ["QA Score", `${selectedDraft.qaScore}/100`],
                    ["Approval", selectedDraft.status],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="text-xs font-bold text-slate-800 mt-1 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Email Draft</h3>
                      {contextDirty[selectedDraft.id] && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700">Context changed</span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p><span className="font-bold">Subject 1:</span> {selectedDraft.subject1 || "Missing"}</p>
                      <p><span className="font-bold">Subject 2:</span> {selectedDraft.subject2 || "Missing"}</p>
                      <p><span className="font-bold">Preview:</span> {selectedDraft.previewText || "Missing"}</p>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 whitespace-pre-wrap leading-relaxed">{selectedDraft.body || "No draft body yet."}</div>
                      <p><span className="font-bold">CTA:</span> {selectedDraft.cta || "Missing"}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Context Used Panel</h3>
                      <Edit3 className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {[
                        ["Business Knowledge", selectedDraft.aiContext?.businessKnowledgeUsed ? "Yes" : "Warning"],
                        ["App Mindset", selectedDraft.aiContext?.appMindsetUsed ? "Yes" : "Warning"],
                        ["Manual Context", contextText.trim() ? "Yes" : "No"],
                        ["Personalization", selectedDraft.aiContext?.personalizationLevel || (contextText.trim() ? "Account-Specific" : "Basic")],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                          <p className="font-black uppercase tracking-widest text-slate-400">{label}</p>
                          <p className="font-bold text-slate-700 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>

                    <textarea
                      value={contextText}
                      onChange={(event) => {
                        setContextText(event.target.value);
                        setContextDirty((previous) => ({ ...previous, [selectedDraft.id]: true }));
                      }}
                      rows={8}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Add or edit account context before export. Regenerate the draft after material changes."
                    />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => saveContext("contact")} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                        <Save className="h-3.5 w-3.5" /> Save to Contact
                      </button>
                      <button onClick={() => saveContext("use_once")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        Use Once
                      </button>
                      <button onClick={() => { setContextText(""); saveContext("delete"); }} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" /> Delete Context
                      </button>
                      <button disabled={isRegenerating || !contextDirty[selectedDraft.id]} onClick={regenerateWithUpdatedContext} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                        <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} /> Regenerate With Updated Context
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {EXPORT_OPTIONS.map((opt) => {
          const done = exported.has(opt.id);
          const disabled = exporting === opt.id || exportBlockers.length > 0;
          return (
            <div key={opt.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow ${done ? "border-emerald-200" : "border-slate-100"}`}>
              <div className={`rounded-xl p-3 shrink-0 ${opt.color}`}>{opt.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-400 bg-slate-100 rounded-md px-2 py-0.5">{opt.format}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-500">{approvedDrafts.length} approved</span>
                  {!done ? (
                    <button
                      disabled={disabled}
                      title={exportBlockers[0] || "Export approved drafts"}
                      onClick={() => exportFile(opt.id, opt.format)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Download className="h-3.5 w-3.5" /> {exporting === opt.id ? "Exporting..." : "Export"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-700 px-3 py-1.5 text-xs font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" /> Downloaded
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
