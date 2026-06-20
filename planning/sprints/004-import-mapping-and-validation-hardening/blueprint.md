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
