import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, environment, selected_model_mode, api_key } = body;
    const serverKey = String(process.env.OPENROUTER_API_KEY || "").trim();
    const submittedKey = String(api_key || "").trim();
    const mode = String(environment || "Demo");
    const key = mode === "Demo" ? (submittedKey || serverKey) : serverKey;

    await new Promise(resolve => setTimeout(resolve, 500));

    if (provider !== 'OpenRouter') {
      return NextResponse.json({
        status: "error",
        provider: provider || "Unknown",
        message: "Invalid API provider."
      }, { status: 400 });
    }

    if (!key) {
      return NextResponse.json({
        status: "invalid_api_key",
        provider: "OpenRouter",
        environment: mode,
        model_mode: selected_model_mode || "Balanced",
        message: "OpenRouter API key is required."
      }, { status: 400 });
    }

    if (key.startsWith("sk_demo_")) {
      if (mode !== "Demo") {
        return NextResponse.json({
          status: "invalid_api_key",
          provider: "OpenRouter",
          environment: mode,
          message: "Demo keys can only be used in Demo mode."
        }, { status: 400 });
      }

      return NextResponse.json({
        status: "connected",
        provider: "OpenRouter",
        environment: mode,
        model_mode: selected_model_mode || "Balanced",
        message: "Demo OpenRouter connection successful.",
        timestamp: new Date().toISOString()
      });
    }

    if (!key.startsWith("sk-or-v1-") || key.length < 48) {
      return NextResponse.json({
        status: "invalid_api_key",
        provider: "OpenRouter",
        environment: mode,
        model_mode: selected_model_mode || "Balanced",
        message: "Invalid OpenRouter key format."
      }, { status: 400 });
    }

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "EmailORC QA",
      },
      cache: "no-store",
    });

    if (!openRouterResponse.ok) {
      return NextResponse.json({
        status: "invalid_api_key",
        provider: "OpenRouter",
        environment: mode,
        model_mode: selected_model_mode || "Balanced",
        message: "OpenRouter rejected this API key."
      }, { status: 401 });
    }

    return NextResponse.json({
      status: "connected",
      provider: "OpenRouter",
      environment: mode,
      model_mode: selected_model_mode || "Balanced",
      message: "OpenRouter connection successful.",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Internal server error during connection test."
    }, { status: 500 });
  }
}
