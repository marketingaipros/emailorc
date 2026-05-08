ALTER TABLE leads ADD COLUMN user_id TEXT;
ALTER TABLE leads ADD COLUMN environment TEXT NOT NULL DEFAULT 'demo';
ALTER TABLE leads ADD COLUMN import_batch_id TEXT;
ALTER TABLE leads ADD COLUMN offer_id TEXT;
ALTER TABLE leads ADD COLUMN offer_name TEXT;
ALTER TABLE leads ADD COLUMN playbook_name TEXT;
ALTER TABLE leads ADD COLUMN standard_fields_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE leads ADD COLUMN custom_fields_json TEXT NOT NULL DEFAULT '{}';

ALTER TABLE drafts ADD COLUMN subject_line_2 TEXT;
ALTER TABLE drafts ADD COLUMN preview_text TEXT;
ALTER TABLE drafts ADD COLUMN spam_risk TEXT NOT NULL DEFAULT 'Low';
ALTER TABLE drafts ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE drafts ADD COLUMN revision_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE drafts ADD COLUMN offer_id TEXT;
ALTER TABLE drafts ADD COLUMN offer_name TEXT;
ALTER TABLE drafts ADD COLUMN playbook_name TEXT;
ALTER TABLE drafts ADD COLUMN ai_context_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE drafts ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
ALTER TABLE drafts ADD COLUMN environment TEXT NOT NULL DEFAULT 'demo';

CREATE TABLE IF NOT EXISTS import_batches (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  environment TEXT NOT NULL DEFAULT 'demo',
  file_name TEXT,
  source_type TEXT,
  mapping_json TEXT NOT NULL DEFAULT '{}',
  offer_id TEXT,
  playbook_name TEXT,
  total_records INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS field_mappings (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  environment TEXT NOT NULL DEFAULT 'demo',
  template_name TEXT NOT NULL,
  source_type TEXT,
  mapping_json TEXT NOT NULL DEFAULT '{}',
  custom_fields_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TEXT,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  draft_id TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'demo',
  approval_status TEXT NOT NULL,
  qa_score REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(draft_id) REFERENCES drafts(id)
);

CREATE TABLE IF NOT EXISTS export_batches (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  environment TEXT NOT NULL DEFAULT 'demo',
  format TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  export_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, environment, export_key),
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  environment TEXT NOT NULL DEFAULT 'demo',
  event_name TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS offer_library (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  environment TEXT NOT NULL DEFAULT 'demo',
  offer_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_leads_org_env ON leads(organization_id, environment);
CREATE INDEX IF NOT EXISTS idx_drafts_org_env_status ON drafts(organization_id, environment, approval_status);
CREATE INDEX IF NOT EXISTS idx_import_batches_org_env ON import_batches(organization_id, environment);
CREATE INDEX IF NOT EXISTS idx_exports_org_env ON export_batches(organization_id, environment);
CREATE INDEX IF NOT EXISTS idx_analytics_org_env ON analytics_events(organization_id, environment);
