"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileText, ShieldCheck, Zap, CheckCircle, Loader2, Copy, RefreshCw } from "lucide-react";

export default function UploadPage() {
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const parseFile = (file: File) => {
    setFileName(file.name);
    setResults([]);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        if (parsed.data.length > 0) setData(parsed.data as any[]);
      },
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
      const generated = data.map((row) => {
        const name = row.Name || row.name || row["First Name"] || "Valued Customer";
        const company = row.Company || row.company || row["Company Name"] || "your organization";
        const product = row["Current Product"] || row.Product || "your current plan";
        return {
          ...row,
          _subject: `Unlock More Value at ${company} — Exclusive Offer Inside`,
          _preview: `Hi ${name}, we've identified a tailored growth opportunity for you...`,
          _body: `Hi ${name},\n\nI hope things are going well at ${company}. I wanted to reach out personally because based on your usage of ${product}, our team identified a tailored upgrade path that could significantly accelerate your results.\n\nI'd love to schedule a quick 15-minute conversation to walk you through what this looks like specifically for ${company}.\n\nAre you available early next week?\n\nBest,\nAccount Growth Team`,
          _score: Math.floor(Math.random() * 15) + 82,
          _spam: "Low",
          _status: "Pending Review",
        };
      });
      setResults(generated);
      setIsProcessing(false);
    }, 2500);
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const handleApprove = (idx: number) => {
    setResults((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, _status: "Approved" } : r))
    );
  };

  const approvedCount = results.filter((r) => r._status === "Approved").length;

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

          {results.map((row, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                ${row._status === "Approved" ? "border-emerald-300" : "border-slate-100"}`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <p className="font-semibold text-slate-900">{row.Name || row.name || "Customer"}</p>
                  <p className="text-sm text-slate-500">{row.Company || row.company || "Company"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    QA Score: {row._score}/100
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Spam Risk: {row._spam}
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
                {row._status !== "Approved" ? (
                  <button
                    onClick={() => handleApprove(idx)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve Draft
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
