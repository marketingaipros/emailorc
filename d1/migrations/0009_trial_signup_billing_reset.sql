ALTER TABLE organizations ADD COLUMN industry TEXT;
ALTER TABLE organizations ADD COLUMN environment TEXT NOT NULL DEFAULT 'test-live';
ALTER TABLE organizations ADD COLUMN trial_start_date TEXT;
ALTER TABLE organizations ADD COLUMN trial_end_date TEXT;
ALTER TABLE organizations ADD COLUMN credits_used INTEGER NOT NULL DEFAULT 0;
ALTER TABLE organizations ADD COLUMN credits_remaining INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'TRIAL_ACTIVE',
  trial_start_date TEXT,
  trial_end_date TEXT,
  credits_included INTEGER NOT NULL DEFAULT 100,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_remaining INTEGER NOT NULL DEFAULT 100,
  billing_reset_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY(plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE IF NOT EXISTS reset_audit (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  organization_id TEXT,
  environment TEXT NOT NULL,
  reset_type TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO subscription_plans (id, name, monthly_credit_limit, base_price, features)
VALUES
  ('plan_trial', 'Trial', 100, 0, '{"credits":100,"trial_duration_days":14,"estimated_full_emails":10}'),
  ('plan_starter', 'Starter', 500, 49, '{"credits":500}'),
  ('plan_growth', 'Growth', 2500, 199, '{"credits":2500}'),
  ('plan_pro', 'Pro', 10000, 499, '{"credits":10000}'),
  ('plan_enterprise', 'Enterprise', NULL, 0, '{"credits":"custom"}');

INSERT OR IGNORE INTO subscriptions (id, organization_id, plan_id, status, trial_start_date, trial_end_date, credits_included, credits_used, credits_remaining)
SELECT
  'sub_' || id,
  id,
  CASE lower(plan)
    WHEN 'trial' THEN 'plan_trial'
    WHEN 'starter' THEN 'plan_starter'
    WHEN 'growth' THEN 'plan_growth'
    WHEN 'pro' THEN 'plan_pro'
    ELSE 'plan_trial'
  END,
  CASE lower(subscription_status)
    WHEN 'active' THEN 'ACTIVE'
    ELSE subscription_status
  END,
  COALESCE(trial_start_date, CURRENT_TIMESTAMP),
  COALESCE(trial_end_date, datetime(CURRENT_TIMESTAMP, '+14 days')),
  COALESCE(ai_credits, 100),
  COALESCE(credits_used, 0),
  CASE WHEN COALESCE(credits_remaining, 0) > 0 THEN credits_remaining ELSE COALESCE(ai_credits, 100) END
FROM organizations;
