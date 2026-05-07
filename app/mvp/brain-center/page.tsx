"use client";

import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Settings2, 
  Cpu, 
  ShieldAlert, 
  BookOpen, 
  Briefcase, 
  Lightbulb, 
  ScrollText, 
  History, 
  GraduationCap,
  Save,
  CheckCircle2,
  CreditCard,
  Link2,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  ListTodo,
  PlusCircle,
  Clock,
  Settings,
  ChevronRight,
  ShieldCheck,
  Globe,
  ArrowRight,
  Info,
  Download
} from "lucide-react";
import Link from "next/link";

type Tab = 
  | "Business Knowledge" 
  | "App Mindset" 
  | "Offer Library" 
  | "Campaign Playbooks" 
  | "Decision Rules" 
  | "Model Settings" 
  | "Learning Log" 
  | "Learn Mode"
  | "API Connection"
  | "Usage & Billing";

const TABS: { name: Tab; icon: React.ReactNode }[] = [
  { name: "Business Knowledge", icon: <Briefcase className="h-4 w-4" /> },
  { name: "App Mindset", icon: <Lightbulb className="h-4 w-4" /> },
  { name: "Offer Library", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Campaign Playbooks", icon: <ScrollText className="h-4 w-4" /> },
  { name: "Decision Rules", icon: <ShieldAlert className="h-4 w-4" /> },
  { name: "Model Settings", icon: <Cpu className="h-4 w-4" /> },
  { name: "Learning Log", icon: <History className="h-4 w-4" /> },
  { name: "Learn Mode", icon: <GraduationCap className="h-4 w-4" /> },
  { name: "API Connection", icon: <Link2 className="h-4 w-4" /> },
  { name: "Usage & Billing", icon: <CreditCard className="h-4 w-4" /> },
];

interface ModelConfig {
  id: string;
  taskName: string;
  selectedModel: string;
  purpose: string;
  temperature: number;
  maxLength: number;
  costMode: "Quality" | "Balanced" | "Economy";
  active: boolean;
  fallbackModel: string;
  notes: string;
}

const DEFAULT_MODELS: ModelConfig[] = [
  { id: "orc", taskName: "ORC Intake and Validation Model", selectedModel: "gpt-5-nano", purpose: "Parses uploaded records, determines campaign mode, checks DNC status.", temperature: 0.1, maxLength: 500, costMode: "Economy", active: true, fallbackModel: "gpt-5-mini", notes: "Requires strict JSON formatting. Fast model preferred." },
  { id: "sentinel", taskName: "SENTINEL Strategy Model", selectedModel: "gpt-5-mini", purpose: "Creates the strategic angle, upsell bridge, risk framing, and value outcome.", temperature: 0.7, maxLength: 800, costMode: "Quality", active: true, fallbackModel: "gpt-5.1", notes: "Needs high reasoning capability to avoid generic sales pitches." },
  { id: "scribe", taskName: "SCRIBE Writing Model", selectedModel: "gpt-5-mini", purpose: "Writes the actual email copy following PAS frameworks and rules.", temperature: 0.6, maxLength: 400, costMode: "Quality", active: true, fallbackModel: "gpt-5.1", notes: "Must strictly adhere to word counts and banned phrase lists." },
  { id: "lexi", taskName: "LEXI QA Model", selectedModel: "gpt-5.1", purpose: "Scores the draft, checks spam risk, and forces revisions if score < 90.", temperature: 0.2, maxLength: 1000, costMode: "Quality", active: true, fallbackModel: "gpt-5.4-mini", notes: "Needs high instruction-following to enforce the 90/100 threshold." },
  { id: "reply_class", taskName: "Reply Classification Model", selectedModel: "gpt-5-nano", purpose: "Detects intent and sentiment from inbound customer replies.", temperature: 0.1, maxLength: 200, costMode: "Economy", active: true, fallbackModel: "gpt-5-mini", notes: "" },
  { id: "reply_draft", taskName: "Reply Drafting Model", selectedModel: "gpt-5-mini", purpose: "Drafts the recommended response for the Reply Assistant.", temperature: 0.5, maxLength: 400, costMode: "Balanced", active: true, fallbackModel: "gpt-5.1", notes: "" },
  { id: "knowledge", taskName: "Knowledge Search / Embedding Model", selectedModel: "text-embedding-3-small", purpose: "Retrieves relevant business knowledge for the strategy context.", temperature: 0, maxLength: 0, costMode: "Economy", active: true, fallbackModel: "", notes: "" },
  { id: "cleanup", taskName: "Data Cleanup Model", selectedModel: "gpt-5-nano", purpose: "Standardizes messy input data before ORC validation.", temperature: 0.1, maxLength: 2000, costMode: "Economy", active: true, fallbackModel: "gpt-5-mini", notes: "" },
  { id: "summarization", taskName: "Summarization Model", selectedModel: "gpt-5-mini", purpose: "Summarizes account notes and previous interactions for context.", temperature: 0.3, maxLength: 500, costMode: "Economy", active: true, fallbackModel: "gpt-5-nano", notes: "" },
];

type ModelMode = "Economy" | "Balanced" | "Quality" | "Enterprise";

type UsageSubTab = "Current Plan" | "Credit Rules" | "Plan Builder" | "Trial Settings" | "Usage Logs";

export default function BrainCenterPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Usage & Billing");
  const [models, setModels] = useState<ModelConfig[]>(DEFAULT_MODELS);
  const [isSaving, setIsSaving] = useState(false);
  
  // API Connection State
  const [apiKey, setApiKey] = useState("sk_demo_9a8b7c6d5e4f3g2h1i0j");
  const [showKey, setShowKey] = useState(false);
  const [envConfig, setEnvConfig] = useState<any>({
    mode: "DEMO",
    useLiveBrainApi: false,
    useSampleData: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("envConfig");
    if (saved) setEnvConfig(JSON.parse(saved));
  }, []);

  // Usage & Billing Sub-tabs
  const [activeUsageSubTab, setActiveUsageSubTab] = useState<UsageSubTab>("Current Plan");

  // Model Settings Provider State
  const [modelProvider, setModelProvider] = useState("OpenRouter");
  const [costTrackingMode, setCostTrackingMode] = useState(true);
  const [modelMode, setModelMode] = useState<ModelMode>("Balanced");

  // Connection Status State
  const [connectionStatus, setConnectionStatus] = useState<"Not Connected" | "Connected" | "Error" | "Invalid API Key" | "Provider Unavailable" | "Model Not Available">("Not Connected");
  const [lastTested, setLastTested] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(true);

  const [isSyncing, setIsSyncing] = useState(false);

  function handleSaveApiKey() {
    const trimmed = apiKey.trim();
    const validDemoKey = trimmed === "sk_demo_9a8b7c6d5e4f3g2h1i0j";
    const validOpenRouterShape = trimmed.startsWith("sk-or-v1-") && trimmed.length >= 48;

    if (!validDemoKey && !validOpenRouterShape) {
      setApiKeySaved(false);
      setConnectionStatus("Invalid API Key");
      setLastTested(new Date().toLocaleString());
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setApiKey(trimmed);
      setIsSaving(false);
      setApiKeySaved(true);
      setConnectionStatus("Not Connected");
    }, 800);
  }

  async function handleTestConnection() {
    if (!apiKeySaved) return;
    setIsTesting(true);
    try {
      const response = await fetch('/api/brain/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: modelProvider,
          environment: envConfig.mode === "DEMO" ? "Demo" : envConfig.mode === "TEST_LIVE" ? "Test Live" : "Production",
          selected_model_mode: modelMode,
          api_key: apiKey,
        })
      });
      const data = await response.json();
      if (data.status === "connected") {
        setConnectionStatus("Connected");
      } else if (data.status === "invalid_api_key") {
        setConnectionStatus("Invalid API Key");
      } else {
        setConnectionStatus("Error");
      }
      setLastTested(new Date().toLocaleString());
    } catch (err) {
      setConnectionStatus("Provider Unavailable");
    } finally {
      setIsTesting(false);
    }
  }

  function applyModelMode(mode: ModelMode) {
    setModelMode(mode);
    if (mode === "Balanced") {
      setModels(prev => prev.map(m => {
        let selectedModel = m.selectedModel;
        if (m.id === "orc") selectedModel = "gpt-5-nano";
        if (m.id === "sentinel") selectedModel = "gpt-5-mini";
        if (m.id === "scribe") selectedModel = "gpt-5-mini";
        if (m.id === "lexi") selectedModel = "gpt-5.1";
        if (m.id === "reply_class") selectedModel = "gpt-5-nano";
        if (m.id === "reply_draft") selectedModel = "gpt-5-mini";
        if (m.id === "cleanup") selectedModel = "gpt-5-nano";
        if (m.id === "summarization") selectedModel = "gpt-5-mini";
        return { ...m, selectedModel };
      }));
    }
    // Logic for other modes would go here
  }

  function handleSyncModels() {
    setIsSyncing(true);
    // Simulate API call to fetch latest model definitions
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  }

  function updateModel(id: string, field: keyof ModelConfig, value: any) {
    setModels(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  function handleSave() {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <Brain className="h-6 w-6 text-indigo-600" />
          Brain Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage the core intelligence, writing standards, and logic models that power the 4-role AI engine.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                activeTab === tab.name 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={activeTab === tab.name ? "text-indigo-600" : "text-slate-400"}>
                {tab.icon}
              </span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[600px] overflow-hidden">
          
          {/* Header of Content Area */}
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{activeTab}</h2>
              <p className="text-sm text-slate-500">
                {activeTab === "Model Settings" && "Map specific GPT-5 series LLMs to discrete tasks to balance quality and economy."}
                {activeTab === "Usage & Billing" && "Manage your AI Credits, subscription tier, and usage metrics."}
                {activeTab === "API Connection" && "Configure your Brain API environment, keys, and hybrid demo fallback settings."}
                {!["Model Settings", "Usage & Billing", "API Connection"].includes(activeTab) && "Configure intelligence parameters for the AI generation workflow."}
              </p>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              {isSaving ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saved" : "Save Changes"}
            </button>
          </div>

          <div className="p-6">
            {activeTab === "Model Settings" ? (
              <div className="space-y-8">
                {/* Admin Note for GPT-5 */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-800">Admin Routing Note</h3>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Use **GPT-5 nano** for low-cost utility tasks, **GPT-5 mini** for most production email work, and **GPT-5.1** or **GPT-5.4 mini** for premium QA and final drafts.
                    </p>
                  </div>
                </div>

                {/* Model Mode Selection */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Model Routing Mode</h3>
                      <p className="text-xs text-slate-500">Auto-assign models based on your performance and cost requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Mode:</label>
                    <select 
                      value={modelMode}
                      onChange={(e) => applyModelMode(e.target.value as ModelMode)}
                      className="bg-slate-50 border-slate-200 text-sm rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-700"
                    >
                      <option value="Economy">Economy</option>
                      <option value="Balanced">Balanced</option>
                      <option value="Quality">Quality</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                {/* Provider Selection */}
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl shadow-sm text-white">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-sm font-semibold">Model Provider Gateway</p>
                      <p className="text-xs text-slate-400">All models are securely routed through our Brain API via {modelProvider}.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={modelProvider}
                      onChange={(e) => setModelProvider(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-xs rounded-lg px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="OpenRouter">OpenRouter</option>
                      <option value="Anthropic">Anthropic</option>
                      <option value="OpenAI">OpenAI</option>
                    </select>
                    <button 
                      onClick={handleSyncModels}
                      disabled={isSyncing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} /> 
                      {isSyncing ? "Syncing..." : "Sync Models"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {models.map((model) => (
                    <div key={model.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-slate-400" />
                          <h3 className="text-sm font-semibold text-slate-900">{model.taskName}</h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          model.costMode === "Quality" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          model.costMode === "Balanced" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                          "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}>
                          {model.costMode}
                        </span>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Selected Model</label>
                            <select 
                              value={model.selectedModel}
                              onChange={(e) => updateModel(model.id, "selectedModel", e.target.value)}
                              className={`w-full text-sm rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-white ${
                                (model.selectedModel === "gpt-5.1" && connectionStatus === "Connected") ? "border-amber-300 text-amber-700" : 
                                (model.selectedModel === "gpt-5-mini" && connectionStatus === "Error") ? "border-red-300 text-red-700" : ""
                              }`}
                            >
                              <option value="gpt-5-nano">GPT-5 Nano</option>
                              <option value="gpt-5-mini">GPT-5 Mini</option>
                              <option value="gpt-5.1">GPT-5.1</option>
                              <option value="gpt-5.4-mini">GPT-5.4 Mini</option>
                              <option value="text-embedding-3-small">Embeddings 3 Small</option>
                            </select>
                            {model.selectedModel === "gpt-5.1" && connectionStatus === "Connected" && (
                              <p className="text-[10px] text-amber-600 mt-1 font-medium flex items-center gap-1">
                                <Info className="h-3 w-3" /> Fallback to GPT-5 Mini active
                              </p>
                            )}
                            {model.selectedModel === "gpt-5-mini" && connectionStatus === "Error" && (
                              <p className="text-[10px] text-red-600 mt-1 font-bold">
                                Selected model unavailable. Please choose another model.
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Fallback Model</label>
                            <select 
                              value={model.fallbackModel}
                              onChange={(e) => updateModel(model.id, "fallbackModel", e.target.value)}
                              className="w-full text-sm rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                              <option value="">None</option>
                              <option value="gpt-5-nano">GPT-5 Nano</option>
                              <option value="gpt-5-mini">GPT-5 Mini</option>
                              <option value="gpt-5.1">GPT-5.1</option>
                              <option value="gpt-5.4-mini">GPT-5.4 Mini</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <label className="block text-xs font-medium text-slate-500">Temperature</label>
                              <span className="text-xs text-slate-900 font-medium">{model.temperature}</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" max="1" step="0.1"
                              value={model.temperature}
                              onChange={(e) => updateModel(model.id, "temperature", parseFloat(e.target.value))}
                              className="w-full accent-indigo-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Max Length</label>
                            <input 
                              type="number" 
                              value={model.maxLength}
                              onChange={(e) => updateModel(model.id, "maxLength", parseInt(e.target.value) || 0)}
                              className="w-full text-sm rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Purpose / Instructions</label>
                            <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 min-h-[44px]">
                              {model.purpose}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Internal Notes</label>
                            <input 
                              type="text" 
                              value={model.notes}
                              onChange={(e) => updateModel(model.id, "notes", e.target.value)}
                              placeholder="Add admin notes..."
                              className="w-full text-xs rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder:text-slate-300"
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === "Usage & Billing" ? (
              <div className="space-y-8">
                {/* Sub-tabs for Usage & Billing */}
                <div className="flex items-center gap-1 border-b border-slate-100 pb-px">
                  {(["Current Plan", "Credit Rules", "Plan Builder", "Trial Settings", "Usage Logs"] as UsageSubTab[]).map((subTab) => (
                    <button
                      key={subTab}
                      onClick={() => setActiveUsageSubTab(subTab)}
                      className={`px-4 py-2 text-sm font-medium transition-all relative ${
                        activeUsageSubTab === subTab 
                          ? "text-indigo-600" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {subTab}
                      {activeUsageSubTab === subTab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {activeUsageSubTab === "Current Plan" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-900">Current Plan: Growth</h3>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">Active Subscription</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Organization</p>
                            <p className="text-sm font-medium text-slate-700">Acme Revenue Ops</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Billing Reset</p>
                            <p className="text-sm font-medium text-slate-700">June 1, 2026</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 max-w-md">You are currently on the Growth tier, giving your organization access to the full 4-role Brain and 2,500 AI credits per month.</p>
                        <div className="flex gap-4">
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Upgrade to Pro</button>
                          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Buy Extra Credits</button>
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-2xl p-6 shadow-sm text-white flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-slate-400">AI Credits Remaining</h3>
                          <p className="text-4xl font-bold mt-2">1,832</p>
                        </div>
                        <div className="space-y-2 mt-6">
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '26%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>668 used</span>
                            <span>2,500 total</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-semibold text-slate-900 mb-4">Usage This Month</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Drafts Generated", value: "324", cost: "5 credits ea." },
                          { label: "QA Reviews", value: "348", cost: "2 credits ea." },
                          { label: "Replies Classified", value: "91", cost: "2 credits ea." },
                          { label: "Knowledge Searches", value: "112", cost: "1 credit ea." },
                        ].map((stat, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{stat.cost}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeUsageSubTab === "Credit Rules" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-md font-semibold text-slate-900">AI Credit Pricing Rules</h3>
                        <p className="text-sm text-slate-500">Define how many credits are deducted for each automated action.</p>
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                        <PlusCircle className="h-4 w-4" /> Add Rule
                      </button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="px-6 py-3">Action Name</th>
                            <th className="px-6 py-3">Credit Cost</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Notes</th>
                            <th className="px-6 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { name: "Validate 1 record (ORC)", cost: 1, status: "Active", notes: "Applied to all tiers" },
                            { name: "Generate Strategy (SENTINEL)", cost: 2, status: "Active", notes: "High reasoning model used" },
                            { name: "Generate 1 Draft (SCRIBE)", cost: 5, status: "Active", notes: "Default email generation" },
                            { name: "QA Score 1 Draft (LEXI)", cost: 2, status: "Active", notes: "Per validation run" },
                            { name: "Revise 1 Draft (LEXI Loop)", cost: 3, status: "Active", notes: "Deducted on each revision" },
                            { name: "Full Production Workflow", cost: 10, status: "Active", notes: "ORC + SENTINEL + SCRIBE + LEXI" },
                          ].map((rule, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-medium text-slate-900">{rule.name}</td>
                              <td className="px-6 py-4">
                                <input type="number" defaultValue={rule.cost} className="w-16 text-sm rounded-md border-slate-200 py-1" />
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">{rule.status}</span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-xs">{rule.notes}</td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-slate-600 transition-colors"><Settings className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeUsageSubTab === "Plan Builder" && (
                  <div className="space-y-6 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100 text-indigo-500">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Build Your Subscription Tiers</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">Create Trial, Starter, Growth, and Pro plans with specific credit allowances and feature gating.</p>
                    <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all">Create New Plan</button>
                  </div>
                )}

                {activeUsageSubTab === "Trial Settings" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-semibold text-slate-900">Trial Configuration</h3>
                        <p className="text-sm text-slate-500">Manage rules for new organization sign-ups.</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div>
                            <p className="text-sm font-medium text-slate-900">Automatic Free Trial</p>
                            <p className="text-xs text-slate-500">Grant new accounts trial credits instantly.</p>
                          </div>
                          <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-indigo-600">
                            <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <h3 className="text-md font-semibold text-slate-900 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        Trial Restrictions
                      </h3>
                      <div className="space-y-3">
                         {[
                           { label: "Require Credit Card", enabled: false },
                           { label: "Allow Exports", enabled: true },
                           { label: "Apply Export Watermark", enabled: true },
                           { label: "Restrict to Demo Data Only", enabled: false },
                         ].map((item, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">{item.label}</span>
                              <button className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.enabled ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                                <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeUsageSubTab === "Usage Logs" && (
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-bold text-slate-900">Brain API Audit Log</h3>
                        <div className="flex gap-2">
                           <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                             <Download className="h-3.5 w-3.5" /> Export CSV
                           </button>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                         <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                              <tr>
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">Organization</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Action / Task</th>
                                <th className="px-4 py-3">Model</th>
                                <th className="px-4 py-3">Tokens (P/O)</th>
                                <th className="px-4 py-3">API Cost</th>
                                <th className="px-4 py-3">Credits</th>
                                <th className="px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                               {[
                                 { time: "2026-05-06 10:12:04", org: "Acme", user: "j.smith", action: "SENTINEL Strategy", cost: "-2", model: "GPT-5.1", tokens: "1,240 / 480", api: "$0.014", status: "Success" },
                                 { time: "2026-05-06 10:10:55", org: "Acme", user: "j.smith", action: "SCRIBE Writing", cost: "-5", model: "GPT-5-mini", tokens: "850 / 620", api: "$0.006", status: "Success" },
                                 { time: "2026-05-06 09:45:12", org: "Globex", user: "h.simpson", action: "LEXI QA", cost: "-2", model: "GPT-5.1", tokens: "2,100 / 150", api: "$0.021", status: "Success" },
                                 { time: "2026-05-06 09:30:01", org: "Acme", user: "j.smith", action: "ORC Validation", cost: "-1", model: "GPT-5-nano", tokens: "4,200 / 200", api: "$0.001", status: "Success" },
                               ].map((log, i) => (
                                 <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-400 font-mono">{log.time.split(' ')[1]}</td>
                                    <td className="px-4 py-3 text-slate-600 font-bold">{log.org}</td>
                                    <td className="px-4 py-3 text-slate-500">{log.user}</td>
                                    <td className="px-4 py-3 text-slate-900 font-bold">{log.action}</td>
                                    <td className="px-4 py-3 text-indigo-600">{log.model}</td>
                                    <td className="px-4 py-3 text-slate-500 font-mono">{log.tokens}</td>
                                    <td className="px-4 py-3 text-emerald-600 font-bold">{log.api}</td>
                                    <td className="px-4 py-3 font-black text-amber-600">{log.cost}</td>
                                    <td className="px-4 py-3">
                                       <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${log.status.includes("Failed") ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                                          {log.status}
                                       </span>
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Showing last 50 events</p>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">View All Audit Logs →</button>
                      </div>
                   </div>
                )}
              </div>
            ) : activeTab === "API Connection" ? (
              <div className="space-y-8">
                {/* Status Bar */}
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`h-3 w-3 rounded-full animate-pulse ${
                      connectionStatus === "Connected" ? "bg-emerald-500" : connectionStatus === "Not Connected" ? "bg-slate-500" : "bg-red-500"
                    }`}></div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">
                        Status: {connectionStatus}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {lastTested ? `Last Tested: ${lastTested}` : "Never tested"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    <button 
                      onClick={handleTestConnection}
                      disabled={isTesting || !apiKeySaved}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 disabled:opacity-50"
                    >
                      {isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                      Test Connection
                    </button>
                    <Link 
                      href="/mvp/admin"
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Manage Environment
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-semibold text-slate-900 mb-1">API Authentication</h3>
                      <p className="text-sm text-slate-500 mb-4">Manage your organization's API credentials securely.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">OpenRouter API Key</label>
                      <div className="relative">
                        <input 
                          type={showKey ? "text" : "password"} 
                          value={apiKeySaved && !showKey ? "••••••••••••••••" : apiKey} 
                          onChange={(e) => {
                            setApiKey(e.target.value);
                            setApiKeySaved(false);
                          }}
                          className="w-full text-sm rounded-lg border-slate-200 pr-10 focus:ring-indigo-500 focus:border-indigo-500 font-mono" 
                        />
                        <button 
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={handleSaveApiKey}
                          className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Save API Key
                        </button>
                      </div>
                      
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Provider:</span>
                            <span className="font-bold text-slate-700">OpenRouter</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Environment:</span>
                            <span className="font-bold text-indigo-600">{envConfig.mode === "DEMO" ? "Demo" : envConfig.mode === "TEST_LIVE" ? "Test Live" : "Production"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Model Mode:</span>
                            <span className="font-bold text-slate-700">{modelMode}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Available Models:</span>
                            <span className="font-bold text-emerald-600">Yes (Loaded)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <div>
                      <h3 className="text-md font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-600" />
                        Logic Guards
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">Current logic and data constraints for {envConfig.mode}.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Live Brain API</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${envConfig.useLiveBrainApi ? 'text-emerald-600' : 'text-slate-400'}`}>
                           {envConfig.useLiveBrainApi ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Sample Data Injection</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${envConfig.useSampleData ? 'text-indigo-600' : 'text-slate-400'}`}>
                           {envConfig.useSampleData ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Credit Deduction</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${envConfig.creditMode === 'REAL' ? 'text-red-600' : 'text-amber-600'}`}>
                           {envConfig.creditMode} Mode
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-center">
                         <Link href="/mvp/admin" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                            Modify Environment in Admin Console <ArrowRight className="h-3 w-3" />
                         </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                  <Brain className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Module Under Construction</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">
                    The <strong>{activeTab}</strong> interface is currently being built out. Check back soon.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
