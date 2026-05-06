"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  CreditCard, 
  BarChart3, 
  Settings2, 
  Plus, 
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Database,
  Lock,
  Zap,
  ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";

type AdminTab = "Organizations" | "User Accounts" | "Subscription Plans" | "Global Settings" | "API Health";

export default function AdminConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("Organizations");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "SUPER_ADMIN") {
      router.push("/mvp/dashboard");
    }
  }, [router]);

  const orgs = [
    { id: "org_acme", name: "Acme Revenue Ops", plan: "Growth", status: "Active", users: 12, credits: 1832, used: 668 },
    { id: "org_globex", name: "Globex Corp", plan: "Pro", status: "Active", users: 45, credits: 8240, used: 1760 },
    { id: "org_stark", name: "Stark Industries", plan: "Enterprise", status: "Active", users: 8, credits: 45000, used: 5000 },
    { id: "org_demo", name: "Demo User", plan: "Trial", status: "Expired", users: 1, credits: 0, used: 100 },
  ];

  const plans = [
    { name: "Trial", credits: 100, price: "$0", color: "bg-slate-500" },
    { name: "Starter", credits: 500, price: "$99/mo", color: "bg-blue-500" },
    { name: "Growth", credits: 2500, price: "$299/mo", color: "bg-indigo-600" },
    { name: "Pro", credits: 10000, price: "$799/mo", color: "bg-purple-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Super Admin Console
            </h1>
            <p className="text-sm text-slate-400">Global governance, monetization, and infrastructure management.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">System Live</span>
          </div>
          <button className="flex items-center gap-2 bg-white text-slate-950 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all shadow-lg">
            <Plus className="h-4 w-4" />
            New Client
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {[
            { name: "Organizations", icon: Building2 },
            { name: "User Accounts", icon: Users },
            { name: "Subscription Plans", icon: CreditCard },
            { name: "Global Settings", icon: Settings2 },
            { name: "API Health", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === tab.name 
                  ? "bg-white/10 text-white shadow-sm border border-white/10" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.name ? "text-indigo-400" : "text-slate-500"}`} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">{activeTab}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1.5 text-sm rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 w-64 bg-white"
              />
            </div>
          </div>

          <div className="p-6">
            {activeTab === "Organizations" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Orgs", value: "142", trend: "+4 this week", icon: Building2 },
                    { label: "Active Subs", value: "128", trend: "90%", icon: CheckCircle2 },
                    { label: "Monthly MRR", value: "$34.2k", trend: "+12.4%", icon: BarChart3 },
                    { label: "Total Credits", value: "2.4M", trend: "1.2M used", icon: CreditCard },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="h-4 w-4 text-slate-400" />
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{stat.trend}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-4">Organization</th>
                        <th className="px-6 py-4">Plan</th>
                        <th className="px-6 py-4">Users</th>
                        <th className="px-6 py-4">AI Credits</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orgs.map((org) => (
                        <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{org.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{org.id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-100">
                              {org.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">{org.users}</td>
                          <td className="px-6 py-4">
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full mb-1">
                              <div 
                                className="bg-indigo-500 h-1.5 rounded-full" 
                                style={{ width: `${(org.used / (org.used + org.credits)) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
                              {org.credits.toLocaleString()} / {(org.credits + org.used).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {org.status === "Active" ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                <Clock className="h-3.5 w-3.5" /> Expired
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Subscription Plans" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-bold text-slate-900">Subscription Tier Manager</h3>
                    <p className="text-sm text-slate-500">Configure feature access and credit limits per plan.</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                    Create Plan
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.name} className="border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-all">
                      <div className={`h-2 w-12 rounded-full ${plan.color} mb-4`} />
                      <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                      <p className="text-2xl font-black text-slate-900 mt-1">{plan.price}</p>
                      <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Monthly Credits</span>
                            <span className="text-xs font-bold text-slate-900">{plan.credits.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Core Engine</span>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Reply Assistant</span>
                            {plan.credits > 500 ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                         </div>
                      </div>
                      <button className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all border border-slate-200">
                        Edit Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Global Settings" && (
              <div className="max-w-2xl space-y-8">
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                    <Database className="h-4 w-4 text-indigo-500" />
                    Database & Infrastructure
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                     <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Environment</p>
                          <p className="text-[10px] text-slate-500">Currently running in SQLite Demo Mode</p>
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-widest border border-indigo-200">Local SQLite</span>
                     </div>
                     <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2">
                        <ArrowUpRight className="h-3.5 w-3.5" /> Migrate to Postgres (Supabase)
                     </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-500" />
                    Master API Gateway
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">OpenRouter Global Master Key</label>
                        <div className="flex gap-2">
                          <input 
                            type="password" 
                            defaultValue="sk_master_••••••••••••••••"
                            className="flex-1 bg-white border-slate-200 text-sm rounded-lg py-2 focus:ring-indigo-500"
                          />
                          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all">Update</button>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        <p className="text-[10px] text-amber-700 leading-tight">This key is used for all "Demo" organizations. Client organizations with "Connected" status use their own secure proxy keys.</p>
                     </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "API Health" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-indigo-500" />
                        OpenRouter Latency
                      </h3>
                      <div className="h-48 flex items-end gap-1 px-2">
                         {[45, 62, 38, 81, 120, 55, 42, 33, 90, 72, 44, 38, 51, 60].map((h, i) => (
                           <div key={i} className="flex-1 bg-indigo-100 rounded-t-sm hover:bg-indigo-400 transition-colors" style={{ height: `${h}%` }} />
                         ))}
                      </div>
                      <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span>1 hour ago</span>
                         <span>Now (Avg 58ms)</span>
                      </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Model Availability
                      </h3>
                      <div className="space-y-3">
                         {[
                           { name: "GPT-5 Nano", status: "Operational", color: "text-emerald-500" },
                           { name: "GPT-5 Mini", status: "Operational", color: "text-emerald-500" },
                           { name: "GPT-5.1", status: "Slow Response", color: "text-amber-500" },
                           { name: "GPT-5.4 Mini", status: "Operational", color: "text-emerald-500" },
                         ].map((m, i) => (
                           <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                              <span className="text-xs font-medium text-slate-700">{m.name}</span>
                              <span className={`text-[10px] font-bold uppercase ${m.color}`}>{m.status}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
