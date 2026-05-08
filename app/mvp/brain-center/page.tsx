"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
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
  Download,
  Send,
  MessageSquare,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useNotice } from "@/components/notice/NoticeProvider";
import {
  APP_MINDSET_KEY,
  BUSINESS_KNOWLEDGE_KEY,
  DEFAULT_APP_MINDSET,
  DEFAULT_BUSINESS_KNOWLEDGE,
  DEFAULT_DEVELOPER_KNOWLEDGE,
  DEFAULT_OFFERS,
  DEVELOPER_KNOWLEDGE_KEY,
  OFFER_LIBRARY_KEY,
  contextStatus,
  loadJson,
  loadJsonArray,
  type ApprovalStatus,
  type AppMindset,
  type BusinessKnowledge,
  type DeveloperKnowledgeItem,
  type OfferItem,
} from "@/lib/brain-context";

type Tab = 
  | "Business Knowledge" 
  | "App Mindset" 
  | "Offer Library" 
  | "Campaign Playbooks" 
  | "Decision Rules" 
  | "Model Settings" 
  | "Learning Log" 
  | "Learn Mode"
  | "Developer Knowledge"
  | "API Connection"
  | "Model Test Chat"
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
  { name: "Developer Knowledge", icon: <Database className="h-4 w-4" /> },
  { name: "API Connection", icon: <Link2 className="h-4 w-4" /> },
  { name: "Model Test Chat", icon: <MessageSquare className="h-4 w-4" /> },
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

type ModelMode = "Economy" | "Balanced" | "Quality" | "Enterprise";

type UsageSubTab = "Current Plan" | "Credit Rules" | "Plan Builder" | "Trial Settings" | "Usage Logs";

const GPT5_OPTIONS = [
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-5.1", label: "GPT-5.1" },
];

const MODEL_MODE_ROUTING: Record<ModelMode, Record<string, string>> = {
  Economy: {
    orc: "openai/gpt-5-nano",
    sentinel: "openai/gpt-5-mini",
    scribe: "openai/gpt-5-mini",
    lexi: "openai/gpt-5-mini",
    reply_class: "openai/gpt-5-nano",
    reply_draft: "openai/gpt-5-mini",
    cleanup: "openai/gpt-5-nano",
    summarization: "openai/gpt-5-nano",
  },
  Balanced: {
    orc: "openai/gpt-5-nano",
    sentinel: "openai/gpt-5-mini",
    scribe: "openai/gpt-5-mini",
    lexi: "openai/gpt-5.1",
    reply_class: "openai/gpt-5-nano",
    reply_draft: "openai/gpt-5-mini",
    cleanup: "openai/gpt-5-nano",
    summarization: "openai/gpt-5-mini",
  },
  Quality: {
    orc: "openai/gpt-5-mini",
    sentinel: "openai/gpt-5.1",
    scribe: "openai/gpt-5.1",
    lexi: "openai/gpt-5.1",
    reply_class: "openai/gpt-5-nano",
    reply_draft: "openai/gpt-5.1",
    cleanup: "openai/gpt-5-nano",
    summarization: "openai/gpt-5-mini",
  },
  Enterprise: {
    orc: "openai/gpt-5-mini",
    sentinel: "openai/gpt-5.1",
    scribe: "openai/gpt-5.1",
    lexi: "openai/gpt-5.1",
    reply_class: "openai/gpt-5-nano",
    reply_draft: "openai/gpt-5.1",
    cleanup: "openai/gpt-5-nano",
    summarization: "openai/gpt-5-mini",
  },
};

const MODEL_FALLBACKS: Record<string, string> = {
  "openai/gpt-5.1": "openai/gpt-5-mini",
  "openai/gpt-5-mini": "openai/gpt-5-nano",
  "openai/gpt-5-nano": "",
};

function fallbackFor(model: string) {
  return MODEL_FALLBACKS[model] ?? "";
}

const DEFAULT_MODELS: ModelConfig[] = [
  { id: "orc", taskName: "ORC Intake and Validation Model", selectedModel: "openai/gpt-5-nano", purpose: "Parses uploaded records, determines campaign mode, checks DNC status.", temperature: 0.1, maxLength: 500, costMode: "Economy", active: true, fallbackModel: "openai/gpt-5-mini", notes: "Requires strict JSON formatting. Fast model preferred." },
  { id: "sentinel", taskName: "SENTINEL Strategy Model", selectedModel: "openai/gpt-5-mini", purpose: "Creates the strategic angle, upsell bridge, risk framing, and value outcome.", temperature: 0.7, maxLength: 800, costMode: "Quality", active: true, fallbackModel: "openai/gpt-5-nano", notes: "Needs high reasoning capability to avoid generic sales pitches." },
  { id: "scribe", taskName: "SCRIBE Writing Model", selectedModel: "openai/gpt-5-mini", purpose: "Writes the actual email copy following PAS frameworks and rules.", temperature: 0.6, maxLength: 400, costMode: "Quality", active: true, fallbackModel: "openai/gpt-5-nano", notes: "Must strictly adhere to word counts and banned phrase lists." },
  { id: "lexi", taskName: "LEXI QA Model", selectedModel: "openai/gpt-5.1", purpose: "Scores the draft, checks spam risk, and forces revisions if score < 90.", temperature: 0.2, maxLength: 1000, costMode: "Quality", active: true, fallbackModel: "openai/gpt-5-mini", notes: "Needs high instruction-following to enforce the 90/100 threshold." },
  { id: "reply_class", taskName: "Reply Classification Model", selectedModel: "openai/gpt-5-nano", purpose: "Detects intent and sentiment from inbound customer replies.", temperature: 0.1, maxLength: 200, costMode: "Economy", active: true, fallbackModel: "", notes: "" },
  { id: "reply_draft", taskName: "Reply Drafting Model", selectedModel: "openai/gpt-5-mini", purpose: "Drafts the recommended response for the Reply Assistant.", temperature: 0.5, maxLength: 400, costMode: "Balanced", active: true, fallbackModel: "openai/gpt-5-nano", notes: "" },
  { id: "knowledge", taskName: "Knowledge Search / Embedding Model", selectedModel: "text-embedding-3-small", purpose: "Retrieves relevant business knowledge for the strategy context.", temperature: 0, maxLength: 0, costMode: "Economy", active: true, fallbackModel: "", notes: "" },
  { id: "cleanup", taskName: "Data Cleanup Model", selectedModel: "openai/gpt-5-nano", purpose: "Standardizes messy input data before ORC validation.", temperature: 0.1, maxLength: 2000, costMode: "Economy", active: true, fallbackModel: "", notes: "" },
  { id: "summarization", taskName: "Summarization Model", selectedModel: "openai/gpt-5-mini", purpose: "Summarizes account notes and previous interactions for context.", temperature: 0.3, maxLength: 500, costMode: "Economy", active: true, fallbackModel: "openai/gpt-5-nano", notes: "" },
];

