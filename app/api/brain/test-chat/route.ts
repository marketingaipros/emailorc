import { NextResponse } from "next/server";
import {
  TEST_CHAT_TASKS,
  getOpenRouterKey,
  logBrainUsage,
  normalizeMode,
  pickModel,
  safeErrorMessage,
  sendOpenRouterChat,
} from "@/lib/brain/openrouter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = String(body.provider || "OpenRouter");
  const environment = String(body.environment || process.env.APP_ENV || "Demo");
  const modelMode = normalizeMode(body.model_mode);
  const model = pickModel(modelMode, body.model);
  const task = String(body.task || "General Test");
  const prompt = String(body.prompt || "").trim();
  const orgId = body.org_id || null;
  const userId = body.user_id || null;
  const creditsCharged = 1;

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

    const result = await sendOpenRouterChat({
      apiKey: key,
      model,
      prompt,
      systemPrompt: TEST_CHAT_TASKS[task] || TEST_CHAT_TASKS["General Test"],
      maxTokens: 260,
    });

    const promptTokens = result.usage?.prompt_tokens ?? null;
    const completionTokens = result.usage?.completion_tokens ?? null;

    await logBrainUsage({
      orgId,
      userId,
      action: `MODEL_TEST_CHAT:${task}`,
      provider,
      model,
      modelMode,
      promptTokens,
      completionTokens,
      estimatedApiCost: null,
      creditsCharged,
      success: true,
      environment,
    });

    return NextResponse.json({
      status: "success",
      provider,
      model_used: model,
      model_mode: modelMode,
      task,
      response: result.content,
      response_time_ms: result.responseTimeMs,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      credits_charged: creditsCharged,
      estimated_api_cost: null,
      subscription_status: "Active",
      credits_remaining: null,
      message: "Model test chat completed.",
    });
  } catch (error) {
    const safeError = safeErrorMessage(error);
    await logBrainUsage({
      orgId,
      userId,
      action: `MODEL_TEST_CHAT:${task}`,
      provider,
      model,
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
      provider,
      model_used: model,
      model_mode: modelMode,
      message: "Model test chat failed.",
      safe_error: safeError,
    }, { status: 502 });
  }
}
