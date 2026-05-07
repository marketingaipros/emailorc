"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, Mail, Users, XCircle, MessageSquare, CheckCircle } from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";

const DRAFT_STORAGE_KEY = "emailorcGeneratedDrafts";

const EXPORT_OPTIONS = [
  { id: "approved-csv",   label: "Approved Drafts",      description: "All approved email drafts ready for sending",       format: "CSV",              count: 2, color: "bg-emerald-100", icon: <CheckCircle className="h-5 w-5 text-emerald-600" /> },
  { id: "approved-excel", label: "Approved Drafts",      description: "Formatted spreadsheet with subject + body columns", format: "Excel",            count: 2, color: "bg-emerald-100", icon: <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> },
  { id: "crm-import",     label: "CRM-Ready Import",     description: "Salesforce / CRM compatible flat-file format",      format: "CRM CSV",          count: 2, color: "bg-blue-100",    icon: <FileText className="h-5 w-5 text-blue-600" /> },
  { id: "mail-merge",     label: "Outlook Mail Merge",   description: "Mail merge format for Microsoft 365 / Outlook",     format: "Outlook CSV",      count: 2, color: "bg-blue-100",    icon: <Mail className="h-5 w-5 text-blue-600" /> },
  { id: "needs-review",   label: "Needs Review List",    description: "Records flagged for human review before outreach",  format: "CSV",              count: 1, color: "bg-amber-100",   icon: <Users className="h-5 w-5 text-amber-600" /> },
  { id: "dnc-list",       label: "Do Not Contact List",  description: "DNC list for compliance and suppression upload",    format: "CSV",              count: 1, color: "bg-red-100",     icon: <XCircle className="h-5 w-5 text-red-600" /> },
  { id: "reply-followup", label: "Reply Follow-Up List", description: "Customers who replied and need a follow-up action", format: "CSV",              count: 1, color: "bg-violet-100",  icon: <MessageSquare className="h-5 w-5 text-violet-600" /> },
];

export default function ExportCenterPage() {
  const notice = useNotice();
  const [exported, setExported] = useState<Set<string>>(new Set());

  const exportFile = (id: string, format: string) => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    const rows = saved ? JSON.parse(saved) : [];
    const approvedRows = rows.filter((row: any) => row._status === "Approved");
    const sourceRows = approvedRows.length ? approvedRows : [
      { _name: "Sarah Johnson", _company: "Apex Logistics", _email: "sarah@apexlogistics.com", _subject: "Unlock Enterprise-Level Growth for Apex Logistics", _body: "Approved demo draft", _score: 94, _status: "Approved" },
      { _name: "Marcus Webb", _company: "Greenfield Capital", _email: "m.webb@greenfield.com", _subject: "See what Pro + Analytics unlocks", _body: "Approved demo draft", _score: 92, _status: "Approved" },
    ];
    const headers = ["name", "company", "email", "subject", "body", "qa_score", "status"];
    const csv = [
      headers.join(","),
      ...sourceRows.map((row: any) => [
        row._name || row.Name || "",
        row._company || row.Company || "",
        row._email || row.Email || "",
        row._subject || "",
        row._body || "",
        row._score || "",
        row._status || "",
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${id}.${format === "Excel" ? "csv" : "csv"}`;
    link.click();
    URL.revokeObjectURL(url);
    setExported((p) => new Set([...p, id]));
    notice.success(`${format} export completed.`, "Export completed");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Export Center</h1>
        <p className="text-sm text-slate-500 mt-1">Download approved drafts and lists in the format that fits your current workflow.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <Download className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Integration-free bridge.</span> Until CRM and Outlook integrations are live, exports let your team use AI-generated drafts directly in their existing tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXPORT_OPTIONS.map((opt) => {
          const done = exported.has(opt.id);
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
                  <span className="text-xs text-slate-500">{opt.count} record{opt.count !== 1 ? "s" : ""}</span>
                  {!done ? (
                    <button onClick={() => exportFile(opt.id, opt.format)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
                      <Download className="h-3.5 w-3.5" /> Export
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
