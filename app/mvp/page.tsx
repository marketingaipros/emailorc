"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, TrendingUp, Mail, CheckCircle, XCircle,
  AlertTriangle, BarChart2, MessageSquare, Download, ShieldAlert, CreditCard
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
  const [credits, setCredits] = useState(1832);
  const [role, setRole] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [storedPlan, setStoredPlan] = useState("Trial");

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
    setStoredPlan(localStorage.getItem("userPlan") || "Trial");
    fetch(`/api/billing/current-plan?organization_id=${encodeURIComponent(localStorage.getItem("orgId") || "org_demo")}`)
      .then((response) => response.json())
      .then((data) => {
        setPlan(data);
        setCredits(Number(data.credits_remaining ?? 0));
        localStorage.setItem("userPlan", data.plan || "Trial");
        localStorage.setItem("subscriptionStatus", data.subscription_status || "Trial Active");
        localStorage.setItem("aiCredits", String(data.credits_remaining ?? 0));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Growth Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Turn customer records into approved upsell outreach — without touching a live CRM or inbox yet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end px-4 py-2 bg-slate-950 rounded-xl border border-white/5 shadow-lg">
             <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Credits Remaining</span>
             <span className="text-lg font-black text-white">{credits.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Plan</span>
             <span className="text-sm font-black text-slate-900">{plan?.plan || storedPlan}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
            <ShieldAlert className="h-3.5 w-3.5" />
            Auto-send OFF
          </div>
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

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-black text-indigo-950">Plan: {plan?.plan || "Trial"} · {plan?.subscription_status || "Trial Active"}</p>
              <p className="mt-1 text-xs font-semibold text-indigo-700">
                Credits: {plan?.credits_remaining ?? credits} / {plan?.credits_included ?? 100} remaining · Estimated emails remaining: {plan?.estimated_emails_remaining ?? Math.floor(credits / 10)}
                {plan?.trial_ends_at ? ` · Trial ends: ${new Date(plan.trial_ends_at).toLocaleDateString()}` : ""}
              </p>
            </div>
          </div>
          <button onClick={() => alert("Billing is not connected yet. Contact admin to upgrade.")} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
            Upgrade Plan
          </button>
        </div>
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
