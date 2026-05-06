"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Briefcase, 
  Shield, 
  Building2, 
  Clock, 
  Lock, 
  Bell, 
  Save, 
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Globe
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "Jane Smith",
    email: "jane.smith@acme.com",
    jobTitle: "RevOps Director",
    role: "CLIENT_ADMIN",
    organization: "Acme Revenue Operations",
    status: "ACTIVE",
    lastLogin: "2026-05-06 09:45 AM"
  });

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedEmail = localStorage.getItem("userEmail");
    const savedRole = localStorage.getItem("userRole");
    const savedOrg = localStorage.getItem("userOrg");

    if (savedName || savedEmail) {
      setUser(prev => ({
        ...prev,
        name: savedName || prev.name,
        email: savedEmail || prev.email,
        role: savedRole || prev.role,
        organization: savedOrg || prev.organization
      }));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <div className="bg-slate-950 rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-indigo-500/20">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
            <p className="text-indigo-400 font-semibold uppercase tracking-widest text-xs mt-1">
              {user.role.replace('_', ' ')} • {user.organization}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="h-4 w-4" /> {user.email}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="h-4 w-4" /> Last Login: {user.lastLogin}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Personal Details</h2>
              <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors flex items-center gap-1">
                Edit Information <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <User className="h-3 w-3" /> Full Name
                   </label>
                   <p className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">{user.name}</p>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Briefcase className="h-3 w-3" /> Job Title
                   </label>
                   <p className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">{user.jobTitle}</p>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Shield className="h-3 w-3" /> Account Role
                   </label>
                   <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                     <p className="text-sm font-semibold text-slate-900">{user.role}</p>
                     <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase tracking-wider">Verified</span>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Building2 className="h-3 w-3" /> Organization
                   </label>
                   <p className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">{user.organization}</p>
                </div>
              </div>

              <div className="pt-4">
                 <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5 text-white" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Account Active</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Enterprise permissions verified until Dec 2026</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Security & Access</h2>
            </div>
            <div className="p-8 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-slate-600" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-900">Account Password</p>
                        <p className="text-xs text-slate-500">Last changed 42 days ago</p>
                     </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg">
                    Update Password
                  </button>
               </div>

               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-slate-600" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500">Recommended for enterprise accounts</p>
                     </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Disabled</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Notifications</h2>
            </div>
            <div className="p-6 space-y-4">
               {[
                 { label: "Email Notifications", sub: "Monthly usage summaries", icon: Mail },
                 { label: "Push Notifications", sub: "Campaign completion alerts", icon: Bell },
                 { label: "Security Alerts", sub: "Login attempts & key changes", icon: ShieldCheck },
                 { label: "Browser Alerts", sub: "Real-time generation updates", icon: Globe },
               ].map((pref) => (
                 <div key={pref.label} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                       <pref.icon className="h-4 w-4 text-slate-400" />
                       <div>
                          <p className="text-[11px] font-bold text-slate-900">{pref.label}</p>
                          <p className="text-[10px] text-slate-400">{pref.sub}</p>
                       </div>
                    </div>
                    <div className="h-4 w-8 bg-indigo-600 rounded-full flex items-center justify-end px-0.5 cursor-pointer">
                       <div className="h-3 w-3 bg-white rounded-full shadow-sm" />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <button className="w-full py-4 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-slate-900 rounded-3xl text-sm font-bold transition-all flex items-center justify-center gap-2 group">
            <Save className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            Save Profile Changes
          </button>
        </div>
      </div>
    </div>
  );
}
