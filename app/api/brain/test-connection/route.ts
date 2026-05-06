import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, environment, selected_model_mode } = body;

    // In a real app, we would retrieve the API key from a secure database/vault here.
    // For this demo, we'll simulate the check.
    // We assume the key is "sk_demo_9a8b7c6d5e4f3g2h1i0j" or similar.
    
    // Simulate a lightweight request to OpenRouter
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple validation logic for the demo
    if (provider === 'OpenRouter') {
      return NextResponse.json({
        status: "connected",
        provider: "OpenRouter",
        environment: environment || "Test Live",
        model_mode: selected_model_mode || "Balanced",
        message: "OpenRouter connection successful.",
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      status: "error",
      provider: provider || "Unknown",
      message: "Invalid API key or provider unavailable."
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Internal server error during connection test."
    }, { status: 500 });
  }
}
