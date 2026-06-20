"use client";

import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { CheckCircle, FileText, Loader2, PlusCircle, RefreshCw, Save, ShieldCheck, UploadCloud, Zap } from "lucide-react";
import { useNotice } from "@/components/notice/NoticeProvider";
import {
  APP_MINDSET_KEY,
  BUSINESS_KNOWLEDGE_KEY,
  DEFAULT_APP_MINDSET,
  DEFAULT_BUSINESS_KNOWLEDGE,
  DEFAULT_VOICE_MEMORY,
  DEFAULT_OFFERS,
  ACCOUNT_CONTEXT_KEY,
  MAPPING_TEMPLATES_KEY,
  OFFER_LIBRARY_KEY,
  VOICE_MEMORY_KEY,
  type AccountContextSaveMode,
  type AiContextUsed,
  type AppMindset,
  type BusinessKnowledge,
  type ManualAccountContext,
  type MappingTemplate,
  type OfferItem,
  type VoiceMemory,
  loadJson,
  loadJsonArray,
} from "@/lib/brain-context";
import { generateSageRenewalDraft } from "@/lib/sage-renewal-generator";
import {
  STANDARD_IMPORT_FIELDS,
  formatImportValidationSummary,
  inferImportMapping,
  mapImportRecord,
  validateImportRows,
} from "@/lib/import-validation";

const DRAFT_STORAGE_KEY = "emailorcGeneratedDrafts";
const QA_APPROVAL_THRESHOLD = 90;

const EMPTY_ACCOUNT_CONTEXT: ManualAccountContext = {
  rawText: "",
  currentPlan: "",
  currentProduct: "",
  renewalMonth: "",
  renewalDate: "",
  businessDescription: "",
  industry: "",
  painPoints: "",
  operationalNotes: "",
  crmNotes: "",
  websiteResearchNotes: "",
  recommendedUpsell: "",
  personalizationAngle: "",
  sourceOfInformation: "",
  confidenceLevel: "",
  saveMode: "contact",
};

function mappedRecord(row: Record<string, any>, mapping: Record<string, string>) {
  return mapImportRecord(row, mapping);
}

function isDnc(value = "") {
  return /^(true|yes|y|1|do not contact|dnc)$/i.test(value.trim());
}

