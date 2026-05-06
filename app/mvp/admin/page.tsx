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
  ShieldAlert,
  Mail,
  UserPlus,
  ArrowRight,
  UserCheck,
  MoreHorizontal,
  MailPlus,
  Trash2,
  Power,
  RotateCcw
} from "lucide-react";
import { useRouter } from "next/navigation";

type AdminTab = "Users" | "Organizations" | "Roles & Permissions" | "Subscription Plans" | "AI Credits" | "Usage Logs" | "API Settings";

export default function AdminConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("Users");
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "SUPER_ADMIN") {
      router.push("/mvp/dashboard");
    }
  }, [router]);

  const userList = [
    { id: "u1", name: "Jane Smith", email: "jane.smith@acme.com", org: "Acme Revenue", role: "CLIENT_ADMIN", status: "ACTIVE", lastLogin: "2 min ago", created: "2026-04-12" },
    { id: "u2", name: "Bob Johnson", email: "bob@globex.com", org: "Globex Corp", role: "EDITOR", status: "ACTIVE", lastLogin: "1 day ago", created: "2026-04-15" },
    { id: "u3", name: "Alice Stark", email: "alice@stark.com", org: "Stark Industries", role: "REVIEWER", status: "PENDING", lastLogin: "Never", created: "2026-05-01" },
    { id: "u4", name: "Charlie Brown", email: "charlie@acme.com", org: "Acme Revenue", role: "VIEWER", status: "INACTIVE", lastLogin: "12 days ago", created: "2026-03-20" },
  ];

  const orgs = [
    { id: "org_acme", name: "Acme Revenue Ops", plan: "Growth", status: "Active", users: 12, credits: 1832, used: 668, apiKey: "Connected" },
    { id: "org_globex", name: "Globex Corp", plan: "Pro", status: "Active", users: 45, credits: 8240, used: 1760, apiKey: "Connected" },
    { id: "org_stark", name: "Stark Industries", plan: "Enterprise", status: "Active", users: 8, credits: 45000, used: 5000, apiKey: "Connected" },
    { id: "org_demo", name: "Demo User", plan: "Trial", status: "Expired", users: 1, credits: 0, used: 100, apiKey: "Not Connected" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/5 blur-3xl -z-10" />
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Enterprise Governance
            </h1>
            <p className="text-sm text-slate-400 font-medium">Global infrastructure & monetization command</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Live</span>
          </div>
          <button 
            onClick={() => setIsCreateUserModalOpen(true)}
            className="flex items-center gap-2 bg-white text-slate-950 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
          >
            <UserPlus className="h-4 w-4" />
            Provision User
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {[
            { id: "Users", icon: Users },
            { id: "Organizations", icon: Building2 },
            { id: "Roles & Permissions", icon: Lock },
            { id: "Subscription Plans", icon: CreditCard },
            { id: "AI Credits", icon: BarChart3 },
            { id: "Usage Logs", icon: Database },
            { id: "API Settings", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all border ${
                activeTab === tab.id 
                  ? "bg-indigo-600/10 text-white border-indigo-500/20 shadow-lg" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white border-transparent"
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-indigo-400" : "text-slate-500"}`} />
              {tab.id}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
          <div className="border-b border-slate-50 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeTab}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage and audit global system assets</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab.toLowerCase()}...`} 
                className="pl-9 pr-4 py-2 text-sm rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-72 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="p-8 flex-1">
            {activeTab === "Users" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Identity</th>
                        <th className="px-6 py-4">Organization</th>
                        <th className="px-6 py-4">System Role</th>
                        <th className="px-6 py-4">Activity</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {userList.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                               <Building2 className="h-3 w-3 text-slate-400" />
                               {user.org}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase tracking-wider border border-slate-200">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[10px] text-slate-500 font-bold flex flex-col">
                               <span>Last: {user.lastLogin}</span>
                               <span className="text-slate-300 font-medium">Joined: {user.created}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : user.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'ACTIVE' ? 'text-emerald-600' : user.status === 'PENDING' ? 'text-amber-600' : 'text-slate-400'}`}>
                                  {user.status}
                                </span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button title="Edit" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Settings2 className="h-4 w-4" /></button>
                                <button title="Send Invite" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><MailPlus className="h-4 w-4" /></button>
                                <button title="Delete" className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Organizations" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Active Orgs", value: "128", icon: Building2, color: "text-blue-500" },
                    { label: "Pending Subs", value: "14", icon: Clock, color: "text-amber-500" },
                    { label: "Trial Accounts", value: "32", icon: Zap, color: "text-indigo-500" },
                    { label: "System Uptime", value: "99.98%", icon: ShieldCheck, color: "text-emerald-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Organization</th>
                        <th className="px-6 py-4">Subscription</th>
                        <th className="px-6 py-4">Governance</th>
                        <th className="px-6 py-4">API Stack</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {orgs.map((org) => (
                        <tr key={org.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{org.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{org.id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded uppercase tracking-wider border border-indigo-100 w-fit">
                                 {org.plan} Tier
                               </span>
                               <span className="text-[10px] text-slate-400 mt-1">{org.credits.toLocaleString()} Credits Bal.</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1 text-slate-600 text-xs font-bold">
                               <Users className="h-3.5 w-3.5 text-slate-400" /> {org.users} Seats
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className={`flex items-center gap-1.5 text-[10px] font-bold ${org.apiKey === 'Connected' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <Zap className="h-3 w-3" /> {org.apiKey}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                            {org.status === "Active" ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Operational
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <Clock className="h-3.5 w-3.5" /> Deactivated
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg"><MoreHorizontal className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Roles & Permissions" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { role: "Super Admin", count: 2, desc: "Global system control, billing, and infrastructure.", color: "bg-indigo-600" },
                      { role: "Client Admin", count: 142, desc: "Organization management, users, and brain defaults.", color: "bg-emerald-600" },
                      { role: "Editor", count: 850, desc: "Full campaign workflow: upload, generate, and edit.", color: "bg-blue-600" },
                      { role: "Reviewer", count: 320, desc: "Quality assurance: review, approve, or reject drafts.", color: "bg-amber-600" },
                      { role: "Viewer", count: 120, desc: "Read-only access to records and generated content.", color: "bg-slate-400" },
                    ].map((r) => (
                      <div key={r.role} className="border border-slate-100 rounded-3xl p-6 hover:shadow-lg transition-all group">
                         <div className={`h-1.5 w-12 rounded-full ${r.color} mb-4`} />
                         <div className="flex items-center justify-between mb-2">
                           <h3 className="text-lg font-black text-slate-900 tracking-tight">{r.role}</h3>
                           <span className="text-xs font-bold text-slate-400">{r.count} users</span>
                         </div>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">{r.desc}</p>
                         <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200">
                           Manage Permissions
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal (Simple Mock) */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-10 py-8 bg-slate-950 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
                 <div className="relative z-10">
                    <h2 className="text-2xl font-black tracking-tight">Provision New User</h2>
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">Grant platform access & roles</p>
                 </div>
                 <button onClick={() => setIsCreateUserModalOpen(false)} className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all relative z-10">
                    <XCircle className="h-6 w-6" />
                 </button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                       <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="John" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                       <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Doe" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input type="email" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="john.doe@company.com" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</label>
                       <select className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500">
                          <option>Acme Revenue</option>
                          <option>Globex Corp</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</label>
                       <select className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500">
                          <option>Editor</option>
                          <option>Reviewer</option>
                          <option>Client Admin</option>
                          <option>Viewer</option>
                       </select>
                    </div>
                 </div>
                 <div className="pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-5 w-10 bg-indigo-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                          <div className="h-3 w-3 bg-white rounded-full shadow-sm" />
                       </div>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Send email invite immediately</span>
                    </div>
                    <button className="bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2">
                       <UserCheck className="h-4 w-4" /> Provision User Account
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
