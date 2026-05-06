"use client";

import React, { useEffect, useState } from "react";
import { Bell, Search, ShieldCheck, Zap, User } from "lucide-react";

export function Header() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-slate-100 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
            placeholder="Search accounts, companies, or campaigns..."
            type="search"
          />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Role Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
             <User className="h-3 w-3 text-indigo-400" />
             {role?.replace('_', ' ') || "Guest"}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest">
            <Zap className="h-3 w-3 fill-indigo-500" />
            Demo Environment
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure | Auto-send OFF
          </div>
          
          <div className="h-6 w-px bg-slate-200" />

          <button type="button" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
