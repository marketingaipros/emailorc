# Architect Pack 004 — Import Mapping and Validation Hardening

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `004-import-mapping-and-validation-hardening`  
**Created:** 2026-05-20  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 004 hardens the CSV/import workflow after Sprint 003 fixed the two P1 demo-flow blockers.

Sprint 002 identified CSV upload/import reliability as the next P2 core workflow issue. The current flow appears to import records without a clear field mapping or validation step, which can create bad records, unclear errors, and unreliable downstream draft generation.

Sprint 004 adds a controlled import mapping and validation layer so operators can verify required fields before records are accepted into the workflow.

The goal is to make upload/import behavior safer and clearer without expanding into CRM integrations, production sending, database migrations, dashboard redesign, or broad data-model rewrites.

---

## Scope Control

### In Scope

- Inspect the current CSV/upload/import workflow.
- Identify current accepted CSV headers and required fields.
- Add or harden a field mapping step where practical.
- Validate required fields before records are accepted.
- Normalize common header variations where practical.
- Surface clear user-facing validation errors for missing or unmapped required fields.
- Prevent invalid imports from silently creating bad records.
- Preserve valid import behavior.
- Add or update focused tests for import mapping and validation rules.
- Run the current safe local validation gate:
  - `npm run test`
  - `npm run build`
- Update planning and validation docs after the implementation.

### Out of Scope

- No CRM integration.
- No Salesforce integration.
- No live email integration.
- No auto-send enablement.
- No production-readiness claim.
- No database schema changes.
- No migrations.
- No seed commands.
- No env changes.
- No deployment changes.
- No Cloudflare config changes.
- No Campaign Board drag/drop fixes.
- No Playwright mutation cleanup.
- No lint tooling setup.
- No auth/session redesign.
- No admin role changes.
- No broad UI redesign.
- No AI prompt rewrite.
- No new database-backed mapping template system unless already supported by the existing architecture.
- No intentional changes to `prisma/dev.db`.

---

## Source Facts From Prior Sprints

Sprint 001 established:

- EmailORC is MVP/demo-stage.
- It should not be treated as production-ready.
- Auto-send remains disabled.
- Live CRM/email integrations remain disabled.
- Human review remains required.

Sprint 002 reported:

- `npm run test` passed.
- `npm run build` passed.
- `npm run lint` is blocked by interactive Next ESLint setup.
- `npm run test:e2e` was skipped because current Playwright tests mutate admin/user/environment state.
- Safe local validation gate is `npm run test` plus `npm run build`.
- CSV upload flow has no field mapping step and was ranked P2.

Sprint 003 completed:

- `/mvp/admin` is restricted to Super Admin users only.
- Draft approval is blocked below QA score 90.
- Tests passed.
- Build passed.
- Auto-send and live integrations remain untouched.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-20  
**Current phase:** Sprint 004 — Import Mapping and Validation Hardening

---

## Current Status

Sprint 003 is complete.

The two P1 demo-flow blockers from Sprint 002 have been fixed:

1. `/mvp/admin` is restricted to Super Admin users only.
2. Draft approval is blocked when QA score is below 90.

The current safe local validation gate remains:

- `npm run test`
- `npm run build`

Sprint 004 is active and targets the next P2 core workflow issue from Sprint 002:

- CSV upload/import lacks a clear field mapping and validation step.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/004-import-mapping-and-validation-hardening/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- Sprint 003 completed two P1 demo-flow fixes.
- `npm run test` passed after Sprint 003.
- `npm run build` passed after Sprint 003.
- `npm run lint` remains interactive.
- E2E remains skipped because it currently mutates app/admin/user/environment state.

---

## Next Actions

1. Apply Architect Pack 004 to create Sprint 004 planning files.
2. Have Codex read Sprint 004 files and summarize the plan before implementation.
3. Approve Codex implementation only after the summary is correct.
4. Harden import mapping and required-field validation only.
5. Run `npm run test` and `npm run build`.
6. Report acceptance status and recommended Sprint 005.

---

## Blockers / Open Items

- Production readiness is not established.
- Full auth/session readiness still needs a future audit.
- Campaign Board movement remains unresolved.
- Playwright state mutation remains unresolved.
- `npm run lint` remains interactive.
- Prisma SQLite and Cloudflare D1 relationship needs future reconciliation.
- Environment mode definitions need future clarification.
- Required import fields need to be confirmed from existing code and tests during Sprint 004.
```

---

# File: planning/DECISIONS.md

```markdown
# Decisions

