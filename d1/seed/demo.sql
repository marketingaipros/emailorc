PRAGMA foreign_keys = ON;

INSERT OR REPLACE INTO organizations (id, name, slug, plan, subscription_status, ai_credits, status)
VALUES ('org_demo', 'Demo Organization', 'demo-org', 'GROWTH', 'ACTIVE', 10000, 'ACTIVE');

INSERT OR REPLACE INTO users (id, email, first_name, last_name, job_title, password_hash, status)
VALUES
  ('user_super_admin', 'admin@demo.com', 'Super', 'Admin', 'Platform Owner', '$2b$10$h1hYD75gEdS/96Dy0YZwDO8EEwEFs5mtSBFid44qxHt6KJo9cpQ9.', 'ACTIVE'),
  ('user_client_admin', 'client@demo.com', 'Client', 'Admin', 'Growth Lead', '$2b$10$FxNZZFI6dIQR7dbnZFQmv.dARiuUopxuT9LZ6/qlMAPRdhA9Bx136', 'ACTIVE'),
  ('user_editor', 'editor@demo.com', 'Demo', 'Editor', 'Campaign Editor', '$2b$10$Sf4HNdecJxKfo3/DOqEVh.5zHCmeL3SrhLLPX92q4mzpBl9MiuuP6', 'ACTIVE'),
  ('user_reviewer', 'reviewer@demo.com', 'Demo', 'Reviewer', 'QA Reviewer', '$2b$10$pEy61kVoHxTVBZ55JglCxeGdLobFACH.22z/AFbsNDgm1szvfOiMG', 'ACTIVE'),
  ('user_viewer', 'viewer@demo.com', 'Demo', 'Viewer', 'Read Only', '$2b$10$RXXmvmiIG9s1eLCVs9Z/fukynL4wmbzMpIMxvNsXz12l0dGujmY1W', 'ACTIVE');

INSERT OR REPLACE INTO memberships (id, user_id, organization_id, role, status)
VALUES
  ('membership_super_admin', 'user_super_admin', 'org_demo', 'SUPER_ADMIN', 'ACTIVE'),
  ('membership_client_admin', 'user_client_admin', 'org_demo', 'CLIENT_ADMIN', 'ACTIVE'),
  ('membership_editor', 'user_editor', 'org_demo', 'EDITOR', 'ACTIVE'),
  ('membership_reviewer', 'user_reviewer', 'org_demo', 'REVIEWER', 'ACTIVE'),
  ('membership_viewer', 'user_viewer', 'org_demo', 'VIEWER', 'ACTIVE');

INSERT OR REPLACE INTO subscription_plans (id, name, monthly_credit_limit, base_price, features)
VALUES
  ('plan_trial', 'Trial', 100, 0, '{"credits":100,"support":"demo"}'),
  ('plan_starter', 'Starter', 500, 49, '{"credits":500}'),
  ('plan_growth', 'Growth', 2500, 199, '{"credits":2500,"playbooks":true}'),
  ('plan_pro', 'Pro', 10000, 499, '{"credits":10000,"advanced_reporting":true}'),
  ('plan_enterprise', 'Enterprise', NULL, 0, '{"credits":"custom","sla":true}');

INSERT OR REPLACE INTO credit_rules (id, action_name, credit_cost, description)
VALUES
  ('credit_validate_record', 'VALIDATE_RECORD', 1, 'Validate record'),
  ('credit_generate_strategy', 'GENERATE_STRATEGY', 2, 'Generate strategy'),
  ('credit_generate_draft_email', 'GENERATE_DRAFT', 5, 'Generate draft email'),
  ('credit_qa_score_draft', 'QA_SCORE', 2, 'QA score draft'),
  ('credit_revise_draft', 'REVISE_DRAFT', 3, 'Revise draft'),
  ('credit_full_email', 'FULL_EMAIL', 10, 'Full ORC -> SENTINEL -> SCRIBE -> LEXI email'),
  ('credit_classify_reply', 'CLASSIFY_REPLY', 2, 'Classify reply'),
  ('credit_draft_reply', 'DRAFT_REPLY', 5, 'Draft reply'),
  ('credit_knowledge_search', 'KNOWLEDGE_SEARCH', 1, 'Knowledge search');

INSERT OR REPLACE INTO brain_settings (id, organization_id, task_name, selected_model, purpose, cost_mode)
VALUES
  ('brain_orc', 'org_demo', 'ORC_INTAKE', 'openai/gpt-5-mini', 'Validate and normalize uploaded account records.', 'BALANCED'),
  ('brain_sentinel', 'org_demo', 'SENTINEL_STRATEGY', 'anthropic/claude-sonnet-4.5', 'Choose outreach strategy and risk controls.', 'QUALITY'),
  ('brain_scribe', 'org_demo', 'SCRIBE_WRITING', 'openai/gpt-5', 'Generate human-review email drafts.', 'QUALITY'),
  ('brain_lexi', 'org_demo', 'LEXI_QA', 'openai/gpt-5-mini', 'Score draft quality and approval readiness.', 'BALANCED');

INSERT OR REPLACE INTO campaign_playbooks (id, organization_id, name, description, mode, playbook_json, is_active)
VALUES
  ('playbook_upsell', 'org_demo', 'Account Growth Upsell', 'Default demo playbook for expansion outreach.', 'demo', '{"audience":"existing customers","approvalThreshold":90}', 1),
  ('playbook_renewal', 'org_demo', 'Renewal Save', 'Demo playbook for renewal risk and retention outreach.', 'demo', '{"audience":"renewals","approvalThreshold":90}', 1);

INSERT OR REPLACE INTO usage_logs (id, organization_id, user_id, action, model_used, credits_charged, prompt_tokens, completion_tokens, total_tokens, estimated_api_cost, success, environment)
VALUES
  ('usage_seed_orc', 'org_demo', 'user_client_admin', 'VALIDATE_RECORD', 'openai/gpt-5-mini', 1, 320, 80, 400, 0.001, 1, 'demo'),
  ('usage_seed_draft', 'org_demo', 'user_client_admin', 'GENERATE_DRAFT', 'openai/gpt-5', 5, 920, 260, 1180, 0.006, 1, 'demo');

INSERT OR REPLACE INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
VALUES
  ('audit_seed', 'user_super_admin', 'org_demo', 'SEED_DEMO_DATA', 'DATABASE', 'org_demo', '{"source":"d1/seed/demo.sql"}');
