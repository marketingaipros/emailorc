"use client";

import React, { useState } from "react";
import { MessageSquare, Loader2, ShieldAlert, CheckCircle, AlertTriangle, XCircle, ThumbsUp, HelpCircle, Copy } from "lucide-react";

type Classification = "Interested" | "Pricing Question" | "Objection" | "Not Interested" | "Remove Me" | "Needs Human Review";
type Sentiment = "Positive" | "Neutral" | "Negative";
type RiskLevel = "Low" | "Medium" | "High";

interface AnalysisResult {
  classification: Classification;
  sentiment: Sentiment;
  intent: string;
  risk: RiskLevel;
  nextAction: string;
  draftResponse: string;
  approvalStatus: "Pending Human Approval";
}

const CLASS_CONFIG: Record<Classification, { color: string; icon: React.ReactNode }> = {
  "Interested":          { color: "bg-emerald-50 text-emerald-700 border-emerald-200",  icon: <ThumbsUp className="h-4 w-4" /> },
  "Pricing Question":    { color: "bg-blue-50 text-blue-700 border-blue-200",           icon: <HelpCircle className="h-4 w-4" /> },
  "Objection":           { color: "bg-amber-50 text-amber-700 border-amber-200",        icon: <AlertTriangle className="h-4 w-4" /> },
  "Not Interested":      { color: "bg-orange-50 text-orange-700 border-orange-200",     icon: <XCircle className="h-4 w-4" /> },
  "Remove Me":           { color: "bg-red-50 text-red-700 border-red-200",              icon: <XCircle className="h-4 w-4" /> },
  "Needs Human Review":  { color: "bg-violet-50 text-violet-700 border-violet-200",     icon: <MessageSquare className="h-4 w-4" /> },
};

const RISK_COLOR: Record<RiskLevel, string> = {
  Low:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High:   "bg-red-50 text-red-700 border-red-200",
};

const SENT_COLOR: Record<Sentiment, string> = {
  Positive: "text-emerald-600",
  Neutral:  "text-slate-500",
  Negative: "text-red-500",
};

