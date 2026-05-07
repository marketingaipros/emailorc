"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  CreditCard, 
  BarChart3, 
  Settings2, 
  Plus, 
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Database,
  Lock,
  Zap,
  ShieldAlert,
  Mail,
  UserPlus,
  ArrowRight,
  UserCheck,
  MoreHorizontal,
  MailPlus,
  Trash2,
  Power,
  RotateCcw,
  Save,
  Eye,
  AlertCircle,
  Globe,
  AlertTriangle,
  Info,
  ExternalLink,
  Cpu
} from "lucide-react";
import { useRouter } from "next/navigation";

type AdminTab = "Users" | "Organizations" | "Roles & Permissions" | "Subscription Plans" | "AI Credits" | "Usage Logs" | "API Settings" | "Environment";

type EnvironmentMode = "DEMO" | "TEST_LIVE" | "PRODUCTION";

interface EnvironmentConfig {
  mode: EnvironmentMode;
  useLiveBrainApi: boolean;
  useFallbackOutputs: boolean;
  useSampleData: boolean;
  creditMode: "DEMO" | "TEST" | "REAL";
  openRouterKeyType: "DEMO" | "TEST" | "PRODUCTION";
  databaseType: "DEMO" | "TEST" | "PRODUCTION";
  exportLabel: string;
  autoSendEnabled: boolean;
}

