ALTER TABLE import_batches ADD COLUMN status TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE import_batches ADD COLUMN completed_at TEXT;
ALTER TABLE import_batches ADD COLUMN failed_at TEXT;
ALTER TABLE import_batches ADD COLUMN failure_category TEXT;
ALTER TABLE import_batches ADD COLUMN archived_at TEXT;
ALTER TABLE import_batches ADD COLUMN archived_by TEXT;
ALTER TABLE import_batches ADD COLUMN archive_reason TEXT;
ALTER TABLE import_batches ADD COLUMN restored_at TEXT;
ALTER TABLE import_batches ADD COLUMN restored_by TEXT;
ALTER TABLE import_batches ADD COLUMN restore_reason TEXT;
ALTER TABLE import_batches ADD COLUMN canceled_at TEXT;
ALTER TABLE import_batches ADD COLUMN canceled_by TEXT;
ALTER TABLE import_batches ADD COLUMN cancel_reason TEXT;
ALTER TABLE import_batches ADD COLUMN updated_at TEXT;

UPDATE import_batches
SET status = 'completed',
    completed_at = COALESCE(completed_at, created_at),
    updated_at = COALESCE(updated_at, created_at)
WHERE status IS NULL OR status = 'completed';

ALTER TABLE leads ADD COLUMN archived_at TEXT;
ALTER TABLE leads ADD COLUMN archived_by TEXT;
ALTER TABLE leads ADD COLUMN archive_reason TEXT;
ALTER TABLE leads ADD COLUMN restored_at TEXT;
ALTER TABLE leads ADD COLUMN restored_by TEXT;
ALTER TABLE leads ADD COLUMN restore_reason TEXT;

UPDATE leads
SET archived_at = COALESCE(archived_at, updated_at, created_at),
    archive_reason = COALESCE(archive_reason, 'operational_correction')
WHERE UPPER(COALESCE(validation_status, '')) = 'ARCHIVED'
  AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_import_batches_org_env_status ON import_batches(organization_id, environment, status, archived_at);
CREATE INDEX IF NOT EXISTS idx_leads_org_env_archived ON leads(organization_id, environment, archived_at);
