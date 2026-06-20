"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink, Clock, Lock, CheckCircle2, Zap, AlertTriangle, Shield, Unplug } from "lucide-react";

type BadgeType = "planned" | "coming-soon" | "manual-now" | "requires-access" | "requires-review";

interface Integration {
  name: string;
  description: string;
  badge: BadgeType;
  icon: string;
}

type MicrosoftStatus = {
  connected: boolean;
  accountHint?: string;
  connectedAt?: string | null;
  lastSuccessAt?: string | null;
  reconnectRequired?: boolean;
  storageAvailable?: boolean;
};

const BADGE_CONFIG: Record<BadgeType, { label: string; color: string; icon: React.ReactNode }> = {
  "planned":          { label: "Planned",                      color: "bg-blue-50 text-blue-700 border-blue-200",      icon: <Clock className="h-3 w-3" /> },
  "coming-soon":      { label: "Coming Soon",                  color: "bg-violet-50 text-violet-700 border-violet-200", icon: <Zap className="h-3 w-3" /> },
  "manual-now":       { label: "Manual Export Available Now",  color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  "requires-access":  { label: "Requires Admin Access",        color: "bg-amber-50 text-amber-700 border-amber-200",   icon: <Lock className="h-3 w-3" /> },
  "requires-review":  { label: "Requires Microsoft 365 Review",color: "bg-orange-50 text-orange-700 border-orange-200", icon: <AlertTriangle className="h-3 w-3" /> },
};

const EMAIL_INTEGRATIONS: Integration[] = [
  { name: "Gmail",              icon: "G",  badge: "planned",        description: "Send approved drafts directly from Gmail. Drafts are saved to your account for rep review before sending." },
  { name: "Outlook / M365",     icon: "O",  badge: "planned",        description: "Push approved email drafts into Outlook Drafts folder. Requires Microsoft Graph API access." },
  { name: "Microsoft Copilot",  icon: "C",  badge: "requires-review",description: "AI-assisted drafting and co-pilot workflows inside Microsoft 365 environment. Requires IT review." },
];

const CRM_INTEGRATIONS: Integration[] = [
  { name: "Salesforce",         icon: "SF", badge: "requires-access", description: "Sync accounts, contacts, and opportunities. Log approved emails as Activities. Requires Salesforce Admin credentials." },
  { name: "HubSpot",            icon: "HS", badge: "planned",         description: "Pull contacts and deals from HubSpot CRM. Push approved sequences back as enrolled workflows." },
  { name: "Zoho CRM",           icon: "ZO", badge: "planned",         description: "Bi-directional account sync with Zoho CRM. Log outreach results and next-step tasks." },
  { name: "Pipedrive",          icon: "PD", badge: "planned",         description: "Link pipeline stages to approved email drafts. Auto-advance deals on send confirmation." },
  { name: "MS Dynamics",        icon: "D",  badge: "planned",         description: "Enterprise CRM integration for Microsoft Dynamics 365. Requires Microsoft partner approval." },
];

const DATA_INTEGRATIONS: Integration[] = [
  { name: "Google Sheets",      icon: "GS", badge: "manual-now",   description: "Export approved drafts as a Google Sheets–compatible CSV. Import customer data from Google Sheets exports." },
  { name: "Excel / OneDrive",   icon: "XL", badge: "manual-now",   description: "Download XLSX export files. Upload Excel exports from any CRM. Full workflow available today via manual file transfer." },
  { name: "Zapier",             icon: "ZP", badge: "coming-soon",  description: "Trigger workflows when a draft is approved. Connect to 6,000+ apps via Zapier automation." },
  { name: "Make (Integromat)",  icon: "MK", badge: "coming-soon",  description: "Build advanced automation scenarios with Make. Route approvals, notify reps, and update CRMs automatically." },
  { name: "Webhooks / API",     icon: "WH", badge: "coming-soon",  description: "POST approved draft payloads to any endpoint. Build custom workflows with the Account Growth API." },
];

function IntegrationCard({
  item,
  microsoftStatus,
  onMicrosoftDisconnect,
}: {
  item: Integration;
  microsoftStatus?: MicrosoftStatus | null;
  onMicrosoftDisconnect?: () => void;
}) {
  const cfg = BADGE_CONFIG[item.badge];
  const isAvailable = item.badge === "manual-now";
  const isOutlook = item.name === "Outlook / M365";
  const outlookConnected = isOutlook && microsoftStatus?.connected;
  const outlookNeedsReconnect = isOutlook && microsoftStatus?.reconnectRequired;
  const outlookAvailable = isOutlook && microsoftStatus?.storageAvailable !== false;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0">
          {item.icon}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
        {isOutlook && microsoftStatus ? (
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {outlookConnected
              ? `Connected${microsoftStatus.accountHint ? `: ${microsoftStatus.accountHint}` : ""}`
              : outlookNeedsReconnect
                ? "Reconnect required"
                : "Not connected"}
          </p>
        ) : null}
      </div>
      {isOutlook ? (
        <div className="grid grid-cols-1 gap-2">
          <button
            disabled={!outlookAvailable}
            onClick={() => { window.location.href = "/api/integrations/microsoft/connect"; }}
            className={`w-full rounded-lg py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              outlookAvailable ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5" /> {outlookConnected ? "Reconnect Outlook" : "Connect Outlook"}
          </button>
          {outlookConnected && (
            <button
              onClick={onMicrosoftDisconnect}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <Unplug className="h-3.5 w-3.5" /> Disconnect
            </button>
          )}
        </div>
      ) : (
        <button disabled={!isAvailable} className={`w-full rounded-lg py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5
          ${isAvailable
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
          {isAvailable ? <><ExternalLink className="h-3.5 w-3.5" /> Use Manual Export</> : "Not Yet Available"}
        </button>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  items,
  microsoftStatus,
  onMicrosoftDisconnect,
}: {
  title: string;
  subtitle: string;
  items: Integration[];
  microsoftStatus?: MicrosoftStatus | null;
  onMicrosoftDisconnect?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <IntegrationCard
            key={item.name}
            item={item}
            microsoftStatus={microsoftStatus}
            onMicrosoftDisconnect={onMicrosoftDisconnect}
          />
        ))}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [microsoftStatus, setMicrosoftStatus] = useState<MicrosoftStatus | null>(null);

  function refreshMicrosoftStatus() {
    fetch("/api/integrations/microsoft/status")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) setMicrosoftStatus(data); })
      .catch(() => setMicrosoftStatus({ connected: false, storageAvailable: false }));
  }

  useEffect(() => {
    refreshMicrosoftStatus();
  }, []);

  function disconnectMicrosoft() {
    fetch("/api/integrations/microsoft/disconnect", { method: "POST" })
      .then(() => refreshMicrosoftStatus())
      .catch(() => refreshMicrosoftStatus());
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Future third-party connections for CRM, email, and automation platforms.
        </p>
      </div>

      {/* MVP Workflow Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="rounded-xl bg-white/10 p-3 shrink-0">
          <Shield className="h-6 w-6 text-indigo-300" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Current MVP Workflow — No Live Integrations Active</p>
          <p className="text-slate-300 text-xs mt-1">
            Live integrations are not enabled in this MVP. Use CSV/XLSX upload and export to test the full workflow safely before connecting production CRM or email systems.
          </p>
        </div>
        <div className="shrink-0 rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-xs font-semibold text-indigo-200">
          Manual Export Available Now
        </div>
      </div>

      <Section
        title="Email Integrations"
        subtitle="Send approved drafts directly through your team's existing email platform."
        items={EMAIL_INTEGRATIONS}
        microsoftStatus={microsoftStatus}
        onMicrosoftDisconnect={disconnectMicrosoft}
      />
      <Section
        title="CRM Integrations"
        subtitle="Sync account data, log outreach activities, and advance pipeline stages automatically."
        items={CRM_INTEGRATIONS}
      />
      <Section
        title="Data & Automation Integrations"
        subtitle="Connect spreadsheets, workflow tools, and custom APIs to extend the platform."
        items={DATA_INTEGRATIONS}
      />

      {/* Security Notes */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-slate-600" />
          <h2 className="text-base font-semibold text-slate-900">Security & Compliance Notes</h2>
        </div>
        {[
          "Admin approval may be required before enabling any live CRM or email integration.",
          "API access credentials must be reviewed and stored securely before connecting production systems.",
          "All data handling practices must be reviewed before enabling live sync with customer records.",
          "Human approval remains required for all email drafts unless explicitly changed by an admin.",
          "Auto-send is OFF by default and requires a deliberate admin override to enable.",
        ].map((note) => (
          <div key={note} className="flex items-start gap-3 text-sm text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>{note}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