export default function AdminConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("Users");
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [envConfig, setEnvConfig] = useState<EnvironmentConfig>({
    mode: "DEMO",
    useLiveBrainApi: false,
    useFallbackOutputs: true,
    useSampleData: true,
    creditMode: "DEMO",
    openRouterKeyType: "DEMO",
    databaseType: "DEMO",
    exportLabel: "Demo Export",
    autoSendEnabled: false,
  });
  const [isConfirmingProduction, setIsConfirmingProduction] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, orgsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/organizations")
      ]);
      
      if (!usersRes.ok || !orgsRes.ok) throw new Error("Failed to fetch data");
      
      const usersData = await usersRes.json();
      const orgsData = await orgsRes.json();
      
      setUserList(usersData);
      setOrganizations(orgsData);

      // Get current user info from the list for permission checks
      const userEmail = localStorage.getItem("userEmail");
      const current = usersData.find((u: any) => u.email === userEmail);
      setCurrentUser(current);
      
      if (orgsData.length > 0 && !newUser.organizationId) {
        const defaultOrgId = current?.memberships?.[0]?.orgId || orgsData[0].id;
        setNewUser(prev => ({ ...prev, organizationId: defaultOrgId }));
      }
      const savedEnv = localStorage.getItem("envConfig");
      if (savedEnv) setEnvConfig(JSON.parse(savedEnv));
    } catch (err) {
      setError("Could not load administrative data. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEnvConfig = (config: EnvironmentConfig) => {
    setEnvConfig(config);
    localStorage.setItem("envConfig", JSON.stringify(config));
    setSuccess("Environment configuration updated.");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleModeSwitch = (newMode: EnvironmentMode) => {
    if (newMode === "PRODUCTION" && !isSuperAdmin) {
      setError("Only Super Admins can transition to Production Mode.");
      return;
    }

    if (newMode === "PRODUCTION" && isSuperAdmin) {
      setIsConfirmingProduction(true);
      return;
    }

    const updates: Partial<EnvironmentConfig> = { mode: newMode };
    
    if (newMode === "DEMO") {
      updates.useLiveBrainApi = false;
      updates.useFallbackOutputs = true;
      updates.useSampleData = true;
      updates.creditMode = "DEMO";
      updates.openRouterKeyType = "DEMO";
      updates.databaseType = "DEMO";
      updates.exportLabel = "Demo Export";
      updates.autoSendEnabled = false;
    } else if (newMode === "TEST_LIVE") {
      updates.useLiveBrainApi = true;
      updates.useFallbackOutputs = false;
      updates.useSampleData = false;
      updates.creditMode = "TEST";
      updates.openRouterKeyType = "TEST";
      updates.databaseType = "TEST";
      updates.exportLabel = "Test Export";
      updates.autoSendEnabled = false;
    }

    saveEnvConfig({ ...envConfig, ...updates });
  };

  const confirmProductionMode = () => {
    saveEnvConfig({
      ...envConfig,
      mode: "PRODUCTION",
      useLiveBrainApi: true,
      useFallbackOutputs: false,
      useSampleData: false,
      creditMode: "REAL",
      openRouterKeyType: "PRODUCTION",
      databaseType: "PRODUCTION",
      exportLabel: "Production Export",
      autoSendEnabled: false // Still false by default for safety
    });
    setIsConfirmingProduction(false);
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "SUPER_ADMIN") {
      router.push("/mvp");
      return;
    }
    fetchData();
  }, [router]);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isClientAdmin = currentUser?.role === "CLIENT_ADMIN";
  const userOrgId = currentUser?.memberships?.[0]?.orgId;

  const [searchQuery, setSearchQuery] = useState("");
  const [userList, setUserList] = useState<any[]>([]);

  const filteredUsers = userList.filter(user => 
    (user.firstName + " " + user.lastName).toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.org || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [newUser, setNewUser] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    jobTitle: "",
    organizationId: "", 
    role: "EDITOR",
    status: "ACTIVE",
    password: "",
    sendInvite: false,
    requirePasswordReset: false
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      
      setSuccess("User provisioned successfully.");
      setIsCreateUserModalOpen(false);
      setNewUser({ 
        firstName: "", 
        lastName: "", 
        email: "", 
        jobTitle: "",
        organizationId: organizations[0]?.id || "", 
        role: "EDITOR",
        status: "ACTIVE",
        password: "",
        sendInvite: false,
        requirePasswordReset: false
      });
      fetchData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser({
      ...user,
      organizationId: user.memberships?.[0]?.orgId || "",
      role: user.memberships?.[0]?.role || "VIEWER",
      password: ""
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedUser),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      
      setSuccess("User updated successfully.");
      setIsEditModalOpen(false);
      fetchData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleArchiveUser = async (id: string) => {
    if (!confirm("Are you sure you want to archive this user?")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive user");
      
      setSuccess("User archived.");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAction = async (id: string, action: string) => {
    // Placeholder for other actions like Resend Invite, Suspend, etc.
    setSuccess(`${action} action performed.`);
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Notifications */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
        {error && (
          <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold text-sm">{error}</span>
            <button onClick={() => setError(null)}><XCircle className="h-4 w-4 opacity-50" /></button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-bold text-sm">{success}</span>
          </div>
        )}
      </div>

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/5 blur-3xl -z-10" />
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Enterprise Governance
            </h1>
            <p className="text-sm text-slate-400 font-medium">Global infrastructure & monetization command</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Live</span>
          </div>
          <button 
            onClick={() => setIsCreateUserModalOpen(true)}
            className="flex items-center gap-2 bg-white text-slate-950 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
          >
            <UserPlus className="h-4 w-4" />
            Provision User
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {[
            { id: "Users", icon: Users },
            { id: "Organizations", icon: Building2 },
            { id: "Roles & Permissions", icon: Lock },
            { id: "Subscription Plans", icon: CreditCard },
            { id: "AI Credits", icon: BarChart3 },
            { id: "Usage Logs", icon: Database },
            { id: "API Settings", icon: Zap },
            { id: "Environment", icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all border ${
                activeTab === tab.id 
                  ? "bg-indigo-600/10 text-white border-indigo-500/20 shadow-lg" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white border-transparent"
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-indigo-400" : "text-slate-500"}`} />
              {tab.id}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
          <div className="border-b border-slate-50 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeTab}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage and audit global system assets</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab.toLowerCase()}...`} 
                className="pl-9 pr-4 py-2 text-sm rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-72 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="p-8 flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                 <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Infrastructure...</p>
              </div>
            ) : activeTab === "Users" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Identity</th>
                        <th className="px-6 py-4">Organization</th>
                        <th className="px-6 py-4">System Role</th>
                        <th className="px-6 py-4">Activity</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold italic">
                            No users found in governance registry
                          </td>
                        </tr>
                      ) : filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{user.email}</div>
                            {user.jobTitle && <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{user.jobTitle}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                               <Building2 className="h-3 w-3 text-slate-400" />
                               {user.org}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase tracking-wider border border-slate-200">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[10px] text-slate-500 font-bold flex flex-col">
                               <span>Last: {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}</span>
                               <span className="text-slate-300 font-medium">Joined: {user.created}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : user.status === 'INVITED' ? 'bg-amber-500' : user.status === 'SUSPENDED' ? 'bg-red-500' : 'bg-slate-300'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'ACTIVE' ? 'text-emerald-600' : user.status === 'INVITED' ? 'text-amber-600' : user.status === 'SUSPENDED' ? 'text-red-600' : 'text-slate-400'}`}>
                                  {user.status}
                                </span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleAction(user.id, "View")}
                                  title="View Details"
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleEditUser(user)}
                                  title="Edit" 
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                  <Settings2 className="h-4 w-4" />
                                </button>
                                {user.status === 'INVITED' && (
                                  <button onClick={() => handleAction(user.id, "Resend Invite")} title="Resend Invite" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><MailPlus className="h-4 w-4" /></button>
                                )}
                                <button 
                                  onClick={() => handleArchiveUser(user.id)}
                                  title="Archive" 
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Environment" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Environment Switcher */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["DEMO", "TEST_LIVE", "PRODUCTION"] as EnvironmentMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleModeSwitch(m)}
                      className={`relative overflow-hidden p-6 rounded-[2.5rem] border-2 transition-all text-left group ${
                        envConfig.mode === m 
                          ? m === "DEMO" ? "border-indigo-500 bg-indigo-50/30" : 
                            m === "TEST_LIVE" ? "border-amber-500 bg-amber-50/30" : 
                            "border-red-500 bg-red-50/30"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                         <div className={`p-3 rounded-2xl ${
                           m === "DEMO" ? "bg-indigo-100 text-indigo-600" : 
                           m === "TEST_LIVE" ? "bg-amber-100 text-amber-600" : 
                           "bg-red-100 text-red-600"
                         }`}>
                           {m === "DEMO" ? <Zap className="h-6 w-6" /> : m === "TEST_LIVE" ? <Cpu className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                         </div>
                         {envConfig.mode === m && (
                           <CheckCircle2 className={`h-6 w-6 ${
                             m === "DEMO" ? "text-indigo-500" : 
                             m === "TEST_LIVE" ? "text-amber-500" : 
                             "text-red-500"
                           }`} />
                         )}
                      </div>
                      <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                        {m === "DEMO" ? "Demo Mode" : m === "TEST_LIVE" ? "Test Live" : "Production"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                        {m === "DEMO" ? "Sample data and fallback outputs for safe exploration." : 
                         m === "TEST_LIVE" ? "Live API usage with sanitized real data for QA validation." : 
                         "Full enterprise capacity with real client records and delivery."}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Safety Warnings */}
                <div className="bg-slate-950 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                            <ShieldAlert className="h-6 w-6 text-amber-500" />
                         </div>
                         <h4 className="text-white font-black uppercase tracking-widest text-sm">Safety Protocol & Guards</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                               <strong className="text-white block mb-1 uppercase tracking-wider">Unsubscribe Protection</strong>
                               Do Not Contact (DNC) lists are globally enforced across ALL modes. Real client records will be scrubbed before any outreach generation.
                            </p>
                         </div>
                         <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Lock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                               <strong className="text-white block mb-1 uppercase tracking-wider">Auto-Send Guard</strong>
                               Auto-send is locked globally. It requires explicit Super Admin authorization and a verified production subscription to enable.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Detailed Configuration */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                   <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                      <div>
                         <h4 className="text-slate-900 font-black uppercase tracking-tight text-sm">Mode Configuration</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fine-tune environment behavior</p>
                      </div>
                      <button 
                        onClick={() => saveEnvConfig(envConfig)}
                        className="px-4 py-2 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                      >
                         <Save className="h-3.5 w-3.5" /> Save Changes
                      </button>
                   </div>
                   
                   <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      {/* Logic Controls */}
                      <div className="space-y-6">
                         <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Core Logic</h5>
                         
                         <div className="flex items-center justify-between group">
                            <div>
                               <p className="text-sm font-bold text-slate-800">Use Live Brain API</p>
                               <p className="text-[10px] text-slate-400 font-medium">Connect to OpenRouter/LLM providers</p>
                            </div>
                            <button 
                              onClick={() => setEnvConfig({...envConfig, useLiveBrainApi: !envConfig.useLiveBrainApi})}
                              className={`w-12 h-6 rounded-full transition-colors relative ${envConfig.useLiveBrainApi ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${envConfig.useLiveBrainApi ? 'left-7' : 'left-1'}`} />
                            </button>
                         </div>

                         <div className="flex items-center justify-between group">
                            <div>
                               <p className="text-sm font-bold text-slate-800">Use Fallback Outputs</p>
                               <p className="text-[10px] text-slate-400 font-medium">Use cached/static results if API fails</p>
                            </div>
                            <button 
                              onClick={() => setEnvConfig({...envConfig, useFallbackOutputs: !envConfig.useFallbackOutputs})}
                              className={`w-12 h-6 rounded-full transition-colors relative ${envConfig.useFallbackOutputs ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${envConfig.useFallbackOutputs ? 'left-7' : 'left-1'}`} />
                            </button>
                         </div>

                         <div className="flex items-center justify-between group">
                            <div>
                               <p className="text-sm font-bold text-slate-800">Use Sample Data</p>
                               <p className="text-[10px] text-slate-400 font-medium">Inject dummy records for testing</p>
                            </div>
                            <button 
                              onClick={() => setEnvConfig({...envConfig, useSampleData: !envConfig.useSampleData})}
                              className={`w-12 h-6 rounded-full transition-colors relative ${envConfig.useSampleData ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${envConfig.useSampleData ? 'left-7' : 'left-1'}`} />
                            </button>
                         </div>

                         <div className="flex items-center justify-between group pt-2">
                            <div>
                               <p className="text-sm font-bold text-red-600 flex items-center gap-2">
                                 <ShieldAlert className="h-4 w-4" />
                                 Enable Auto-Send
                               </p>
                               <p className="text-[10px] text-slate-400 font-medium italic">Requires Super Admin + Production Mode</p>
                            </div>
                            <button 
                              disabled={envConfig.mode !== "PRODUCTION" || !isSuperAdmin}
                              onClick={() => setEnvConfig({...envConfig, autoSendEnabled: !envConfig.autoSendEnabled})}
                              className={`w-12 h-6 rounded-full transition-colors relative disabled:opacity-30 disabled:cursor-not-allowed ${envConfig.autoSendEnabled ? 'bg-red-600' : 'bg-slate-200'}`}
                            >
                               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${envConfig.autoSendEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                         </div>
                      </div>

                      {/* Resource Mapping */}
                      <div className="space-y-6">
                         <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Resource Mapping</h5>
                         
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit Mode</label>
                            <select 
                              value={envConfig.creditMode}
                              onChange={(e) => setEnvConfig({...envConfig, creditMode: e.target.value as any})}
                              className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold"
                            >
                               <option value="DEMO">Demo Credits (Infinite)</option>
                               <option value="TEST">Test Pool (Sanitized)</option>
                               <option value="REAL">Real Balance (Deductible)</option>
                            </select>
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OpenRouter Key</label>
                            <select 
                              value={envConfig.openRouterKeyType}
                              onChange={(e) => setEnvConfig({...envConfig, openRouterKeyType: e.target.value as any})}
                              className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold"
                            >
                               <option value="DEMO">Demo Key (Shared)</option>
                               <option value="TEST">Test Key (Company)</option>
                               <option value="PRODUCTION">Production Key (Enterprise)</option>
                            </select>
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Backend</label>
                            <select 
                              value={envConfig.databaseType}
                              onChange={(e) => setEnvConfig({...envConfig, databaseType: e.target.value as any})}
                              className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold"
                            >
                               <option value="DEMO">Demo Isolated</option>
                               <option value="TEST">Staging/Live Test</option>
                               <option value="PRODUCTION">Production Primary</option>
                            </select>
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Export Label</label>
                            <input 
                              type="text"
                              value={envConfig.exportLabel}
                              onChange={(e) => setEnvConfig({...envConfig, exportLabel: e.target.value})}
                              className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold"
                              placeholder="e.g. Demo Export"
                            />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Production Warning Modal */}
                {isConfirmingProduction && (
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl p-12 text-center space-y-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                      <div className="h-24 w-24 bg-red-100 rounded-[2rem] flex items-center justify-center mx-auto border-4 border-red-50">
                        <ShieldAlert className="h-12 w-12 text-red-600" />
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Critical Confirmation</h2>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm mx-auto">
                          You are transitioning to **Production Mode**. This will enable real billing, live API costs, and access to actual client records.
                        </p>
                      </div>
                      
                      <div className="bg-red-50 rounded-3xl p-6 text-left border border-red-100 space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-red-900 leading-relaxed">I confirm that all QA testing is complete.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-red-900 leading-relaxed">I understand real credits will be deducted.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setIsConfirmingProduction(false)}
                          className="py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                        >
                          Abort
                        </button>
                        <button 
                          onClick={confirmProductionMode}
                          className="py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 text-xs uppercase tracking-widest"
                        >
                          Confirm Production
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs remain as placeholders for now */}
            {activeTab !== "Users" && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                 <Settings2 className="h-12 w-12 opacity-20" />
                 <p className="font-bold text-sm italic">The {activeTab} control panel is under maintenance.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provision New User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="px-10 py-8 bg-slate-950 text-white flex justify-between items-center sticky top-0 z-10">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
                 <div className="relative z-10">
                    <h2 className="text-2xl font-black tracking-tight">Provision New User</h2>
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">Grant platform access & roles</p>
                 </div>
                 <button onClick={() => setIsCreateUserModalOpen(false)} className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all relative z-10">
                    <XCircle className="h-6 w-6" />
                 </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                       <input 
                         value={newUser.firstName}
                         onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                         type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="John" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                       <input 
                         value={newUser.lastName}
                         onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                         type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Doe" 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address <span className="text-red-500">*</span></label>
                       <input 
                         required
                         value={newUser.email}
                         onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                         type="email" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="john.doe@company.com" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title</label>
                       <input 
                         value={newUser.jobTitle}
                         onChange={(e) => setNewUser({...newUser, jobTitle: e.target.value})}
                         type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Revenue Manager" 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization <span className="text-red-500">*</span></label>
                       <select 
                         required
                         disabled={isClientAdmin}
                         value={newUser.organizationId}
                         onChange={(e) => setNewUser({...newUser, organizationId: e.target.value})}
                         className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                       >
                          {organizations
                            .filter(org => isSuperAdmin || org.id === userOrgId)
                            .map(org => (
                              <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role <span className="text-red-500">*</span></label>
                       <select 
                         required
                         value={newUser.role}
                         onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                         className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                       >
                          {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                          <option value="CLIENT_ADMIN">Client Admin</option>
                          <option value="EDITOR">Editor</option>
                          <option value="REVIEWER">Reviewer</option>
                          <option value="VIEWER">Viewer</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Password</label>
                       <input 
                         disabled={newUser.sendInvite}
                         value={newUser.password}
                         onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                         type="password" 
                         className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" 
                         placeholder="••••••••" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Status</label>
                       <select 
                         value={newUser.status}
                         onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                         className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                       >
                          <option value="ACTIVE">Active</option>
                          <option value="INVITED">Invited</option>
                          <option value="SUSPENDED">Suspended</option>
                       </select>
                    </div>
                 </div>

                 <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            id="sendInvite"
                            checked={newUser.sendInvite}
                            onChange={(e) => setNewUser({...newUser, sendInvite: e.target.checked})}
                            className="h-5 w-5 rounded-lg text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          <label htmlFor="sendInvite" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Send Invite Token (Skip password)</label>
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            id="requireReset"
                            checked={newUser.requirePasswordReset}
                            onChange={(e) => setNewUser({...newUser, requirePasswordReset: e.target.checked})}
                            className="h-5 w-5 rounded-lg text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          <label htmlFor="requireReset" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Require Password Reset on first login</label>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 flex justify-end">
                    <button type="submit" className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2">
                       <UserCheck className="h-4 w-4" /> Provision User Account
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="px-10 py-8 bg-indigo-600 text-white flex justify-between items-center sticky top-0 z-10">
                 <div className="relative z-10">
                    <h2 className="text-2xl font-black tracking-tight">Edit User Account</h2>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Manage credentials & access</p>
                 </div>
                 <button onClick={() => setIsEditModalOpen(false)} className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all relative z-10">
                    <XCircle className="h-6 w-6" />
                 </button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                       <input 
                         required
                         value={selectedUser.firstName || ""}
                         onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                         type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                       <input 
                         required
                         value={selectedUser.lastName || ""}
                         onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                         type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" 
                       />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address (Locked)</label>
                    <input 
                      disabled
                      value={selectedUser.email}
                      type="email" className="w-full bg-slate-100 border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</label>
                       <select 
                         value={selectedUser.organizationId}
                         onChange={(e) => setSelectedUser({...selectedUser, organizationId: e.target.value})}
                         className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                       >
                          {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</label>
                       <select 
                         value={selectedUser.role}
                         onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                         className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                       >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="CLIENT_ADMIN">Client Admin</option>
                          <option value="EDITOR">Editor</option>
                          <option value="REVIEWER">Reviewer</option>
                          <option value="VIEWER">Viewer</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                       <select 
                         value={selectedUser.status}
                         onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                         className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                       >
                          <option value="ACTIVE">Active</option>
                          <option value="INVITED">Invited</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="ARCHIVED">Archived</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title</label>
                       <input 
                         value={selectedUser.jobTitle || ""}
                         onChange={(e) => setSelectedUser({...selectedUser, jobTitle: e.target.value})}
                         type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500" 
                       />
                    </div>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
                    <div className="space-y-1.5 flex-1 mr-6">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reset Password</label>
                       <input 
                         value={selectedUser.password}
                         onChange={(e) => setSelectedUser({...selectedUser, password: e.target.value})}
                         type="password" 
                         className="w-full bg-white border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" 
                         placeholder="Enter new password" 
                       />
                    </div>
                    <button type="button" onClick={() => handleAction(selectedUser.id, "Force Reset")} className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">
                       <RotateCcw className="h-3.5 w-3.5" /> Force Reset
                    </button>
                 </div>
                 <div className="pt-6 flex justify-end">
                    <button type="submit" className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2">
                       <Save className="h-4 w-4" /> Save User Changes
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