const BUSINESS_KNOWLEDGE_FIELDS = [
  ["companyName", "Company Name"], ["website", "Website"], ["industry", "Industry"], ["businessDescription", "Business Description"],
  ["productsServices", "Products / Services"], ["targetCustomers", "Target Customers"], ["idealCustomerProfile", "Ideal Customer Profile"], ["customerPainPoints", "Customer Pain Points"],
  ["mainValueProposition", "Main Value Proposition"], ["competitiveAdvantages", "Competitive Advantages"], ["approvedPositioningStatement", "Approved Positioning Statement"], ["approvedClaims", "Approved Claims"],
  ["bannedClaims", "Banned Claims"], ["faqs", "FAQs"], ["caseStudies", "Case Studies / Proof Points"], ["customerObjections", "Common Customer Objections"],
  ["complianceNotes", "Compliance Notes"], ["internalTerminology", "Internal Terminology"], ["wordsToAvoid", "Words to Avoid"],
  ["preferredCtaLanguage", "Preferred CTA Language"], ["sourceDocumentsUsed", "Source Documents Used"],
] as const;

const APP_MINDSET_FIELDS = [
  ["primaryGoal", "Primary Goal of the App"], ["emailPhilosophy", "Email Philosophy"], ["salesPhilosophy", "Sales Philosophy"], ["tonePrinciples", "Tone Principles"],
  ["structureRules", "Email Structure Rules"], ["ctaPhilosophy", "CTA Philosophy"], ["personalizationRules", "Personalization Rules"], ["deliverabilityRules", "Deliverability Rules"],
  ["qualityThreshold", "Quality Threshold"], ["humanApprovalRules", "Human Approval Rules"], ["noInventedFactsRule", "No Invented Facts Rule"], ["riskFramingRules", "Risk-Framing Rules"],
  ["bannedPhrases", "Banned Phrases"], ["preferredEmailFramework", "Preferred Email Framework"], ["outputFormatRules", "Output Format Rules"],
] as const;

const OFFER_FIELDS = [
  ["offerName", "Offer Name"], ["offerType", "Offer Type"], ["description", "Description"], ["targetSegment", "Target Segment"],
  ["bestFitCustomerType", "Best-Fit Customer Type"], ["bestFitIndustries", "Best-Fit Industries"], ["painPointsSolved", "Pain Points Solved"], ["upsellTriggers", "Upsell Triggers"],
  ["valueOutcomes", "Value Outcomes"], ["approvedClaims", "Approved Claims"], ["bannedClaims", "Banned Claims"], ["ctaOptions", "CTA Options"],
  ["discoveryCallLink", "Discovery Call Link"], ["leadMagnetLink", "Lead Magnet Link"], ["pricingNotes", "Pricing Notes"], ["qualificationRules", "Qualification Rules"],
  ["redFlags", "Red Flags"], ["relatedCampaignPlaybooks", "Related Campaign Playbooks"], ["primaryObjections", "Primary Objections"], ["approvedObjectionResponses", "Approved Objection Responses"],
] as const;

type ExtractionTarget = "Auto-detect" | "Business Knowledge" | "App Mindset" | "Offer Library" | "Campaign Playbook";

interface ExtractedField {
  field: string;
  extracted_value: string;
  confidence: "High" | "Medium" | "Low";
  source_snippet: string;
  action: "Accept" | "Edit" | "Reject";
}

function normalizeImportKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findImportValue(row: Record<string, any>, label: string, key: string) {
  const direct = row[label] ?? row[key];
  if (direct !== undefined && direct !== null) return String(direct).trim();
  const targetKeys = [label, key].map(normalizeImportKey);
  const match = Object.keys(row).find((header) => targetKeys.includes(normalizeImportKey(header)));
  return match ? String(row[match] ?? "").trim() : "";
}

function parseKeyValueText(text: string, fields: readonly (readonly [string, string])[]) {
  const next: Record<string, string> = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([^:=-]+)[:=-]\s*(.+)$/);
    if (!match) continue;
    const [, rawLabel, rawValue] = match;
    const field = fields.find(([key, label]) => [key, label].map(normalizeImportKey).includes(normalizeImportKey(rawLabel)));
    if (field) next[field[0]] = rawValue.trim();
  }
  return next;
}

function completionScore(value: Record<string, any>, fields: readonly (readonly [string, string])[]) {
  const filled = fields.filter(([key]) => String(value[key] || "").trim()).length;
  return Math.round((filled / fields.length) * 100);
}

function missingFields(value: Record<string, any>, fields: readonly (readonly [string, string])[]) {
  return fields.filter(([key]) => !String(value[key] || "").trim()).map(([, label]) => label);
}

function labelToKey(label: string, fields: readonly (readonly [string, string])[]) {
  const normalized = normalizeImportKey(label);
  return fields.find(([key, fieldLabel]) => [key, fieldLabel].map(normalizeImportKey).includes(normalized))?.[0];
}

function currentUserLabel() {
  if (typeof window === "undefined") return "System";
  return localStorage.getItem("userEmail") || localStorage.getItem("userRole") || "Demo Admin";
}

