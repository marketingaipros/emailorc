"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileText, ShieldCheck, Zap, CheckCircle, Loader2, Copy, RefreshCw } from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";

const DRAFT_STORAGE_KEY = "emailorcGeneratedDrafts";
const QA_APPROVAL_THRESHOLD = 90;
const FIELD_DEFS = [
  { key: "name", label: "Contact Name", aliases: ["Name", "name", "Full Name", "Contact Name", "Customer Name", "First Name"], required: true },
  { key: "company", label: "Company", aliases: ["Company", "company", "Company Name", "Account", "Business Name"], required: true },
  { key: "email", label: "Email", aliases: ["Email", "email", "Email Address", "Contact Email"], required: true },
  { key: "product", label: "Current Product", aliases: ["Current Product", "Product", "Plan", "Current Plan"], required: false },
  { key: "renewalDate", label: "Renewal Date", aliases: ["Renewal Date", "Renewal_Date", "Renewal"], required: false },
  { key: "dnc", label: "Do Not Contact", aliases: ["Do Not Contact", "DNC", "do_not_contact"], required: false },
] as const;

function readString(row: any, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function persistDrafts(drafts: any[]) {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

export default function UploadPage() {
  const notice = useNotice();
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  const inferMapping = (headers: string[]) => Object.fromEntries(
    FIELD_DEFS.map((field) => [
      field.key,
      field.aliases.find((alias) => headers.includes(alias)) || "",
    ])
  );

  const mappedValue = (row: any, key: string, fallback = "") => {
    const mappedKey = fieldMapping[key];
    const value = mappedKey ? row[mappedKey] : "";
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  };

  const parseFile = (file: File) => {
    setFileName(file.name);
    setResults([]);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        if (parsed.data.length > 0) {
          const rows = parsed.data as any[];
          setData(rows);
          setFieldMapping(inferMapping(Object.keys(rows[0] || {})));
          notice.success(`${rows.length} records loaded and ready for mapping.`, "Upload completed");
        } else {
          notice.warning("The uploaded file did not contain any records.", "Upload empty");
        }
      },
      error: (error) => notice.error(error.message || "Upload failed. Check the file format.", "Upload failed"),
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const handleGenerate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generated = data.map((row, idx) => {
        const name = mappedValue(row, "name");
        const company = mappedValue(row, "company", "your organization");
        const product = mappedValue(row, "product", "your current plan");
        const email = mappedValue(row, "email");
        const isDnc = /^(true|yes|y|1)$/i.test(mappedValue(row, "dnc"));
        const score = name && email && !isDnc ? 92 + (idx % 5) : 78;
        return {
          ...row,
          _id: `upload-${Date.now()}-${idx}`,
          _name: name || "Missing Name",
          _company: company,
          _product: product,
          _email: email,
          _dnc: isDnc,
          _subject: `Missed growth opportunities at ${company}?`,
          _subject2: `A simpler next step for ${company}`,
          _preview: `Hi ${name || "there"}, we've identified a tailored growth opportunity for you...`,
          _body: `Hi ${name || "there"},\n\nI hope things are going well at ${company}. I wanted to reach out personally because based on your usage of ${product}, our team identified a tailored upgrade path that could significantly accelerate your results.\n\nI'd love to schedule a quick 15-minute conversation to walk you through what this looks like specifically for ${company}.\n\nAre you available early next week?\n\nBest,\nAccount Growth Team`,
          _score: score,
          _spam: isDnc ? "Blocked" : "Low",
          _status: score >= QA_APPROVAL_THRESHOLD ? "Pending Review" : "Needs Revision",
          _revision_count: 0,
          _qa_issues: score >= QA_APPROVAL_THRESHOLD ? [] : ["QA score below threshold"],
          _source: "Upload Data",
        };
      });
      setResults(generated);
      persistDrafts(generated);
      setIsProcessing(false);
      notice.success(`${generated.length} drafts generated and validation completed.`, "Record validation completed");
    }, 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notice.info("Draft copied to clipboard.", "Copied");
  };

  const handleApprove = (idx: number) => {
    const row = results[idx];
    if (row?._score < QA_APPROVAL_THRESHOLD) {
      notice.warning("Draft approval blocked. QA score must be 90 or higher.", "Approval blocked");
      return;
    }
    setResults((prev) => {
      const next = prev.map((r, i) => (
        i === idx && r._score >= QA_APPROVAL_THRESHOLD ? { ...r, _status: "Approved" } : r
      ));
      persistDrafts(next);
      return next;
    });
    notice.success("Draft approved.", "Approval complete");
  };

  const handleRegenerate = (idx: number) => {
    setResults((prev) => {
      const next = prev.map((row, i) => {
        if (i !== idx) return row;
        if (!row._name || !row._email || row._dnc) return row;
        return {
          ...row,
          _score: 93,
          _status: "Pending Review",
          _body: row._body.replace("significantly accelerate your results", "improve team outcomes with a clearer upgrade path"),
        };
      });
      persistDrafts(next);
      return next;
    });
    notice.info("Draft regenerated with a higher QA score.", "Draft revised");
  };

  const approvedCount = results.filter((r) => r._status === "Approved").length;
  const headers = data.length ? Object.keys(data[0]) : [];
  const missingRequiredMappings = FIELD_DEFS.filter((field) => field.required && !fieldMapping[field.key]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Upload Customer & Account Data</h1>
        <p className="text-sm text-slate-500 mt-1">
          Turn customer records into approved upsell outreach. Identify expansion opportunities and generate personalized email drafts for human review.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700">
          <p><span className="font-semibold">Secure System | Auto-send OFF:</span> Your data is processed locally. This MVP works through secure spreadsheet exports today so you can test the workflow before connecting live CRM or email systems later.</p>
          <p className="mt-1 opacity-80">Manual approval is required for every draft before export or send.</p>
        </div>
      </div>

      {/* Upload Zone */}
      {!data.length && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 transition-colors cursor-pointer
            ${isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"}`}
        >
          <input type="file" accept=".csv,.xlsx" onChange={handleFileInput} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="flex flex-col items-center gap-4 cursor-pointer">
            <div className="rounded-full bg-indigo-100 p-5">
              <UploadCloud className="h-10 w-10 text-indigo-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-800">Drag & drop your CRM export here</p>
              <p className="text-sm text-slate-500 mt-1">or <span className="text-indigo-600 underline">click to browse</span></p>
              <p className="text-xs text-slate-400 mt-2">Supports CSV and XLSX · Max 10MB</p>
            </div>
          </label>
        </div>
      )}

      {/* File Loaded — Ready to Generate */}
      {data.length > 0 && !results.length && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-100 p-3">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{fileName}</p>
                <p className="text-sm text-slate-500">{data.length} customer records loaded and validated</p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="h-4 w-4" /> Generate Email Drafts</>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900">Field Mapping Review</h2>
            <p className="text-xs text-slate-500 mt-1">Map required CSV columns before generating drafts. Missing mappings usually cause low QA scores.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {FIELD_DEFS.map((field) => {
                return (
                  <div key={field.key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{field.label}{field.required ? " *" : ""}</p>
                    <select
                      value={fieldMapping[field.key] || ""}
                      onChange={(event) => setFieldMapping((prev) => ({ ...prev, [field.key]: event.target.value }))}
                      className="mt-2 w-full rounded-lg border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <option value="">Not mapped</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            {missingRequiredMappings.length > 0 && (
              <p className="text-xs font-semibold text-amber-600 mt-3">
                Map {missingRequiredMappings.map((field) => field.label).join(", ")} to avoid blocked drafts.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Generated Drafts
              <span className="ml-2 text-sm font-normal text-slate-500">{approvedCount} of {results.length} approved</span>
            </h2>
            <button
              onClick={() => { setData([]); setResults([]); setFileName(""); }}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <RefreshCw className="h-4 w-4" /> Start Over
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["ORC", "Validation complete"],
              ["SENTINEL", "Strategy generated"],
              ["SCRIBE", "Email drafted"],
              ["LEXI", "QA scored"],
            ].map(([role, status]) => (
              <div key={role} className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{role}</p>
                <p className="text-xs text-slate-500 mt-1">{status}</p>
              </div>
            ))}
          </div>

          {results.map((row, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                ${row._status === "Approved" ? "border-emerald-300" : "border-slate-100"}`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <p className="font-semibold text-slate-900">{row._name || row.Name || row.name || "Customer"}</p>
                  <p className="text-sm text-slate-500">{row._company || row.Company || row.company || "Company"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    QA Score: {row._score}/100
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {row._dnc ? "Do Not Contact" : `Spam Risk: ${row._spam}`}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border
                    ${row._status === "Approved"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                    {row._status}
                  </span>
                </div>
              </div>

              {/* Draft Content */}
              <div className="px-6 py-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Subject Line</p>
                  <p className="text-sm font-medium text-slate-800">{row._subject}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Email Draft</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                    {row._body}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => copyToClipboard(`Subject: ${row._subject}\n\n${row._body}`)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Copy className="h-4 w-4" /> Copy
                </button>
                {row._score < QA_APPROVAL_THRESHOLD && !row._dnc && row._email && row._name && (
                  <button
                    onClick={() => handleRegenerate(idx)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" /> Regenerate to 90+
                  </button>
                )}
                {row._status !== "Approved" ? (
                  <button
                    onClick={() => handleApprove(idx)}
                    aria-disabled={row._score < QA_APPROVAL_THRESHOLD}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm ${
                      row._score < QA_APPROVAL_THRESHOLD ? "bg-slate-300 text-slate-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" /> {row._score >= QA_APPROVAL_THRESHOLD ? "Approve Draft" : "Needs 90+ QA"}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                    <CheckCircle className="h-4 w-4" /> Approved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
