# Domain Context

## Project

EmailORC.

## Business Goal

Help operators manage email campaign workflows by importing account/contact records, validating records, generating or managing drafts, reviewing and approving drafts, and exporting approved drafts.

## Current Product Position

MVP/demo-stage email workflow app.

Current working model:

- Human review is required before email output is used.
- Approved drafts can be exported.
- Auto-send is disabled.
- Live CRM/email integrations are disabled.
- Production readiness is not established.

## Users / Roles

Known or implied roles:

| Role | Purpose | Notes |
|---|---|---|
| Demo user | Explore or test MVP flows | Exact permissions need documentation. |
| User | Work through upload, record, draft, and export workflows | Auth/session model needs review. |
| Client Admin | Admin-oriented access | Existing bug summary reportedly mentions direct admin access issue. |
| Internal operator | Reviews app behavior, validates outputs, manages project direction | Current owner/operator role. |

## Core Workflows

### Import Workflow

- User uploads CSV/account/contact records.
- Import API parses data.
- Records may be persisted in D1 when available.
- Validation flags records with issues.

### Validation Workflow

Known validation concerns include:

- Missing email
- Do-not-contact records
- Missing company
- Renewal timing
- Other campaign/account readiness checks

### Draft Workflow

- Drafts are generated or managed.
- Drafts require review.
- Drafts can be approved.
- Export should use only approved, non-archived drafts and exclude do-not-contact records.

### Brain Center Workflow

App includes Brain Center configuration for:

- Model settings
- OpenRouter keys
- Business knowledge
- Playbooks
- Learning logs

### Environment Mode Workflow

Known modes include:

- Demo
- Test-live
- Production

The exact business meaning of each mode must be documented before production decisions.

## Business Rules

- Do not send campaign emails automatically unless a future approved sprint changes this rule.
- Do not include do-not-contact records in approved draft export.
- Human approval is required before draft output is treated as usable.
- Secret values must never be exposed in logs, docs, or chat.
