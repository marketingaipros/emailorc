"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { usePathname, useRouter } from "next/navigation";
import { canAccessPath } from "@/lib/auth-rules";

export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");

    if (!userId || !email || !role) {
      localStorage.clear();
      router.replace("/login");
      return;
    }

    if (!canAccessPath(role, pathname || "/mvp")) {
      router.replace("/mvp");
      return;
    }

    setIsAllowed(true);
  }, [pathname, router]);

  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-sm font-bold uppercase tracking-widest text-slate-400">
        Checking access...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