export default function BrainCenterPage() {
  const notice = useNotice();
  const [activeTab, setActiveTab] = useState<Tab>("Usage & Billing");
  const [models, setModels] = useState<ModelConfig[]>(DEFAULT_MODELS);
  const [isSaving, setIsSaving] = useState(false);
  const [businessKnowledge, setBusinessKnowledge] = useState<BusinessKnowledge>(DEFAULT_BUSINESS_KNOWLEDGE);
  const [appMindset, setAppMindset] = useState<AppMindset>(DEFAULT_APP_MINDSET);
  const [offers, setOffers] = useState<OfferItem[]>(DEFAULT_OFFERS);
  const [selectedOfferId, setSelectedOfferId] = useState(DEFAULT_OFFERS[0].id);
  const [developerKnowledge, setDeveloperKnowledge] = useState<DeveloperKnowledgeItem[]>(DEFAULT_DEVELOPER_KNOWLEDGE);
  const [selectedDeveloperKnowledgeId, setSelectedDeveloperKnowledgeId] = useState(DEFAULT_DEVELOPER_KNOWLEDGE[0].id);
  const [extractionTarget, setExtractionTarget] = useState<ExtractionTarget>("Auto-detect");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionReview, setExtractionReview] = useState<{
    target: "business_knowledge" | "app_mindset" | "offer_library";
    fileName: string;
    fields: ExtractedField[];
    warnings: string[];
    missingFields: string[];
  } | null>(null);
  
  // API Connection State
  const [apiKey, setApiKey] = useState("");
  const [maskedApiKey, setMaskedApiKey] = useState("Server secret or saved key");
  const [showKey, setShowKey] = useState(false);
  const [envConfig, setEnvConfig] = useState<any>({
    mode: "DEMO",
    useLiveBrainApi: false,
    useSampleData: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("envConfig");
    if (saved) setEnvConfig(JSON.parse(saved));
    const loadedBusinessKnowledge = loadJson(BUSINESS_KNOWLEDGE_KEY, DEFAULT_BUSINESS_KNOWLEDGE);
    const loadedAppMindset = loadJson(APP_MINDSET_KEY, DEFAULT_APP_MINDSET);
    const loadedOffers = loadJsonArray(OFFER_LIBRARY_KEY, DEFAULT_OFFERS);
    const loadedDeveloperKnowledge = loadJsonArray(DEVELOPER_KNOWLEDGE_KEY, DEFAULT_DEVELOPER_KNOWLEDGE);
    setBusinessKnowledge(loadedBusinessKnowledge);
    setAppMindset(loadedAppMindset);
    setOffers(loadedOffers);
    setDeveloperKnowledge(loadedDeveloperKnowledge);
    setSelectedOfferId(loadedOffers[0]?.id || DEFAULT_OFFERS[0].id);
    setSelectedDeveloperKnowledgeId(loadedDeveloperKnowledge[0]?.id || DEFAULT_DEVELOPER_KNOWLEDGE[0].id);
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
  const [availableModelsLoaded, setAvailableModelsLoaded] = useState(false);
  const [modelTested, setModelTested] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState("No live test has been run in this session.");

  const [chatModel, setChatModel] = useState(MODEL_MODE_ROUTING.Balanced.scribe);
  const [chatTask, setChatTask] = useState("General Test");
  const [chatPrompt, setChatPrompt] = useState("Write a short professional email opening for an accountant who misses calls during tax season.");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string; meta?: string }>>([]);
  const [isChatTesting, setIsChatTesting] = useState(false);
  const [lastChatResult, setLastChatResult] = useState<any>(null);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);

  const environmentName = envConfig.mode === "DEMO" ? "Demo" : envConfig.mode === "TEST_LIVE" ? "Test Live" : "Production";
  const orgId = typeof window !== "undefined" ? localStorage.getItem("orgId") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  async function refreshUsageLogs() {
    try {
      const response = await fetch(`/api/usage/logs?org_id=${encodeURIComponent(localStorage.getItem("orgId") || "org_demo")}`);
      const data = await response.json();
      setUsageLogs(data.logs || []);
    } catch {
      setUsageLogs([]);
    }
  }

  useEffect(() => {
    refreshUsageLogs();
  }, []);

  async function handleSaveApiKey() {
    const trimmed = apiKey.trim();
    const validOpenRouterShape = trimmed.startsWith("sk-or-v1-") && trimmed.length >= 48;

    if (!validOpenRouterShape) {
      setApiKeySaved(false);
      setConnectionStatus("Invalid API Key");
      setLastTested(new Date().toLocaleString());
      notice.error("Enter a valid OpenRouter key before saving.", "API key not saved");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/brain/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: modelProvider, api_key: trimmed, org_id: orgId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.safe_error || data.error || "Could not save API key.");
      setMaskedApiKey(data.masked_key || "Saved securely");
      setApiKey("");
      setShowKey(false);
      setApiKeySaved(true);
      setConnectionStatus("Not Connected");
      notice.success(data.message || "OpenRouter API key saved securely.", "API key saved");
    } catch (error: any) {
      setApiKeySaved(false);
      notice.error(error.message || "Could not save OpenRouter API key.", "API key save failed");
    } finally {
      setIsSaving(false);
    }
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
          environment: environmentName,
          selected_model_mode: modelMode,
          selected_model: chatModel,
          org_id: orgId,
          user_id: userId,
        })
      });
      const data = await response.json();
      if (data.status === "connected") {
        setConnectionStatus("Connected");
        setAvailableModelsLoaded(Boolean(data.available_models_loaded));
        setModelTested(data.model_tested || null);
        setConnectionMessage(`${data.message || "OpenRouter connection successful."} Key verified: ${data.key_verified ? "Yes" : "No"}. Live Model Response: ${data.live_model_response ? "Yes" : "No"}. Content length: ${data.content_length || 0}.`);
        notice.success(`${data.message} Model tested: ${data.model_tested}. Live response: ${data.live_model_response ? "Yes" : "No"}.`, "OpenRouter connected");
      } else {
        setConnectionStatus("Error");
        setConnectionMessage(data.safe_error || data.message || "OpenRouter connection failed.");
        notice.error(data.safe_error || data.message || "OpenRouter connection failed.", "OpenRouter failed");
      }
      setLastTested(data.last_tested ? new Date(data.last_tested).toLocaleString() : new Date().toLocaleString());
      refreshUsageLogs();
    } catch (err) {
      setConnectionStatus("Provider Unavailable");
      const message = err instanceof Error ? err.message : "OpenRouter provider unavailable.";
      setConnectionMessage(message);
      notice.error(message, "OpenRouter failed");
    } finally {
      setIsTesting(false);
    }
  }

  function applyModelMode(mode: ModelMode) {
    setModelMode(mode);
    const routing = MODEL_MODE_ROUTING[mode];
    setModels(prev => prev.map(m => {
      const selectedModel = routing[m.id] || m.selectedModel;
      return { ...m, selectedModel, fallbackModel: fallbackFor(selectedModel) };
    }));
    setChatModel(routing.scribe || "openai/gpt-5-mini");
    notice.info(`Model mode set to ${mode}.`, "Model mode updated");
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
    localStorage.setItem(BUSINESS_KNOWLEDGE_KEY, JSON.stringify({ ...businessKnowledge, lastUpdated: new Date().toISOString() }));
    localStorage.setItem(APP_MINDSET_KEY, JSON.stringify({ ...appMindset, lastUpdated: new Date().toISOString() }));
    localStorage.setItem(OFFER_LIBRARY_KEY, JSON.stringify(offers.map((offer) => offer.id === selectedOfferId ? { ...offer, lastUpdated: new Date().toISOString() } : offer)));
    localStorage.setItem(DEVELOPER_KNOWLEDGE_KEY, JSON.stringify(developerKnowledge.map((item) => item.id === selectedDeveloperKnowledgeId ? { ...item, lastUpdated: new Date().toISOString() } : item)));
    setTimeout(() => {
      setIsSaving(false);
      notice.success("Brain Center settings saved.", "Settings saved");
    }, 800);
  }

  function saveBusinessKnowledge() {
    const next = { ...businessKnowledge, status: "Draft" as ApprovalStatus, lastUpdated: new Date().toISOString() };
    setBusinessKnowledge(next);
    localStorage.setItem(BUSINESS_KNOWLEDGE_KEY, JSON.stringify(next));
    notice.success("Business Knowledge saved as draft.", "Draft saved");
  }

  function approveBusinessKnowledge() {
    const next = { ...businessKnowledge, status: "Approved" as ApprovalStatus, approvedBy: currentUserLabel(), lastUpdated: new Date().toISOString() };
    setBusinessKnowledge(next);
    localStorage.setItem(BUSINESS_KNOWLEDGE_KEY, JSON.stringify(next));
    notice.success("Business Knowledge approved and active for generation.", "Business Knowledge approved");
  }

  function saveAppMindset() {
    const next = { ...appMindset, status: "Draft" as ApprovalStatus, lastUpdated: new Date().toISOString() };
    setAppMindset(next);
    localStorage.setItem(APP_MINDSET_KEY, JSON.stringify(next));
    notice.success("App Mindset saved as draft.", "Draft saved");
  }

  function approveAppMindset() {
    const next = { ...appMindset, status: "Approved" as ApprovalStatus, approvedBy: currentUserLabel(), lastUpdated: new Date().toISOString() };
    setAppMindset(next);
    localStorage.setItem(APP_MINDSET_KEY, JSON.stringify(next));
    notice.success("App Mindset approved and active for SENTINEL, SCRIBE, and LEXI.", "App Mindset approved");
  }

  function saveOffers(nextOffers = offers) {
    const stamped = nextOffers.map((offer) => offer.id === selectedOfferId ? { ...offer, lastUpdated: new Date().toISOString() } : offer);
    setOffers(stamped);
    localStorage.setItem(OFFER_LIBRARY_KEY, JSON.stringify(stamped));
    notice.success("Offer Library saved.", "Offer Library saved");
  }

  function saveSelectedOfferDraft() {
    const stamped = offers.map((offer) => offer.id === selectedOfferId ? { ...offer, status: "Draft" as const, lastUpdated: new Date().toISOString() } : offer);
    saveOffers(stamped);
    notice.success("Offer saved as draft.", "Draft saved");
  }

  function activateSelectedOffer() {
    const stamped = offers.map((offer) => offer.id === selectedOfferId ? { ...offer, status: "Active" as const, approvedBy: currentUserLabel(), lastUpdated: new Date().toISOString() } : offer);
    saveOffers(stamped);
    notice.success("Offer approved and active for generation.", "Offer activated");
  }

  function addOffer() {
    const offer: OfferItem = {
      ...DEFAULT_OFFERS[0],
      id: `offer-${Date.now()}`,
      offerName: "New Offer",
      status: "Draft",
      lastUpdated: new Date().toISOString(),
    };
    const next = [offer, ...offers];
    setOffers(next);
    setSelectedOfferId(offer.id);
    localStorage.setItem(OFFER_LIBRARY_KEY, JSON.stringify(next));
    notice.info("New draft offer created. Fill it out before using it in generation.", "Offer created");
  }

  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) || offers[0];
  const selectedDeveloperKnowledge = developerKnowledge.find((item) => item.id === selectedDeveloperKnowledgeId) || developerKnowledge[0];

  function updateDeveloperKnowledge(field: keyof DeveloperKnowledgeItem, value: any) {
    setDeveloperKnowledge((current) => current.map((item) => (
      item.id === selectedDeveloperKnowledgeId ? { ...item, [field]: value } : item
    )));
  }

  function saveDeveloperKnowledge() {
    const stamped = developerKnowledge.map((item) => item.id === selectedDeveloperKnowledgeId ? { ...item, lastUpdated: new Date().toISOString() } : item);
    setDeveloperKnowledge(stamped);
    localStorage.setItem(DEVELOPER_KNOWLEDGE_KEY, JSON.stringify(stamped));
    notice.success("Developer Knowledge saved. It is technical-only and excluded from sales messaging.", "Developer Knowledge saved");
  }

  async function extractFromFile(file: File, target: ExtractionTarget = extractionTarget) {
    setIsExtracting(true);
    try {
      let text = "";
      if (file.name.toLowerCase().endsWith(".csv")) {
        text = await new Promise<string>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (parsed) => resolve(JSON.stringify(parsed.data, null, 2)),
            error: reject,
          });
        });
      } else {
        text = await file.text();
      }

      const response = await fetch("/api/brain/extract-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: orgId,
          extraction_target: target,
          uploaded_file_reference: { name: file.name, text },
          existing_section_data: { businessKnowledge, appMindset, selectedOffer },
          model_mode: modelMode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.safe_error || data.message || "Extraction failed.");
      setExtractionReview({
        target: data.recommended_section,
        fileName: file.name,
        fields: (data.extracted_fields || []).map((field: ExtractedField) => ({ ...field, action: field.extracted_value ? "Accept" : "Reject" })),
        warnings: data.warnings || [],
        missingFields: data.missing_fields || [],
      });
      notice.info("Extraction ready for human review. Nothing has been activated yet.", "Review extraction");
    } catch (error: any) {
      notice.error(error.message || "Could not extract from file.", "Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  }

  function updateExtractedField(index: number, updates: Partial<ExtractedField>) {
    setExtractionReview((current) => current ? {
      ...current,
      fields: current.fields.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...updates } : field),
    } : current);
  }

  function applyExtraction(saveMode: "draft" | "approved") {
    if (!extractionReview) return;
    const accepted = extractionReview.fields.filter((field) => field.action === "Accept" && field.extracted_value.trim());
    const approvedBy = saveMode === "approved" ? currentUserLabel() : undefined;
    const status = saveMode === "approved" ? "Approved" as const : "Draft" as const;

    if (extractionReview.target === "business_knowledge") {
      const nextFields = Object.fromEntries(accepted.map((field) => [labelToKey(field.field, BUSINESS_KNOWLEDGE_FIELDS), field.extracted_value]).filter(([key]) => key));
      const next = { ...businessKnowledge, ...nextFields, sourceDocumentsUsed: extractionReview.fileName, status, approvedBy, lastUpdated: new Date().toISOString() };
      setBusinessKnowledge(next);
      localStorage.setItem(BUSINESS_KNOWLEDGE_KEY, JSON.stringify(next));
    } else if (extractionReview.target === "app_mindset") {
      const nextFields = Object.fromEntries(accepted.map((field) => [labelToKey(field.field, APP_MINDSET_FIELDS), field.extracted_value]).filter(([key]) => key));
      const next = { ...appMindset, ...nextFields, status, approvedBy, lastUpdated: new Date().toISOString() };
      setAppMindset(next);
      localStorage.setItem(APP_MINDSET_KEY, JSON.stringify(next));
    } else {
      const nextFields = Object.fromEntries(accepted.map((field) => [labelToKey(field.field, OFFER_FIELDS), field.extracted_value]).filter(([key]) => key));
      const offer = {
        ...DEFAULT_OFFERS[0],
        ...selectedOffer,
        ...nextFields,
        id: selectedOffer?.id || `offer-extract-${Date.now()}`,
        status: saveMode === "approved" ? "Active" as const : "Draft" as const,
        approvedBy,
        lastUpdated: new Date().toISOString(),
      };
      const next = selectedOffer
        ? offers.map((item) => item.id === offer.id ? offer : item)
        : [offer, ...offers];
      setOffers(next);
      setSelectedOfferId(offer.id);
      localStorage.setItem(OFFER_LIBRARY_KEY, JSON.stringify(next));
    }

    setExtractionReview(null);
    notice.success(saveMode === "approved" ? "Accepted extraction approved and activated." : "Accepted extraction saved as draft.", saveMode === "approved" ? "Approved" : "Draft saved");
  }

  async function handleSendTestChat() {
    const prompt = chatPrompt.trim();
    if (!prompt) {
      notice.warning("Enter a prompt before running the model test.", "Prompt required");
      return;
    }
    setIsChatTesting(true);
    setChatMessages((current) => [...current, { role: "user", content: prompt }]);
    try {
      const response = await fetch("/api/brain/test-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: modelProvider,
          environment: environmentName,
          model_mode: modelMode,
          model: chatModel,
          task: chatTask,
          prompt,
          org_id: orgId,
          user_id: userId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.safe_error || data.message || "Model test chat failed.");
      if (!data.response?.trim()) throw new Error("OpenRouter returned an empty model response.");
      setLastChatResult(data);
      setChatMessages((current) => [...current, {
        role: "assistant",
        content: data.response,
        meta: `${data.status_label || "Success"} / ${data.provider} / ${data.model_used} / ${data.response_time_ms}ms / ${data.credits_charged} credit / ${data.content_length || 0} chars / Live response: ${data.live_model_response ? "Yes" : "No"}`,
      }]);
      notice.success("Model Test Chat completed and usage was logged.", "Brain test passed");
      refreshUsageLogs();
    } catch (error: any) {
      const message = error.message || "Model Test Chat failed.";
      setLastChatResult({ status_label: "Failed", live_model_response: false, credits_charged: 0, safe_error: message, model_used: chatModel });
      setChatMessages((current) => [...current, { role: "assistant", content: message, meta: "Failed / 0 credits / Live response: No" }]);
      notice.error(message, "Brain test failed");
      refreshUsageLogs();
    } finally {
      setIsChatTesting(false);
    }
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
                {activeTab === "Model Test Chat" && "Run admin-only model checks before testers use the Brain API."}
                {activeTab === "Developer Knowledge" && "Store technical API references used for integration diagnostics, not customer-facing email generation."}
                {!["Model Settings", "Usage & Billing", "API Connection", "Model Test Chat", "Developer Knowledge"].includes(activeTab) && "Configure intelligence parameters for the AI generation workflow."}
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
            {extractionReview && (
              <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-700">Extraction Review</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">{extractionReview.fileName}</h3>
                    <p className="text-sm text-slate-600">Target: {extractionReview.target.replace("_", " ")}. Human approval is required before this data feeds generation.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setExtractionReview(null)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">Reject</button>
                    <button onClick={() => applyExtraction("draft")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">Save as Draft</button>
                    <button onClick={() => applyExtraction("approved")} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Approve All</button>
                  </div>
                </div>
                {extractionReview.warnings.length > 0 && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                    {extractionReview.warnings.join(" ")}
                  </div>
                )}
                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr><th className="p-3">Field</th><th className="p-3">Extracted Value</th><th className="p-3">Confidence</th><th className="p-3">Source Snippet</th><th className="p-3">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {extractionReview.fields.map((field, index) => (
                        <tr key={`${field.field}-${index}`}>
                          <td className="p-3 font-bold text-slate-800">{field.field}</td>
                          <td className="p-3 min-w-[240px]">
                            <textarea value={field.extracted_value} onChange={(e) => updateExtractedField(index, { extracted_value: e.target.value, action: "Edit" })} rows={2} className="w-full rounded-lg border-slate-200 text-xs" />
                          </td>
                          <td className="p-3">
                            <span className={`rounded-full px-2 py-1 font-bold ${field.confidence === "High" ? "bg-emerald-50 text-emerald-700" : field.confidence === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{field.confidence}</span>
                          </td>
                          <td className="p-3 max-w-[260px] text-slate-500">{field.source_snippet || "Missing"}</td>
                          <td className="p-3">
                            <select value={field.action} onChange={(e) => updateExtractedField(index, { action: e.target.value as ExtractedField["action"] })} className="rounded-lg border-slate-200 text-xs font-bold">
                              <option value="Accept">Accept</option>
                              <option value="Edit">Edit</option>
                              <option value="Reject">Reject</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Developer Knowledge" ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Technical Knowledge</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">Developer Knowledge / API Knowledge</h3>
                      <p className="mt-1 text-sm text-slate-600">Approved integration docs for API setup, model routing, response parsing, and troubleshooting. These records are not included in customer email generation context.</p>
                    </div>
                    <button onClick={saveDeveloperKnowledge} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
                      <Save className="h-4 w-4" /> Save
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                    {developerKnowledge.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedDeveloperKnowledgeId(item.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-bold ${selectedDeveloperKnowledgeId === item.id ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                      >
                        {item.title}
                        <span className="mt-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">{item.type}</span>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Status</p>
                        <p className="mt-1 text-sm font-bold text-emerald-800">{selectedDeveloperKnowledge?.status || "Approved / Active"}</p>
                      </div>
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Active</p>
                        <p className="mt-1 text-sm font-bold text-blue-800">{selectedDeveloperKnowledge?.active ? "Yes" : "No"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Updated</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{selectedDeveloperKnowledge?.lastUpdated ? new Date(selectedDeveloperKnowledge.lastUpdated).toLocaleString() : "Not saved"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</span>
                        <input value={selectedDeveloperKnowledge?.title || ""} onChange={(e) => updateDeveloperKnowledge("title", e.target.value)} className="w-full rounded-lg border-slate-200 text-sm" />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</span>
                        <input value={selectedDeveloperKnowledge?.type || ""} onChange={(e) => updateDeveloperKnowledge("type", e.target.value)} className="w-full rounded-lg border-slate-200 text-sm" />
                      </label>
                    </div>

                    {[
                      ["sourceFile", "Source File"],
                      ["summary", "Summary"],
                      ["usedFor", "Used For"],
                      ["notes", "Notes"],
                    ].map(([field, label]) => (
                      <label key={field} className="block space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                        <textarea
                          value={String(selectedDeveloperKnowledge?.[field as keyof DeveloperKnowledgeItem] || "")}
                          onChange={(e) => updateDeveloperKnowledge(field as keyof DeveloperKnowledgeItem, e.target.value)}
                          rows={field === "summary" ? 4 : 3}
                          className="w-full rounded-lg border-slate-200 text-sm"
                        />
                      </label>
                    ))}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                        <select value={selectedDeveloperKnowledge?.status || "Approved / Active"} onChange={(e) => updateDeveloperKnowledge("status", e.target.value)} className="w-full rounded-lg border-slate-200 text-sm">
                          <option value="Draft">Draft</option>
                          <option value="Approved / Active">Approved / Active</option>
                          <option value="Needs Review">Needs Review</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">
                        <input type="checkbox" checked={Boolean(selectedDeveloperKnowledge?.active)} onChange={(e) => updateDeveloperKnowledge("active", e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                        Active for developer diagnostics
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "Business Knowledge" ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Brain Usage</p>
                  <p className="mt-1 text-sm text-blue-700">ORC, SENTINEL, SCRIBE, and LEXI use this as approved company truth. Missing knowledge lowers strategy confidence and draft QA.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Extract From File</p>
                      <p className="text-xs text-slate-500">Supports PDF, DOCX, TXT, CSV, XLSX, and Markdown uploads. Text/CSV/Markdown extract directly in this demo; binary documents may need exported text.</p>
                    </div>
                    <div className="flex gap-2">
                      <select value={extractionTarget} onChange={(e) => setExtractionTarget(e.target.value as ExtractionTarget)} className="rounded-lg border-slate-200 text-sm font-semibold">
                        {["Auto-detect", "Business Knowledge", "App Mindset", "Offer Library", "Campaign Playbook"].map((target) => <option key={target} value={target}>{target}</option>)}
                      </select>
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Download className="h-4 w-4" /> {isExtracting ? "Extracting..." : "Upload File"}
                        <input type="file" accept=".pdf,.docx,.txt,.csv,.xlsx,.md" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) extractFromFile(file, "Business Knowledge"); e.currentTarget.value = ""; }} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    ["Completion", `${completionScore(businessKnowledge as any, BUSINESS_KNOWLEDGE_FIELDS)}%`],
                    ["Status", businessKnowledge.status || "Draft"],
                    ["Approved By", businessKnowledge.approvedBy || "Not approved"],
                    ["Missing", missingFields(businessKnowledge as any, BUSINESS_KNOWLEDGE_FIELDS).slice(0, 3).join(", ") || "None"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Status: {contextStatus(businessKnowledge as any, ["companyName", "mainValueProposition", "approvedPositioningStatement"])}</p>
                    <p className="text-xs text-slate-500">Last updated: {businessKnowledge.lastUpdated ? new Date(businessKnowledge.lastUpdated).toLocaleString() : "Not saved yet"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveBusinessKnowledge} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><Save className="h-4 w-4" /> Save Draft</button>
                    <button onClick={approveBusinessKnowledge} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4" /> Approve / Activate</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUSINESS_KNOWLEDGE_FIELDS.map(([key, label]) => (
                    <label key={key} className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                      <textarea
                        value={(businessKnowledge as any)[key] || ""}
                        onChange={(e) => setBusinessKnowledge((prev) => ({ ...prev, [key]: e.target.value }))}
                        rows={key === "businessDescription" || key === "approvedPositioningStatement" ? 4 : 3}
                        className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : activeTab === "App Mindset" ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Brain Usage</p>
                  <p className="mt-1 text-sm text-violet-700">SENTINEL uses this for strategy, SCRIBE for writing, and LEXI for scoring, duplicate subject checks, banned phrases, and approval threshold rules.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Extract From File</p>
                      <p className="text-xs text-slate-500">Upload writing rules, brand standards, QA rules, or messaging docs for review before saving.</p>
                    </div>
                    <div className="flex gap-2">
                      <select value={extractionTarget} onChange={(e) => setExtractionTarget(e.target.value as ExtractionTarget)} className="rounded-lg border-slate-200 text-sm font-semibold">
                        {["Auto-detect", "Business Knowledge", "App Mindset", "Offer Library", "Campaign Playbook"].map((target) => <option key={target} value={target}>{target}</option>)}
                      </select>
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Download className="h-4 w-4" /> {isExtracting ? "Extracting..." : "Upload File"}
                        <input type="file" accept=".pdf,.docx,.txt,.csv,.xlsx,.md" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) extractFromFile(file, "App Mindset"); e.currentTarget.value = ""; }} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    ["Completion", `${completionScore(appMindset as any, APP_MINDSET_FIELDS)}%`],
                    ["Status", appMindset.status || "Draft"],
                    ["Approved By", appMindset.approvedBy || "Not approved"],
                    ["Missing", missingFields(appMindset as any, APP_MINDSET_FIELDS).slice(0, 3).join(", ") || "None"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Status: {contextStatus(appMindset as any, ["primaryGoal", "emailPhilosophy", "qualityThreshold"])}</p>
                    <p className="text-xs text-slate-500">Last updated: {appMindset.lastUpdated ? new Date(appMindset.lastUpdated).toLocaleString() : "Default mindset active"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveAppMindset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><Save className="h-4 w-4" /> Save Draft</button>
                    <button onClick={approveAppMindset} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4" /> Approve / Activate</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {APP_MINDSET_FIELDS.map(([key, label]) => (
                    <label key={key} className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                      <textarea
                        value={(appMindset as any)[key] || ""}
                        onChange={(e) => setAppMindset((prev) => ({ ...prev, [key]: e.target.value }))}
                        rows={key === "qualityThreshold" ? 1 : 3}
                        className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : activeTab === "Offer Library" ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Brain Usage</p>
                  <p className="mt-1 text-sm text-emerald-700">ORC validates offer status, SENTINEL builds the angle from offer triggers, SCRIBE describes the offer accurately, and LEXI blocks banned claims.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Extract From File</p>
                      <p className="text-xs text-slate-500">Upload offer sheets, pricing notes, sales enablement docs, or CSV offer rows for review before activation.</p>
                    </div>
                    <div className="flex gap-2">
                      <select value={extractionTarget} onChange={(e) => setExtractionTarget(e.target.value as ExtractionTarget)} className="rounded-lg border-slate-200 text-sm font-semibold">
                        {["Auto-detect", "Business Knowledge", "App Mindset", "Offer Library", "Campaign Playbook"].map((target) => <option key={target} value={target}>{target}</option>)}
                      </select>
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Download className="h-4 w-4" /> {isExtracting ? "Extracting..." : "Upload File"}
                        <input type="file" accept=".pdf,.docx,.txt,.csv,.xlsx,.md" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) extractFromFile(file, "Offer Library"); e.currentTarget.value = ""; }} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Offer</label>
                    <select value={selectedOfferId} onChange={(e) => setSelectedOfferId(e.target.value)} className="mt-1 w-full rounded-lg border-slate-200 text-sm font-semibold">
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.offerName} ({offer.status})</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addOffer} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><PlusCircle className="h-4 w-4" /> Add Offer</button>
                    <button onClick={saveSelectedOfferDraft} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><Save className="h-4 w-4" /> Save Draft</button>
                    <button onClick={activateSelectedOffer} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4" /> Approve / Activate</button>
                  </div>
                </div>
                {selectedOffer && (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      ["Completion", `${completionScore(selectedOffer as any, OFFER_FIELDS)}%`],
                      ["Status", selectedOffer.status || "Draft"],
                      ["Approved By", selectedOffer.approvedBy || "Not approved"],
                      ["Missing", missingFields(selectedOffer as any, OFFER_FIELDS).slice(0, 3).join(", ") || "None"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {OFFER_FIELDS.map(([key, label]) => (
                      <label key={key} className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                        <textarea
                          value={(selectedOffer as any)[key] || ""}
                          onChange={(e) => setOffers((current) => current.map((offer) => offer.id === selectedOffer.id ? { ...offer, [key]: e.target.value } : offer))}
                          rows={key === "description" ? 4 : 3}
                          className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </label>
                    ))}
                    <label className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                      <select
                        value={selectedOffer.status}
                        onChange={(e) => setOffers((current) => current.map((offer) => offer.id === selectedOffer.id ? { ...offer, status: e.target.value as OfferItem["status"] } : offer))}
                        className="w-full rounded-xl border-slate-200 text-sm font-semibold"
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Approved">Approved</option>
                        <option value="Needs Review">Needs Review</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{selectedOffer.status} · Last updated {selectedOffer.lastUpdated ? new Date(selectedOffer.lastUpdated).toLocaleString() : "not saved yet"}</p>
                    </div>
                  </div>
                  </>
                )}
              </div>
            ) : activeTab === "Model Settings" ? (
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
                                (model.selectedModel === "openai/gpt-5.1" && connectionStatus === "Connected") ? "border-amber-300 text-amber-700" : 
                                (model.selectedModel === "openai/gpt-5-mini" && connectionStatus === "Error") ? "border-red-300 text-red-700" : ""
                              }`}
                            >
                              {GPT5_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                              <option value="text-embedding-3-small">Embeddings 3 Small</option>
                            </select>
                            {model.selectedModel === "openai/gpt-5.1" && connectionStatus === "Connected" && (
                              <p className="text-[10px] text-amber-600 mt-1 font-medium flex items-center gap-1">
                                <Info className="h-3 w-3" /> Fallback to GPT-5 Mini active
                              </p>
                            )}
                            {model.selectedModel === "openai/gpt-5-mini" && connectionStatus === "Error" && (
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
                              {GPT5_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
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
                               {(usageLogs.some((log) => String(log.action || "").includes("ORC")) ? usageLogs : [
                                 ...usageLogs,
                                 {
                                   created_at: "2026-05-06 09:30:01",
                                   org_name: "Acme",
                                   user_email: "j.smith",
                                   action: "ORC Validation",
                                   model_used: "openai/gpt-5-nano",
                                   credits_charged: 1,
                                   prompt_tokens: 4200,
                                   completion_tokens: 200,
                                   estimated_api_cost: 0.001,
                                   success: 1,
                                 },
                               ]).map((log) => ({
                                 time: String(log.created_at || "").replace("T", " ").slice(0, 19),
                                 org: log.org_name || "Demo Organization",
                                 user: log.user_email || "admin",
                                 action: log.action,
                                 cost: `-${log.credits_charged || 0}`,
                                 model: log.model_used,
                                 tokens: `${log.prompt_tokens || 0} / ${log.completion_tokens || 0}`,
                                 api: log.estimated_api_cost ? `$${Number(log.estimated_api_cost).toFixed(4)}` : "n/a",
                                 status: Number(log.success) === 1 ? "Success" : "Failed",
                               })).map((log, i) => (
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
            ) : activeTab === "Model Test Chat" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Model</label>
                      <select
                        value={chatModel}
                        onChange={(e) => setChatModel(e.target.value)}
                        className="w-full rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-700"
                      >
                        {GPT5_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Model Mode</label>
                      <select
                        value={modelMode}
                        onChange={(e) => applyModelMode(e.target.value as ModelMode)}
                        className="w-full rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-700"
                      >
                        <option value="Economy">Economy</option>
                        <option value="Balanced">Balanced</option>
                        <option value="Quality">Quality</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Task</label>
                      <select
                        value={chatTask}
                        onChange={(e) => setChatTask(e.target.value)}
                        className="w-full rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-700"
                      >
                        {[
                          "General Test",
                          "ORC Intake Test",
                          "SENTINEL Strategy Test",
                          "SCRIBE Writing Test",
                          "LEXI QA Test",
                          "Reply Classification Test",
                          "Reply Drafting Test",
                        ].map((task) => <option key={task} value={task}>{task}</option>)}
                      </select>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 space-y-2">
                      <div className="flex justify-between"><span>Provider</span><strong>OpenRouter</strong></div>
                      <div className="flex justify-between"><span>Subscription</span><strong className="text-emerald-600">Active</strong></div>
                      <div className="flex justify-between"><span>Credit cost</span><strong>1 test credit</strong></div>
                      <div className="flex justify-between"><span>Environment</span><strong>{environmentName}</strong></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Admin Model Test Chat</h3>
                        <p className="text-xs text-slate-500">Successful tests write to Usage Logs and charge 1 test credit.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setChatMessages([]); setLastChatResult(null); }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Clear Chat
                      </button>
                    </div>

                    <div className="h-[320px] overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                      {chatMessages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-center">
                          <div>
                            <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                            <p className="mt-2 text-sm font-semibold text-slate-500">Run a model test before inviting users.</p>
                          </div>
                        </div>
                      ) : chatMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            message.role === "user" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-700"
                          }`}>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.meta && <p className="mt-2 text-[10px] font-bold uppercase tracking-widest opacity-60">{message.meta}</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 p-4 space-y-3">
                      <textarea
                        id="admin-model-test-prompt"
                        name="admin-model-test-prompt"
                        value={chatPrompt}
                        onChange={(e) => setChatPrompt(e.target.value)}
                        placeholder="Ask a question to test the selected model..."
                        rows={3}
                        disabled={false}
                        readOnly={false}
                        className="relative z-10 w-full resize-none rounded-xl border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={handleSendTestChat}
                        disabled={isChatTesting || !chatPrompt.trim()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        {isChatTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {isChatTesting ? "Testing Model..." : "Send Test"}
                      </button>
                    </div>
                  </div>
                </div>

                {lastChatResult && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ["Status", lastChatResult.status_label || (lastChatResult.safe_error ? "Failed" : "Success")],
                      ["Live Model Response", lastChatResult.live_model_response ? "Yes" : "No"],
                      ["Model Used", lastChatResult.model_used],
                      ["Response Time", `${lastChatResult.response_time_ms}ms`],
                      ["Credits Charged", lastChatResult.credits_charged],
                      ["Content Length", lastChatResult.content_length || 0],
                      ["Usage Log ID", lastChatResult.usage_log_id || "Not logged"],
                      ["Tokens", `${lastChatResult.prompt_tokens || 0} / ${lastChatResult.completion_tokens || 0}`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                      </div>
                    ))}
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
                          value={apiKeySaved && !showKey ? maskedApiKey : apiKey} 
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
                            <span className={`font-bold ${availableModelsLoaded ? "text-emerald-600" : "text-slate-500"}`}>{availableModelsLoaded ? "Yes (Loaded)" : "No"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Model Tested:</span>
                            <span className="font-bold text-slate-700">{modelTested || "None"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Message:</span>
                            <span className="max-w-[220px] text-right font-bold text-slate-700">{connectionMessage}</span>
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
