"use client";

import React, { useState } from "react";
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
  EyeOff
} from "lucide-react";

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
  { id: "orc", taskName: "ORC Intake and Validation Model", selectedModel: "gpt-4o-mini", purpose: "Parses uploaded records, determines campaign mode, checks DNC status.", temperature: 0.1, maxLength: 500, costMode: "Economy", active: true, fallbackModel: "claude-3-haiku", notes: "Requires strict JSON formatting. Fast model preferred." },
  { id: "sentinel", taskName: "SENTINEL Strategy Model", selectedModel: "gpt-4o", purpose: "Creates the strategic angle, upsell bridge, risk framing, and value outcome.", temperature: 0.7, maxLength: 800, costMode: "Quality", active: true, fallbackModel: "claude-3-5-sonnet", notes: "Needs high reasoning capability to avoid generic sales pitches." },
  { id: "scribe", taskName: "SCRIBE Writing Model", selectedModel: "gpt-4o", purpose: "Writes the actual email copy following PAS frameworks and rules.", temperature: 0.6, maxLength: 400, costMode: "Quality", active: true, fallbackModel: "claude-3-5-sonnet", notes: "Must strictly adhere to word counts and banned phrase lists." },
  { id: "lexi", taskName: "LEXI QA Model", selectedModel: "gpt-4o", purpose: "Scores the draft, checks spam risk, and forces revisions if score < 90.", temperature: 0.2, maxLength: 1000, costMode: "Quality", active: true, fallbackModel: "gpt-4-turbo", notes: "Needs high instruction-following to enforce the 90/100 threshold." },
  { id: "reply_class", taskName: "Reply Classification Model", selectedModel: "gpt-4o-mini", purpose: "Detects intent and sentiment from inbound customer replies.", temperature: 0.1, maxLength: 200, costMode: "Economy", active: true, fallbackModel: "claude-3-haiku", notes: "" },
  { id: "reply_draft", taskName: "Reply Drafting Model", selectedModel: "claude-3-5-sonnet", purpose: "Drafts the recommended response for the Reply Assistant.", temperature: 0.5, maxLength: 400, costMode: "Balanced", active: true, fallbackModel: "gpt-4o", notes: "" },
  { id: "knowledge", taskName: "Knowledge Search / Embedding Model", selectedModel: "text-embedding-3-small", purpose: "Retrieves relevant business knowledge for the strategy context.", temperature: 0, maxLength: 0, costMode: "Economy", active: true, fallbackModel: "", notes: "" },
  { id: "cleanup", taskName: "Data Cleanup Model", selectedModel: "gpt-4o-mini", purpose: "Standardizes messy input data before ORC validation.", temperature: 0.1, maxLength: 2000, costMode: "Economy", active: true, fallbackModel: "claude-3-haiku", notes: "" },
  { id: "summarization", taskName: "Summarization Model", selectedModel: "gpt-4o-mini", purpose: "Summarizes account notes and previous interactions for context.", temperature: 0.3, maxLength: 500, costMode: "Economy", active: true, fallbackModel: "claude-3-haiku", notes: "" },
];

