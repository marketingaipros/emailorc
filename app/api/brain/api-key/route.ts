import { NextResponse } from "next/server";
import { getOpenRouterKeyStatus, saveOpenRouterKey, safeErrorMessage } from "@/lib/brain/openrouter";

export const dynamic = "force-dynamic";

function errorCode(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const match = message.match(/^([a-z_]+):/);
  return match?.[1] || "database_write_failed";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org_id") || undefined;
  const status = await getOpenRouterKeyStatus(orgId);
  return NextResponse.json({
    success: true,
    provider: "OpenRouter",
    configured: status.configured,
    key_source: status.source === "secret" ? "Server Cloudflare Secret" : status.source === "stored" ? "Organization Saved Key" : "Not Configured",
    key_status: status.configured ? "Saved" : "Missing",
    masked_key: status.maskedKey,
    database_available: status.dbAvailable,
    environment: process.env.APP_ENV || process.env.NODE_ENV || "development",
  });
}

export async function POST(request: Request) {
  try {
    const { provider, api_key, org_id } = await request.json();
    if (provider !== "OpenRouter") {
      return NextResponse.json({ error: "Only OpenRouter keys are supported right now." }, { status: 400 });
    }
    if (!org_id) {
      return NextResponse.json({ error: "Organization is required to save an API key." }, { status: 400 });
    }

    const masked = await saveOpenRouterKey({ orgId: org_id, apiKey: String(api_key || "") });
    return NextResponse.json({
      success: true,
      status: "saved",
      provider: "OpenRouter",
      masked_key: masked,
      key_source: "Organization Saved Key",
      key_status: "Saved",
      message: "OpenRouter API key saved.",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: "error",
      error_code: errorCode(error),
      message: "Could not save OpenRouter API key.",
      safe_error: safeErrorMessage(error),
    }, { status: 400 });
  }
}