Record durable decisions future sprints must respect.

---

## Decision Log

| Date | Decision | Reason | Impact |
|---|---|---|---|
| 2026-05-20 | Sprint 004 will harden CSV import mapping and validation only. | Sprint 002 identified CSV import reliability as the next P2 core workflow issue after the P1 demo blockers. | Codex must not expand Sprint 004 into CRM integrations, sending, database migrations, or dashboard work. |
| 2026-05-20 | Invalid imports should fail clearly instead of silently creating bad records. | Downstream validation, draft generation, and export depend on trustworthy input records. | Import logic should report missing or unmapped required fields before records are accepted. |
| 2026-05-20 | Sprint 004 should use existing app patterns for import UI and validation. | The app is MVP/demo-stage and should not receive a broad redesign or data-model rewrite in this sprint. | Keep the fix small, local, and auditable. |
| 2026-05-20 | Sprint 004 validation gate is `npm run test` and `npm run build`. | Sprint 002 established these as the safe local gates and Sprint 003 preserved them. | Lint and E2E are not required gates for Sprint 004 unless handled in a later tooling sprint. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Auth/session model is MVP-style and not production-ready. | High | High | Sprint 003 fixed one admin access guard; full auth audit remains future work. | Open |
| CSV imports may accept incomplete or incorrectly mapped records. | High | High | Sprint 004 adds mapping/required-field validation and clear errors. | Active |
| Required CSV fields may be unclear or inconsistent across code, tests, and samples. | Medium | High | Builder must inspect existing code/tests/samples and document assumptions before implementation. | Active |
| Import UI could become overbuilt. | Medium | Medium | Keep mapping UI practical and MVP-level; avoid a persistent template system unless already supported. | Active |
| Prisma SQLite and Cloudflare D1 schemas may diverge. | Medium | High | Do not change schema in Sprint 004; schedule future data-model sprint. | Open |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep explicit decision that auto-send and live integrations remain disabled unless approved. | Open |
| Existing Campaign Board bug may be pulled into Sprint 004. | Medium | Medium | Scope is limited to import mapping and validation only. | Open |
| Modified local database file could be accidentally committed. | Medium | Medium | Do not touch `prisma/dev.db`; verify git status before and after. | Open |
| Playwright suite mutates app state. | Medium | Medium | Do not use E2E as Sprint 004 acceptance gate. | Open |
| `npm run lint` is interactive. | High | Low | Do not require lint as Sprint 004 gate; create future tooling cleanup sprint if needed. | Open |
```

---

# File: planning/QUESTIONS.md

```markdown
# Open Questions

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Is EmailORC intended for internal AI Hub use only, client demos, or paid client production use? | Owner | Production readiness sprint | Open | Affects full auth, deployment, compliance, and sending rules. |
| What is the correct production target: Cloudflare only, local/server deploy, or another host? | Owner | Production readiness sprint | Open | Current audit found Cloudflare D1 and OpenNext Cloudflare path. |
| Should Prisma SQLite remain only for local development? | Architect/Builder | Data model sprint | Open | Needs schema reconciliation with D1. |
| What should demo, test-live, and production mean in business terms? | Owner/Architect | Environment mode sprint | Open | Must be documented before behavior changes. |
| Should the product ever send emails directly, or should it remain review/export only? | Owner | Integration roadmap | Open | Current decision: no auto-send unless future sprint approves it. |
| What fields are required in uploaded CSV/account files? | Builder/Architect | Sprint 004 | Active | Builder must confirm from current code, tests, samples, and UI. Do not invent fields without evidence. |
| What header aliases should Sprint 004 support? | Builder/Architect | Sprint 004 | Active | Support obvious aliases only if they map cleanly to existing fields. Document all aliases added. |
| Should Playwright tests be rewritten to avoid mutating app state? | Architect/Builder | Future validation sprint | Open | Sprint 002 found E2E is not no-mutation-safe. |
| Should lint be configured to run non-interactively? | Architect/Builder | Future tooling sprint | Open | Sprint 002 found `npm run lint` triggers interactive Next ESLint setup. |
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes from the existing audit.

Do not treat this as complete until a Builder performs a route-by-route API inventory.

## Known Workflow Routes

