"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Brain
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
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
  { name: "Settings",        href: "/mvp/settings",     icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Growth Center
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-400",
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
      <div className="flex shrink-0 border-t border-slate-800 p-4">
        <div className="flex items-center w-full">
          <div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              JS
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Jane Smith</p>
            <p className="text-xs font-medium text-slate-400">RevOps Director</p>
          </div>
        </div>
      </div>
    </div>
  );
}
