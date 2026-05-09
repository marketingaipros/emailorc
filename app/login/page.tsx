"use client";

import React, { useEffect, useState } from "react";
import { Brain, Lock, Mail, Loader2, ChevronRight, ShieldCheck, UserCircle2, Pencil, Eye, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotice } from "@/components/notice/NoticeProvider";

export default function LoginPage() {
  const router = useRouter();
  const notice = useNotice();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signup, setSignup] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    jobTitle: "",
    phone: "",
    industry: "",
    acceptTerms: false,
    acceptTrial: false,
  });

  const demoAccounts = [
    { label: "Super Admin Demo", email: "admin@demo.com", password: "DemoAdmin123!", icon: ShieldCheck, color: "indigo" },
    { label: "Client Admin Demo", email: "client@demo.com", password: "DemoClient123!", icon: UserCircle2, color: "emerald" },
    { label: "Editor Demo", email: "editor@demo.com", password: "DemoEditor123!", icon: Pencil, color: "sky" },
    { label: "Reviewer Demo", email: "reviewer@demo.com", password: "DemoReviewer123!", icon: ClipboardCheck, color: "amber" },
    { label: "Viewer Demo", email: "viewer@demo.com", password: "DemoViewer123!", icon: Eye, color: "slate" },
  ];

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    if (userId && userEmail && userRole) router.replace("/mvp");
  }, [router]);

  const handleLogin = async (e?: React.FormEvent, credentials?: { email: string; password: string }) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    const loginEmail = credentials?.email || email;
    const loginPassword = credentials?.password || password;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store session data
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userOrg", data.orgName);
      localStorage.setItem("orgId", data.orgId);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userPlan", data.plan || "Trial");
      localStorage.setItem("subscriptionStatus", data.subscriptionStatus || "TRIAL_ACTIVE");
      localStorage.setItem("aiCredits", String(data.aiCredits ?? 100));
      localStorage.setItem("sessionCreatedAt", new Date().toISOString());

      notice.success(`Welcome back, ${data.name || data.email}.`, "Login successful");
      router.push("/mvp");
    } catch (err: any) {
      setError(err.message);
      notice.error(err.message || "Login failed. Check your email and password.", "Login failed");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create account.");
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userOrg", data.orgName);
      localStorage.setItem("orgId", data.orgId);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userPlan", data.plan || "Trial");
      localStorage.setItem("subscriptionStatus", data.subscriptionStatus || "TRIAL_ACTIVE");
      localStorage.setItem("aiCredits", String(data.creditsRemaining ?? 100));
      localStorage.setItem("trialEndsAt", data.trialEndsAt || "");
      localStorage.setItem("sessionCreatedAt", new Date().toISOString());
      notice.success(data.message || "Trial account created. You have 100 AI Credits available.", "Trial created");
      router.push("/mvp");
    } catch (err: any) {
      setError(err.message);
      notice.error(err.message || "Could not create trial account.", "Signup failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-6 border border-white/10">
            <Brain className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Growth Center</h1>
          <p className="text-slate-400 mt-2">Account Growth Command Center & Brain API</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950/60 p-1">
            <button type="button" onClick={() => setMode("login")} className={`rounded-xl py-2 text-xs font-black uppercase tracking-widest ${mode === "login" ? "bg-white text-slate-950" : "text-slate-400"}`}>Sign In</button>
            <button type="button" onClick={() => setMode("signup")} className={`rounded-xl py-2 text-xs font-black uppercase tracking-widest ${mode === "signup" ? "bg-white text-slate-950" : "text-slate-400"}`}>Create Account</button>
          </div>

          {mode === "login" ? <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-800/40 border-slate-700/50 text-white rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/40 border-slate-700/50 text-white rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form> : (
            <form onSubmit={handleSignup} className="space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center font-semibold">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <input required value={signup.firstName} onChange={(e) => setSignup({ ...signup, firstName: e.target.value })} placeholder="First Name" className="bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
                <input required value={signup.lastName} onChange={(e) => setSignup({ ...signup, lastName: e.target.value })} placeholder="Last Name" className="bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
              </div>
              <input required type="email" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} placeholder="Work Email" className="w-full bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
              <input required value={signup.organizationName} onChange={(e) => setSignup({ ...signup, organizationName: e.target.value })} placeholder="Organization / Company Name" className="w-full bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} placeholder="Password" className="bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
                <input required type="password" value={signup.confirmPassword} onChange={(e) => setSignup({ ...signup, confirmPassword: e.target.value })} placeholder="Confirm Password" className="bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={signup.jobTitle} onChange={(e) => setSignup({ ...signup, jobTitle: e.target.value })} placeholder="Job Title" className="bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
                <input value={signup.phone} onChange={(e) => setSignup({ ...signup, phone: e.target.value })} placeholder="Phone" className="bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
              </div>
              <input value={signup.industry} onChange={(e) => setSignup({ ...signup, industry: e.target.value })} placeholder="Industry" className="w-full bg-slate-800/40 border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm" />
              <label className="flex gap-3 text-xs font-semibold text-slate-400"><input required type="checkbox" checked={signup.acceptTerms} onChange={(e) => setSignup({ ...signup, acceptTerms: e.target.checked })} /> I agree to Terms and Privacy Policy</label>
              <label className="flex gap-3 text-xs font-semibold text-slate-400"><input required type="checkbox" checked={signup.acceptTrial} onChange={(e) => setSignup({ ...signup, acceptTrial: e.target.checked })} /> I understand this creates a trial account</label>
              <button disabled={isLoading} className="w-full bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Trial Account"}
              </button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-slate-950 px-3 text-slate-600">Quick Access Demo</span></div>
          </div>

          {mode === "login" && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleLogin(undefined, account)}
                  className="flex items-center gap-3 p-3 bg-slate-800/40 border border-white/10 rounded-2xl hover:bg-slate-800 transition-all group text-left"
                >
                  <Icon className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{account.label}</span>
                </button>
              );
            })}
          </div>}

          <div className="pt-4 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
               <ShieldCheck className="h-4 w-4" />
               Enterprise Security Active
             </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-[11px] font-medium max-w-xs mx-auto">
          Need an account? <button onClick={() => setMode("signup")} className="text-indigo-400 hover:underline cursor-pointer">Create a trial account</button>.
        </p>
      </div>
    </div>
  );
}
