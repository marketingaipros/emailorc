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
  CheckCircle2
} from "lucide-react";

type Tab = 
  | "Business Knowledge" 
  | "App Mindset" 
  | "Offer Library" 
  | "Campaign Playbooks" 
  | "Decision Rules" 
  | "Model Settings" 
  | "Learning Log" 
  | "Learn Mode";

const TABS: { name: Tab; icon: React.ReactNode }[] = [
  { name: "Business Knowledge", icon: <Briefcase className="h-4 w-4" /> },
  { name: "App Mindset", icon: <Lightbulb className="h-4 w-4" /> },
  { name: "Offer Library", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Campaign Playbooks", icon: <ScrollText className="h-4 w-4" /> },
  { name: "Decision Rules", icon: <ShieldAlert className="h-4 w-4" /> },
  { name: "Model Settings", icon: <Cpu className="h-4 w-4" /> },
  { name: "Learning Log", icon: <History className="h-4 w-4" /> },
  { name: "Learn Mode", icon: <GraduationCap className="h-4 w-4" /> },
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
  const [activeTab, setActiveTab] = useState<Tab>("Model Settings");
  const [models, setModels] = useState<ModelConfig[]>(DEFAULT_MODELS);
  const [isSaving, setIsSaving] = useState(false);

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
                {activeTab !== "Model Settings" && "Configure intelligence parameters for the AI generation workflow."}
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
