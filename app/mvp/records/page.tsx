"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Trash2, Save, AlertTriangle, XCircle, CheckCircle, Clock, Eye, RotateCcw } from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";
import { ACCOUNT_CONTEXT_KEY, type AccountContextSaveMode, type ManualAccountContext } from "@/lib/brain-context";
import { leadEmailStatus, type LeadEmailStatus, type LeadSortDirection, type LeadSortField } from "@/lib/lead-management";

type RecordStatus = "Ready" | "Missing Email" | "Missing Company" | "Duplicate" | "Do Not Contact" | "Needs Review";

interface CustomerRecord {
  id: number | string;
  displayId?: number;
  name: string;
  rawName?: string;
  company: string;
  rawCompany?: string;
  email: string;
  rawEmail?: string;
  product: string;
  renewal: string;
  industry: string;
  owner: string;
  status: RecordStatus;
  confidence: number;
  upsell: string;
  environment?: string;
  importBatchId?: string;
  sourceFile?: string;
  sourceLabel?: string;
  sourceRowId?: string;
  importedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
  archiveReason?: string;
  restoredAt?: string;
  restoreReason?: string;
  standardFields?: Record<string, string>;
  customFields?: Record<string, string>;
  emailStatus?: LeadEmailStatus;
  draftReadiness?: "draft_ready" | "not_draft_ready";
  draftReadinessLabel?: string;
  draftReadinessReason?: string;
  draftReadinessMissing?: string[];
  validationIssues?: string[];
  hasValidationProblems?: boolean;
}

const DEMO_RECORDS: CustomerRecord[] = [
  { id: 1, name: "Sarah Johnson", company: "Apex Logistics", email: "sarah@apexlogistics.com", product: "Pro Plan", renewal: "2025-07-15", industry: "Logistics", owner: "James R.", status: "Ready", confidence: 91, upsell: "Enterprise Suite", sourceLabel: "Demo fallback" },
  { id: 2, name: "Marcus Webb", company: "Greenfield Capital", email: "m.webb@greenfield.com", product: "Starter", renewal: "2025-06-01", industry: "Finance", owner: "Dana K.", status: "Ready", confidence: 87, upsell: "Pro Plan + Analytics", sourceLabel: "Demo fallback" },
  { id: 3, name: "Rina Patel", company: "BluePath Health", email: "", product: "Growth Plan", renewal: "2025-08-20", industry: "Healthcare", owner: "James R.", status: "Missing Email", confidence: 0, upsell: "Enterprise Suite", sourceLabel: "Demo fallback" },
  { id: 4, name: "Tom Hargrove", company: "", email: "tom.h@hargrove.io", product: "Pro Plan", renewal: "2025-09-10", industry: "Tech", owner: "Dana K.", status: "Missing Company", confidence: 0, upsell: "Enterprise Suite", sourceLabel: "Demo fallback" },
  { id: 5, name: "Olivia Stern", company: "Stern & Associates", email: "olivia@sternassoc.com", product: "Enterprise", renewal: "2025-05-30", industry: "Legal", owner: "James R.", status: "Needs Review", confidence: 63, upsell: "Premium Support Add-on", sourceLabel: "Demo fallback" },
  { id: 6, name: "Carlos Mena", company: "Mena Retail Group", email: "carlos@menaretail.com", product: "Starter", renewal: "2025-07-01", industry: "Retail", owner: "Dana K.", status: "Ready", confidence: 82, upsell: "Pro Plan", sourceLabel: "Demo fallback" },
  { id: 7, name: "Janet Liu", company: "Skyline Dev Co.", email: "janet@skylinedev.com", product: "Pro Plan", renewal: "2025-10-15", industry: "Real Estate", owner: "James R.", status: "Duplicate", confidence: 0, upsell: "Enterprise Suite", sourceLabel: "Demo fallback" },
  { id: 8, name: "Howard Grant", company: "Grant Manufacturing", email: "howard@grantmfg.com", product: "Enterprise", renewal: "2025-12-01", industry: "Manufacturing", owner: "Dana K.", status: "Do Not Contact", confidence: 0, upsell: "N/A", sourceLabel: "Demo fallback" },
];