| Route | Purpose | Notes |
|---|---|---|
| `app/api/workflow/import/route.ts` | CSV/contact import | Sprint 004 should harden mapping and required-field validation before accepting records. |
| `app/api/workflow/records/route.ts` | Record retrieval / validation display | Needs route-level documentation. |
| `app/api/workflow/drafts/route.ts` | Draft retrieval | Needs route-level documentation. |
| `app/api/workflow/export/route.ts` | Approved draft export | Selects approved, non-archived drafts and excludes do-not-contact records. |
| `app/api/drafts/approve/route.ts` | Draft approval | Sprint 003 enforces QA score >= 90 before approval. |

## Import Mapping / Validation Expectations

Sprint 004 should inspect and document the actual request/response behavior for the import path.

Expected behavior after Sprint 004:

- The import path validates required fields before accepting records.
- Missing required fields return a clear error response.
- Unmapped required fields are surfaced clearly to the user.
- Common header variations may be normalized where supported by existing data fields.
- Invalid rows should not silently create misleading records.
- Valid imports should continue to work.

Sprint 004 must not add CRM sync, live integrations, sending behavior, database migrations, or production deployment behavior.

## Admin / Access-Control Areas

Sprint 003 behavior:

- Super Admin can access `/mvp/admin`.
- Client Admin cannot directly access `/mvp/admin`.
- Unauthorized users cannot access `/mvp/admin`.

## Other API Areas Identified

- Auth
- Admin
- Environment status
- Billing
- Brain/OpenRouter
- Usage logs
- Account intelligence

## API Documentation Gaps

Future API documentation should capture for each route:

- Method
- Path
- Request shape
- Response shape
- Auth/session expectation
- Data source
- Validation rules
- Error states
- Environment-mode behavior
```

---

# File: docs/VALIDATION.md

```markdown
# Validation Plan

## Overview

Validation proves EmailORC is safe and trustworthy before future feature work, demos, or production decisions.

Current status:

- MVP/demo behavior exists.
- Production readiness is not established.
- Safe local validation gate from Sprint 002:
  - `npm run test`
  - `npm run build`
- `npm run lint` is not an unattended gate yet because it triggers interactive Next ESLint setup.
- Playwright/E2E is not a no-mutation-safe gate yet.

## Existing Validation Assets

| Asset | Purpose | Notes |
|---|---|---|
| `tests/` | Automated and manual validation | Includes Vitest, Playwright, fixtures, manual QA assets. |
| `tests/BUG_SUMMARY.md` | Known unresolved bugs | Sprint 002 used this for bug prioritization. |
| `playwright.config.ts` | E2E configuration | Do not treat as no-mutation-safe yet. |
| `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md` | Sprint 002 validation findings | Source for Sprint 003 and Sprint 004 priority. |

## Sprint 003 Validation Status

Sprint 003 fixed and validated:

1. Client Admin cannot access `/mvp/admin`.
2. Draft approval is blocked when QA score is below 90.

Sprint 003 validation passed:

```bash
npm run test
npm run build
```

## Sprint 004 Validation Focus

Sprint 004 validates import mapping and required-field handling.

Sprint 004 should prove:

1. Valid CSV/import input still works.
2. Missing required fields are blocked clearly.
3. Unmapped required fields are surfaced clearly.
4. Supported header aliases normalize correctly, if aliases are added.
5. Invalid imports do not silently create bad records.
6. Tests cover the mapping and validation behavior where practical.

## Sprint 004 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run build
```

Optional targeted tests may be added or run if they are local-safe.

Do not run E2E unless Codex proves the specific command is local-safe and does not mutate app/admin/user/environment state.

Do not run:

- migrations
- seed commands
- deploy commands
- wrangler deploy
- commands that write to live services
- commands that require secret values
- commands that enable sending or integrations

## Future Validation Areas

- Export filtering rules.
- Campaign board drag/drop behavior.
- Environment mode behavior.
- D1 persistence behavior.
- Auth/session readiness.
- Production deployment readiness.
- Non-mutating Playwright/E2E gate.
- Non-interactive lint gate.
```

---

# File: planning/sprints/004-import-mapping-and-validation-hardening/requirements.md

```markdown
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
```

---

# File: planning/sprints/004-import-mapping-and-validation-hardening/blueprint.md

