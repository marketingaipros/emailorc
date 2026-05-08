import { NextResponse } from "next/server";
import { fetchOpenRouterModelCatalog, getOpenRouterKey, safeErrorMessage, verifyOpenRouterKey } from "@/lib/brain/openrouter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org_id") || undefined;

  try {
    const { key, source } = await getOpenRouterKey(orgId);
    if (!key) {
      return NextResponse.json({
        success: false,
        error_code: "no_key_saved",
        message: "No OpenRouter key saved.",
        models: [],
      }, { status: 400 });
    }

    await verifyOpenRouterKey(key);
    const models = await fetchOpenRouterModelCatalog(key);

    return NextResponse.json({
      success: true,
      provider: "OpenRouter",
      key_source: source === "secret" ? "Server Cloudflare Secret" : "Organization Saved Key",
      models,
      model_ids: models.map((model) => model.id),
      count: models.length,
      message: `Loaded ${models.length} OpenRouter models.`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error_code: "models_sync_failed",
      message: "Could not load OpenRouter models.",
      safe_error: safeErrorMessage(error),
      models: [],
    }, { status: 502 });
  }
}
