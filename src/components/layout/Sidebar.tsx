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
  Zap
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
    setEmail(localStorage.getItem("userEmail"));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const filteredNav = navigation.filter(item => {
    if (item.adminOnly) return role === "SUPER_ADMIN";
    return true;
  });

  return (
    <div className="flex h-full w-64 flex-col bg-slate-950 border-r border-slate-800/50">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Growth Center
          </span>
        </div>
      </div>
      
      {/* Demo Badge */}
      <div className="px-4 py-3 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Demo Mode Active</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/mvp" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-indigo-600/10 text-white shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                  "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
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

      <div className="flex flex-col shrink-0 border-t border-white/5 p-4 bg-slate-900/20">
        <div className="flex items-center w-full mb-4">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
            {email?.substring(0, 2).toUpperCase() || "JS"}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{email?.split('@')[0] || "Jane Smith"}</p>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{role?.replace('_', ' ') || "Client Admin"}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg text-xs font-semibold transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