```markdown
# Sprint 004 Blueprint — Import Mapping and Validation Hardening

## Objective

Implement a focused import mapping and validation hardening pass for the EmailORC CSV/upload workflow.

## Files to Read First

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md`
- `planning/sprints/003-demo-flow-stability-fixes/acceptance.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/requirements.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/blueprint.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/acceptance.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before editing.

Likely areas:

- `app/mvp/upload/`
- upload/import pages under `app/mvp/`
- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- import helpers under `src/`
- validation helpers under `src/`
- CSV parsing logic under `src/` or `app/api/`
- existing fixtures under `tests/`
- existing unit tests under `tests/`
- README or docs that mention CSV format
- sample CSV files, if present

Do not assume exact paths without checking the repo.

## Files to Create

- `planning/sprints/004-import-mapping-and-validation-hardening/requirements.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/blueprint.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/acceptance.md`
- `planning/sprints/004-import-mapping-and-validation-hardening/handoff-prompt.md`

## Files to Modify

Expected categories:

- Import API route or import parser/mapper helper
- Upload/import UI only if needed for clear validation feedback
- Shared validation helper, if existing patterns support it
- Focused tests for import mapping and validation
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DECISIONS.md`, only if durable decisions are made

## Implementation Plan

### Step 1 — Confirm baseline

1. Run:

   ```bash
   git status --short
   ```

2. Confirm `prisma/dev.db` is not intentionally touched.
3. Inspect Sprint 002 validation report and Sprint 003 acceptance status.
4. Inspect current import UI, import API, CSV parser, validators, tests, and fixtures.
5. Identify actual current input fields and internal record fields.
6. Summarize planned file edits before making changes.

### Step 2 — Identify required import fields

1. Determine required fields from existing code, tests, fixtures, and docs.
2. Record the required fields in Sprint 004 completion notes.
3. If evidence conflicts, choose the smallest safe requirement set and document the ambiguity.
4. Do not invent client-specific fields without evidence.

### Step 3 — Add or harden mapping logic

1. Add a small mapping layer if one does not already exist.
2. Normalize header casing and spacing.
3. Support obvious aliases only when they map directly to existing fields.
4. Keep alias support explicit and tested.
5. Avoid broad fuzzy matching that could map fields incorrectly.

### Step 4 — Enforce required-field validation

1. Validate required fields in the authoritative import path.
2. Block imports that cannot map required fields.
3. Block or clearly flag rows missing required values, based on existing app patterns.
4. Return clear errors or structured validation feedback.
5. Prevent invalid imports from silently creating misleading records.

### Step 5 — Surface clear UI feedback

1. If the upload UI currently shows import errors, reuse that pattern.
2. If the UI does not clearly show errors, add focused feedback for missing/unmapped required fields.
3. Do not redesign the upload page.
4. Do not add a complex mapping wizard unless the existing app structure already supports it with minimal changes.

### Step 6 — Add focused tests

Add or update tests where practical for:

- Valid import headers map correctly.
- Common supported aliases map correctly, if aliases are added.
- Missing required headers are blocked.
- Missing required row values are blocked or reported according to the chosen rule.
- Valid imports still pass.

If route-level tests are difficult due to existing test structure, add focused utility tests around mapping/validation helpers, but keep code changes minimal.

### Step 7 — Validate

Run:

```bash
npm run test
npm run build
```

Do not require:

```bash
npm run lint
npm run test:e2e
```

Reason:

- Lint is currently interactive.
- E2E currently mutates app/admin/user/environment state.

### Step 8 — Update docs/state

Update:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/DECISIONS.md`, only if durable decisions were made

Recommend Sprint 005 based on remaining P2/P3 items.

## Forbidden Changes

Do not modify:

- `prisma/dev.db`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `d1/`
- `.env`
- `.env.example`
- `.dev.vars`
- `.dev.vars.example`
- `wrangler.jsonc`
- deployment config
- unrelated app features

Do not run:

- deploy commands
- migrations
- seed commands
- commands requiring live credentials
- commands that send email
- commands that enable integrations

## Validation Commands

Required:

```bash
git status --short
npm run test
npm run build
```

Optional:

- Targeted unit tests if the repo supports running a single test file safely.

Skipped unless separately approved:

```bash
npm run lint
npm run test:e2e
npm run test:e2e:report
```

## Report Format

After implementation, Codex should report:

1. Files changed.
2. Current import fields identified.
3. Required fields chosen and evidence for them.
4. Mapping behavior before/after.
5. Validation behavior before/after.
6. UI feedback behavior before/after.
7. Tests added/updated.
8. Commands run and results.
9. Commands skipped and why.
10. Acceptance criteria complete/incomplete.
11. Any risks introduced.
12. Recommended Sprint 005.
```

---

# File: planning/sprints/004-import-mapping-and-validation-hardening/acceptance.md

