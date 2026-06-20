# Sprint 006 Builder Handoff Prompt

You are the Builder Layer for EmailORC.

This is Sprint 006:

`006-playwright-non-mutating-validation-gate`

This sprint creates or isolates a safe, non-mutating Playwright browser validation path.

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
13. `planning/sprints/005-campaign-board-browser-state-fix/acceptance.md`
14. `planning/sprints/006-playwright-non-mutating-validation-gate/requirements.md`
15. `planning/sprints/006-playwright-non-mutating-validation-gate/blueprint.md`
16. `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`

Then inspect the relevant source/test files.

Likely areas:

- `package.json`
- `playwright.config.ts`
- Playwright specs under `tests/`
- E2E runbook or QA docs under `tests/` or `docs/`
- Playwright fixtures/helpers, if present

Do not assume exact paths. Inspect first.

## Task

Create or isolate a non-mutating Playwright validation path that future builders can safely run.

The safe path must not mutate:

- app state
- admin state
- user state
- environment state
- database records
- integrations
- email sending state

Create or update tests/scripts where practical.

Update planning/docs after implementation.

## Hard Rules

- Do not rewrite the full E2E suite unless required and documented.
- Do not configure lint tooling.
- Do not implement app feature work.
- Do not change Campaign Board behavior.
- Do not change CSV/import behavior.
- Do not change draft approval behavior.
- Do not change auth/session behavior.
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

1. What Sprint 006 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. Which tests/scripts you expect to add or update.
5. Which validation commands you plan to run.
6. Which commands you will skip and why.
7. Any blockers or ambiguities.

Stop after the summary and wait for approval before implementing.

## After Approval

Implement only the Playwright non-mutating validation gate.

Required validation:

```bash
git status --short
npm run test
npm run build
```

Run the new safe Playwright command only after documenting why it is non-mutating.

Skip unless separately approved:

```bash
npm run lint
npm run test:e2e
npm run test:e2e:report
```

## After Implementation

Report:

1. Files changed.
2. Existing Playwright tests classified as safe/mutating/unknown.
3. New safe Playwright command created.
4. Why the new command is non-mutating.
5. Tests added/updated.
6. Commands run and results.
7. Commands skipped and why.
8. Acceptance criteria complete/incomplete.
9. Any risks introduced.
10. Recommended Sprint 007.

Do not start Sprint 007.
