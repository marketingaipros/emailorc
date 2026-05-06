"use client";

import React, { useState } from "react";
import { Shield, ToggleLeft, ToggleRight, Save, BookOpen, Package, AlertOctagon, User, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  // Safety
  const [autoSend, setAutoSend] = useState(false);
  const [humanApproval, setHumanApproval] = useState(true);
  const [lowConfidenceReview, setLowConfidenceReview] = useState(true);
  const [noInventedFacts, setNoInventedFacts] = useState(true);
  const [unsubDetection, setUnsubDetection] = useState(true);

  // Brand Voice
  const [brandVoice, setBrandVoice] = useState("Professional, consultative, and warm. Lead with customer value. Avoid aggressive or high-pressure language.");
  const [bannedPhrases, setBannedPhrases] = useState("act now, limited time, you must, guaranteed, free money, click here, no risk");
  const [approvedPhrases, setApprovedPhrases] = useState("tailored for you, based on your usage, we noticed, your team, at your scale");
  const [industryLanguage, setIndustryLanguage] = useState("Use vertical-specific terminology where applicable (e.g., 'accounts' for finance, 'patients' for healthcare).");

  // Campaign Rules
  const [defaultCta, setDefaultCta] = useState("Schedule a 15-minute discovery call");
  const [qaThreshold, setQaThreshold] = useState(75);
  const [emailLength, setEmailLength] = useState(200);
  const [maxEmailsPerContact, setMaxEmailsPerContact] = useState(3);
  const [followUpSpacing, setFollowUpSpacing] = useState(7);

  // Sender
  const [senderName, setSenderName] = useState("Account Growth Team");
  const [senderTitle, setSenderTitle] = useState("Account Executive");
  const [senderEmail, setSenderEmail] = useState("growth@yourcompany.com");
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [signatureBlock, setSignatureBlock] = useState("Best regards,\n[Sender Name] | [Title]\n[Company] | [Email]");

  // Offer Library
  const [currentProducts, setCurrentProducts] = useState("Starter Plan, Pro Plan, Growth Plan, Enterprise Suite");
  const [upsellProducts, setUpsellProducts] = useState("Pro Plan, Enterprise Suite, Premium Support, Analytics Add-on");
  const [ctaOptions, setCta] = useState("Schedule a demo, Get a custom quote, Watch a 3-minute overview, Start a free trial");
  const [valueProps, setValueProps] = useState("Reduce operational overhead, Accelerate time-to-insight, Scale without adding headcount");

  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Toggle = ({ value, onChange, locked }: { value: boolean; onChange: () => void; locked?: boolean }) => (
    <button onClick={() => !locked && onChange()} className={`flex items-center gap-2 text-sm font-semibold ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      {value
        ? <><ToggleRight className="h-7 w-7 text-indigo-600" /><span className="text-indigo-700">ON</span></>
        : <><ToggleLeft className="h-7 w-7 text-slate-400" /><span className="text-slate-500">OFF</span></>}
    </button>
  );

  const Field = ({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1.5 block">{label}</label>
      {rows
        ? <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" />}
    </div>
  );

  const Card = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        {icon}
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  const ToggleRow = ({ label, sub, value, onChange, locked, lockedMsg }: { label: string; sub: string; value: boolean; onChange: () => void; locked?: boolean; lockedMsg?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Toggle value={value} onChange={onChange} locked={locked} />
        {locked && lockedMsg && <span className="text-xs text-red-500 font-medium">{lockedMsg}</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings & Governance</h1>
          <p className="text-sm text-slate-500 mt-1">Control brand voice, compliance rules, offer library, and approval requirements.</p>
        </div>
        <button onClick={handleSave} className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all ${saved ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
          <Save className="h-4 w-4" /> {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      {/* A. Safety Controls */}
      <Card icon={<Shield className="h-5 w-5 text-indigo-600" />} title="Safety & Approval Controls">
        <ToggleRow label="Auto-Send Emails" sub="Automatically send emails without human review." value={autoSend} onChange={() => {}} locked lockedMsg="Locked OFF for MVP" />
        <ToggleRow label="Require Human Approval" sub="Every draft must be manually approved before export or send." value={humanApproval} onChange={() => setHumanApproval(!humanApproval)} />
        <ToggleRow label="Flag Low-Confidence Records for Manual Review" sub="Records below confidence threshold are held for human triage." value={lowConfidenceReview} onChange={() => setLowConfidenceReview(!lowConfidenceReview)} />
        <ToggleRow label="No Invented Facts Rule" sub="AI is instructed never to fabricate data, stats, or product claims." value={noInventedFacts} onChange={() => setNoInventedFacts(!noInventedFacts)} />
        <ToggleRow label="Unsubscribe Phrase Detection" sub="Automatically detect and flag removal requests in customer replies." value={unsubDetection} onChange={() => setUnsubDetection(!unsubDetection)} />
      </Card>

      {/* B. Brand Voice */}
      <Card icon={<BookOpen className="h-5 w-5 text-indigo-600" />} title="Brand Voice">
        <Field label="Voice & Tone Instructions" value={brandVoice} onChange={setBrandVoice} rows={3} />
        <Field label="Banned Phrases (comma-separated)" value={bannedPhrases} onChange={setBannedPhrases} />
        <Field label="Approved Phrases (comma-separated)" value={approvedPhrases} onChange={setApprovedPhrases} />
        <Field label="Industry-Specific Language Rules" value={industryLanguage} onChange={setIndustryLanguage} rows={2} />
      </Card>

      {/* C. Campaign Rules */}
      <Card icon={<SettingsIcon className="h-5 w-5 text-indigo-600" />} title="Campaign Rules">
        <Field label="Default CTA" value={defaultCta} onChange={setDefaultCta} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-slate-500">Min QA Score</label><span className="text-xs font-bold text-indigo-600">{qaThreshold}/100</span></div>
            <input type="range" min={50} max={100} value={qaThreshold} onChange={(e) => setQaThreshold(+e.target.value)} className="w-full accent-indigo-600" />
          </div>
          <div>
            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-slate-500">Email Length (words)</label><span className="text-xs font-bold text-indigo-600">{emailLength}w</span></div>
            <input type="range" min={100} max={500} step={25} value={emailLength} onChange={(e) => setEmailLength(+e.target.value)} className="w-full accent-indigo-600" />
          </div>
          <div>
            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-slate-500">Max Emails Per Contact</label><span className="text-xs font-bold text-indigo-600">{maxEmailsPerContact}</span></div>
            <input type="range" min={1} max={10} value={maxEmailsPerContact} onChange={(e) => setMaxEmailsPerContact(+e.target.value)} className="w-full accent-indigo-600" />
          </div>
          <div>
            <div className="flex justify-between mb-2"><label className="text-xs font-medium text-slate-500">Follow-Up Spacing (days)</label><span className="text-xs font-bold text-indigo-600">{followUpSpacing}d</span></div>
            <input type="range" min={1} max={30} value={followUpSpacing} onChange={(e) => setFollowUpSpacing(+e.target.value)} className="w-full accent-indigo-600" />
          </div>
        </div>
      </Card>

      {/* D. Sender Info */}
      <Card icon={<User className="h-5 w-5 text-indigo-600" />} title="Sender Information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sender Name" value={senderName} onChange={setSenderName} />
          <Field label="Sender Title" value={senderTitle} onChange={setSenderTitle} />
          <Field label="Sender Email" value={senderEmail} onChange={setSenderEmail} />
          <Field label="Company Name" value={companyName} onChange={setCompanyName} />
        </div>
        <Field label="Signature Block" value={signatureBlock} onChange={setSignatureBlock} rows={3} />
      </Card>

      {/* E. Offer Library */}
      <Card icon={<Package className="h-5 w-5 text-indigo-600" />} title="Offer Library">
        <Field label="Current Products (comma-separated)" value={currentProducts} onChange={setCurrentProducts} />
        <Field label="Upsell / Upgrade Targets (comma-separated)" value={upsellProducts} onChange={setUpsellProducts} />
        <Field label="CTA Options (comma-separated)" value={ctaOptions} onChange={setCta} />
        <Field label="Approved Value Propositions (comma-separated)" value={valueProps} onChange={setValueProps} rows={2} />
      </Card>

      {/* F. Compliance */}
      <Card icon={<AlertOctagon className="h-5 w-5 text-indigo-600" />} title="Compliance Controls">
        <div className="text-sm text-slate-500 space-y-2">
          {[
            "Do-not-contact records are automatically excluded from all drafts and exports.",
            "Unsubscribe phrases detected in customer replies immediately flag the record.",
            "Sensitive data fields (SSN, payment info) must not appear in any upload or export.",
            "AI will not fabricate company facts, product claims, or statistics.",
            "Records below the confidence threshold require human review before drafts are generated.",
            "All exports include a DNC exclusion report for compliance audit purposes.",
          ].map((rule) => (
            <div key={rule} className="flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
