import { createId } from "@/lib/cloudflare-db";

export function appBaseUrl(request?: Request) {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }
  return "http://localhost:3000";
}

export function inviteUrl(token: string, request?: Request) {
  return `${appBaseUrl(request)}/accept-invite?token=${encodeURIComponent(token)}`;
}

export function maskedEmailConfig() {
  return {
    provider: process.env.EMAIL_PROVIDER || "manual",
    fromEmail: process.env.FROM_EMAIL || "",
    fromName: process.env.FROM_NAME || "Account Growth Command Center",
    configured: Boolean(process.env.EMAIL_PROVIDER && process.env.FROM_EMAIL && (process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER === "manual")),
  };
}

export async function sendInviteEmail(params: {
  to: string;
  firstName?: string;
  organizationName?: string;
  inviteUrl: string;
  expiresAt: string;
}) {
  const provider = String(process.env.EMAIL_PROVIDER || "").toLowerCase();
  const fromEmail = process.env.FROM_EMAIL || "";
  const fromName = process.env.FROM_NAME || "Account Growth Command Center";

  if (!provider || provider === "manual") {
    return { sent: false, provider: "manual", safeError: "email_provider_not_configured" };
  }

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY || "";
    if (!apiKey || !fromEmail) return { sent: false, provider: "resend", safeError: "missing_resend_configuration" };
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [params.to],
        subject: "You're invited to Account Growth Command Center",
        text: `Hi ${params.firstName || "there"},

You've been invited to join ${params.organizationName || "your organization"} in Account Growth Command Center.

Use this secure link to finish setting up your account:

${params.inviteUrl}

This invite expires on ${new Date(params.expiresAt).toLocaleString()}.

If you were not expecting this invitation, you can ignore this email.`,
      }),
    });
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) return { sent: false, provider: "resend", safeError: data?.message || data?.error || "resend_send_failed" };
    return { sent: true, provider: "resend", providerId: data?.id || createId("resend") };
  }

  return { sent: false, provider, safeError: `${provider}_not_implemented` };
}
