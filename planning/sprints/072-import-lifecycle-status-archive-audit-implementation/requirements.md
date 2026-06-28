# Sprint 072 Requirements

## Name

`072-import-lifecycle-status-archive-audit-implementation`

## Goal

Close the remaining Sprint 069 operational gaps without creating unrelated features.

## Approved Safe Defaults

- Completed imports are archive-only by default; no destructive rollback.
- Lead archive is reversible.
- Import owner and admin/operator may cancel a staged import before persistence.
- Admin/operator may archive and restore completed imports.
- Admin/operator may archive and restore leads.
- Archive, restore, and cancellation actions require a reason.
- Use existing `audit_log` first.
- Do not delete lead data or imported records.
- Do not add direct D1/manual cleanup steps.
- Do not change Outlook/Microsoft behavior or add sending.

## Requirements

- Trace visible medical/demo leads, including BluePath Health, through app code and data path.
- Gate or label demo fallback records so they cannot appear as normal production leads when real lead data is absent.
- Make source/import information visible enough for an admin to identify where a lead came from.
- Add staged import cancellation with a required reason and audit event.
- Add archive and restore for completed imports with required reason and audit event.
- Add reversible lead archive and restore with required reason and audit event.
- Preserve source/import linkage and avoid destructive rollback.
- Add focused tests for changed helper behavior.

## Exclusions

- No direct D1 writes or manual cleanup.
- No destructive deletion.
- No rollback.
- No Outlook/Microsoft behavior changes.
- No email sending.
- No deployment, commit, or push.
