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
  Cpu,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotice } from "@/components/notice/NoticeProvider";
import { normalizeRole, permissionsForRole, roleLabel } from "@/lib/roles";

type AdminTab = "Users" | "Organizations" | "Roles & Permissions" | "Subscription Plans" | "AI Credits" | "Usage Logs" | "API Settings" | "Environment" | "Data Management" | "System Health";

type EnvironmentMode = "DEMO" | "LIVE_TEST" | "TEST_LIVE" | "PRODUCTION";

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
  const notice = useNotice();
  const [activeTab, setActiveTab] = useState<AdminTab>("Users");
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inviteResult, setInviteResult] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [planForm, setPlanForm] = useState({ plan: "Trial", credits: 100, status: "TRIAL_ACTIVE", trialDays: 14, organizationStatus: "ACTIVE" });
  const [resetForm, setResetForm] = useState({ resetType: "live-test", organizationId: "", includeUsageLogs: false, includeBrain: false, confirmed: false, confirmation: "" });
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [permissionDiagnostics, setPermissionDiagnostics] = useState<any>(null);
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
  const [productionConfirmChecked, setProductionConfirmChecked] = useState(false);
  const [productionConfirmText, setProductionConfirmText] = useState("");

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
      if (orgsData.length) {
        const firstOrg = orgsData[0];
        setSelectedOrgId((current) => current || firstOrg.id);
        setResetForm((prev) => ({ ...prev, organizationId: prev.organizationId || firstOrg.id }));
        setPlanForm({
          plan: firstOrg.plan || "Trial",
          credits: Number(firstOrg.aiCredits || firstOrg.creditsRemaining || 100),
          status: firstOrg.subscriptionStatus || "TRIAL_ACTIVE",
          trialDays: 14,
          organizationStatus: firstOrg.status || "ACTIVE",
        });
      }

      // Get current user info from the list for permission checks
      const userEmail = localStorage.getItem("userEmail");
      const current = usersData.find((u: any) => String(u.email || "").toLowerCase() === String(userEmail || "").toLowerCase());
      const localRole = localStorage.getItem("userRole");
      setCurrentUser(current || {
        id: localStorage.getItem("userId"),
        email: userEmail,
        role: localRole,
        memberships: [{ orgId: localStorage.getItem("orgId") || "org_demo", role: localRole }],
      });

      fetch(`/api/auth/me?user_id=${encodeURIComponent(localStorage.getItem("userId") || "")}&email=${encodeURIComponent(userEmail || "")}&role=${encodeURIComponent(localRole || "")}&organization_id=${encodeURIComponent(localStorage.getItem("orgId") || "org_demo")}`, { cache: "no-store" })
        .then((response) => response.json())
        .then((me) => {
          if (me.error) return;
          setPermissionDiagnostics(me);
          localStorage.setItem("userRole", me.role?.toUpperCase?.() || localRole || "VIEWER");
          setCurrentUser((existing: any) => ({
            ...(existing || {}),
            id: me.user_id || existing?.id,
            email: me.email || existing?.email,
            role: me.role,
            roleLabel: me.role_label,
            memberships: [{
              orgId: me.organization_id || existing?.memberships?.[0]?.orgId,
              orgName: me.organization_name || existing?.memberships?.[0]?.orgName,
              role: me.role,
            }],
          }));
        })
        .catch(() => {});
      
      const defaultOrgId = current?.memberships?.[0]?.orgId || orgsData[0]?.id || "org_demo";
      if (orgsData.length > 0 && !newUser.organizationId) {
        setNewUser(prev => ({ ...prev, organizationId: defaultOrgId }));
      }
      const savedEnv = localStorage.getItem("envConfig");
      if (savedEnv) setEnvConfig(JSON.parse(savedEnv));
      fetch(`/api/environment/status?organization_id=${encodeURIComponent(localStorage.getItem("orgId") || defaultOrgId || "org_demo")}`, { cache: "no-store" })
        .then((response) => response.json())
        .then((status) => {
          const mode = status.mode as EnvironmentMode | undefined;
          if (!mode) return;
          setEnvConfig((current) => {
            const next = { ...current, mode };
            localStorage.setItem("envConfig", JSON.stringify(next));
            return next;
          });
        })
        .catch(() => {});
    } catch (err) {
      setError("Could not load administrative data. Please refresh.");
      notice.error("Could not load administrative data. Please refresh.", "Admin data failed");
    } finally {
      setIsLoading(false);
    }
  };

  const saveEnvConfig = async (config: EnvironmentConfig) => {
    setEnvConfig(config);
    localStorage.setItem("envConfig", JSON.stringify(config));
    try {
      const response = await fetch("/api/environment/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: localStorage.getItem("orgId") || selectedOrgId || "org_demo",
          user_id: localStorage.getItem("userId") || "user_super_admin",
          email: localStorage.getItem("userEmail") || "",
          role: normalizeRole(currentUser?.role || localStorage.getItem("userRole")),
          mode: config.mode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const syncedConfig = { ...config, mode: data.mode || config.mode };
        setEnvConfig(syncedConfig);
        localStorage.setItem("envConfig", JSON.stringify(syncedConfig));
        setSuccess(`${data.badge_label || "Environment"} saved.`);
        notice.success(`${data.badge_label || "Environment"} saved.`, "Environment saved");
      } else {
        setSuccess("Environment saved locally. Database environment was not updated.");
        notice.warning(data.message || "Environment saved locally only.", "Environment not persisted");
      }
    } catch {
      setSuccess("Environment saved locally. Backend environment status could not be updated.");
      notice.warning("Environment saved locally. Backend environment status could not be updated.", "Environment not persisted");
    }
    setTimeout(() => setSuccess(null), 3000);
  };

  const loadSystemHealth = async () => {
    const env = envConfig.mode.toLowerCase().replace("_", "-");
    const response = await fetch(`/api/admin/system-health?organization_id=${encodeURIComponent(localStorage.getItem("orgId") || "org_demo")}&environment=${encodeURIComponent(env)}`);
    const data = await response.json();
    setSystemHealth(data);
  };

  const handleModeSwitch = async (newMode: EnvironmentMode) => {
    if (newMode === "PRODUCTION" && !canTransitionProduction) {
      setError("Only Super Admins can transition to Production Mode.");
      notice.error("Only Super Admins can transition to Production Mode.", "Permission blocked");
      return;
    }

    if (newMode === "PRODUCTION" && canTransitionProduction) {
      setProductionConfirmChecked(false);
      setProductionConfirmText("");
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
    } else if (newMode === "LIVE_TEST") {
      updates.useLiveBrainApi = true;
      updates.useFallbackOutputs = false;
      updates.useSampleData = false;
      updates.creditMode = "TEST";
      updates.openRouterKeyType = "TEST";
      updates.databaseType = "TEST";
      updates.exportLabel = "Live Test Export";
      updates.autoSendEnabled = false;
    }

    await saveEnvConfig({ ...envConfig, ...updates });
    if (newMode !== "DEMO") {
      notice.info(`You are viewing ${newMode === "LIVE_TEST" ? "Live Test" : newMode === "TEST_LIVE" ? "Test Live" : "Production"} analytics. Demo/Test/Live Test/Production analytics are stored separately.`, "Environment data switched");
    }
  };

  const confirmProductionMode = async () => {
    if (!productionConfirmChecked || productionConfirmText.trim().toUpperCase() !== "PRODUCTION") {
      notice.warning("Check the confirmation box and type PRODUCTION to continue.", "Confirmation required");
      return;
    }
    await saveEnvConfig({
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
    const role = normalizeRole(localStorage.getItem("userRole"));
    if (role !== "super_admin") {
      router.push("/mvp");
      return;
    }
    fetchData();
  }, [router]);

  const normalizedCurrentRole = normalizeRole(permissionDiagnostics?.role || currentUser?.role || localStorage.getItem("userRole"));
  const rolePermissions = permissionDiagnostics?.permissions || permissionsForRole(normalizedCurrentRole);
  const isSuperAdmin = normalizedCurrentRole === "super_admin";
  const canTransitionProduction = Boolean(rolePermissions.canTransitionProduction);
  const isClientAdmin = normalizedCurrentRole === "client_admin";
  const userOrgId = currentUser?.memberships?.[0]?.orgId;
  const currentRoleLabel = permissionDiagnostics?.role_label || roleLabel(normalizedCurrentRole);

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
    phone: "",
    notes: "",
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
      
      setInviteResult(data.invite || null);
      setSuccess(data.message || "User provisioned successfully.");
      if (data.invite?.email_sent) notice.success("User created and invite email sent.", "User created");
      else if (data.invite) notice.warning("Invite link created. Email delivery is not configured yet.", "Manual invite needed");
      else notice.success("User provisioned successfully.", "User created");
      setIsCreateUserModalOpen(false);
      setNewUser({ 
        firstName: "", 
        lastName: "", 
        email: "", 
        jobTitle: "",
        phone: "",
        notes: "",
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
      notice.error(err.message || "Failed to create user.", "User creation failed");
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
      notice.success("User updated successfully.", "User saved");
      setIsEditModalOpen(false);
      fetchData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      notice.error(err.message || "Failed to update user.", "User update failed");
    }
  };

  const handleArchiveUser = async (id: string) => {
    if (!confirm("Are you sure you want to archive this user?")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive user");
      
      setSuccess("User archived.");
      notice.warning("User archived.", "User archived");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      notice.error(err.message || "Failed to archive user.", "Archive failed");
    }
  };

  const handleAction = async (id: string, action: string) => {
    if (action === "Resend Invite" || action === "Send Invite") {
      try {
        const res = await fetch(`/api/admin/users/${id}/invite`, { method: "POST" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Could not create invite.");
        setInviteResult(data);
        if (data.email_sent) notice.success("Invite email sent.", "Invite sent");
        else notice.warning("Invite link created. Email delivery is not configured yet.", "Manual invite needed");
        fetchData();
      } catch (err: any) {
        notice.error(err.message || "Could not create invite.", "Invite failed");
      }
      return;
    }
    notice.info(`${action} action performed.`, "Admin action");
  };

  const copyInviteLink = async (url?: string) => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    notice.info("Invite link copied.", "Copied");
  };

  const selectedOrganization = organizations.find((org) => org.id === selectedOrgId) || organizations[0];

  const selectOrganization = (orgId: string) => {
    const org = organizations.find((item) => item.id === orgId);
    setSelectedOrgId(orgId);
    if (org) {
      setPlanForm({
        plan: org.plan || "Trial",
        credits: Number(org.aiCredits || org.creditsRemaining || 100),
        status: org.subscriptionStatus || "TRIAL_ACTIVE",
        trialDays: 14,
        organizationStatus: org.status || "ACTIVE",
      });
    }
  };

  const updateOrganizationPlan = async () => {
    if (!selectedOrganization) return;
    const res = await fetch(`/api/admin/organizations/${selectedOrganization.id}/plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: planForm.plan,
        credits: planForm.credits,
        status: planForm.status,
        trial_days: planForm.trialDays,
        organization_status: planForm.organizationStatus,
        actor_user_id: localStorage.getItem("userId"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notice.error(data.error || "Could not update plan.", "Plan update failed");
      return;
    }
    notice.success(data.message || "Organization plan updated.", "Plan updated");
    fetchData();
  };

  const resetData = async () => {
    const resetEnvironment =
      resetForm.resetType === "demo" ? "demo" :
      resetForm.resetType === "production" ? "production" :
      resetForm.resetType === "live-test" ? "live-test" :
      "test-live";
    const res = await fetch("/api/admin/reset-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reset_type: resetForm.resetType,
        environment: resetEnvironment,
        organization_id: resetForm.resetType === "organization" || resetForm.resetType === "live-test" ? (resetForm.organizationId || localStorage.getItem("orgId") || "org_demo") : undefined,
        include_usage_logs: resetForm.includeUsageLogs,
        include_brain: resetForm.includeBrain,
        confirmed: resetForm.confirmed,
        confirmation: resetForm.confirmation,
        actor_user_id: localStorage.getItem("userId"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notice.error(data.error || "Reset failed.", "Reset failed");
      return;
    }
    notice.success("Reset completed. Users, organizations, plans, and settings were kept.", "Reset complete");
    setSystemHealth(null);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Lock className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-500">Checking access...</p>
          <p className="mt-2 text-sm text-slate-500">Admin Console is restricted to Super Admin users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
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

      {inviteResult?.invite_url && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black">{inviteResult.email_sent ? "Invite email accepted by provider." : "Invite created. Copy the invite link to send manually."}</p>
              <p className="mt-1 break-all font-mono text-xs">{inviteResult.invite_url}</p>
              <p className="mt-1 text-xs">Expires: {new Date(inviteResult.invite_expires_at).toLocaleString()}</p>
              {inviteResult.safe_error && <p className="mt-1 text-xs font-bold">Email status: {inviteResult.safe_error}</p>}
            </div>
            <button onClick={() => copyInviteLink(inviteResult.invite_url)} className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Copy Invite Link
            </button>
          </div>
        </div>
      )}

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
            { id: "Data Management", icon: Database },
            { id: "System Health", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as AdminTab); if (tab.id === "System Health") setTimeout(loadSystemHealth, 0); }}
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
                             <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                               Invite: {user.inviteStatus || "NOT_SENT"}
                             </div>
                             {user.lastInviteSent && <div className="text-[9px] text-slate-400">Sent: {new Date(user.lastInviteSent).toLocaleDateString()}</div>}
                             {user.inviteExpires && <div className="text-[9px] text-slate-400">Expires: {new Date(user.inviteExpires).toLocaleDateString()}</div>}
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
                                <button onClick={() => handleAction(user.id, user.status === 'INVITED' ? "Resend Invite" : "Send Invite")} title={user.status === 'INVITED' ? "Resend Invite" : "Send Invite"} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><MailPlus className="h-4 w-4" /></button>
                                {user.inviteUrl && (
                                  <button onClick={() => copyInviteLink(user.inviteUrl)} title="Copy Invite Link" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"><ExternalLink className="h-4 w-4" /></button>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(["DEMO", "LIVE_TEST", "TEST_LIVE", "PRODUCTION"] as EnvironmentMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleModeSwitch(m)}
                      className={`relative overflow-hidden p-6 rounded-[2.5rem] border-2 transition-all text-left group ${
                        envConfig.mode === m 
                          ? m === "DEMO" ? "border-indigo-500 bg-indigo-50/30" : 
                            m === "LIVE_TEST" ? "border-emerald-500 bg-emerald-50/30" :
                            m === "TEST_LIVE" ? "border-amber-500 bg-amber-50/30" : 
                            "border-red-500 bg-red-50/30"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                         <div className={`p-3 rounded-2xl ${
                           m === "DEMO" ? "bg-indigo-100 text-indigo-600" : 
                           m === "LIVE_TEST" ? "bg-emerald-100 text-emerald-600" :
                           m === "TEST_LIVE" ? "bg-amber-100 text-amber-600" : 
                           "bg-red-100 text-red-600"
                         }`}>
                           {m === "DEMO" ? <Zap className="h-6 w-6" /> : m === "LIVE_TEST" ? <Activity className="h-6 w-6" /> : m === "TEST_LIVE" ? <Cpu className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                         </div>
                         {envConfig.mode === m && (
                           <CheckCircle2 className={`h-6 w-6 ${
                             m === "DEMO" ? "text-indigo-500" : 
                             m === "LIVE_TEST" ? "text-emerald-500" :
                             m === "TEST_LIVE" ? "text-amber-500" : 
                             "text-red-500"
                           }`} />
                         )}
                      </div>
                      <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                        {m === "DEMO" ? "Demo Mode" : m === "LIVE_TEST" ? "Live Test" : m === "TEST_LIVE" ? "Test Live" : "Production"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                        {m === "DEMO" ? "Sample data and fallback outputs for safe exploration." : 
                         m === "LIVE_TEST" ? "Clean user-created data, live model calls, export testing only." :
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
                        <label className="flex items-start gap-3 rounded-2xl bg-white p-3 border border-red-100">
                          <input
                            type="checkbox"
                            checked={productionConfirmChecked}
                            onChange={(event) => setProductionConfirmChecked(event.target.checked)}
                            className="mt-0.5 rounded border-red-300 text-red-600"
                          />
                          <span className="text-xs font-bold text-red-900 leading-relaxed">I understand this switches the organization to Production Mode.</span>
                        </label>
                        <input
                          value={productionConfirmText}
                          onChange={(event) => setProductionConfirmText(event.target.value)}
                          placeholder="Type PRODUCTION"
                          className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        />
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
                          disabled={!productionConfirmChecked || productionConfirmText.trim().toUpperCase() !== "PRODUCTION"}
                          className="py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Confirm Production
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "System Health" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Database & Environment Health</h3>
                    <p className="text-xs text-slate-500">Counts are separated by the active environment so Demo, Live Test, Test Live, and Production analytics do not overwrite each other.</p>
                  </div>
                  <button onClick={loadSystemHealth} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">Refresh</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    ["Database connected", systemHealth?.database_connected ? "Yes" : "No"],
                    ["Active environment", systemHealth?.active_environment || envConfig.mode],
                    ["Last database write", systemHealth?.last_database_write || "None yet"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="mt-2 text-sm font-black text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current user permissions</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      ["Email", permissionDiagnostics?.email || currentUser?.email || localStorage.getItem("userEmail") || "Unknown"],
                      ["User ID", permissionDiagnostics?.user_id || currentUser?.id || localStorage.getItem("userId") || "Unknown"],
                      ["Display role", currentRoleLabel],
                      ["Normalized role", normalizedCurrentRole],
                      ["Organization", permissionDiagnostics?.organization_name || currentUser?.memberships?.[0]?.orgName || localStorage.getItem("userOrg") || "Unknown"],
                      ["Session source", permissionDiagnostics?.session_source || "local"],
                      ["Can transition production", canTransitionProduction ? "Yes" : "No"],
                      ["Can manage users", rolePermissions.canManageUsers ? "Yes" : "No"],
                      ["Can manage plans", rolePermissions.canManagePlans ? "Yes" : "No"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                        <p className="mt-1 text-xs font-black text-slate-900 break-words">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Table counts</p>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(systemHealth?.counts || {}).map(([table, count]) => (
                      <div key={table} className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-bold text-slate-500">{table}</p>
                        <p className="text-2xl font-black text-slate-900">{String(count)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {envConfig.mode !== "DEMO" && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                    You are viewing {envConfig.mode === "LIVE_TEST" ? "Live Test" : envConfig.mode === "TEST_LIVE" ? "Test Live" : "Production"} analytics. Demo/Live Test/Test/Production analytics are stored separately.
                  </div>
                )}
              </div>
            )}

            {activeTab === "Organizations" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizations.map((org) => (
                    <button key={org.id} onClick={() => selectOrganization(org.id)} className={`rounded-2xl border p-5 text-left ${selectedOrgId === org.id ? "border-indigo-400 bg-indigo-50" : "border-slate-100 bg-white"}`}>
                      <p className="text-sm font-black text-slate-900">{org.name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">Plan: {org.plan || "Trial"} · {org.subscriptionStatus || "TRIAL_ACTIVE"}</p>
                      <p className="mt-1 text-xs text-slate-400">Credits: {org.aiCredits ?? org.creditsRemaining ?? 100} · Status: {org.status}</p>
                    </button>
                  ))}
                </div>
                {selectedOrganization && (
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900">Organization Plan</h3>
                    <p className="text-xs text-slate-500">Plans are assigned to organizations. Users inherit access through membership and role.</p>
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3">
                      <select value={planForm.plan} onChange={(e) => {
                        const credits = e.target.value === "Trial" ? 100 : e.target.value === "Starter" ? 500 : e.target.value === "Growth" ? 2500 : e.target.value === "Pro" ? 10000 : planForm.credits;
                        setPlanForm({ ...planForm, plan: e.target.value, credits, status: e.target.value === "Trial" ? "TRIAL_ACTIVE" : "ACTIVE" });
                      }} className="rounded-xl border-slate-200 text-sm font-bold">
                        {["Trial", "Starter", "Growth", "Pro", "Enterprise"].map((plan) => <option key={plan}>{plan}</option>)}
                      </select>
                      <input type="number" value={planForm.credits} onChange={(e) => setPlanForm({ ...planForm, credits: Number(e.target.value) })} className="rounded-xl border-slate-200 text-sm font-bold" />
                      <select value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })} className="rounded-xl border-slate-200 text-sm font-bold">
                        <option value="TRIAL_ACTIVE">Trial Active</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="TRIAL_ENDED">Trial Ended</option>
                      </select>
                      <input type="number" value={planForm.trialDays} onChange={(e) => setPlanForm({ ...planForm, trialDays: Number(e.target.value) })} className="rounded-xl border-slate-200 text-sm font-bold" placeholder="Trial days" />
                      <button onClick={updateOrganizationPlan} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">Save Plan</button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setPlanForm({ ...planForm, credits: 0 })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Reset Credits</button>
                      <button onClick={() => setPlanForm({ ...planForm, trialDays: planForm.trialDays + 7, status: "TRIAL_ACTIVE" })} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Extend Trial 7 Days</button>
                      <button onClick={() => setPlanForm({ ...planForm, status: "SUSPENDED", organizationStatus: "SUSPENDED" })} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Suspend Organization</button>
                      <button onClick={() => setPlanForm({ ...planForm, status: "ACTIVE", organizationStatus: "ACTIVE" })} className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">Activate Organization</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Data Management" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Reset Data</h3>
                  <p className="text-xs text-slate-500">Use before controlled live testing. Users, organizations, plan templates, Super Admin, and system configuration are kept unless Full Factory Reset is confirmed.</p>
                </div>
                <div className="rounded-3xl border border-red-100 bg-red-50 p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select value={resetForm.resetType} onChange={(e) => setResetForm({ ...resetForm, resetType: e.target.value, confirmation: "", confirmed: false })} className="rounded-xl border-red-200 text-sm font-bold">
                      <option value="demo">Reset Demo Data Only</option>
                      <option value="live-test">Reset Live Test Data</option>
                      <option value="test-live">Reset Test Live Data</option>
                      <option value="organization">Reset Organization Data</option>
                      <option value="factory">Full Factory Reset</option>
                    </select>
                    <select value={resetForm.organizationId} onChange={(e) => setResetForm({ ...resetForm, organizationId: e.target.value })} disabled={resetForm.resetType !== "organization" && resetForm.resetType !== "live-test"} className="rounded-xl border-red-200 text-sm font-bold disabled:opacity-50">
                      {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-xs font-semibold text-red-800">
                    Deletes selected leads/contacts, drafts, exports, analytics, uploaded batches, and selected optional logs/context. Keeps users, organizations, subscriptions, plans, and admin accounts.
                  </div>
                  <label className="flex items-center gap-3 text-xs font-bold text-red-800"><input type="checkbox" checked={resetForm.includeUsageLogs} onChange={(e) => setResetForm({ ...resetForm, includeUsageLogs: e.target.checked })} /> Also clear usage logs</label>
                  <label className="flex items-center gap-3 text-xs font-bold text-red-800"><input type="checkbox" checked={resetForm.includeBrain} onChange={(e) => setResetForm({ ...resetForm, includeBrain: e.target.checked })} /> Also clear Brain Center workspace data</label>
                  <label className="flex items-center gap-3 text-xs font-bold text-red-800"><input type="checkbox" checked={resetForm.confirmed} onChange={(e) => setResetForm({ ...resetForm, confirmed: e.target.checked })} /> I understand what will be deleted and kept</label>
                  <input value={resetForm.confirmation} onChange={(e) => setResetForm({ ...resetForm, confirmation: e.target.value })} placeholder={resetForm.resetType === "factory" ? "Type RESET ALL DATA" : resetForm.resetType === "live-test" ? "Type RESET LIVE TEST" : "Type RESET DATA"} className="w-full rounded-xl border-red-200 text-sm font-bold" />
                  <button onClick={resetData} className="rounded-xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">Final Reset</button>
                </div>
              </div>
            )}

            {/* Other tabs remain as placeholders for now */}
            {activeTab !== "Users" && activeTab !== "Organizations" && activeTab !== "Environment" && activeTab !== "Data Management" && activeTab !== "System Health" && (
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
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                       <input
                         value={selectedUser.phone || ""}
                         onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                         type="tel" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                       />
                    </div>
                    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedUser.requirePasswordReset)}
                        onChange={(e) => setSelectedUser({...selectedUser, requirePasswordReset: e.target.checked})}
                        className="h-5 w-5 rounded-lg text-indigo-600 border-slate-300"
                      />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Require password reset</span>
                    </label>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                    <textarea
                      value={selectedUser.notes || ""}
                      onChange={(e) => setSelectedUser({...selectedUser, notes: e.target.value})}
                      rows={3}
                      className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
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
