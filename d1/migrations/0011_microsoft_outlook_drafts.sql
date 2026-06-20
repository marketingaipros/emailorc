PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS integration_connections (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  account_hint TEXT,
  encrypted_token_payload TEXT NOT NULL,
  token_key_version TEXT NOT NULL DEFAULT 'v1',
  scope_summary TEXT NOT NULL DEFAULT '',
  connected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_success_at TEXT,
  reconnect_required_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, user_id, provider),
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS oauth_authorization_states (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  state_hash TEXT NOT NULL UNIQUE,
  pkce_verifier_encrypted TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outlook_draft_deliveries (
  id TEXT PRIMARY KEY,
  emailorc_draft_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  connection_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'microsoft_outlook',
  provider_message_id TEXT,
  status TEXT NOT NULL,
  error_category TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(emailorc_draft_id, connection_id),
  FOREIGN KEY(emailorc_draft_id) REFERENCES drafts(id) ON DELETE CASCADE,
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(connection_id) REFERENCES integration_connections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_integration_connections_user_provider
  ON integration_connections(organization_id, user_id, provider);

CREATE INDEX IF NOT EXISTS idx_oauth_authorization_states_expiry
  ON oauth_authorization_states(provider, expires_at, consumed_at);

CREATE INDEX IF NOT EXISTS idx_outlook_draft_deliveries_draft
  ON outlook_draft_deliveries(organization_id, emailorc_draft_id, status);
