# Sprint 007 Builder Handoff Prompt

You are the Builder Layer for EmailORC.

This is Sprint 007:

`007-non-interactive-lint-validation-gate`

This sprint makes lint run non-interactively as a safe validation gate.

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
12. `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`
13. `planning/sprints/007-non-interactive-lint-validation-gate/requirements.md`
14. `planning/sprints/007-non-interactive-lint-validation-gate/blueprint.md`
15. `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
16. `planning/sprints/007-non-interactive-lint-validation-gate/handoff-prompt.md`

Then inspect:

- `package.json`
- `next.config.*`
- `.eslintrc*`
- `eslint.config.*`
- `tsconfig.json`
- `.eslintignore`, if present
- existing validation docs or runbooks

## Task

Make lint run non-interactively as an unattended validation gate.

Create:

- `planning/sprints/007-non-interactive-lint-validation-gate/requirements.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/blueprint.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/handoff-prompt.md`

Update as needed:

- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DECISIONS.md`, only if durable decisions were made
- `package.json`, only if a script change is needed
- lint config files, only if needed
- minimal source files, only if required to pass lint and safe to change

## Hard Rules

- Do not implement app feature work.
- Do not perform broad formatting churn.
- Do not redesign lint rules broadly.
- Do not change Playwright behavior except reading or referencing Sprint 006 docs.
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

1. What Sprint 007 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. What you believe is causing lint to prompt interactively.
5. What lint command/config change you plan to try.
6. Which validation commands you plan to run.
7. Which commands you will skip and why.
8. Any blockers or ambiguities.

Stop after the summary and wait for approval before implementing.

## After Implementation

Report:

1. Files changed.
2. Why lint was interactive.
3. What lint config/script change was made.
4. The final non-interactive lint command.
5. Any lint issues fixed.
6. Any lint issues deferred and why.
7. Commands run and results.
8. Commands skipped and why.
9. Acceptance criteria complete/incomplete.
10. Any risks introduced.
11. Recommended Sprint 008.