const STATUS_CONFIG: Record<RecordStatus, { label: string; color: string; icon: React.ReactNode }> = {
  "Ready":           { label: "Ready",           color: "bg-emerald-50 text-emerald-700 border-emerald-200",  icon: <CheckCircle className="h-3.5 w-3.5" /> },
  "Missing Email":   { label: "Missing Email",   color: "bg-amber-50 text-amber-700 border-amber-200",        icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  "Missing Company": { label: "Missing Company", color: "bg-amber-50 text-amber-700 border-amber-200",        icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  "Duplicate":       { label: "Duplicate",       color: "bg-orange-50 text-orange-700 border-orange-200",     icon: <Clock className="h-3.5 w-3.5" /> },
  "Do Not Contact":  { label: "Do Not Contact",  color: "bg-red-50 text-red-700 border-red-200",              icon: <XCircle className="h-3.5 w-3.5" /> },
  "Needs Review":    { label: "Needs Review",    color: "bg-blue-50 text-blue-700 border-blue-200",           icon: <Eye className="h-3.5 w-3.5" /> },
};

const ALL_STATUSES: RecordStatus[] = ["Ready", "Missing Email", "Missing Company", "Duplicate", "Do Not Contact", "Needs Review"];
const PAGE_SIZES = [50, 100, 250];
const EDITABLE_FIELDS = ["name", "company", "email", "product", "renewal", "industry", "owner", "upsell"] as const;
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

export default function RecordsPage() {
  const notice = useNotice();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<RecordStatus | "All">("All");
  const [selected, setSelected] = useState<Array<number | string>>([]);
  const [records, setRecords] = useState<CustomerRecord[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<number | string | null>(null);
  const [draftLead, setDraftLead] = useState<Partial<CustomerRecord> | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sort, setSort] = useState<LeadSortField>("importedAt");
  const [direction, setDirection] = useState<LeadSortDirection>("desc");
  const [accountContexts, setAccountContexts] = useState<Record<string, ManualAccountContext>>({});
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [lifecycleReason, setLifecycleReason] = useState("test_demo_cleanup");

  const activeEnvironment = React.useCallback(() => {
    try {
      const envConfig = JSON.parse(localStorage.getItem("envConfig") || "{}");
      return String(envConfig.mode || "demo").toLowerCase().replace("_", "-");
    } catch {
      return "demo";
    }
  }, []);

  const demoDataAllowed = React.useCallback(() => {
    return activeEnvironment() === "demo";
  }, [activeEnvironment]);

  const loadRecords = React.useCallback(() => {
    setIsLoadingRecords(true);
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
    const params = new URLSearchParams({
      organization_id: localStorage.getItem("orgId") || "org_demo",
      environment: activeEnvironment(),
      page: String(page),
      page_size: String(pageSize),
      sort,
      direction,
      include_archived: showArchived ? "true" : "false",
    });
    fetch(`/api/workflow/records?${params.toString()}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const loaded = data.records || [];
          setRecords(loaded);
          setTotalRecords(Number(data.total || loaded.length));
          setActiveRecordId(loaded[0]?.id || null);
          if (loaded.length) notice.success(`${loaded.length} records loaded from ${data.environment}.`, "Records loaded");
        } else {
          const fallback = demoDataAllowed() ? DEMO_RECORDS : [];
          setRecords(fallback);
          setTotalRecords(fallback.length);
          setActiveRecordId(fallback[0]?.id || null);
        }
      })
      .catch(() => {
        const fallback = demoDataAllowed() ? DEMO_RECORDS : [];
        setRecords(fallback);
        setTotalRecords(fallback.length);
        setActiveRecordId(fallback[0]?.id || null);
      })
      .finally(() => setIsLoadingRecords(false));
  }, [page, pageSize, sort, direction, showArchived, notice, activeEnvironment, demoDataAllowed]);

  useEffect(() => {
    try {
      setAccountContexts(JSON.parse(localStorage.getItem(ACCOUNT_CONTEXT_KEY) || "{}"));
    } catch {
      setAccountContexts({});
    }
    loadRecords();
  }, [loadRecords]);

  const visibleRecords = records.length ? records : (demoDataAllowed() ? DEMO_RECORDS : []);
  const filtered = visibleRecords.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      String(r.email || r.rawEmail || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || r.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const toggleSelect = (id: number | string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const selectAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((r) => r.id));

  const summary = ALL_STATUSES.map((s) => ({
    status: s,
    count: visibleRecords.filter((r) => r.status === s).length,
  }));
  const activeRecord = visibleRecords.find((record) => record.id === activeRecordId) || filtered[0] || visibleRecords[0];
  const selectedRecord = draftLead || activeRecord;
  const emailStatus = leadEmailStatus(selectedRecord?.email);
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const rangeStart = totalRecords ? ((page - 1) * pageSize) + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, totalRecords);
  const sortedPageRecords = useMemo(() => filtered, [filtered]);
  const activeContextKey = activeRecord ? `${activeRecord.company || "company"}:${activeRecord.name || activeRecord.id}`.toLowerCase() : "";
  const activeContext = { ...EMPTY_ACCOUNT_CONTEXT, ...(accountContexts[activeContextKey] || {}) };

  function updateActiveContext(patch: Partial<ManualAccountContext>) {
    if (!activeContextKey) return;
    setAccountContexts((prev) => ({ ...prev, [activeContextKey]: { ...activeContext, ...patch } }));
  }

  function saveActiveContext() {
    if (!activeContextKey || !activeRecord) return;
    const next = {
      ...accountContexts,
      [activeContextKey]: {
        ...activeContext,
        currentProduct: activeContext.currentProduct || activeRecord.product,
        renewalDate: activeContext.renewalDate || activeRecord.renewal,
        industry: activeContext.industry || activeRecord.industry,
        recommendedUpsell: activeContext.recommendedUpsell || activeRecord.upsell,
        savedAt: new Date().toISOString(),
      },
    };
    setAccountContexts(next);
    localStorage.setItem(ACCOUNT_CONTEXT_KEY, JSON.stringify(next));
    if (next[activeContextKey].saveMode !== "use_once") {
      fetch("/api/account-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: localStorage.getItem("orgId") || "org_demo",
          user_id: localStorage.getItem("userId") || "user_super_admin",
          contact_key: activeContextKey,
          company_key: String(activeRecord.company || "").trim().toLowerCase(),
          save_scope: next[activeContextKey].saveMode,
          context: next[activeContextKey],
        }),
      }).catch(() => {});
    }
    notice.success("Account Context saved to this contact/account.", "Account Context saved");
  }

  function updateDraftLead(key: typeof EDITABLE_FIELDS[number], value: string) {
    setDraftLead((current) => ({ ...(current || activeRecord || {}), [key]: value }));
  }

  async function saveLead() {
    if (!selectedRecord) return;
    const isNew = showAddLead;
    const response = await fetch("/api/workflow/records", {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedRecord.id,
        organization_id: localStorage.getItem("orgId") || "org_demo",
        environment: activeEnvironment(),
        name: selectedRecord.name,
        company: selectedRecord.company,
        email: selectedRecord.email,
        product: selectedRecord.product,
        renewal: selectedRecord.renewal,
        industry: selectedRecord.industry,
        owner: selectedRecord.owner,
        upsell: selectedRecord.upsell,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status === "error") {
      notice.error(data.error || "Lead could not be saved.", "Lead save failed");
      return;
    }
    notice.success(isNew ? "Manual lead saved. Draft readiness was recalculated." : "Lead profile updated, source trace preserved, and draft readiness recalculated.", "Lead saved");
    setShowAddLead(false);
    setDraftLead(null);
    loadRecords();
  }

  async function updateLeadLifecycle(action: "archive" | "restore") {
    if (!activeRecord) return;
    if (!lifecycleReason) {
      notice.warning("A reason category is required.", "Reason required");
      return;
    }
    const response = await fetch("/api/workflow/records", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: activeRecord.id,
        action,
        reason: lifecycleReason,
        organization_id: localStorage.getItem("orgId") || "org_demo",
        environment: activeEnvironment(),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status === "error") {
      notice.error(data.error || `Lead could not be ${action}d.`, "Lifecycle failed");
      return;
    }
    notice.success(action === "archive" ? "Lead archived. Existing import and draft history was preserved." : "Lead restored. Existing source/import history was preserved.", action === "archive" ? "Lead archived" : "Lead restored");
    setDraftLead(null);
    loadRecords();
  }

  function startAddLead() {
    setShowAddLead(true);
    setDraftLead({
      name: "",
      company: "",
      email: "",
      product: "",
      renewal: "",
      industry: "",
      owner: "",
      upsell: "",
      status: "Ready",
      confidence: 90,
      sourceLabel: "Manual entry",
    });
  }

  function toggleSort(field: LeadSortField) {
    setPage(1);
    if (sort === field) {
      setDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSort(field);
    setDirection(field === "importedAt" ? "desc" : "asc");
  }

  const sortLabel = (field: LeadSortField, label: string) => (
    <button onClick={() => toggleSort(field)} className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900">
      {label}{sort === field ? (direction === "asc" ? " ↑" : " ↓") : ""}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Validate Account Records</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and validate imported data to identify upsell opportunities and growth targets.
          </p>
        </div>
        <button onClick={startAddLead} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      {/* Status Summary Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("All")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors
            ${activeFilter === "All" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
        >
          All <span className="font-bold">{visibleRecords.length}</span>
        </button>
        {summary.map(({ status, count }) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors
                ${activeFilter === status ? cfg.color + " ring-2 ring-offset-1 ring-indigo-400" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
            >
              {cfg.icon} {status} <span className="font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select value={sort} onChange={(e) => { setPage(1); setSort(e.target.value as LeadSortField); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          <option value="importedAt">Sort: Import date</option>
          <option value="name">Sort: Name</option>
          <option value="company">Sort: Business</option>
          <option value="email">Sort: Email</option>
          <option value="source">Sort: Source</option>
          <option value="status">Sort: Status</option>
        </select>
        <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} / page</option>)}
        </select>
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={showArchived} onChange={(event) => { setPage(1); setShowArchived(event.target.checked); }} className="rounded border-slate-300 text-indigo-600" />
          Show archived
        </label>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-slate-500">{selected.length} selected</span>
            <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
              Mark DNC
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoadingRecords && (
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">Loading records from database...</div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={selectAll}
                  className="rounded border-slate-300 text-indigo-600"
                />
              </th>
              <th className="px-4 py-3 text-left">{sortLabel("name", "Customer")}</th>
              <th className="px-4 py-3 text-left">{sortLabel("company", "Business")}</th>
              <th className="px-4 py-3 text-left">{sortLabel("email", "Email")}</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Product</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Renewal</th>
              <th className="px-4 py-3 text-left">{sortLabel("source", "Source")}</th>
              <th className="px-4 py-3 text-left">{sortLabel("status", "Status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedPageRecords.map((record) => {
              const cfg = STATUS_CONFIG[record.status];
              const recordEmailStatus = leadEmailStatus(record.email);
              return (
                <tr key={record.id} onClick={() => setActiveRecordId(record.id)} className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${activeRecordId === record.id ? "bg-indigo-50/60" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(record.id)}
                      onChange={() => toggleSelect(record.id)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0">
                        {record.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className={`font-medium ${record.hasValidationProblems ? "text-amber-800" : "text-slate-900"}`}>{record.name}</p>
                        <p className="text-xs text-slate-400">{record.company || "Missing business"}</p>
                        {record.validationIssues?.length ? <p className="mt-1 text-[10px] font-bold text-amber-600">{record.validationIssues.slice(0, 2).join(" · ")}</p> : null}
                        <p className={`mt-1 text-[10px] font-bold ${record.draftReadiness === "draft_ready" ? "text-emerald-600" : "text-amber-600"}`}>
                          {record.draftReadinessLabel || "Not Draft Ready"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{record.company || "Needs review"}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{record.email || "No email"}</p>
                    <p className={`text-[11px] font-bold ${recordEmailStatus === "Valid" ? "text-emerald-600" : recordEmailStatus === "Missing" ? "text-amber-600" : "text-red-600"}`}>{recordEmailStatus}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{record.product}</td>
                  <td className="px-4 py-3 text-slate-600">{record.renewal}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <p className={`font-semibold ${record.sourceLabel === "Demo fallback" ? "text-purple-700" : "text-slate-700"}`}>{record.sourceLabel || record.sourceFile || "Manual entry"}</p>
                    {record.importBatchId && <p className="text-[10px] text-slate-400">Batch {record.importBatchId}</p>}
                    {record.sourceRowId && <p className="text-[10px] text-slate-400">Row {record.sourceRowId}</p>}
                    {record.archivedAt && <p className="text-[10px] font-bold text-red-500">Archived</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Search className="h-10 w-10 mb-3" />
            <p className="text-sm">No records match your filters.</p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
          <span>Showing {rangeStart}-{rangeEnd} of {totalRecords}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded border border-slate-200 bg-white px-3 py-1 disabled:opacity-40">Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded border border-slate-200 bg-white px-3 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{showAddLead ? "Add Lead" : "Lead Profile"}</h2>
            <p className="mt-1 text-xs text-slate-500">{selectedRecord?.sourceLabel || selectedRecord?.sourceFile || "Manual entry"} · {selectedRecord?.importedAt || selectedRecord?.createdAt || "Not imported"}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${emailStatus === "Valid" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : emailStatus === "Missing" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            Email: {emailStatus}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {EDITABLE_FIELDS.map((key) => (
            <label key={key} className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{key === "company" ? "Business / Practice" : key}</span>
              <input value={String(selectedRecord?.[key] || "")} onChange={(e) => updateDraftLead(key, e.target.value)} className="mt-1 w-full rounded-lg border-slate-200 text-sm" />
            </label>
          ))}
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
            <p><span className="font-bold">Original source:</span> {selectedRecord?.sourceLabel || selectedRecord?.sourceFile || "Manual entry"}</p>
            <p><span className="font-bold">Import batch:</span> {selectedRecord?.importBatchId || "None"}</p>
            <p><span className="font-bold">Source row:</span> {selectedRecord?.sourceRowId || "None"}</p>
            <p><span className="font-bold">Archive state:</span> {selectedRecord?.archivedAt ? `Archived (${selectedRecord.archiveReason || "reason recorded"})` : "Active"}</p>
            <p><span className="font-bold">Validation:</span> {selectedRecord?.validationIssues?.length ? selectedRecord.validationIssues.join("; ") : "No visible issues"}</p>
            <p><span className="font-bold">Draft readiness:</span> {selectedRecord?.draftReadinessReason || "Missing required draft-readiness fields."}</p>
            {selectedRecord?.rawName && selectedRecord.rawName !== selectedRecord.name && <p><span className="font-bold">Raw contact value:</span> {selectedRecord.rawName}</p>}
            {selectedRecord?.rawEmail && selectedRecord.emailStatus !== "Valid" && <p><span className="font-bold">Raw email value:</span> {selectedRecord.rawEmail}</p>}
          </div>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archive/restore reason</span>
            <select value={lifecycleReason} onChange={(event) => setLifecycleReason(event.target.value)} className="mt-1 w-full rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-700">
              <option value="duplicate">Duplicate import or lead</option>
              <option value="wrong_source">Wrong file or wrong source</option>
              <option value="test_demo_cleanup">Test/demo cleanup</option>
              <option value="bad_source_data">Bad or incomplete source data</option>
              <option value="out_of_scope">Client/account no longer in scope</option>
              <option value="compliance_or_dnc">Compliance or do-not-contact concern</option>
              <option value="operational_correction">Operational correction</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveLead} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"><Save className="h-4 w-4" /> Save Lead</button>
            {!showAddLead && activeRecord && !activeRecord.archivedAt && (
              <button onClick={() => updateLeadLifecycle("archive")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"><Trash2 className="h-4 w-4" /> Archive Lead</button>
            )}
            {!showAddLead && activeRecord?.archivedAt && (
              <button onClick={() => updateLeadLifecycle("restore")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"><RotateCcw className="h-4 w-4" /> Restore Lead</button>
            )}
          </div>
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Account Context</h2>
            <p className="mt-1 text-xs text-slate-500">{activeRecord?.company} · {activeRecord?.name}</p>
          </div>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            {activeContext.rawText || activeContext.operationalNotes ? "Saved" : "None"}
          </span>
        </div>
        <textarea
          value={activeContext.rawText}
          onChange={(e) => updateActiveContext({ rawText: e.target.value })}
          rows={8}
          placeholder="Paste any notes about this customer's business, current plan, renewal situation, pain points, operations, website research, CRM notes, or why the selected offer may be relevant."
          className="mt-4 w-full rounded-lg border-slate-200 text-sm"
        />
        <div className="mt-3 grid grid-cols-1 gap-2">
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
              value={String(activeContext[key as keyof ManualAccountContext] || "")}
              onChange={(e) => updateActiveContext({ [key]: e.target.value } as Partial<ManualAccountContext>)}
              placeholder={label}
              className="rounded-lg border-slate-200 text-sm"
            />
          ))}
          <select value={activeContext.confidenceLevel} onChange={(e) => updateActiveContext({ confidenceLevel: e.target.value as ManualAccountContext["confidenceLevel"] })} className="rounded-lg border-slate-200 text-sm">
            <option value="">Confidence Level</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select value={activeContext.saveMode} onChange={(e) => updateActiveContext({ saveMode: e.target.value as AccountContextSaveMode })} className="rounded-lg border-slate-200 text-sm">
            <option value="contact">Save to this contact/account</option>
            <option value="use_once">Use once for this draft only</option>
            <option value="company">Save to company/account profile for future drafts</option>
          </select>
          <button onClick={saveActiveContext} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
            Save Account Context
          </button>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
