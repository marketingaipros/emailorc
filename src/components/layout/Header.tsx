"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Bell, 
  Search, 
  ShieldCheck, 
  Zap, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Building2, 
  CreditCard,
  RefreshCw
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useNotice } from "@/components/notice/NoticeProvider";

export function Header() {
  const router = useRouter();
  const notice = useNotice();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [envMode, setEnvMode] = useState<"DEMO" | "TEST_LIVE" | "PRODUCTION">("DEMO");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
    setEmail(localStorage.getItem("userEmail"));
    setName(localStorage.getItem("userName"));

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const resolveEnvMode = () => {
      const saved = localStorage.getItem("envConfig");
      if (saved) return JSON.parse(saved).mode || "DEMO";
      if (window.location.hostname.includes("test-live")) return "TEST_LIVE";
      if (window.location.hostname.includes("production")) return "PRODUCTION";
      return "DEMO";
    };

    const updateEnv = () => setEnvMode(resolveEnvMode());
    updateEnv();
    window.addEventListener("storage", updateEnv);
    const interval = setInterval(updateEnv, 1000);
    return () => {
      window.removeEventListener("storage", updateEnv);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    notice.info("You have been logged out.", "Logout successful");
    router.push("/login");
  };

  const handleSwitchMode = () => {
    if (role === "SUPER_ADMIN") {
      router.push("/mvp"); // Or wherever the client view starts
    } else {
      router.push("/mvp/admin");
    }
    setIsProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-slate-100 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm font-medium"
            placeholder="Search accounts, companies, or campaigns..."
            type="search"
          />
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {(() => {
            const badgeStyles: Record<string, string> = {
              DEMO: "bg-indigo-50 border-indigo-100 text-indigo-700",
              TEST_LIVE: "bg-amber-50 border-amber-100 text-amber-700",
              PRODUCTION: "bg-red-50 border-red-100 text-red-700"
            };

            const labels: Record<string, string> = {
              DEMO: "Demo Environment",
              TEST_LIVE: "Test Live Environment",
              PRODUCTION: "Production Environment"
            };

            return (
              <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${badgeStyles[envMode] || badgeStyles.DEMO}`}>
                <Zap className="h-3 w-3 fill-current" />
                {labels[envMode] || labels.DEMO}
              </div>
            );
          })()}
          
          <div className="h-6 w-px bg-slate-200" />

          <button type="button" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white shadow-sm" />
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all group"
            >
              <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover:scale-105 transition-transform">
                {name?.substring(0, 2).toUpperCase() || "U"}
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-xs font-bold text-slate-900 leading-none">{name || "Signed In User"}</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                  {role?.replace('_', ' ') || "USER"}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{email || "No email"}</p>
                </div>
                
                <div className="p-1.5">
                  <button 
                    onClick={() => { router.push("/mvp/profile"); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <User className="h-4 w-4 text-slate-400" /> My Profile
                  </button>
                  <button 
                    onClick={() => { router.push("/mvp/settings"); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <Building2 className="h-4 w-4 text-slate-400" /> Organization Settings
                  </button>
                  <button 
                    onClick={() => { router.push("/mvp/brain-center"); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <CreditCard className="h-4 w-4 text-slate-400" /> Usage & Billing
                  </button>
                </div>

                <div className="border-t border-slate-50 p-1.5">
                  {role === "SUPER_ADMIN" && (
                    <button 
                      onClick={handleSwitchMode}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <RefreshCw className="h-4 w-4" /> 
                      {pathname?.includes('/admin') ? 'Switch to Client Mode' : 'Switch to Admin Mode'}
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-50 p-1.5">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