```markdown
# Sprint 004 Acceptance Criteria

Sprint 004 is complete when:

## Scope Control

- [ ] Builder read the Sprint 004 requirements, blueprint, and acceptance criteria.
- [ ] Builder confirmed the sprint is limited to import mapping and validation hardening.
- [ ] Builder did not implement CRM integration.
- [ ] Builder did not implement Salesforce integration.
- [ ] Builder did not enable sending or auto-send.
- [ ] Builder did not implement Campaign Board drag/drop fixes.
- [ ] Builder did not clean up Playwright mutation behavior.
- [ ] Builder did not configure lint tooling.
- [ ] Builder did not redesign auth/session.
- [ ] Builder did not claim production readiness.

## Import Field Discovery

- [ ] Current import source files were inspected.
- [ ] Existing tests/fixtures/samples were inspected where available.
- [ ] Required import fields were identified from existing evidence.
- [ ] Any ambiguity about required fields was documented instead of guessed.

## Mapping Behavior

- [ ] Header normalization handles casing and spacing differences where practical.
- [ ] Supported aliases are explicit and documented if aliases are added.
- [ ] Mapping avoids unsafe broad fuzzy matching.
- [ ] Valid import headers map to the expected internal fields.
- [ ] Valid imports continue to work.

## Validation Behavior

- [ ] Missing required headers are blocked with clear feedback.
- [ ] Unmapped required fields are blocked or clearly surfaced.
- [ ] Missing required row values are blocked or clearly reported according to the implemented rule.
- [ ] Invalid imports do not silently create misleading records.
- [ ] Validation is enforced in the authoritative import path.
- [ ] The fix is not UI-only.

## UI Feedback

- [ ] Upload/import UI clearly communicates missing or unmapped required fields.
- [ ] UI changes are limited to the import validation feedback need.
- [ ] No broad upload page redesign was introduced.

## Tests

- [ ] Focused test coverage exists for valid import mapping, if practical in the current test structure.
- [ ] Focused test coverage exists for missing required headers, if practical in the current test structure.
- [ ] Focused test coverage exists for missing required row values or documented validation behavior, if practical in the current test structure.
- [ ] If a test could not be added, Codex documents why and describes the manual verification performed.

## Safety

- [ ] No database files changed.
- [ ] No migrations changed.
- [ ] No env files changed.
- [ ] No deployment config changed.
- [ ] `prisma/dev.db` was not intentionally touched.
- [ ] No secrets were exposed.
- [ ] Auto-send remains disabled.
- [ ] Live integrations remain disabled.

## Validation

- [ ] `git status --short` was run before and after.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run lint` was skipped unless it has been made non-interactive in a separately approved change.
- [ ] E2E was skipped unless proven local-safe and non-mutating.

## Documentation

- [ ] `planning/STATE.md` is updated.
- [ ] `planning/RISKS.md` is updated.
- [ ] `planning/QUESTIONS.md` is updated if new questions are found.
- [ ] `docs/API.md` is updated if route behavior changed.
- [ ] `docs/VALIDATION.md` is updated with Sprint 004 validation results.
- [ ] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [ ] Builder recommends a specific Sprint 005.
- [ ] Builder does not start Sprint 005.
```

---

# File: planning/sprints/004-import-mapping-and-validation-hardening/handoff-prompt.md

```markdown
# Sprint 004 Builder Handoff Prompt

You are the Builder Layer for EmailORC.

This is Sprint 004:

`004-import-mapping-and-validation-hardening`

This sprint implements only import mapping and validation hardening for the CSV/upload workflow.

## Read First

Read:

1. `AGENTS.md`
2. `CODEX.md`
3. `planning/STATE.md`
4. `planning/DECISIONS.md`
5. `planning/DOMAIN.md`
6. `planning/RISKS.md`
7. `planning/QUESTIONS.md`
8. `docs/ARCHITECTURE.md`
9. `docs/API.md`
10. `docs/DATA_MODEL.md`
11. `docs/VALIDATION.md`
12. `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md`
13. `planning/sprints/003-demo-flow-stability-fixes/acceptance.md`
14. `planning/sprints/004-import-mapping-and-validation-hardening/requirements.md`
15. `planning/sprints/004-import-mapping-and-validation-hardening/blueprint.md`
16. `planning/sprints/004-import-mapping-and-validation-hardening/acceptance.md`

Then inspect the relevant source/test files.

Likely areas:

