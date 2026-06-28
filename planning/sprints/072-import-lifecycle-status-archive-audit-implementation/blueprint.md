# Sprint 072 Blueprint

## Implementation Plan

1. Inspect Sprint 069, 070, and 071 context plus current records/import code and D1 schema.
2. Add lifecycle helpers for required reason categories, safe notes, demo fallback source labels, and admin/operator permission checks.
3. Add D1 migration text for import batch lifecycle fields and dedicated lead archive/restore fields.
4. Update `/api/workflow/import`:
   - keep persisted imports immediate and completed by default
   - add import list metadata for source/admin review
   - add staged cancellation audit without creating an import batch
   - add completed import archive/restore only
   - reject completed-import cancel
5. Update `/api/workflow/records`:
   - preserve source/import linkage
   - add reversible archive/restore with required reason
   - write lifecycle events to `audit_log`
   - remain compatible with not-yet-migrated D1 schemas
6. Update `/mvp/records` and `/mvp/upload` so operators can see source/import metadata and perform approved lifecycle actions.
7. Add focused validation tests and update durable docs.

## Medical Lead Root Cause

Repo evidence shows `Rina Patel / BluePath Health` is hardcoded demo fallback UI data in `/mvp/records` and also appears as a campaign-board seed card in `src/lib/campaign-board.ts`.

The records page previously fell back to those demo records when `/api/workflow/records` did not return persisted D1 records. That made BluePath Health look like an ordinary lead in demo-mode empty/error states unless the user inspected source metadata.

Sprint 072 labels those records as `Demo fallback` and only allows fallback data in demo mode. Persisted D1 records remain traceable through `import_batch_id`, `source_row_id`, file label, and import timestamps.

## Safety Notes

- Completed imports cannot be canceled or rolled back.
- Archive and restore preserve leads, drafts, approvals, analytics, and audit history.
- Existing `audit_log` is sufficient for lifecycle metadata in this sprint.
- No direct database cleanup, Outlook action, email send, deploy, commit, or push is part of this sprint.
