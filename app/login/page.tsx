"use client";

import React, { useState } from "react";
import { Brain, Lock, Mail, Loader2, ChevronRight, ShieldCheck, UserPlus, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const demoAccounts = {
    admin: { email: "admin@demo.com", password: "DemoAdmin123!" },
    client: { email: "client@demo.com", password: "DemoClient123!" }
  };

  const handleLogin = async (e?: React.FormEvent, credentials?: typeof demoAccounts.admin) => {
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

      router.push("/mvp");
    } catch (err: any) {
      setError(err.message);
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
          <form onSubmit={handleLogin} className="space-y-5">
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
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-slate-950 px-3 text-slate-600">Quick Access Demo</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleLogin(undefined, demoAccounts.admin)}
              className="flex flex-col items-center gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500/20 transition-all group"
            >
               <ShieldCheck className="h-5 w-5 text-indigo-400" />
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">Super Admin</span>
            </button>
            <button 
              onClick={() => handleLogin(undefined, demoAccounts.client)}
              className="flex flex-col items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all group"
            >
               <UserCircle2 className="h-5 w-5 text-emerald-400" />
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">Client Demo</span>
            </button>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
               <ShieldCheck className="h-4 w-4" />
               Enterprise Security Active
             </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-[11px] font-medium max-w-xs mx-auto">
          Need an account? <span className="text-indigo-400 hover:underline cursor-pointer">Contact your organization administrator</span> or request enterprise access.
        </p>
      </div>
    </div>
  );
}
