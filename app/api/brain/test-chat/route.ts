import { NextResponse } from "next/server";
import { requireBrainOrganization } from "../../../../src/lib/brain-auth";
import {
  TEST_CHAT_TASKS,
  fetchOpenRouterModels,
  getOpenRouterKey,
  logBrainUsage,
  normalizeMode,
  OPENROUTER_CHAT_ENDPOINT,
  OPENROUTER_TOKEN_DEFAULTS,
  pickModel,
  safeErrorMessage,
  sendOpenRouterChat,
  verifyOpenRouterKey,
} from "../../../../src/lib/brain/openrouter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = String(body.provider || "OpenRouter");
  const environment = String(body.environment || process.env.APP_ENV || "Demo");
  const modelMode = normalizeMode(body.model_mode);
  const model = pickModel(modelMode, body.model);
  const task = String(body.task || "General Test");
  const prompt = String(body.prompt || "").trim();
  const auth = await requireBrainOrganization(request, body.org_id);
  if (auth.response) return auth.response;
  const orgId = auth.organizationId;
  const userId = auth.currentUser.userId;

  if (provider !== "OpenRouter") {
    return NextResponse.json({ status: "error", message: "Only OpenRouter is supported right now." }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ status: "error", message: "Enter a test prompt first." }, { status: 400 });
  }

  try {
    const { key } = await getOpenRouterKey(orgId);
    if (!key) {
      throw new Error("OpenRouter API key is not configured. Save a key or set the OPENROUTER_API_KEY Cloudflare secret.");
    }
    await verifyOpenRouterKey(key);
    const availableModels = await fetchOpenRouterModels(key);
    if (!availableModels.includes(model)) {
      throw new Error("Selected model unavailable in OpenRouter. Choose another model.");
    }

    const result = await sendOpenRouterChat({
      apiKey: key,
      model,
      prompt,
      systemPrompt: TEST_CHAT_TASKS[task] || TEST_CHAT_TASKS["General Test"],
      maxTokens: OPENROUTER_TOKEN_DEFAULTS.model_test_chat,
      timeoutMs: 30000,
    });

    const promptTokens = result.usage?.prompt_tokens ?? null;
    const completionTokens = result.usage?.completion_tokens ?? null;
    const creditsCharged = result.content.trim() ? 1 : 0;
    if (!result.content.trim()) {
      throw new Error("OpenRouter returned an empty model response.");
    }

    const usageLogId = await logBrainUsage({
      orgId,
      userId,
      action: `MODEL_TEST_CHAT:${task}`,
      provider,
      model,
      modelRequested: model,
      modelMode,
      promptTokens,
      completionTokens,
      estimatedApiCost: null,
      creditsCharged,
      success: true,
      environment,
      endpoint: OPENROUTER_CHAT_ENDPOINT,
      responseStatus: result.rawStatus,
      contentLength: result.contentLength,
    });

    return NextResponse.json({
      status: "success",
      provider,
      model_requested: model,
      model_used: model,
      model_mode: modelMode,
      task,
      response: result.content,
      content_length: result.contentLength,
      response_status: result.rawStatus,
      finish_reason: result.finishReason,
      max_tokens_sent: result.maxTokensSent,
      retry_attempted: result.retryAttempted,
      retry_max_tokens: result.retryMaxTokens,
      choices_count: result.choicesCount,
      endpoint: OPENROUTER_CHAT_ENDPOINT,
      live_model_response: true,
      status_label: "Success",
      response_time_ms: result.responseTimeMs,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      credits_charged: creditsCharged,
      estimated_api_cost: null,
      subscription_status: "Active",
      credits_remaining: null,
      usage_log_id: usageLogId,
      message: "Model test chat completed.",
    });
  } catch (error) {
    const safeError = safeErrorMessage(error);
    const usageLogId = await logBrainUsage({
      orgId,
      userId,
      action: `MODEL_TEST_CHAT:${task}`,
      provider,
      model,
      modelRequested: model,
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
      provider,
      model_requested: model,
      model_used: model,
      model_mode: modelMode,
      live_model_response: false,
      status_label: "Failed",
      credits_charged: 0,
      content_length: 0,
      max_tokens_sent: OPENROUTER_TOKEN_DEFAULTS.model_test_chat,
      retry_attempted: /output_limit_too_low|finish reason: length/i.test(safeError),
      retry_max_tokens: /output_limit_too_low|finish reason: length/i.test(safeError) ? 2000 : null,
      endpoint: OPENROUTER_CHAT_ENDPOINT,
      usage_log_id: usageLogId,
      message: "Model test chat failed.",
      safe_error: safeError,
    }, { status: 502 });
  }
}
