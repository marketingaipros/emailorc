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
