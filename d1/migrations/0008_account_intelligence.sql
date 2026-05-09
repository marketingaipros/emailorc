CREATE TABLE IF NOT EXISTS account_intelligence (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  contact_key TEXT,
  company_key TEXT,
  save_scope TEXT NOT NULL DEFAULT 'contact',
  context_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, contact_key, company_key, save_scope)
);