- `app/mvp/upload/`
- upload/import pages under `app/mvp/`
- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- import helpers under `src/`
- validation helpers under `src/`
- CSV parsing logic under `src/` or `app/api/`
- existing fixtures under `tests/`
- existing unit tests under `tests/`
- README or docs that mention CSV format
- sample CSV files, if present

Do not assume exact paths. Inspect first.

## Task

Harden the CSV/upload import workflow so required fields are mapped and validated before records are accepted.

Create or update tests where practical.

Update planning/docs after implementation.

## Hard Rules

- Do not implement CRM integration.
- Do not implement Salesforce integration.
- Do not enable sending.
- Do not enable auto-send.
- Do not rewrite AI prompts.
- Do not fix Campaign Board drag/drop.
- Do not clean up Playwright mutation behavior.
- Do not configure lint tooling.
- Do not redesign auth/session.
- Do not create a new broad permission system.
- Do not change database schema.
- Do not modify database files.
- Do not modify migrations.
- Do not modify env files.
- Do not modify deployment config.
- Do not expose secrets.
- Do not enable live integrations.
- Do not mark the app production-ready.
- Do not intentionally touch `prisma/dev.db`.

## Before Making Changes

Summarize:

1. What Sprint 004 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. What required fields you believe the import currently needs, and what evidence supports that.
5. Which mapping/validation behavior you plan to implement.
6. Which tests you expect to add or update.
7. Which validation commands you plan to run.
8. Which commands you will skip and why.
9. Any blockers or ambiguities.

Stop after the summary and wait for approval before implementing.

## After Approval

Implement the import mapping and validation hardening only.

Required validation:

```bash
git status --short
npm run test
npm run build
```

Skip unless separately approved:

```bash
npm run lint
npm run test:e2e
npm run test:e2e:report
```

## After Implementation

Report:

1. Files changed.
2. Current import fields identified.
3. Required fields chosen and evidence for them.
4. Mapping behavior before and after.
5. Validation behavior before and after.
6. UI feedback behavior before and after.
7. Tests added or updated.
8. Commands run and results.
9. Commands skipped and why.
10. Acceptance criteria complete or incomplete.
11. Any risks introduced.
12. Recommended Sprint 005.

Do not start Sprint 005.
```

---

# Codex Apply Architect Pack 004 Prompt

Use this prompt in Codex after saving this Architect Pack at the EmailORC repo root.

```text
You are the Builder Layer for EmailORC.

Apply Architect Pack 004 — Import Mapping and Validation Hardening.

Important:
- This is Sprint 004.
- Do not implement fixes yet.
- First apply/create the Sprint 004 planning files from the Architect Pack.
- Then read the Sprint 004 files and summarize the implementation plan.
- Stop after the summary and wait for approval.

Create/update the planning and docs files described in the Architect Pack.

Hard limits:
- Do not implement CRM integration.
- Do not implement Salesforce integration.
- Do not enable sending.
- Do not enable auto-send.
- Do not rewrite AI prompts.
- Do not fix Campaign Board drag/drop.
- Do not clean up Playwright mutation behavior.
- Do not configure lint tooling.
- Do not redesign auth/session.
- Do not create a new broad permission system.
- Do not change database schema.
- Do not modify database files.
- Do not modify migrations.
- Do not modify env files.
- Do not modify deployment config.
- Do not expose secrets.
- Do not enable live integrations.
- Do not mark the app production-ready.
- Do not intentionally touch prisma/dev.db.

After applying the pack, summarize:

1. What Sprint 004 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. What required fields you believe the import currently needs, and what evidence supports that.
5. Which mapping/validation behavior you plan to implement.
6. Which tests you expect to add or update.
7. Which validation commands you plan to run.
8. Which commands you will skip and why.
9. Any blockers or ambiguities.

Stop after the summary and wait for my approval before implementing.
```

---

# Recommended Sprint 005 Direction

Do not start Sprint 005 yet.

Sprint 005 should be selected only after Sprint 004 is complete.

Likely candidates:

1. `005-campaign-board-browser-state-fix`
2. `005-playwright-non-mutating-validation-gate`
3. `005-lint-tooling-cleanup`
4. `005-auth-session-readiness-audit`
5. `005-data-model-source-of-truth-audit`

Recommended default if Sprint 004 passes:

`005-campaign-board-browser-state-fix`

Reason:

Campaign Board movement was the remaining P2 user-visible workflow issue from Sprint 002 after the Sprint 003 P1 fixes and Sprint 004 import hardening.
