"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  UploadCloud, 
  Database, 
  Mail, 
  KanbanSquare, 
  MessageSquare, 
  Download, 
  Settings,
  Plug,
  BookOpen,
  Brain,
  ShieldCheck,
  LogOut,
  Zap,
  ArrowLeftRight,
  User
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { canUseNavItem } from "@/lib/auth-rules";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type NavItem = {
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
};

const navigation: NavItem[] = [
  { name: "Dashboard",       href: "/mvp",              icon: Home },
  { name: "Upload Data",     href: "/mvp/upload",       icon: UploadCloud },
  { name: "Records",         href: "/mvp/records",      icon: Database },
  { name: "Email Drafts",    href: "/mvp/drafts",       icon: Mail },
  { name: "Campaign Board",  href: "/mvp/campaigns",    icon: KanbanSquare },
  { name: "Reply Assistant", href: "/mvp/reply",        icon: MessageSquare },
  { name: "Export Center",   href: "/mvp/export",       icon: Download },
  { name: "Integrations",    href: "/mvp/integrations", icon: Plug },
  { name: "How-To",          href: "/mvp/howto",        icon: BookOpen },
  { name: "Brain Center",    href: "/mvp/brain-center", icon: Brain },
  { name: "Admin Console",   href: "/mvp/admin",        icon: ShieldCheck, adminOnly: true },
  { name: "Settings",        href: "/mvp/settings",     icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [envMode, setEnvMode] = useState<"DEMO" | "LIVE_TEST" | "TEST_LIVE" | "PRODUCTION">("DEMO");
  const [envLabel, setEnvLabel] = useState("Demo Environment");

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
    setEmail(localStorage.getItem("userEmail"));
    setName(localStorage.getItem("userName"));

    const updateEnvironment = async () => {
      try {
        const orgId = localStorage.getItem("orgId") || "org_demo";
        const response = await fetch(`/api/environment/status?organization_id=${encodeURIComponent(orgId)}`, { cache: "no-store" });
        const data = await response.json();
        setEnvMode(data.mode || "DEMO");
        setEnvLabel(data.badge_label || "Demo Environment");
        localStorage.setItem("envConfig", JSON.stringify({
          ...(JSON.parse(localStorage.getItem("envConfig") || "{}")),
          mode: data.mode || "DEMO",
        }));
      } catch {
        const saved = localStorage.getItem("envConfig");
        if (saved) {
          const parsed = JSON.parse(saved);
          setEnvMode(parsed.mode || "DEMO");
          setEnvLabel(parsed.mode === "LIVE_TEST" ? "Live Test Environment" : parsed.mode === "TEST_LIVE" ? "Test Live Environment" : parsed.mode === "PRODUCTION" ? "Production Environment" : "Demo Environment");
        }
      }
    };

    updateEnvironment();
    const interval = setInterval(updateEnvironment, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleSwitchMode = () => {
    if (pathname.includes('/admin')) {
      router.push('/mvp');
    } else {
      router.push('/mvp/admin');
    }
  };

  const filteredNav = navigation.filter(item => {
    return canUseNavItem(role, item.href, item.adminOnly);
  });

  return (
    <div className="flex h-full w-64 flex-col bg-slate-950 border-r border-white/5">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/5 blur-3xl -z-10" />
        <Link href="/mvp" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Growth Center
          </span>
        </Link>
      </div>
      
      {/* Mode Switcher Banner */}
      {(role === "SUPER_ADMIN") && (
        <button 
          onClick={handleSwitchMode}
          className="mx-3 mt-4 mb-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
             <div className={`p-1.5 rounded-lg ${pathname.includes('/admin') ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                {pathname.includes('/admin') ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Current Mode</p>
                <p className="text-[11px] font-bold text-slate-400 mt-1">{pathname.includes('/admin') ? 'Enterprise Admin' : 'Campaign User'}</p>
             </div>
          </div>
          <ArrowLeftRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
        </button>
      )}

      {!pathname.includes('/admin') && (
        <div className="px-4 py-3 mx-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center gap-2 mt-4">
          <Zap className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            {envLabel || (envMode === "LIVE_TEST" ? "Live Test Environment" : envMode === "TEST_LIVE" ? "Test Live Environment" : envMode === "PRODUCTION" ? "Production Environment" : "Demo Environment")}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1.5 px-3">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/mvp" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-white/10 text-white shadow-xl border border-white/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border-transparent",
                  "group flex items-center rounded-2xl px-3 py-3 text-sm font-bold transition-all border"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400",
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col shrink-0 border-t border-white/5 p-4 bg-slate-900/40">
        <Link href="/mvp/profile" className="flex items-center w-full mb-4 p-2 rounded-2xl hover:bg-white/5 transition-colors group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
            {name?.substring(0, 2).toUpperCase() || "JS"}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-black text-white truncate leading-none group-hover:text-indigo-400 transition-colors">{name || "Jane Smith"}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{role?.replace('_', ' ') || "Client Admin"}</p>
          </div>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
