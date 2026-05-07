import { NextResponse } from "next/server";
import {
  fetchOpenRouterModels,
  getOpenRouterKey,
  logBrainUsage,
  normalizeMode,
  pickModel,
  safeErrorMessage,
  sendOpenRouterChat,
} from "@/lib/brain/openrouter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const testedAt = new Date().toISOString();
  const body = await request.json().catch(() => ({}));
  const provider = String(body.provider || "OpenRouter");
  const environment = String(body.environment || process.env.APP_ENV || "Demo");
  const modelMode = normalizeMode(body.selected_model_mode);
  const selectedModel = pickModel(modelMode, body.selected_model);
  const orgId = body.org_id || null;
  const userId = body.user_id || null;

  if (provider !== "OpenRouter") {
    return NextResponse.json({
      status: "error",
      provider,
      message: "Invalid API provider.",
      safe_error: "Only OpenRouter is supported in this test route.",
    }, { status: 400 });
  }

  try {
    const { key, source } = await getOpenRouterKey(orgId);
    if (!key) {
      throw new Error("OpenRouter API key is not configured. Save a key or set the OPENROUTER_API_KEY Cloudflare secret.");
    }

    const availableModels = await fetchOpenRouterModels(key);
    let modelTested = selectedModel;
    if (!availableModels.includes(modelTested)) {
      modelTested = availableModels.find((model) => model.includes("gpt-4o-mini")) || availableModels[0] || selectedModel;
    }
    if (!modelTested) {
      throw new Error("OpenRouter authenticated, but no models were returned for this account.");
    }

    const chatResult = await sendOpenRouterChat({
      apiKey: key,
      model: modelTested,
      prompt: "Reply with exactly: EmailORC connection ok",
      systemPrompt: "You are validating an API connection. Keep the response short.",
      maxTokens: 24,
    });

    await logBrainUsage({
      orgId,
      userId,
      action: "OPENROUTER_TEST_CONNECTION",
      provider,
      model: modelTested,
      modelMode,
      promptTokens: chatResult.usage?.prompt_tokens,
      completionTokens: chatResult.usage?.completion_tokens,
      estimatedApiCost: null,
      creditsCharged: 0,
      success: true,
      environment,
    });

    return NextResponse.json({
      status: "connected",
      provider: "OpenRouter",
      environment,
      model_mode: modelMode,
      model_tested: modelTested,
      model_key_source: source,
      available_models_loaded: availableModels.length > 0,
      message: "OpenRouter connection successful.",
      last_tested: testedAt,
    });
  } catch (error) {
    const safeError = safeErrorMessage(error);
    await logBrainUsage({
      orgId,
      userId,
      action: "OPENROUTER_TEST_CONNECTION",
      provider,
      model: selectedModel,
      modelMode,
      promptTokens: null,
      completionTokens: null,
      estimatedApiCost: null,
      creditsCharged: 0,
      success: false,
      errorMessage: safeError,
      environment,
    });

    return NextResponse.json({
      status: "error",
      provider: "OpenRouter",
      environment,
      model_mode: modelMode,
      model_tested: selectedModel,
      message: "Invalid API key, unavailable model, or provider error.",
      safe_error: safeError,
      last_tested: testedAt,
    }, { status: 502 });
  }
}
