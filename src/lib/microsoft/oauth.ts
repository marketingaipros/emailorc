import { createId } from "../cloudflare-db";
import type { CurrentUser } from "../current-user";
import { encryptMicrosoftSecret, randomUrlToken, sha256Base64Url, sha256Hex } from "./crypto";

export const MICROSOFT_PROVIDER = "microsoft_outlook";
export const MICROSOFT_AUTHORITY_DEFAULT = "common";
export const MICROSOFT_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
export const MICROSOFT_GRAPH_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "https://graph.microsoft.com/Mail.ReadWrite",
] as const;

export function assertNoMailSendScope(scopes: readonly string[] = MICROSOFT_GRAPH_SCOPES) {
  if (scopes.some((scope) => scope.toLowerCase().includes("mail.send"))) {
    throw new Error("Mail.Send is not allowed for Outlook draft creation.");
  }
}

export function microsoftAuthority() {
  return process.env.MICROSOFT_TENANT_ID || MICROSOFT_AUTHORITY_DEFAULT;
}

export function microsoftClientId() {
  return String(process.env.MICROSOFT_CLIENT_ID || "").trim();
}

export function microsoftClientSecret() {
  return String(process.env.MICROSOFT_CLIENT_SECRET || "").trim();
}

export async function getMicrosoftOAuthConfig() {
  const fromProcess = {
    clientId: microsoftClientId(),
    clientSecret: microsoftClientSecret(),
  };
  if (fromProcess.clientId || fromProcess.clientSecret) return fromProcess;

  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = await mod.getCloudflareContext({ async: true });
    return {
      clientId: String((context.env as any).MICROSOFT_CLIENT_ID || "").trim(),
      clientSecret: String((context.env as any).MICROSOFT_CLIENT_SECRET || "").trim(),
    };
  } catch {
    return fromProcess;
  }
}

export function microsoftRedirectUri(request: Request) {
  const configured = String(process.env.MICROSOFT_REDIRECT_URI || "").trim();
  if (configured) return configured;
  return new URL("/api/integrations/microsoft/callback", request.url).toString();
}

export function microsoftAuthorizationEndpoint(authority = microsoftAuthority()) {
  return `https://login.microsoftonline.com/${encodeURIComponent(authority)}/oauth2/v2.0/authorize`;
}

export function microsoftTokenEndpoint(authority = microsoftAuthority()) {
  return `https://login.microsoftonline.com/${encodeURIComponent(authority)}/oauth2/v2.0/token`;
}

export function buildMicrosoftAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  scopes?: readonly string[];
  authority?: string;
}) {
  const scopes = params.scopes || MICROSOFT_GRAPH_SCOPES;
  assertNoMailSendScope(scopes);

  const url = new URL(microsoftAuthorizationEndpoint(params.authority));
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url;
}

export async function createMicrosoftOAuthState(db: D1Database, currentUser: CurrentUser, redirectUri: string) {
  const state = randomUrlToken(32);
  const pkceVerifier = randomUrlToken(64);
  const now = Date.now();
  const expiresAt = new Date(now + MICROSOFT_OAUTH_STATE_TTL_MS).toISOString();

  await db.prepare(`
    INSERT INTO oauth_authorization_states (
      id,
      user_id,
      organization_id,
      provider,
      state_hash,
      pkce_verifier_encrypted,
      redirect_uri,
      expires_at,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    createId("oauth_state"),
    currentUser.userId,
    currentUser.organizationId,
    MICROSOFT_PROVIDER,
    sha256Hex(state),
    await encryptMicrosoftSecret(pkceVerifier),
    redirectUri,
    expiresAt,
  ).run();

  return {
    state,
    pkceVerifier,
    codeChallenge: sha256Base64Url(pkceVerifier),
    expiresAt,
  };
}

export async function exchangeMicrosoftAuthorizationCode(params: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
  fetchImpl?: typeof fetch;
}) {
  const { clientId, clientSecret } = await getMicrosoftOAuthConfig();
  if (!clientId || !clientSecret) {
    throw new Error("missing_microsoft_oauth_config");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
    scope: MICROSOFT_GRAPH_SCOPES.join(" "),
  });

  const response = await (params.fetchImpl || fetch)(microsoftTokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`token_exchange_failed:${response.status}`);
  return data;
}

export async function refreshMicrosoftAccessToken(params: {
  refreshToken: string;
  fetchImpl?: typeof fetch;
}) {
  const { clientId, clientSecret } = await getMicrosoftOAuthConfig();
  if (!clientId || !clientSecret) {
    throw new Error("missing_microsoft_oauth_config");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
    scope: MICROSOFT_GRAPH_SCOPES.join(" "),
  });

  const response = await (params.fetchImpl || fetch)(microsoftTokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`token_refresh_failed:${response.status}`);
  return data;
}