function classifyReply(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  if (lower.includes("unsubscribe") || lower.includes("remove me") || lower.includes("stop emailing")) {
    return {
      classification: "Remove Me", sentiment: "Negative", risk: "High",
      intent: "Customer is requesting removal from outreach list.",
      nextAction: "Immediately add to Do Not Contact list. Do NOT reply with sales content.",
      draftResponse: "Hi [Name],\n\nI've received your request and have removed you from our outreach list immediately. You will not receive further emails from our team.\n\nApologies for any inconvenience.\n\nBest regards,\nAccount Team",
      approvalStatus: "Pending Human Approval",
    };
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much") || lower.includes("pricing")) {
    return {
      classification: "Pricing Question", sentiment: "Neutral", risk: "Low",
      intent: "Customer is asking about pricing before committing.",
      nextAction: "Send pricing guide and offer a personalized quote call.",
      draftResponse: "Hi [Name],\n\nGreat question! Pricing for the Enterprise Suite starts at $X/month depending on team size and usage volume. I'd love to put together a custom quote tailored specifically to [Company]'s needs.\n\nWould a 20-minute call this week work? I can walk you through options and have a proposal ready in advance.\n\nBest,\nAccount Growth Team",
      approvalStatus: "Pending Human Approval",
    };
  }
  if (lower.includes("interested") || lower.includes("yes") || lower.includes("love to") || lower.includes("let's chat") || lower.includes("sounds good")) {
    return {
      classification: "Interested", sentiment: "Positive", risk: "Low",
      intent: "Customer has expressed interest and wants to move forward.",
      nextAction: "Book a discovery call immediately. Respond within 2 hours.",
      draftResponse: "Hi [Name],\n\nWonderful — I'm glad to hear it! I've just sent over a calendar link so you can grab a time that works best for you: [CALENDAR LINK]\n\nI'll come prepared with a tailored overview for [Company] and some specific use cases in the [Industry] space.\n\nLooking forward to speaking!\n\nBest,\nAccount Growth Team",
      approvalStatus: "Pending Human Approval",
    };
  }
  if (lower.includes("not interested") || lower.includes("no thanks") || lower.includes("not right now")) {
    return {
      classification: "Not Interested", sentiment: "Negative", risk: "Medium",
      intent: "Customer has declined the current offer.",
      nextAction: "Acknowledge politely. Add a 90-day follow-up task. Do not push.",
      draftResponse: "Hi [Name],\n\nCompletely understood — timing is everything. I'll check back in a few months in case your needs change, but I won't crowd your inbox in the meantime.\n\nThanks for the honest response, I appreciate it.\n\nBest,\nAccount Growth Team",
      approvalStatus: "Pending Human Approval",
    };
  }
  if (lower.includes("but") || lower.includes("concern") || lower.includes("however") || lower.includes("issue") || lower.includes("problem")) {
    return {
      classification: "Objection", sentiment: "Neutral", risk: "Medium",
      intent: "Customer has a concern or objection that needs to be addressed.",
      nextAction: "Acknowledge the concern directly. Offer a case study or proof point.",
      draftResponse: "Hi [Name],\n\nThank you for sharing that — it's a completely valid concern and one I hear from teams at a similar stage. We've worked through this exact scenario with [Similar Company], and I'd love to share what worked for them.\n\nWould it be helpful if I sent over a quick case study, or would you prefer to talk through it directly?\n\nBest,\nAccount Growth Team",
      approvalStatus: "Pending Human Approval",
    };
  }
  return {
    classification: "Needs Human Review", sentiment: "Neutral", risk: "Medium",
    intent: "The intent of this reply could not be confidently determined by the AI.",
    nextAction: "A human rep should read this reply and respond manually.",
    draftResponse: "Hi [Name],\n\nThank you for getting back to me. I want to make sure I address your message correctly — would you mind if I gave you a quick call to follow up directly?\n\nBest,\nAccount Growth Team",
    approvalStatus: "Pending Human Approval",
  };
}

export default function ReplyAssistantPage() {
  const [replyText, setReplyText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [approved, setApproved] = useState(false);

  const handleAnalyze = () => {
    if (!replyText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setApproved(false);
    setTimeout(() => {
      setResult(classifyReply(replyText));
      setIsAnalyzing(false);
    }, 1800);
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reply Intelligence</h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyze customer replies to classify intent, assess risk, and generate AI-drafted responses for human approval.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700">
          <span className="font-semibold">Human approval required.</span> All AI-drafted responses must be reviewed and approved before being sent to a customer.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">Paste Customer Reply</label>
        <textarea
          rows={6}
          value={replyText}
          onChange={(e) => { setReplyText(e.target.value); setResult(null); setApproved(false); }}
          placeholder="Paste the customer's email reply here..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!replyText.trim() || isAnalyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><MessageSquare className="h-4 w-4" /> Analyze Reply</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Classification Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Classification", value: result.classification, extra: CLASS_CONFIG[result.classification].color },
              { label: "Sentiment", value: result.sentiment, extra: "" },
              { label: "Risk Level", value: result.risk, extra: RISK_COLOR[result.risk] },
              { label: "Approval", value: result.approvalStatus, extra: "bg-amber-50 text-amber-700 border-amber-200" },
            ].map(({ label, value, extra }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs font-medium text-slate-400 mb-2">{label}</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${extra || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Intent & Next Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Detected Intent</p>
              <p className="text-sm text-slate-700">{result.intent}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Recommended Next Action</p>
              <p className="text-sm text-slate-700 font-medium">{result.nextAction}</p>
            </div>
          </div>

          {/* Draft Response */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">AI Draft Response</p>
              <button
                onClick={() => copy(result.draftResponse)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{result.draftResponse}</p>
            </div>
            <div className="flex justify-end">
              {!approved ? (
                <button
                  onClick={() => setApproved(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <CheckCircle className="h-4 w-4" /> Approve & Use Response
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
                  <CheckCircle className="h-4 w-4" /> Approved — Ready to Send
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