function persistDrafts(drafts: any[]) {
  if (currentEnvironment() !== "demo") return;
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

function currentEnvironment() {
  try {
    const config = JSON.parse(localStorage.getItem("envConfig") || "{}");
    return String(config.mode || "demo").toLowerCase().replace("_", "-");
  } catch {
    return "demo";
  }
}

function contextKey(standard: Record<string, string>) {
  return (standard.Email || standard["Company Name"] || standard["Business Name"] || standard["Full Name"] || "bulk").toLowerCase();
}

function mergeAccountContext(base: ManualAccountContext, standard: Record<string, string>, custom: Record<string, string>) {
  return {
    ...base,
    currentPlan: base.currentPlan || standard["Current Plan"] || "",
    currentProduct: base.currentProduct || standard["Current Product"] || standard["Current Service"] || "",
    renewalDate: base.renewalDate || standard["Renewal Date"] || "",
    industry: base.industry || standard.Industry || "",
    painPoints: base.painPoints || standard["Pain Point"] || custom["Pain Points"] || "",
    recommendedUpsell: base.recommendedUpsell || standard["Upsell Offer"] || "",
  };
}

export default function UploadPage() {
  const notice = useNotice();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newCustomField, setNewCustomField] = useState("");
  const [templateName, setTemplateName] = useState("Manual CSV");
  const [templates, setTemplates] = useState<MappingTemplate[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [selectedPlaybook, setSelectedPlaybook] = useState("Expansion Outreach");
  const [businessKnowledge, setBusinessKnowledge] = useState<BusinessKnowledge>(DEFAULT_BUSINESS_KNOWLEDGE);
  const [appMindset, setAppMindset] = useState<AppMindset>(DEFAULT_APP_MINDSET);
  const [offers, setOffers] = useState<OfferItem[]>(DEFAULT_OFFERS);
  const [voiceMemory, setVoiceMemory] = useState<VoiceMemory>(DEFAULT_VOICE_MEMORY);
  const [bulkAccountContext, setBulkAccountContext] = useState<ManualAccountContext>(EMPTY_ACCOUNT_CONTEXT);

  useEffect(() => {
    setTemplates(loadJsonArray(MAPPING_TEMPLATES_KEY, []));
    setBusinessKnowledge(loadJson(BUSINESS_KNOWLEDGE_KEY, DEFAULT_BUSINESS_KNOWLEDGE));
    setAppMindset(loadJson(APP_MINDSET_KEY, DEFAULT_APP_MINDSET));
    setVoiceMemory(loadJson(VOICE_MEMORY_KEY, DEFAULT_VOICE_MEMORY));
    const loadedOffers = loadJsonArray(OFFER_LIBRARY_KEY, DEFAULT_OFFERS);
    setOffers(loadedOffers);
    setSelectedOfferId(loadedOffers.find((offer) => offer.status === "Active" || offer.status === "Approved")?.id || loadedOffers[0]?.id || "");
  }, []);

  const headers = data.length ? Object.keys(data[0]) : [];
  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId);

  const previewRows = useMemo(() => data.slice(0, 5).map((row) => mappedRecord(row, fieldMapping)), [data, fieldMapping]);
  const hasEmailMapping = Object.values(fieldMapping).includes("Email");
  const hasIdentityMapping = ["Company Name", "Business Name", "Full Name"].some((field) => Object.values(fieldMapping).includes(field));
  const generationBlocked = !hasEmailMapping || !selectedOfferId || !selectedPlaybook.trim();

  const parseFile = (file: File) => {
    setFileName(file.name);
    setResults([]);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const rows = parsed.data as Record<string, any>[];
        if (!rows.length) {
          notice.warning("The uploaded file did not contain any records.", "Upload empty");
          return;
        }
        setData(rows);
        setFieldMapping(inferImportMapping(Object.keys(rows[0] || {})));
        notice.success(`${rows.length} records loaded. Review mapping and select an offer before import.`, "Upload completed");
      },
      error: (error) => notice.error(error.message || "Upload failed. Check the file format.", "Upload failed"),
    });
  };

  const addCustomField = () => {
    const trimmed = newCustomField.trim();
    if (!trimmed) return;
    setCustomFields((current) => Array.from(new Set([...current, trimmed])));
    setNewCustomField("");
    notice.info(`${trimmed} is now available as a custom mapping field.`, "Custom field added");
  };

  const saveTemplate = () => {
    const template: MappingTemplate = {
      id: `template-${Date.now()}`,
      templateName: templateName.trim() || "Untitled Mapping",
      sourceType: fileName || "CSV Upload",
      fieldMappings: fieldMapping,
      customFields,
      createdBy: localStorage.getItem("userEmail") || "demo user",
      organization: localStorage.getItem("orgId") || "org_demo",
      lastUsed: new Date().toISOString(),
    };
    const next = [template, ...templates.filter((item) => item.templateName !== template.templateName)];
    setTemplates(next);
    localStorage.setItem(MAPPING_TEMPLATES_KEY, JSON.stringify(next));
    notice.success("Mapping template saved.", "Template saved");
  };

  const loadTemplate = (template: MappingTemplate) => {
    setFieldMapping(template.fieldMappings);
    setCustomFields(template.customFields || []);
    const next = templates.map((item) => item.id === template.id ? { ...item, lastUsed: new Date().toISOString() } : item);
    setTemplates(next);
    localStorage.setItem(MAPPING_TEMPLATES_KEY, JSON.stringify(next));
    notice.success(`${template.templateName} mapping loaded.`, "Template loaded");
  };

  const deleteTemplate = (id: string) => {
    const next = templates.filter((template) => template.id !== id);
    setTemplates(next);
    localStorage.setItem(MAPPING_TEMPLATES_KEY, JSON.stringify(next));
    notice.info("Mapping template deleted.", "Template deleted");
  };

  const handleGenerate = async () => {
    if (generationBlocked) {
      notice.warning("Map Email, select an Offer, and choose a Campaign Playbook before generation.", "Import not ready");
      return;
    }

    const mappedRows = data.map((row) => mappedRecord(row, fieldMapping));
    const validation = validateImportRows({
      mapping: fieldMapping,
      records: mappedRows.map(({ standard }) => ({ _standard_fields: standard })),
    });
    if (!validation.valid) {
      notice.error(formatImportValidationSummary(validation), "Import validation failed");
      return;
    }
    if (validation.warnings.length) {
      notice.warning(`${validation.warnings.length} rows have identity or renewal context warnings and will need review.`, "Import review needed");
    }

    setIsProcessing(true);
    setTimeout(async () => {
      const existingBodies: string[] = [];
      const existingSubjects: string[] = [];
      const generated = data.map((row, idx) => {
        const { standard, custom } = mappedRows[idx];
        const accountContext = mergeAccountContext(bulkAccountContext, standard, custom);
        const draft = generateSageRenewalDraft({
          id: `upload-${Date.now()}-${idx}`,
          standard,
          custom,
          rowIndex: idx,
          businessKnowledge,
          appMindset,
          offer: selectedOffer,
          playbookName: selectedPlaybook,
          existingBodies,
          existingSubjects,
          liveModelUsed: false,
          modelName: "Sage renewal ORC/SENTINEL/SCRIBE/LEXI",
          voiceMemory,
          accountContext,
        });
        if (accountContext.saveMode !== "use_once") {
          const saved = loadJson<Record<string, ManualAccountContext>>(ACCOUNT_CONTEXT_KEY, {});
          const key = contextKey(standard);
          saved[key] = { ...accountContext, savedAt: new Date().toISOString() };
          localStorage.setItem(ACCOUNT_CONTEXT_KEY, JSON.stringify(saved));
          fetch("/api/account-intelligence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organization_id: localStorage.getItem("orgId") || "org_demo",
              user_id: localStorage.getItem("userId") || "user_super_admin",
              contact_key: key,
              company_key: String(standard["Company Name"] || standard["Business Name"] || "").trim().toLowerCase(),
              save_scope: accountContext.saveMode,
              context: saved[key],
            }),
          }).catch(() => {});
        }
        existingBodies.push(draft._body);
        existingSubjects.push(draft._subject, draft._subject2);
        return {
          ...row,
          ...draft,
        };
      });
      setResults(generated);
      persistDrafts(generated);
      const saved = await fetch("/api/workflow/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: localStorage.getItem("orgId") || "org_demo",
          user_id: localStorage.getItem("userId") || "user_super_admin",
          environment: currentEnvironment(),
          file_name: fileName,
          mapping: fieldMapping,
          offer_id: selectedOffer?.id,
          offer_name: selectedOffer?.offerName,
          playbook_name: selectedPlaybook,
          records: generated,
          account_context: bulkAccountContext,
        }),
      }).then((response) => response.json().catch(() => ({}))).catch(() => null);
      if (saved?.status === "error") {
        setIsProcessing(false);
        notice.error(saved.error || "Database import validation failed.", "Database import failed");
        return;
      }
      if (saved?.status === "success") notice.info(`Saved ${saved.records_saved} records to the ${currentEnvironment()} database.`, "Database saved");
      if (!saved) notice.warning("Drafts were saved in this browser, but database persistence failed.", "Database warning");
      setIsProcessing(false);
      notice.success(`${generated.length} records imported, validated, and drafted with Brain context.`, "Import complete");
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Upload Customer & Account Data</h1>
        <p className="text-sm text-slate-500 mt-1">Upload, map, preview, select offer/playbook, validate, and generate Brain-grounded drafts.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700"><span className="font-semibold">Auto-send OFF:</span> mapped fields, Business Knowledge, App Mindset, and Offer Library feed generation. Human approval is still required.</p>
      </div>

      {!data.length && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) parseFile(file); }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 transition-colors cursor-pointer ${isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"}`}
        >
          <input type="file" accept=".csv,.xlsx" onChange={(e) => { const file = e.target.files?.[0]; if (file) parseFile(file); }} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="flex flex-col items-center gap-4 cursor-pointer">
            <div className="rounded-full bg-indigo-100 p-5"><UploadCloud className="h-10 w-10 text-indigo-500" /></div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-800">Drag & drop your CRM export here</p>
              <p className="text-sm text-slate-500 mt-1">or <span className="text-indigo-600 underline">click to browse</span></p>
              <p className="text-xs text-slate-400 mt-2">CSV supported in this demo flow</p>
            </div>
          </label>
        </div>
      )}

      {data.length > 0 && !results.length && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-100 p-3"><FileText className="h-6 w-6 text-emerald-600" /></div>
              <div>
                <p className="font-semibold text-slate-800">{fileName}</p>
                <p className="text-sm text-slate-500">{data.length} records loaded · {headers.length} columns detected</p>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={isProcessing || generationBlocked} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60">
              {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Zap className="h-4 w-4" /> Validate & Generate Drafts</>}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-900">Map Fields</h2>
              <p className="text-xs text-slate-500 mt-1">Map each uploaded column to a standard field, custom field, or ignore it.</p>
              <div className="mt-4 space-y-2">
                {headers.map((header) => (
                  <div key={header} className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded column</p>
                      <p className="text-sm font-semibold text-slate-800">{header}</p>
                    </div>
                    <select value={fieldMapping[header] || "Ignore column"} onChange={(e) => setFieldMapping((prev) => ({ ...prev, [header]: e.target.value }))} className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                      <option value="Ignore column">Ignore column</option>
                      <optgroup label="Standard fields">
                        {STANDARD_IMPORT_FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}
                      </optgroup>
                      {customFields.length > 0 && (
                        <optgroup label="Custom fields">
                          {customFields.map((field) => <option key={field} value={field}>{field}</option>)}
                        </optgroup>
                      )}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                <input value={newCustomField} onChange={(e) => setNewCustomField(e.target.value)} placeholder="Create new custom field, e.g. Tax Season Volume" className="rounded-lg border-slate-200 text-sm" />
                <button onClick={addCustomField} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><PlusCircle className="h-4 w-4" /> Add Custom Field</button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">Offer & Playbook</h2>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Offer Library Item</label>
                  <select value={selectedOfferId} onChange={(e) => setSelectedOfferId(e.target.value)} className="mt-1 w-full rounded-lg border-slate-200 text-sm font-semibold">
                    <option value="">Select offer</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.offerName} ({offer.status})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Playbook</label>
                  <input value={selectedPlaybook} onChange={(e) => setSelectedPlaybook(e.target.value)} className="mt-1 w-full rounded-lg border-slate-200 text-sm font-semibold" />
                </div>
                {selectedOffer && selectedOffer.status !== "Active" && <p className="text-xs font-semibold text-amber-700">Selected offer is not active. Generation will warn and block approval.</p>}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Bulk Account Context</h2>
                  <p className="mt-1 text-xs text-slate-500">Optional context applied to this import. Row fields still win where they are more specific.</p>
                </div>
                <textarea
                  value={bulkAccountContext.rawText}
                  onChange={(e) => setBulkAccountContext((prev) => ({ ...prev, rawText: e.target.value }))}
                  rows={5}
                  placeholder="Paste account notes, renewal situation, pain points, CRM notes, website research, or why the selected offer may be relevant."
                  className="w-full rounded-lg border-slate-200 text-sm"
                />
                <div className="grid grid-cols-1 gap-2">
                  {[
                    ["currentPlan", "Current Plan"],
                    ["currentProduct", "Current Product"],
                    ["renewalDate", "Renewal Date"],
                    ["industry", "Industry"],
                    ["painPoints", "Pain Points"],
                    ["recommendedUpsell", "Recommended Upsell"],
                    ["sourceOfInformation", "Source of Information"],
                  ].map(([key, label]) => (
                    <input
                      key={key}
                      value={String(bulkAccountContext[key as keyof ManualAccountContext] || "")}
                      onChange={(e) => setBulkAccountContext((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={label}
                      className="rounded-lg border-slate-200 text-sm"
                    />
                  ))}
                  <select
                    value={bulkAccountContext.confidenceLevel}
                    onChange={(e) => setBulkAccountContext((prev) => ({ ...prev, confidenceLevel: e.target.value as ManualAccountContext["confidenceLevel"] }))}
                    className="rounded-lg border-slate-200 text-sm"
                  >
                    <option value="">Confidence Level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <select
                    value={bulkAccountContext.saveMode}
                    onChange={(e) => setBulkAccountContext((prev) => ({ ...prev, saveMode: e.target.value as AccountContextSaveMode }))}
                    className="rounded-lg border-slate-200 text-sm"
                  >
                    <option value="contact">Save to this contact/account</option>
                    <option value="use_once">Use once for this draft only</option>
                    <option value="company">Save to company/account profile</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">Mapping Templates</h2>
                <div className="flex gap-2">
                  <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="min-w-0 flex-1 rounded-lg border-slate-200 text-sm" />
                  <button onClick={saveTemplate} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" /> Save</button>
                </div>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <button onClick={() => loadTemplate(template)} className="text-left text-xs font-bold text-indigo-700">{template.templateName}</button>
                      <button onClick={() => deleteTemplate(template.id)} className="text-xs font-bold text-slate-400 hover:text-red-600">Delete</button>
                    </div>
                  ))}
                  {!templates.length && <p className="text-xs text-slate-500">No saved templates yet.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900">Preview First 5 Rows</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase tracking-widest">
                  <tr><th className="p-2">Email</th><th className="p-2">Identity</th><th className="p-2">Offer</th><th className="p-2">Custom Fields</th><th className="p-2">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map(({ standard, custom }, index) => {
                    const email = standard.Email || "";
                    const identity = standard["Company Name"] || standard["Business Name"] || standard["Full Name"] || "";
                    return (
                      <tr key={index}>
                        <td className="p-2 font-semibold text-slate-700">{email || "Missing email"}</td>
                        <td className="p-2 text-slate-600">{identity || "Needs review"}</td>
                        <td className="p-2 text-slate-600">{selectedOffer?.offerName || "Missing offer"}</td>
                        <td className="p-2 text-slate-600">{Object.keys(custom).join(", ") || "None"}</td>
                        <td className={`p-2 font-bold ${email ? "text-emerald-600" : "text-red-600"}`}>{email ? "Validatable" : "Blocked"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {(!hasEmailMapping || !hasIdentityMapping) && <p className="mt-3 text-xs font-semibold text-amber-700">Required check: Email is required. Company Name, Business Name, or Full Name is strongly required and will mark records Needs Review if missing.</p>}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Generated Drafts <span className="ml-2 text-sm font-normal text-slate-500">{results.length} total</span></h2>
            <button onClick={() => { setData([]); setResults([]); setFileName(""); }} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"><RefreshCw className="h-4 w-4" /> Start Over</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["ORC validation", "SENTINEL strategy", "SCRIBE draft", "LEXI QA"].map((label) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{label}</p>
                <p className="text-xs text-slate-500 mt-1">Context applied</p>
              </div>
            ))}
          </div>
          {results.map((row) => (
            <div key={row._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{row._name}</p>
                  <p className="text-sm text-slate-500">{row._company} · {row._ai_context.offerUsed}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${row._score >= 90 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>QA {row._score} · {row._status}</span>
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">{row._body}</div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-indigo-50 px-3 py-1 font-bold text-indigo-700">Business Knowledge: {row._ai_context.businessKnowledgeUsed ? "Yes" : "No"}</span>
                <span className="rounded-lg bg-violet-50 px-3 py-1 font-bold text-violet-700">App Mindset: {row._ai_context.appMindsetUsed ? "Yes" : "No"}</span>
                <span className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-700">Custom fields: {row._ai_context.customFieldsUsed.length || 0}</span>
                <span className="rounded-lg bg-blue-50 px-3 py-1 font-bold text-blue-700">Account Context: {row._ai_context.accountContextStatus || "None"}</span>
                <span className="rounded-lg bg-emerald-50 px-3 py-1 font-bold text-emerald-700">Personalization: {row._ai_context.personalizationLevel || "Basic"}</span>
              </div>
              {row._qa_issues.length > 0 && <p className="mt-3 text-xs font-semibold text-amber-700">{row._qa_issues.join(" · ")}</p>}
              {row._score >= QA_APPROVAL_THRESHOLD && <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"><CheckCircle className="h-4 w-4" /> Ready for Draft Review</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
