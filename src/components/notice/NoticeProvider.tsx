"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type NoticeType = "success" | "error" | "warning" | "info";

type Notice = {
  id: string;
  type: NoticeType;
  title?: string;
  message: string;
  critical?: boolean;
};

type NoticeInput = Omit<Notice, "id">;

type NoticeContextValue = {
  notify: (notice: NoticeInput) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string, critical?: boolean) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
};

const NoticeContext = createContext<NoticeContextValue | null>(null);

const styles: Record<NoticeType, { icon: React.ReactNode; border: string; bg: string; title: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    title: "text-emerald-900",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    border: "border-red-200",
    bg: "bg-red-50",
    title: "text-red-900",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    border: "border-amber-200",
    bg: "bg-amber-50",
    title: "text-amber-900",
  },
  info: {
    icon: <Info className="h-5 w-5 text-indigo-600" />,
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    title: "text-indigo-900",
  },
};

function sanitizeNotice(message: string) {
  return message.replace(/sk-or-v1-[A-Za-z0-9_-]+/g, "sk-or-v1-••••••••").replace(/sk_demo_[A-Za-z0-9_-]+/g, "sk_demo_••••");
}

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  const notify = useCallback((notice: NoticeInput) => {
    const id = crypto.randomUUID();
    const nextNotice = { ...notice, id, message: sanitizeNotice(notice.message) };
    setNotices((current) => [nextNotice, ...current].slice(0, 5));

    if (!notice.critical) {
      window.setTimeout(() => dismiss(id), notice.type === "error" ? 7000 : 4200);
    }
  }, [dismiss]);

  const value = useMemo<NoticeContextValue>(() => ({
    notify,
    dismiss,
    success: (message, title = "Success") => notify({ type: "success", title, message }),
    error: (message, title = "Error", critical = false) => notify({ type: "error", title, message, critical }),
    warning: (message, title = "Warning") => notify({ type: "warning", title, message }),
    info: (message, title = "Info") => notify({ type: "info", title, message }),
  }), [dismiss, notify]);

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {notices.map((notice) => {
          const style = styles[notice.type];
          return (
            <div
              key={notice.id}
              role="status"
              className={`rounded-xl border ${style.border} ${style.bg} p-4 shadow-lg shadow-slate-900/10`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{style.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${style.title}`}>{notice.title || notice.type}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-700">{notice.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(notice.id)}
                  className="rounded-md p-1 text-slate-400 hover:bg-white/70 hover:text-slate-700"
                  aria-label="Dismiss notice"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error("useNotice must be used inside NoticeProvider");
  }
  return context;
}
