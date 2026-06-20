# Sprint 003 Builder Handoff Prompt

You are the Builder Layer for EmailORC.

This is Sprint 003:

`003-demo-flow-stability-fixes`

This sprint implements only the two P1 demo stability fixes from Sprint 002.

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
13. `planning/sprints/003-demo-flow-stability-fixes/requirements.md`
14. `planning/sprints/003-demo-flow-stability-fixes/blueprint.md`
15. `planning/sprints/003-demo-flow-stability-fixes/acceptance.md`

Then inspect the relevant source/test files.

Likely areas:

- `app/mvp/admin/`
- `app/mvp/admin/page.tsx`
- admin layout or guard components, if present
- auth/session utilities
- `app/api/drafts/approve/route.ts`
- draft review UI/components
- draft types/validation utilities
- existing tests under `tests/`

Do not assume exact paths. Inspect first.

## Task

Fix only these two P1 blockers:

1. Client Admin can directly access `/mvp/admin`.
2. Draft approval is not blocked below QA score 90.

Create or update tests where practical.

Update planning/docs after implementation.

## Hard Rules

- Do not implement CSV mapping.
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
- Do not enable auto-send.
- Do not enable live integrations.
- Do not mark the app production-ready.
- Do not intentionally touch `prisma/dev.db`.

## Before Making Changes

Summarize:

1. What Sprint 003 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. Which tests you expect to add or update.
5. Which validation commands you plan to run.
6. Which commands you will skip and why.
7. Any blockers or ambiguities.

Stop after the summary and wait for approval before implementing.

## After Approval

Implement the two P1 fixes only.

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
2. Admin access behavior before/after.
3. Draft QA approval behavior before/after.
4. Tests added/updated.
5. Commands run and results.
6. Commands skipped and why.
7. Acceptance criteria complete/incomplete.
8. Any risks introduced.
9. Recommended Sprint 004.

Do not start Sprint 004.
