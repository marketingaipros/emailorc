"use client";

import React, { useState } from "react";
import { Brain, Lock, Mail, Loader2, ChevronRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Mock authentication logic for demo
    setTimeout(() => {
      if (email === "admin@marketingaipros.com" && password === "admin123") {
        // Set a mock session cookie/localStorage
        localStorage.setItem("userRole", "SUPER_ADMIN");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("orgId", "org_marketing_aipros");
        router.push("/mvp/dashboard");
      } else if (email === "client@acme.com" && password === "client123") {
        localStorage.setItem("userRole", "CLIENT_ADMIN");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("orgId", "org_acme");
        router.push("/mvp/dashboard");
      } else {
        setError("Invalid email or password. Try admin@marketingaipros.com / admin123");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-6 border border-white/10">
            <Brain className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Growth Center</h1>
          <p className="text-slate-400 mt-2">Account Growth Command Center & Brain API</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-800/50 border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
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
                  className="w-full bg-slate-800/50 border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Login to Command Center
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-bold">
               <ShieldCheck className="h-4 w-4" />
               Enterprise Security Active
             </div>
             <p className="text-slate-500 text-[10px] text-center max-w-[240px]">
               By logging in, you agree to our Terms of Service and Privacy Policy. All API requests are logged for security and cost tracking.
             </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <div className="flex flex-col items-center">
             <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Demo Admin</span>
             <code className="text-xs text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded">admin@marketingaipros.com</code>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Demo Client</span>
             <code className="text-xs text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded">client@acme.com</code>
          </div>
        </div>
      </div>
    </div>
  );
}
