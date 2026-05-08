"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";

function AcceptInviteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const notice = useNotice();
  const token = params.get("token") || "";
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/auth/accept-invite?token=${encodeURIComponent(token)}`)
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data.valid) throw new Error(data.error || "Invite invalid.");
        setInvite(data);
      })
      .catch((err) => setError(err.message || "Invite invalid."));
  }, [token]);

  async function acceptInvite(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      notice.warning("Password must be at least 8 characters.", "Password too short");
      return;
    }
    if (password !== confirm) {
      notice.warning("Passwords do not match.", "Password mismatch");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not accept invite.");
      notice.success("Invite accepted. Please log in.", "Account active");
      router.push("/login");
    } catch (err: any) {
      notice.error(err.message || "Could not accept invite.", "Invite failed");
      setError(err.message || "Could not accept invite.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white p-8 text-slate-900 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600"><Lock className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-black">Accept Invite</h1>
            <p className="text-sm text-slate-500">Set your password to activate your account.</p>
          </div>
        </div>
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            <ShieldAlert className="mb-2 h-5 w-5" /> {error}
          </div>
        ) : !invite ? (
          <p className="text-sm text-slate-500">Checking invite...</p>
        ) : (
          <form onSubmit={acceptInvite} className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="font-bold">{invite.email}</p>
              <p className="text-slate-500">{invite.organizationName}</p>
              <p className="mt-2 text-xs text-slate-400">Expires {new Date(invite.expiresAt).toLocaleString()}</p>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Password</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </label>
            <button disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-60">
              <CheckCircle2 className="h-4 w-4" /> {isSaving ? "Activating..." : "Activate Account"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950 px-6 py-12 text-white"><div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white p-8 text-slate-900 shadow-2xl">Checking invite...</div></main>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
