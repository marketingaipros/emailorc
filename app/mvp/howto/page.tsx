"use client";

import React from "react";
import { BookOpen, FileText, AlertCircle, ChevronRight } from "lucide-react";

type DocStatus = "User Guide" | "Admin Guide" | "Training Doc" | "Available Soon" | "Draft Needed";

interface DocCard {
  title: string;
  description: string;
  status: DocStatus;
  available: boolean;
}

const STATUS_COLOR: Record<DocStatus, string> = {
  "User Guide":     "bg-blue-50 text-blue-700 border-blue-200",
  "Admin Guide":    "bg-violet-50 text-violet-700 border-violet-200",
  "Training Doc":   "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Available Soon": "bg-amber-50 text-amber-700 border-amber-200",
  "Draft Needed":   "bg-slate-50 text-slate-500 border-slate-200",
};

const DOCS: DocCard[] = [
  { title: "Getting Started",                  description: "Overview of the Account Growth Command Center, how it works, and what to expect in the MVP.",                   status: "Available Soon", available: false },
  { title: "Uploading Customer Data",          description: "How to export data from Salesforce, HubSpot, or any CRM and upload it as a CSV or XLSX file.",                 status: "User Guide",     available: false },
  { title: "Mapping Spreadsheet Fields",       description: "Step-by-step guide to mapping your spreadsheet columns to the required system fields for AI processing.",      status: "User Guide",     available: false },
  { title: "Reviewing Record Validation",      description: "Understanding validation statuses: Ready, Missing Email, Missing Company, Duplicate, and Do Not Contact.",      status: "Training Doc",   available: false },
  { title: "Generating Email Drafts",          description: "How the AI generates personalized upsell and renewal emails from your customer data and offer library.",        status: "Training Doc",   available: false },
  { title: "Approving Drafts",                 description: "The human approval workflow: reviewing QA scores, spam risk, subject lines, and email body before exporting.",  status: "User Guide",     available: false },
  { title: "Using the Reply Assistant",        description: "How to paste a customer reply, classify intent, assess risk, and generate an AI draft response.",              status: "Training Doc",   available: false },
  { title: "Exporting Approved Emails",        description: "Download approved drafts in CSV, Excel, or Outlook mail merge format for use in your current email workflow.",  status: "User Guide",     available: false },
  { title: "Understanding QA Scores",          description: "How QA scores are calculated, what the threshold means, and how to adjust minimum score requirements.",        status: "Training Doc",   available: false },
  { title: "Managing Do-Not-Contact Records",  description: "How DNC records are flagged, excluded from outreach, and exported for suppression upload to your CRM.",        status: "Admin Guide",    available: false },
  { title: "Future Integrations",             description: "Roadmap overview: when and how Salesforce, Outlook, Gmail, and other live integrations will be enabled.",       status: "Available Soon", available: false },
  { title: "Frequently Asked Questions",       description: "Common questions about data privacy, AI accuracy, approval flows, and how to handle exceptions.",              status: "Draft Needed",   available: false },
];

export default function HowToPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">How-To & Documentation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Training guides, user documentation, and admin references for the Account Growth Command Center.
        </p>
      </div>

      {/* Top Alert */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-5 py-4">
        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Documentation is being added.</p>
          <p className="text-sm text-blue-600 mt-0.5">
            For now, follow the workflow:{" "}
            <span className="font-medium">Upload Data → Validate Records → Generate Emails → Review & Approve → Export → Reply Assist</span>
          </p>
        </div>
      </div>

      {/* Quick Workflow Reference */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Quick Workflow Reference</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Upload Data", "Validate Records", "Identify Opportunities", "Generate Drafts", "Review & Approve", "Export", "Reply Assist"].map((step, idx, arr) => (
            <React.Fragment key={step}>
              <span className="rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5">
                {idx + 1}. {step}
              </span>
              {idx < arr.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 self-center" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Doc Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DOCS.map((doc) => (
          <div key={doc.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5 shrink-0">
                <FileText className="h-4 w-4 text-slate-500" />
              </div>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[doc.status]}`}>
                {doc.status}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">{doc.title}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{doc.description}</p>
            </div>
            <button disabled={!doc.available} className={`rounded-lg py-2 text-xs font-semibold transition-colors
              ${doc.available
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
              {doc.available ? "View Guide" : "Coming Soon"}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
