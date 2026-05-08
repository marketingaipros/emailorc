ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN notes TEXT;
ALTER TABLE users ADD COLUMN require_password_reset INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN invite_status TEXT NOT NULL DEFAULT 'NOT_SENT';
ALTER TABLE users ADD COLUMN invite_token TEXT;
ALTER TABLE users ADD COLUMN invite_expires_at TEXT;
ALTER TABLE users ADD COLUMN invite_sent_at TEXT;
ALTER TABLE users ADD COLUMN invite_accepted_at TEXT;
ALTER TABLE users ADD COLUMN invite_error TEXT;

CREATE TABLE IF NOT EXISTS invite_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invite_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CREATED',
  email_provider TEXT,
  email_accepted INTEGER NOT NULL DEFAULT 0,
  safe_error TEXT,
  expires_at TEXT NOT NULL,
  sent_at TEXT,
  accepted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_user ON invite_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
