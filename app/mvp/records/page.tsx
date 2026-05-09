"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, ChevronDown, User, Building2, Mail, AlertTriangle, XCircle, CheckCircle, Clock, Eye } from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";
import { ACCOUNT_CONTEXT_KEY, type AccountContextSaveMode, type ManualAccountContext } from "@/lib/brain-context";

type RecordStatus = "Ready" | "Missing Email" | "Missing Company" | "Duplicate" | "Do Not Contact" | "Needs Review";

interface CustomerRecord {
  id: number;
  name: string;
  company: string;
  email: string;
  product: string;
  renewal: string;
  industry: string;
  owner: string;
  status: RecordStatus;
  confidence: number;
  upsell: string;
}

const DEMO_RECORDS: CustomerRecord[] = [
  { id: 1, name: "Sarah Johnson", company: "Apex Logistics", email: "sarah@apexlogistics.com", product: "Pro Plan", renewal: "2025-07-15", industry: "Logistics", owner: "James R.", status: "Ready", confidence: 91, upsell: "Enterprise Suite" },
  { id: 2, name: "Marcus Webb", company: "Greenfield Capital", email: "m.webb@greenfield.com", product: "Starter", renewal: "2025-06-01", industry: "Finance", owner: "Dana K.", status: "Ready", confidence: 87, upsell: "Pro Plan + Analytics" },
  { id: 3, name: "Rina Patel", company: "BluePath Health", email: "", product: "Growth Plan", renewal: "2025-08-20", industry: "Healthcare", owner: "James R.", status: "Missing Email", confidence: 0, upsell: "Enterprise Suite" },
  { id: 4, name: "Tom Hargrove", company: "", email: "tom.h@hargrove.io", product: "Pro Plan", renewal: "2025-09-10", industry: "Tech", owner: "Dana K.", status: "Missing Company", confidence: 0, upsell: "Enterprise Suite" },
  { id: 5, name: "Olivia Stern", company: "Stern & Associates", email: "olivia@sternassoc.com", product: "Enterprise", renewal: "2025-05-30", industry: "Legal", owner: "James R.", status: "Needs Review", confidence: 63, upsell: "Premium Support Add-on" },
  { id: 6, name: "Carlos Mena", company: "Mena Retail Group", email: "carlos@menaretail.com", product: "Starter", renewal: "2025-07-01", industry: "Retail", owner: "Dana K.", status: "Ready", confidence: 82, upsell: "Pro Plan" },
  { id: 7, name: "Janet Liu", company: "Skyline Dev Co.", email: "janet@skylinedev.com", product: "Pro Plan", renewal: "2025-10-15", industry: "Real Estate", owner: "James R.", status: "Duplicate", confidence: 0, upsell: "Enterprise Suite" },
  { id: 8, name: "Howard Grant", company: "Grant Manufacturing", email: "howard@grantmfg.com", product: "Enterprise", renewal: "2025-12-01", industry: "Manufacturing", owner: "Dana K.", status: "Do Not Contact", confidence: 0, upsell: "N/A" },
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
  const [selected, setSelected] = useState<number[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<number | null>(DEMO_RECORDS[0]?.id || null);
  const [accountContexts, setAccountContexts] = useState<Record<string, ManualAccountContext>>({});

  useEffect(() => {
    try {
      setAccountContexts(JSON.parse(localStorage.getItem(ACCOUNT_CONTEXT_KEY) || "{}"));
    } catch {
      setAccountContexts({});
    }
  }, []);

  const filtered = DEMO_RECORDS.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || r.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const selectAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((r) => r.id));

  const summary = ALL_STATUSES.map((s) => ({
    status: s,
    count: DEMO_RECORDS.filter((r) => r.status === s).length,
  }));
  const activeRecord = DEMO_RECORDS.find((record) => record.id === activeRecordId) || filtered[0] || DEMO_RECORDS[0];
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
    notice.success("Account Context saved to this contact/account.", "Account Context saved");
  }

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
      </div>

      {/* Status Summary Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("All")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors
            ${activeFilter === "All" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
        >
          All <span className="font-bold">{DEMO_RECORDS.length}</span>
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
            placeholder="Search by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
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
              <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Product</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Renewal</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Upsell Target</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Owner</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((record) => {
              const cfg = STATUS_CONFIG[record.status];
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
                        <p className="font-medium text-slate-900">{record.name}</p>
                        <p className="text-xs text-slate-400">{record.email || <span className="text-red-400">No email</span>}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{record.product}</td>
                  <td className="px-4 py-3 text-slate-600">{record.renewal}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-indigo-700">{record.upsell}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{record.owner}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {record.confidence > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${record.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{record.confidence}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
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
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
  );
}