export default function BrainCenterPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Usage & Billing");
  const [models, setModels] = useState<ModelConfig[]>(DEFAULT_MODELS);
  const [isSaving, setIsSaving] = useState(false);
  
  // API Connection State
  const [apiKey, setApiKey] = useState("sk_demo_9a8b7c6d5e4f3g2h1i0j");
  const [showKey, setShowKey] = useState(false);
  const [envMode, setEnvMode] = useState<"Demo" | "Test" | "Production">("Demo");
  const [useSampleData, setUseSampleData] = useState(true);
  const [useFallbackOutputs, setUseFallbackOutputs] = useState(true);

  const updateModel = (id: string, field: keyof ModelConfig, value: any) => {
    setModels(models.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

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
                {activeTab === "Model Settings" && "Map specific LLMs to discrete tasks to balance quality and economy."}
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
                {/* Cost Mode Legend */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                  <span className="font-semibold text-slate-700">Cost Modes:</span>
                  <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Quality (Best for reasoning)
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Balanced (Good for daily use)
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span> Economy (Fast, cheaper)
                  </div>
                </div>

                <div className="space-y-6">
                  {models.map((model) => (
                    <div key={model.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {/* Top Bar */}
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-slate-400" />
                            <h3 className="font-medium text-slate-900 text-sm">{model.taskName}</h3>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                            model.costMode === "Quality" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                            model.costMode === "Balanced" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-white text-slate-600 border-slate-200"
                          }`}>
                            {model.costMode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-500">Active</span>
                          <button 
                            onClick={() => updateModel(model.id, "active", !model.active)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${model.active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${model.active ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Column 1: Model Selection */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Selected Model</label>
                            <select 
                              value={model.selectedModel}
                              onChange={(e) => updateModel(model.id, "selectedModel", e.target.value)}
                              className="w-full text-sm rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                              <option value="gpt-4o">GPT-4o</option>
                              <option value="gpt-4o-mini">GPT-4o Mini</option>
                              <option value="gpt-4-turbo">GPT-4 Turbo</option>
                              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                              <option value="claude-3-opus">Claude 3 Opus</option>
                              <option value="claude-3-haiku">Claude 3 Haiku</option>
                              <option value="text-embedding-3-small">text-embedding-3-small</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Fallback Model</label>
                            <input 
                              type="text" 
                              value={model.fallbackModel}
                              onChange={(e) => updateModel(model.id, "fallbackModel", e.target.value)}
                              placeholder="e.g. claude-3-haiku"
                              className="w-full text-sm rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder:text-slate-300"
                            />
                          </div>
                        </div>

                        {/* Column 2: Parameters */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-xs font-medium text-slate-500">Temperature / Creativity</label>
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
                            <label className="block text-xs font-medium text-slate-500 mb-1">Max Output Length (Tokens)</label>
                            <input 
                              type="number" 
                              value={model.maxLength}
                              onChange={(e) => updateModel(model.id, "maxLength", parseInt(e.target.value) || 0)}
                              className="w-full text-sm rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            />
                          </div>
                        </div>

                        {/* Column 3: Meta */}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Plan */}
                  <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Current Plan: Growth</h3>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">Active Subscription</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 max-w-md">You are currently on the Growth tier, giving your organization access to the full 4-role Brain and 2,500 AI credits per month.</p>
                    <div className="flex gap-4">
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Upgrade to Pro</button>
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Buy Extra Credits</button>
                    </div>
                  </div>

                  {/* AI Credits */}
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
                      <p className="text-xs text-slate-500 mt-2">Resets on June 1st</p>
                    </div>
                  </div>
                </div>

                {/* Usage Metrics */}
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
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <Zap className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">How Credits Work</p>
                    <p className="text-blue-700/80">Credits are deducted only after a successful generation. A full ORC → SENTINEL → SCRIBE → LEXI generation costs 10 AI Credits. Failed calls do not deduct credits.</p>
                  </div>
                </div>
              </div>
            ) : activeTab === "API Connection" ? (
              <div className="space-y-8">
                {/* Status Bar */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-800">Brain API Connected</h3>
                      <p className="text-xs text-emerald-600">All systems operational. Latency: 124ms</p>
                    </div>
                  </div>
                  <span className="bg-white border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                    {envMode} Environment
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Col: Auth */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-semibold text-slate-900 mb-1">API Authentication</h3>
                      <p className="text-sm text-slate-500 mb-4">Manage your organization's API credentials securely.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Organization ID</label>
                      <input type="text" disabled value="org_c92jd84kl2" className="w-full text-sm rounded-lg border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Brain API Key</label>
                      <div className="relative">
                        <input 
                          type={showKey ? "text" : "password"} 
                          value={apiKey} 
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full text-sm rounded-lg border-slate-200 pr-10 focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                        <button 
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Save Key</button>
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Test Connection
                      </button>
                    </div>
                  </div>

                  {/* Right Col: Demo Controls */}
                  <div className="space-y-6 bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <div>
                      <h3 className="text-md font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        Demo & Hybrid Controls
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">Configure fallback data sets to ensure successful demonstrations even without internet.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Environment Mode</label>
                        <select 
                          value={envMode} 
                          onChange={(e) => setEnvMode(e.target.value as any)}
                          className="w-full text-sm rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                          <option value="Demo">Demo (Hybrid Fallbacks)</option>
                          <option value="Test">Test (Sandbox API)</option>
                          <option value="Production">Production (Live CRM & API)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Use Sample Leads</p>
                          <p className="text-xs text-slate-500">Inject sample accountant campaigns.</p>
                        </div>
                        <button onClick={() => setUseSampleData(!useSampleData)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${useSampleData ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useSampleData ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Use Fallback Outputs</p>
                          <p className="text-xs text-slate-500">If live API fails, load cached demo drafts.</p>
                        </div>
                        <button onClick={() => setUseFallbackOutputs(!useFallbackOutputs)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${useFallbackOutputs ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useFallbackOutputs ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
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
