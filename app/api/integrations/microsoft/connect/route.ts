import { NextResponse } from "next/server";
import { getD1Database } from "../../../../../src/lib/cloudflare-db";
import { getCurrentUser, unauthenticatedResponse } from "../../../../../src/lib/current-user";
import {
  buildMicrosoftAuthorizeUrl,
  createMicrosoftOAuthState,
  getMicrosoftOAuthConfig,
  microsoftRedirectUri,
  MICROSOFT_GRAPH_SCOPES,
} from "../../../../../src/lib/microsoft/oauth";
import { MICROSOFT_ENCRYPTION_CONFIG_ERROR } from "../../../../../src/lib/microsoft/crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return unauthenticatedResponse();
  if (!currentUser.organizationId) return NextResponse.json({ error: "Organization access is required." }, { status: 403 });

  const db = await getD1Database();
  if (!db) return NextResponse.json({ error: "Microsoft connection requires D1 storage." }, { status: 503 });

  const { clientId } = await getMicrosoftOAuthConfig();
  if (!clientId) return NextResponse.json({ error: "Microsoft OAuth is not configured." }, { status: 503 });

  const redirectUri = microsoftRedirectUri(request);
  let oauthState;
  try {
    oauthState = await createMicrosoftOAuthState(db, currentUser, redirectUri);
  } catch (error) {
    if (error instanceof Error && error.message === MICROSOFT_ENCRYPTION_CONFIG_ERROR) {
      return NextResponse.json({ error: "Microsoft encryption configuration is required." }, { status: 503 });
    }
    throw error;
  }
  const url = buildMicrosoftAuthorizeUrl({
    clientId,
    redirectUri,
    state: oauthState.state,
    codeChallenge: oauthState.codeChallenge,
    scopes: MICROSOFT_GRAPH_SCOPES,
  });

  return NextResponse.redirect(url);
}
