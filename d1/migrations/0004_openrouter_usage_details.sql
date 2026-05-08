ALTER TABLE usage_logs ADD COLUMN provider TEXT;
ALTER TABLE usage_logs ADD COLUMN model_requested TEXT;
ALTER TABLE usage_logs ADD COLUMN endpoint TEXT;
ALTER TABLE usage_logs ADD COLUMN response_status INTEGER;
ALTER TABLE usage_logs ADD COLUMN content_length INTEGER;
