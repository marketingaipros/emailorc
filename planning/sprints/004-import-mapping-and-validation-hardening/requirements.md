# Sprint 004 Requirements — Import Mapping and Validation Hardening

## Goal

Harden the CSV/upload/import workflow by adding or improving field mapping and required-field validation.

## Business Objective

Make the EmailORC MVP/demo import flow more reliable so operators can trust that uploaded records contain the minimum data needed for downstream validation, draft generation, review, approval, and export.

## User Stories

### Import Field Mapping

As an operator, I want the app to recognize and map the uploaded CSV fields needed by EmailORC, so I do not accidentally import records with missing or mismatched data.

### Required Field Validation

As an operator, I want the app to clearly block imports that are missing required fields, so bad records do not enter the workflow silently.

### Clear Import Feedback

As an operator, I want clear import errors or warnings, so I know what to fix in the CSV before trying again.

## In Scope

- Inspect the current upload/import UI and API flow.
- Identify the current record fields used by the app.
- Identify required fields from existing code, tests, fixtures, and docs.
- Add or improve mapping from CSV headers to internal fields.
- Support obvious header aliases only when they map clearly to existing fields.
- Validate required fields before accepting/importing records.
- Return clear API errors for missing required fields or unmapped required fields.
- Surface clear UI feedback for import validation failures.
- Preserve valid import behavior.
- Add or update focused tests where practical.
- Update docs and planning files after implementation.

## Out of Scope

- CRM integration.
- Salesforce integration.
- Email sending.
- Auto-send.
- AI draft-generation prompt rewrites.
- Full data model redesign.
- Database schema changes.
- Migrations.
- Env changes.
- Deployment changes.
- Auth/session changes.
- Admin permission changes.
- Campaign Board drag/drop fixes.
- Playwright mutation cleanup.
- Lint tooling setup.
- Persistent user-saved mapping templates unless already supported.
- Production readiness claim.

## Business Rules

- Required fields must be based on existing app behavior, tests, fixtures, or documented assumptions.
- Do not invent required fields without documenting evidence.
- Invalid imports should fail clearly.
- Valid imports should continue to work.
- UI-only validation is not enough if the API can still accept invalid records.
- API/import path must enforce required-field validation.
- Human review remains required.
- Auto-send remains disabled.
- Live integrations remain disabled.
- EmailORC remains MVP/demo-stage.

## Expected Output

Create:

- `planning/sprints/004-import-mapping-and-validation-hardening/requirements.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/blueprint.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/acceptance.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/handoff-prompt.md`

Update as needed:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- Targeted app/test files required to implement import mapping and validation hardening

## Success Definition

Sprint 004 succeeds when:

- Current required import fields are identified and documented.
- Valid CSV/import input still succeeds.
- Missing required fields are blocked clearly.
- Unmapped required fields are surfaced clearly.
- API/import path enforces validation.
- UI clearly communicates import validation failures.
- Focused tests cover mapping/validation behavior where practical.
- `npm run test` passes.
- `npm run build` passes.
- No out-of-scope changes are introduced.
