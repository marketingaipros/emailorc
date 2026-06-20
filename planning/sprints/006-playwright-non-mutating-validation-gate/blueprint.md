# Sprint 006 Blueprint — Playwright Non-Mutating Validation Gate

## Objective

Create or isolate one safe browser validation gate:

1. A Playwright command that can run without mutating app/admin/user/environment state.

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
- `planning/sprints/005-campaign-board-browser-state-fix/acceptance.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/requirements.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/blueprint.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before editing.

Likely areas:

- `package.json`
- `playwright.config.ts`
- `tests/`
- Existing Playwright spec files under `tests/`
- Existing E2E runbook or QA docs under `tests/` or `docs/`
- `docs/VALIDATION.md`
- Any test fixtures used by Playwright
- Any demo login helpers used by Playwright

Do not assume exact paths without checking the repo.

## Files to Create

- `planning/sprints/006-playwright-non-mutating-validation-gate/requirements.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/blueprint.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/handoff-prompt.md`

## Files to Modify

Expected categories:

- Playwright config or safe project config, only if needed
- New safe Playwright spec file, if practical
- Existing E2E docs/runbook
- `package.json`, only if a new safe script is needed
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DECISIONS.md`, only if durable decisions were made

## Implementation Plan

### Step 1 — Confirm baseline

1. Run:

   ```bash
   git status --short
   ```

2. Confirm `prisma/dev.db` is already dirty but not intentionally touched.
3. Inspect `package.json` scripts.
4. Inspect `playwright.config.ts`.
5. Inspect existing Playwright tests and docs.

### Step 2 — Classify existing Playwright coverage

Classify current Playwright tests as:

- Safe/read-only
- Mutating app state
- Mutating admin/user state
- Mutating environment state
- Requiring live credentials or services
- Unknown/needs manual review

Document the classification in `docs/VALIDATION.md` or a sprint note.

### Step 3 — Design the smallest safe gate

Prefer one of these approaches:

1. Add a new safe Playwright spec file, such as:
   - `tests/e2e/smoke-readonly.spec.ts`
   - `tests/e2e/non-mutating-smoke.spec.ts`

2. Add a Playwright project for safe specs only.

3. Add a package script such as:
   - `test:e2e:safe`
   - `test:e2e:readonly`
   - `test:browser:safe`

Choose the option that fits the existing repo with the smallest change.

The safe gate should use read-only checks such as:

- Home/login page loads.
- Demo login page renders.
- MVP shell/navigation renders after demo login, if login itself does not mutate durable state.
- Campaign Board page renders, if viewing it does not mutate state.
- Drafts/records/upload pages render without triggering writes.
- Static or seeded demo content is visible.

Do not include actions that change records, users, admin settings, environment modes, campaigns, drafts, imports, or integrations.

### Step 4 — Implement the safe gate

1. Add or update only the minimum Playwright/test/script files needed.
2. Keep mutating tests outside the safe command.
3. Do not delete old tests unless they are being moved or renamed safely and the reason is documented.
4. Do not touch app code unless absolutely required for testability and explicitly justified.
5. Do not create new database state.

### Step 5 — Validate

Run:

```bash
npm run test
npm run build
```

Then run the new safe Playwright command only after confirming it is non-mutating.

Do not require:

```bash
npm run lint
npm run test:e2e
npm run test:e2e:report
```

Reason:

- Lint is currently interactive.
- Existing broad E2E currently mutates app/admin/user/environment state.

### Step 6 — Update docs/state

Update:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/VALIDATION.md`
- `planning/DECISIONS.md`, only if durable decisions were made

Recommend Sprint 007 based on remaining risks.

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

Optional after proven safe:

```bash
npm run test:e2e:safe
```

The exact safe script name may differ if Codex chooses a clearer name.

Skipped unless separately approved:

```bash
npm run lint
npm run test:e2e
npm run test:e2e:report
```

## Report Format

After implementation, Codex should report:

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
