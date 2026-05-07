import { NextResponse } from "next/server";
import { saveOpenRouterKey, safeErrorMessage } from "@/lib/brain/openrouter";

export const dynamic = "force-dynamic";

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
      status: "saved",
      provider: "OpenRouter",
      masked_key: masked,
      message: "OpenRouter API key saved securely.",
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Could not save OpenRouter API key.",
      safe_error: safeErrorMessage(error),
    }, { status: 400 });
  }
}
