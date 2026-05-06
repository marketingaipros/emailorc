"use client";

import React from "react";
import Link from "next/link";
import {
  Users, TrendingUp, Mail, CheckCircle, XCircle,
  AlertTriangle, BarChart2, MessageSquare, Download, ShieldAlert
} from "lucide-react";

const stats = [
  { name: "Records Uploaded",       value: "2,451", icon: Users,          bg: "bg-blue-100",    color: "text-blue-600" },
  { name: "Upsell Opportunities",   value: "843",   icon: TrendingUp,     bg: "bg-emerald-100", color: "text-emerald-600" },
  { name: "Ready for Outreach",     value: "612",   icon: Mail,           bg: "bg-indigo-100",  color: "text-indigo-600" },
  { name: "Needs Review",           value: "145",   icon: AlertTriangle,  bg: "bg-amber-100",   color: "text-amber-600" },
  { name: "Approved Drafts",        value: "467",   icon: CheckCircle,    bg: "bg-emerald-100", color: "text-emerald-600" },
  { name: "Below QA Threshold",     value: "38",    icon: BarChart2,      bg: "bg-orange-100",  color: "text-orange-600" },
  { name: "Replies Reviewed",       value: "91",    icon: MessageSquare,  bg: "bg-violet-100",  color: "text-violet-600" },
  { name: "Do Not Contact",         value: "32",    icon: XCircle,        bg: "bg-red-100",     color: "text-red-600" },
  { name: "Exports Completed",      value: "204",   icon: Download,       bg: "bg-teal-100",    color: "text-teal-600" },
];

const workflowSteps = [
  { label: "Upload Data",           href: "/mvp/upload",    done: true },
  { label: "Validate Records",      href: "/mvp/records",   done: true },
  { label: "Identify Opportunities",href: "/mvp/records",   done: true },
  { label: "Generate Drafts",       href: "/mvp/drafts",    done: true },
  { label: "Review & Approve",      href: "/mvp/drafts",    done: false },
  { label: "Export",                href: "/mvp/export",    done: false },
  { label: "Reply Assist",          href: "/mvp/reply",     done: false },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Account Growth Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Turn customer records into approved upsell outreach — without touching a live CRM or inbox yet.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-semibold text-emerald-700">
          <ShieldAlert className="h-3.5 w-3.5" />
          Auto-send OFF · Human Approval Required
        </div>
      </div>

      {/* Trust Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "No live CRM connection",     sub: "Manual export available now" },
          { label: "Auto-send is OFF",            sub: "Every draft requires approval" },
          { label: "DNC records protected",       sub: "Flagged and excluded automatically" },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800">{t.label}</p>
              <p className="text-xs text-slate-400">{t.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.name} className="relative flex items-center gap-4 rounded-2xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className={`rounded-xl p-3 shrink-0 ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight">{s.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">Campaign Workflow</h2>
          <span className="text-xs text-slate-400">4 of 7 stages complete</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <Link href={step.href} className={`flex flex-col items-center gap-1.5 group`}>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all
                  ${step.done
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300 bg-white group-hover:border-indigo-400"}`}>
                  {step.done
                    ? <CheckCircle className="h-5 w-5 text-white" />
                    : <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500">{idx + 1}</span>}
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${step.done ? "text-indigo-600" : "text-slate-400"}`}>
                  {step.label}
                </span>
              </Link>
              {idx < workflowSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 min-w-4 ${step.done ? "bg-indigo-300" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Quick Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/mvp/upload" className="group rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-5 hover:bg-indigo-100 transition-colors">
          <p className="font-semibold text-indigo-800 text-sm">Upload Customer Data</p>
          <p className="text-xs text-indigo-500 mt-1">Import a CRM export to begin the workflow</p>
        </Link>
        <Link href="/mvp/drafts" className="group rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5 hover:bg-amber-100 transition-colors">
          <p className="font-semibold text-amber-800 text-sm">Review Pending Drafts</p>
          <p className="text-xs text-amber-500 mt-1">145 records need human approval before export</p>
        </Link>
        <Link href="/mvp/export" className="group rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-5 hover:bg-emerald-100 transition-colors">
          <p className="font-semibold text-emerald-800 text-sm">Export Approved Emails</p>
          <p className="text-xs text-emerald-500 mt-1">467 approved drafts ready for download</p>
        </Link>
      </div>

    </div>
  );
}
