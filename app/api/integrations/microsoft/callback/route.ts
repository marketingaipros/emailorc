import { NextResponse } from "next/server";
import { getD1Database } from "../../../../../src/lib/cloudflare-db";
import { getCurrentUser, unauthenticatedResponse } from "../../../../../src/lib/current-user";
import { MICROSOFT_ENCRYPTION_CONFIG_ERROR } from "../../../../../src/lib/microsoft/crypto";
import { consumeOAuthState, saveMicrosoftConnection, writeMicrosoftAudit } from "../../../../../src/lib/microsoft/connections";
import { exchangeMicrosoftAuthorizationCode } from "../../../../../src/lib/microsoft/oauth";

export const dynamic = "force-dynamic";

function integrationsRedirect(request: Request, status: string) {
  const url = new URL("/mvp/integrations", request.url);
  url.searchParams.set("microsoft", status);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return unauthenticatedResponse();

  const db = await getD1Database();
  if (!db) return integrationsRedirect(request, "storage-required");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    await writeMicrosoftAudit({
      db,
      currentUser,
      action: "OUTLOOK_CONNECT_FAILED",
      targetType: "INTEGRATION",
      metadata: { provider: "microsoft_outlook", category: "oauth_error" },
    }).catch(() => null);
    return integrationsRedirect(request, "failed");
  }

  if (!code || !state) return integrationsRedirect(request, "failed");

  let consumed;
  try {
    consumed = await consumeOAuthState({ db, currentUser, state });
  } catch (error) {
    if (error instanceof Error && error.message === MICROSOFT_ENCRYPTION_CONFIG_ERROR) {
      await writeMicrosoftAudit({
        db,
        currentUser,
        action: "OUTLOOK_CONNECT_FAILED",
        targetType: "INTEGRATION",
        metadata: { provider: "microsoft_outlook", category: "configuration_required" },
      }).catch(() => null);
      return integrationsRedirect(request, "configuration-required");
    }
    throw error;
  }
  if (!consumed) {
    await writeMicrosoftAudit({
      db,
      currentUser,
      action: "OUTLOOK_CONNECT_FAILED",
      targetType: "INTEGRATION",
      metadata: { provider: "microsoft_outlook", category: "invalid_state" },
    }).catch(() => null);
    return integrationsRedirect(request, "failed");
  }

  try {
    const tokenData = await exchangeMicrosoftAuthorizationCode({
      code,
      redirectUri: consumed.redirectUri,
      codeVerifier: consumed.codeVerifier,
    });
    await saveMicrosoftConnection({
      db,
      currentUser,
      tokenData,
      accountHint: currentUser.email,
    });
    await writeMicrosoftAudit({
      db,
      currentUser,
      action: "OUTLOOK_CONNECTED",
      targetType: "INTEGRATION",
      metadata: { provider: "microsoft_outlook" },
    });
    return integrationsRedirect(request, "connected");
  } catch (error) {
    const configurationRequired = error instanceof Error && error.message === MICROSOFT_ENCRYPTION_CONFIG_ERROR;
    await writeMicrosoftAudit({
      db,
      currentUser,
      action: "OUTLOOK_CONNECT_FAILED",
      targetType: "INTEGRATION",
      metadata: {
        provider: "microsoft_outlook",
        category: configurationRequired ? "configuration_required" : "token_exchange_failed",
      },
    }).catch(() => null);
    return integrationsRedirect(request, configurationRequired ? "configuration-required" : "failed");
  }
}
