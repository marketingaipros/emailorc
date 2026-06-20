import { createId } from "../cloudflare-db";
import type { CurrentUser } from "../current-user";
import { MICROSOFT_ENCRYPTION_CONFIG_ERROR, decryptMicrosoftSecret, encryptMicrosoftSecret, sha256Hex } from "./crypto";
import { MICROSOFT_PROVIDER, refreshMicrosoftAccessToken } from "./oauth";

export type MicrosoftTokenPayload = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope: string;
  tokenType?: string;
};

export type MicrosoftConnection = {
  id: string;
  organizationId: string;
  userId: string;
  accountHint: string | null;
  encryptedTokenPayload: string;
  scopeSummary: string;
  connectedAt: string | null;
  lastSuccessAt: string | null;
  reconnectRequiredAt: string | null;
  revokedAt: string | null;
};

export function safeAccountHint(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const [name, domain] = raw.split("@");
  if (!domain) return raw.slice(0, 2) + "***";
  return `${name.slice(0, 2)}***@${domain}`;
}

export function tokenPayloadFromOAuthResponse(data: any): MicrosoftTokenPayload {
  const expiresIn = Number(data.expires_in || 3600);
  return {
    accessToken: String(data.access_token || ""),
    refreshToken: String(data.refresh_token || ""),
    expiresAt: new Date(Date.now() + Math.max(60, expiresIn - 60) * 1000).toISOString(),
    scope: String(data.scope || ""),
    tokenType: data.token_type ? String(data.token_type) : undefined,
  };
}

export async function encryptTokenPayload(payload: MicrosoftTokenPayload) {
  return encryptMicrosoftSecret(JSON.stringify(payload));
}

export async function decryptTokenPayload(value: string): Promise<MicrosoftTokenPayload | null> {
  try {
    const decrypted = await decryptMicrosoftSecret(value);
    const parsed = JSON.parse(decrypted);
    if (!parsed?.accessToken || !parsed?.refreshToken) return null;
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message === MICROSOFT_ENCRYPTION_CONFIG_ERROR) throw error;
    return null;
  }
}

export async function getMicrosoftConnection(db: D1Database, currentUser: CurrentUser) {
  if (!currentUser.organizationId) return null;
  const row: any = await db.prepare(`
    SELECT
      id,
      organization_id,
      user_id,
      account_hint,
      encrypted_token_payload,
      scope_summary,
      connected_at,
      last_success_at,
      reconnect_required_at,
      revoked_at
    FROM integration_connections
    WHERE organization_id = ?
      AND user_id = ?
      AND provider = ?
      AND revoked_at IS NULL
    LIMIT 1
  `).bind(currentUser.organizationId, currentUser.userId, MICROSOFT_PROVIDER).first().catch(() => null);

  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    accountHint: row.account_hint || null,
    encryptedTokenPayload: row.encrypted_token_payload,
    scopeSummary: row.scope_summary || "",
    connectedAt: row.connected_at || null,
    lastSuccessAt: row.last_success_at || null,
    reconnectRequiredAt: row.reconnect_required_at || null,
    revokedAt: row.revoked_at || null,
  } satisfies MicrosoftConnection;
}

