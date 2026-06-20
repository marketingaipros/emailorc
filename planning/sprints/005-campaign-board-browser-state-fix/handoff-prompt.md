# Sprint 005 Builder Handoff Prompt

You are the Builder Layer for EmailORC.

This is Sprint 005:

`005-campaign-board-browser-state-fix`

This sprint implements only the Campaign Board browser-state/card movement fix.

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
13. `planning/sprints/005-campaign-board-browser-state-fix/requirements.md`
14. `planning/sprints/005-campaign-board-browser-state-fix/blueprint.md`
15. `planning/sprints/005-campaign-board-browser-state-fix/acceptance.md`

Then inspect the relevant source/test files.

Likely areas:

- `app/mvp/campaigns/`
- `app/mvp/campaigns/page.tsx`
- Campaign Board components under `src/components/`, if present
- Campaign helpers/services under `src/`
- Campaign status/stage/domain types under `src/types/`
- Existing tests under `tests/`

Do not assume exact paths. Inspect first.

## Task

Fix only this issue:

- Campaign Board card movement does not update the visible browser card column/state correctly.

Create or update tests where practical.

Update planning/docs after implementation.

## Hard Rules

- Do not redesign the Campaign Board.
- Do not replace drag/drop infrastructure unless required and documented.
- Do not implement persistence redesign.
- Do not change database schema.
- Do not modify database files.
- Do not modify migrations.
- Do not modify env files.
- Do not modify deployment config.
- Do not expose secrets.
- Do not enable auto-send.
- Do not enable live integrations.
- Do not change auth/session behavior.
- Do not change CSV/import behavior.
- Do not change draft approval behavior.
- Do not configure lint tooling.
- Do not mark the app production-ready.
- Do not intentionally touch `prisma/dev.db`.

## Before Making Changes

Summarize:

1. What Sprint 005 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. Which tests you expect to add or update.
5. Which validation commands you plan to run.
6. Which commands you will skip and why.
7. Any blockers or ambiguities.

Stop after the summary and wait for approval before implementing.

## After Approval

Implement the Campaign Board browser-state/card movement fix only.

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
2. Campaign Board movement behavior before/after.
3. Root cause found.
4. Tests added/updated.
5. Manual verification steps, if any.
6. Commands run and results.
7. Commands skipped and why.
8. Acceptance criteria complete/incomplete.
9. Any risks introduced.
10. Recommended Sprint 006.

Do not start Sprint 006.
