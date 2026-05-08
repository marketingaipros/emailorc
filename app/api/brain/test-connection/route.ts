import { NextResponse } from "next/server";
import {
  fetchOpenRouterModels,
  getOpenRouterKey,
  logBrainUsage,
  normalizeMode,
  OPENROUTER_CHAT_ENDPOINT,
  pickModel,
  safeErrorMessage,
  sendOpenRouterChat,
  verifyOpenRouterKey,
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

    const keyStatus = await verifyOpenRouterKey(key);
    const availableModels = await fetchOpenRouterModels(key);
    if (!availableModels.includes(selectedModel)) {
      throw new Error(`Selected model unavailable in OpenRouter. Choose another model. Requested model_id: ${selectedModel}.`);
    }

    const chatResult = await sendOpenRouterChat({
      apiKey: key,
      model: selectedModel,
      prompt: "Reply with exactly: connected",
      systemPrompt: "",
      maxTokens: 24,
      timeoutMs: 20000,
    });

    if (!/connected/i.test(chatResult.content)) {
      throw new Error("Selected model returned output, but it did not pass the connection verification prompt.");
    }

    const usageLogId = await logBrainUsage({
      orgId,
      userId,
      action: "OPENROUTER_TEST_CONNECTION",
      provider,
      model: selectedModel,
      modelRequested: selectedModel,
      modelMode,
      promptTokens: chatResult.usage?.prompt_tokens,
      completionTokens: chatResult.usage?.completion_tokens,
      estimatedApiCost: null,
      creditsCharged: 0,
      success: true,
      environment,
      endpoint: OPENROUTER_CHAT_ENDPOINT,
      responseStatus: chatResult.rawStatus,
      contentLength: chatResult.contentLength,
    });

    return NextResponse.json({
      status: "connected",
      provider: "OpenRouter",
      environment,
      model_mode: modelMode,
      model_tested: selectedModel,
      model_key_source: source,
      available_models_loaded: availableModels.length > 0,
      available_models_count: availableModels.length,
      selected_model_available: true,
      key_verified: true,
      key_usage: keyStatus.usage,
      key_limit: keyStatus.limit,
      key_limit_remaining: keyStatus.limitRemaining,
      key_expires_at: keyStatus.expiresAt,
      live_model_response: true,
      response_preview: chatResult.content.slice(0, 80),
      content_length: chatResult.contentLength,
      response_status: chatResult.rawStatus,
      finish_reason: chatResult.finishReason,
      endpoint: OPENROUTER_CHAT_ENDPOINT,
      usage_log_id: usageLogId,
      credits_charged: 0,
      message: "OpenRouter connection successful.",
      last_tested: testedAt,
    });
  } catch (error) {
    const safeError = safeErrorMessage(error);
    const emptyResponse = /empty model response|did not include choices|no usable/i.test(safeError);
    const usageLogId = await logBrainUsage({
      orgId,
      userId,
      action: "OPENROUTER_TEST_CONNECTION",
      provider,
      model: selectedModel,
      modelRequested: selectedModel,
      modelMode,
      promptTokens: null,
      completionTokens: null,
      estimatedApiCost: null,
      creditsCharged: 0,
      success: false,
      errorMessage: safeError,
      environment,
      endpoint: OPENROUTER_CHAT_ENDPOINT,
      responseStatus: null,
      contentLength: 0,
    });

    return NextResponse.json({
      status: "error",
      provider: "OpenRouter",
      environment,
      model_mode: modelMode,
      model_tested: selectedModel,
      message: emptyResponse ? "OpenRouter connected, but selected model returned no usable response." : "Invalid API key, unavailable model, or provider error.",
      safe_error: safeError,
      live_model_response: false,
      content_length: 0,
      selected_model_available: !/Selected model unavailable/i.test(safeError),
      endpoint: OPENROUTER_CHAT_ENDPOINT,
      usage_log_id: usageLogId,
      credits_charged: 0,
      last_tested: testedAt,
    }, { status: 502 });
  }
}