export async function saveMicrosoftConnection(params: {
  db: D1Database;
  currentUser: CurrentUser;
  tokenData: any;
  accountHint?: string | null;
}) {
  if (!params.currentUser.organizationId) throw new Error("missing_organization");
  const payload = tokenPayloadFromOAuthResponse(params.tokenData);
  if (!payload.accessToken || !payload.refreshToken) throw new Error("missing_token_payload");

  const encrypted = await encryptTokenPayload(payload);
  const accountHint = safeAccountHint(params.accountHint || params.currentUser.email || "");
  const scopeSummary = payload.scope || "Mail.ReadWrite";

  await params.db.prepare(`
    INSERT INTO integration_connections (
      id,
      organization_id,
      user_id,
      provider,
      account_hint,
      encrypted_token_payload,
      token_key_version,
      scope_summary,
      connected_at,
      reconnect_required_at,
      revoked_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'v1', ?, CURRENT_TIMESTAMP, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(organization_id, user_id, provider)
    DO UPDATE SET
      account_hint = excluded.account_hint,
      encrypted_token_payload = excluded.encrypted_token_payload,
      scope_summary = excluded.scope_summary,
      connected_at = CURRENT_TIMESTAMP,
      reconnect_required_at = NULL,
      revoked_at = NULL,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    createId("conn"),
    params.currentUser.organizationId,
    params.currentUser.userId,
    MICROSOFT_PROVIDER,
    accountHint,
    encrypted,
    scopeSummary,
  ).run();
}

export async function getUsableMicrosoftAccessToken(params: {
  db: D1Database;
  connection: MicrosoftConnection;
  fetchImpl?: typeof fetch;
}) {
  const payload = await decryptTokenPayload(params.connection.encryptedTokenPayload);
  if (!payload) throw new Error("reconnect_required");

  if (new Date(payload.expiresAt).getTime() > Date.now() + 60_000) {
    return payload.accessToken;
  }

  try {
    const refreshed = tokenPayloadFromOAuthResponse(await refreshMicrosoftAccessToken({
      refreshToken: payload.refreshToken,
      fetchImpl: params.fetchImpl,
    }));
    const nextPayload = {
      ...refreshed,
      refreshToken: refreshed.refreshToken || payload.refreshToken,
    };
    await params.db.prepare(`
      UPDATE integration_connections
      SET encrypted_token_payload = ?, reconnect_required_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(await encryptTokenPayload(nextPayload), params.connection.id).run();
    return nextPayload.accessToken;
  } catch (error) {
    if (error instanceof Error && error.message === MICROSOFT_ENCRYPTION_CONFIG_ERROR) throw error;
    await params.db.prepare(`
      UPDATE integration_connections
      SET reconnect_required_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(params.connection.id).run().catch(() => null);
    throw new Error("reconnect_required");
  }
}

export async function disconnectMicrosoftConnection(db: D1Database, currentUser: CurrentUser) {
  if (!currentUser.organizationId) return;
  await db.prepare(`
    UPDATE integration_connections
    SET encrypted_token_payload = '', revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE organization_id = ? AND user_id = ? AND provider = ?
  `).bind(currentUser.organizationId, currentUser.userId, MICROSOFT_PROVIDER).run();
}

export async function consumeOAuthState(params: {
  db: D1Database;
  currentUser: CurrentUser;
  state: string;
}) {
  if (!params.currentUser.organizationId) return null;
  const stateHash = sha256Hex(params.state);
  const row: any = await params.db.prepare(`
    SELECT id, pkce_verifier_encrypted, redirect_uri, expires_at, consumed_at
    FROM oauth_authorization_states
    WHERE state_hash = ?
      AND user_id = ?
      AND organization_id = ?
      AND provider = ?
    LIMIT 1
  `).bind(stateHash, params.currentUser.userId, params.currentUser.organizationId, MICROSOFT_PROVIDER).first().catch(() => null);

  if (!row || row.consumed_at || new Date(row.expires_at).getTime() <= Date.now()) return null;
  await params.db.prepare(`
    UPDATE oauth_authorization_states
    SET consumed_at = CURRENT_TIMESTAMP
    WHERE id = ? AND consumed_at IS NULL
  `).bind(row.id).run();

  return {
    id: row.id as string,
    codeVerifier: await decryptMicrosoftSecret(row.pkce_verifier_encrypted),
    redirectUri: row.redirect_uri as string,
  };
}

export async function writeMicrosoftAudit(params: {
  db: D1Database;
  currentUser: CurrentUser;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await params.db.prepare(`
    INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    createId("audit"),
    params.currentUser.userId,
    params.currentUser.organizationId,
    params.action,
    params.targetType,
    params.targetId || null,
    JSON.stringify(params.metadata || {}),
  ).run();
}
