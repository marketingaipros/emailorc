ALTER TABLE learning_log ADD COLUMN feedback_id TEXT;
ALTER TABLE learning_log ADD COLUMN source TEXT;
ALTER TABLE learning_log ADD COLUMN related_draft_id TEXT;
ALTER TABLE learning_log ADD COLUMN related_offer_id TEXT;
ALTER TABLE learning_log ADD COLUMN related_campaign_id TEXT;
ALTER TABLE learning_log ADD COLUMN feedback_type TEXT;
ALTER TABLE learning_log ADD COLUMN feedback_text TEXT;
ALTER TABLE learning_log ADD COLUMN suggested_rule TEXT;
ALTER TABLE learning_log ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE learning_log ADD COLUMN approved_by TEXT;

CREATE INDEX IF NOT EXISTS idx_learning_log_org_status ON learning_log(organization_id, status);
