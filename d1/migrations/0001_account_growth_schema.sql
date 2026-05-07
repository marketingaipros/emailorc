PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'TRIAL',
  subscription_status TEXT NOT NULL DEFAULT 'ACTIVE',
  ai_credits INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  job_title TEXT,
  password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIEWER',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, organization_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  monthly_credit_limit INTEGER,
  base_price REAL NOT NULL DEFAULT 0,
  features TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_rules (
  id TEXT PRIMARY KEY,
  action_name TEXT NOT NULL UNIQUE,
  credit_cost INTEGER NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  campaign_id TEXT,
  lead_id TEXT,
  draft_id TEXT,
  action TEXT NOT NULL,
  model_used TEXT NOT NULL,
  credits_charged INTEGER NOT NULL DEFAULT 0,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  estimated_api_cost REAL,
  success INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  environment TEXT NOT NULL DEFAULT 'demo',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  campaign_id TEXT,
  source_row_id TEXT,
  contact_name TEXT,
  contact_email TEXT,
  business_name TEXT,
  company TEXT,
  product TEXT,
  do_not_contact INTEGER NOT NULL DEFAULT 0,
  validation_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  lead_id TEXT,
  subject TEXT,
  body TEXT,
  strategy_json TEXT,
  orc_output TEXT,
  sentinel_output TEXT,
  scribe_output TEXT,
  lexi_output TEXT,
  qa_score REAL,
  approval_status TEXT NOT NULL DEFAULT 'PENDING',
  approved_by_user_id TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(lead_id) REFERENCES leads(id),
  FOREIGN KEY(approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS brain_settings (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  selected_model TEXT NOT NULL,
  purpose TEXT,
  temperature REAL NOT NULL DEFAULT 0.7,
  max_output_length INTEGER NOT NULL DEFAULT 2000,
  cost_mode TEXT NOT NULL DEFAULT 'BALANCED',
  is_active INTEGER NOT NULL DEFAULT 1,
  fallback_model TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, task_name),
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaign_playbooks (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  mode TEXT NOT NULL DEFAULT 'demo',
  playbook_json TEXT NOT NULL DEFAULT '{}',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_log (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  source_type TEXT NOT NULL,
  source_id TEXT,
  lesson TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  organization_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(actor_user_id) REFERENCES users(id),
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_org_created ON usage_logs(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_drafts_org_status ON drafts(organization_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_created ON audit_log(organization_id, created_at);
