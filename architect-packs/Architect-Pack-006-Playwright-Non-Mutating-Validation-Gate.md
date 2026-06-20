# Architect Pack 006 — Playwright Non-Mutating Validation Gate

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `006-playwright-non-mutating-validation-gate`  
**Created:** 2026-05-20  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 006 is a focused validation/tooling sprint to make browser-level Playwright validation safe enough to use in future sprints.

The known issue: existing Playwright/E2E tests mutate app/admin/user/environment state, so prior sprints skipped `npm run test:e2e` and `npm run test:e2e:report`.

The goal is to create or isolate a non-mutating Playwright validation path that can verify key demo/browser flows without changing durable app state, admin/user settings, environment mode, database records, or live-service configuration.

This sprint must not expand into feature work, Campaign Board redesign, import changes, auth redesign, database work, live integrations, deployment, lint tooling, or production-readiness claims.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Inspect existing Playwright configuration and E2E tests.
- Identify which current Playwright tests mutate app/admin/user/environment state.
- Create or update a safe non-mutating Playwright validation path.
- Prefer adding a separate non-mutating test file, command, or project rather than rewriting the whole E2E suite.
- Use existing demo/local app behavior only.
- Document which browser checks are safe and which remain unsafe.
- Update validation docs and planning state after implementation.
- Run the current safe validation gate:
  - `npm run test`
  - `npm run build`
- Run the new non-mutating Playwright command only after Codex confirms it is local-safe and non-mutating.

### Out of Scope

- No broad Playwright rewrite.
- No app feature work.
- No Campaign Board redesign or additional board behavior changes.
- No CSV/import changes.
- No draft approval changes.
- No auth/session redesign.
- No database schema changes.
- No migrations.
- No seed commands.
- No D1/Prisma reconciliation.
- No env changes.
- No deployment changes.
- No Wrangler deploy.
- No lint tooling setup.
- No email sending.
- No live CRM/email integrations.
- No production-readiness claim.
- No intentional changes to `prisma/dev.db`.

---

## Source Facts From Prior Sprints

Sprint 002 found:

- `npm run test` passed.
- `npm run build` passed.
- `npm run lint` was blocked by an interactive Next ESLint setup prompt.
- `npm run test:e2e` was skipped because Playwright tests mutate admin/user/environment state.

Sprint 003 fixed:

- Super Admin-only access to `/mvp/admin`.
- Draft approval blocked below QA score 90.

Sprint 004 fixed:

- Import mapping and validation hardening.
- Email is the only blocking import/draft-generation field.
- Missing identity and renewal context are warnings.

Sprint 005 fixed:

- Campaign Board browser-state/card movement issue.
- Added focused Vitest coverage for board movement/grouping.
- Manual browser verification confirmed moved cards render in the correct column.
- Playwright remained skipped because existing E2E tests are still mutating.
- `npm run test` passed with 15 tests.
- `npm run build` passed.

Known validation posture before Sprint 006:

- Safe local gate:
  - `npm run test`
  - `npm run build`
- Unsafe or incomplete gates:
  - `npm run lint` is interactive.
  - `npm run test:e2e` mutates app/admin/user/environment state.
  - `npm run test:e2e:report` depends on the unsafe E2E run.
- `prisma/dev.db` is already dirty in the worktree and must not be intentionally touched.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-20  
**Current phase:** Sprint 006 — Playwright Non-Mutating Validation Gate

---

## Current Status

Sprint 005 is complete locally and accepted by owner review.

Sprint 005 fixed the Campaign Board browser-state/card movement issue. The moved card now appears in the target column and no longer appears in the old column after movement.

The current safe local validation gate remains:

- `npm run test`
- `npm run build`

Sprint 006 is active and targets Playwright validation safety:

- Existing Playwright/E2E tests mutate app/admin/user/environment state.
- Sprint 006 should create or isolate a non-mutating browser validation path that can be used safely in future sprints.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/006-playwright-non-mutating-validation-gate/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- Sprint 003 fixed Super Admin-only access to `/mvp/admin` and blocked draft approval below QA score 90.
- Sprint 004 hardened import mapping and validation.
- Sprint 005 fixed Campaign Board browser-state/card movement.
- `npm run test` passed with 15 tests after Sprint 005.
- `npm run build` passed after Sprint 005.
- `npm run lint` remains interactive.
- Existing E2E remains skipped because current Playwright tests mutate app/admin/user/environment state.

---

## Next Actions

1. Apply Architect Pack 006 to create Sprint 006 planning files.
2. Have Codex read Sprint 006 files and summarize the plan before implementation.
3. Approve Codex implementation only after the summary is correct.
4. Inspect existing Playwright tests and configuration.
5. Create or isolate a non-mutating Playwright validation path.
6. Run `npm run test`, `npm run build`, and the new safe Playwright validation command if confirmed safe.
7. Report acceptance status and recommended Sprint 007.

---

## Blockers / Open Items

- Production readiness is not established.
- Playwright/E2E state mutation remains unresolved until Sprint 006 implementation is complete.
- `npm run lint` remains interactive and should be handled in a separate future sprint.
- Prisma SQLite and Cloudflare D1 relationship needs future reconciliation.
- Environment mode definitions need future clarification.
- Full auth/session readiness still needs a future audit.
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
| 2026-05-20 | Sprint 006 will focus only on creating or isolating a non-mutating Playwright validation gate. | Browser-level validation is useful, but current E2E tests mutate app/admin/user/environment state. | Codex must not expand into feature work, lint tooling, auth redesign, database work, or deployment changes. |
| 2026-05-20 | Sprint 006 should not rewrite the full Playwright suite unless a smaller safe path is not practical. | The goal is a useful safe browser gate, not a broad E2E cleanup project. | Prefer a separate non-mutating test file, project, or script over large rewrites. |
| 2026-05-20 | Lint non-interactive cleanup is deferred to a separate sprint. | Combining lint and Playwright cleanup increases scope and risk. | `npm run lint` remains skipped in Sprint 006 unless already non-interactive without changes. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Existing Playwright tests mutate app/admin/user/environment state. | High | Medium | Sprint 006 creates or isolates a non-mutating browser validation path. | Active |
| Builder rewrites the entire E2E suite. | Medium | Medium | Limit Sprint 006 to the smallest useful non-mutating gate. | Active |
| Browser tests rely on durable local state or dirty database records. | Medium | Medium | Prefer read-only UI checks, fixture-isolated local flows, or routes that do not persist durable changes. | Active |
| New Playwright command accidentally changes app state. | Medium | Medium | Require Codex to document why the command is non-mutating before running it as a gate. | Active |
| `npm run lint` is interactive. | High | Low | Defer lint cleanup to a separate future sprint. | Open |
| Modified local database file could be accidentally committed. | Medium | Medium | Do not intentionally touch `prisma/dev.db`; verify git status before and after. | Open |
| Prisma SQLite and Cloudflare D1 schemas may diverge. | Medium | High | Do not change schema in Sprint 006; schedule future data-model sprint. | Open |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep auto-send and live integrations disabled unless an approved future sprint changes them. | Open |
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
| Should lint be configured to run non-interactively? | Architect/Builder | Future tooling sprint | Open | Sprint 006 defers lint cleanup to keep scope focused. |
| Which browser flows should become the permanent non-mutating Playwright gate? | Architect/Builder | Sprint 006 | Active | Sprint 006 should propose the first safe set. |
| Should Campaign Board movement be added to a future true browser E2E gate after Playwright is safe? | Architect/Builder | Future validation sprint | Open | Sprint 005 used Vitest plus manual verification; browser E2E can be added later if non-mutating. |
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
- Safe local validation gate:
  - `npm run test`
  - `npm run build`
- `npm run lint` is not an unattended gate yet because it triggers interactive Next ESLint setup.
- Existing Playwright/E2E is not a no-mutation-safe gate yet.

## Existing Validation Assets

| Asset | Purpose | Notes |
|---|---|---|
| `tests/` | Automated and manual validation | Includes Vitest, Playwright, fixtures, manual QA assets. |
| `tests/BUG_SUMMARY.md` | Known unresolved bugs | Sprint 002 used this for bug prioritization. |
| `playwright.config.ts` | E2E configuration | Sprint 006 should inspect and isolate safe browser validation. |
| `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md` | Sprint 002 validation findings | Source for validation risks. |
| `tests/validation.test.ts` | Focused validation tests | Includes import validation and Campaign Board movement coverage after Sprint 005. |

## Sprint 006 Validation Focus

Sprint 006 validates one focused improvement:

1. Create or isolate a Playwright browser validation path that is safe and non-mutating.

## Sprint 006 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run build
```

Codex may run the new non-mutating Playwright command only after documenting why it is local-safe and does not mutate app/admin/user/environment state.

Do not run the existing broad E2E command as an acceptance gate unless Codex has proven it is non-mutating.

Do not run:

- migrations
- seed commands
- deploy commands
- wrangler deploy
- commands that write to live services
- commands that require secret values
- commands that enable sending or integrations

## Safe Playwright Gate Requirements

A future accepted Playwright gate should:

- Avoid changing admin/user/environment settings.
- Avoid writing durable database records unless isolated and cleaned up in the same test.
- Avoid sending email or touching live integrations.
- Avoid requiring secret values.
- Prefer read-only navigation, visibility, and smoke checks.
- Clearly separate safe tests from mutating tests.
- Have a documented command that future builders can run.

## Future Validation Areas

- Non-interactive lint gate.
- Campaign Board true browser movement E2E after Playwright is safely isolated.
- Environment mode behavior.
- D1 persistence behavior.
- Auth/session readiness.
- Production deployment readiness.
```

---

# File: planning/sprints/006-playwright-non-mutating-validation-gate/requirements.md

```markdown
# Sprint 006 Requirements — Playwright Non-Mutating Validation Gate

## Goal

Create or isolate a Playwright browser validation path that can be safely run without mutating app/admin/user/environment state.

## Business Objective

Give future EmailORC sprints a stronger browser-level validation gate without risking durable state changes or dirtying local/demo data.

## User Story

As the project owner, I want a safe Playwright validation command, so Codex can verify key browser flows in future sprints without changing app state or creating demo instability.

## In Scope

- Inspect existing Playwright tests and configuration.
- Identify which tests mutate state and why.
- Create or isolate a non-mutating Playwright test path.
- Add or update package scripts only if needed to run the safe Playwright gate.
- Prefer read-only smoke checks and navigation/visibility checks.
- Document unsafe Playwright tests separately from safe tests.
- Run `npm run test`.
- Run `npm run build`.
- Run the new safe Playwright command only if Codex confirms it is local-safe and non-mutating.
- Update Sprint 006 docs and project state.

## Out of Scope

- Full Playwright rewrite.
- Full QA framework redesign.
- Lint tooling cleanup.
- App feature work.
- Campaign Board redesign.
- CSV/import changes.
- Draft approval changes.
- Auth/session redesign.
- Database schema changes.
- Migrations.
- Seed commands.
- Env changes.
- Deployment changes.
- Email sending.
- Live CRM/email integrations.
- Production-readiness claim.

## Business Rules

- Safe Playwright tests must not mutate app/admin/user/environment state.
- Safe Playwright tests must not require live credentials.
- Safe Playwright tests must not send email.
- Safe Playwright tests must not enable integrations.
- Mutating E2E tests should remain separated or skipped from the safe gate.
- If a test needs data, prefer existing demo/read-only data or isolated disposable state that is cleaned up safely.
- `prisma/dev.db` must not be intentionally touched.
- Auto-send remains disabled.
- Live integrations remain disabled.
- EmailORC remains MVP/demo-stage.

## Expected Output

Create:

- `planning/sprints/006-playwright-non-mutating-validation-gate/requirements.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/blueprint.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/handoff-prompt.md`

Update as needed:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/VALIDATION.md`
- Targeted Playwright config/test/script files required to create the safe gate
- `package.json`, only if a new safe test script is needed

## Success Definition

Sprint 006 succeeds when:

- There is a clearly documented safe Playwright/browser validation path.
- The safe Playwright path does not mutate app/admin/user/environment state.
- Mutating E2E tests are not part of the safe validation gate.
- `npm run test` passes.
- `npm run build` passes.
- The new safe Playwright command passes, if implemented and confirmed safe.
- No out-of-scope changes are introduced.
```

---

# File: planning/sprints/006-playwright-non-mutating-validation-gate/blueprint.md

```markdown
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
```

---

# File: planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md

```markdown
# Sprint 006 Acceptance Criteria

Sprint 006 is complete when:

## Scope Control

- [ ] Builder read the Sprint 006 requirements, blueprint, and acceptance criteria.
- [ ] Builder confirmed the sprint is limited to Playwright non-mutating validation.
- [ ] Builder did not rewrite the full E2E suite unless required and documented.
- [ ] Builder did not configure lint tooling.
- [ ] Builder did not implement app feature work.
- [ ] Builder did not change Campaign Board behavior.
- [ ] Builder did not change CSV/import behavior.
- [ ] Builder did not change draft approval behavior.
- [ ] Builder did not change auth/session behavior.
- [ ] Builder did not claim production readiness.

## Playwright Safe Gate

- [ ] Existing Playwright tests/config were inspected.
- [ ] Mutating Playwright tests were identified or isolated.
- [ ] A safe non-mutating Playwright validation path exists.
- [ ] The safe Playwright path is documented in `docs/VALIDATION.md`.
- [ ] The safe Playwright command does not mutate app/admin/user/environment state.
- [ ] The safe Playwright command does not require live credentials.
- [ ] The safe Playwright command does not send email or enable integrations.
- [ ] Mutating E2E tests are not part of the safe gate.

## Tests / Verification

- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] The new safe Playwright command passes if implemented and confirmed safe.
- [ ] If the safe Playwright command could not be fully implemented, Codex documents why and provides the closest safe alternative.

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
- [ ] Existing broad `npm run test:e2e` was skipped unless proven non-mutating.
- [ ] Existing `npm run test:e2e:report` was skipped unless proven non-mutating.
- [ ] `npm run lint` was skipped because lint cleanup is out of Sprint 006 scope.

## Documentation

- [ ] `planning/STATE.md` is updated.
- [ ] `planning/RISKS.md` is updated.
- [ ] `planning/QUESTIONS.md` is updated if new questions are found.
- [ ] `docs/VALIDATION.md` is updated with Sprint 006 validation results and safe browser gate instructions.
- [ ] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [ ] Builder recommends a specific Sprint 007.
- [ ] Builder does not start Sprint 007.
```

---

# File: planning/sprints/006-playwright-non-mutating-validation-gate/handoff-prompt.md

```markdown
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
```

---

# Codex Apply Architect Pack 006 Prompt

Use this prompt in Codex after saving this Architect Pack at the EmailORC repo root.

```text
You are the Builder Layer for EmailORC.

Apply Architect Pack 006 — Playwright Non-Mutating Validation Gate.

Important:
- This is Sprint 006.
- The sprint is limited to creating or isolating a safe non-mutating Playwright validation path.
- Do not implement changes yet.
- First apply/create the Sprint 006 planning files from the Architect Pack.
- Then read the Sprint 006 files and summarize the implementation plan.
- Stop after the summary and wait for approval.

Architect Pack file:
Architect-Pack-006-Playwright-Non-Mutating-Validation-Gate.md

Create/update the planning and docs files described in the Architect Pack.

Hard limits:
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
- Do not intentionally touch prisma/dev.db.

After applying the pack, summarize:

1. What Sprint 006 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. Which tests/scripts you expect to add or update.
5. Which validation commands you plan to run.
6. Which commands you will skip and why.
7. Any blockers or ambiguities.

Stop after the summary and wait for my approval before implementing.
```

---

# Recommended Sprint 007 Direction

Do not start Sprint 007 yet.

Recommended default if Sprint 006 passes:

`007-lint-non-interactive-validation-gate`

Reason:

Lint has remained skipped since Sprint 002 because `npm run lint` triggers an interactive Next ESLint setup prompt. Once Playwright has a safe browser gate, the next validation improvement should make lint non-interactive so future sprints can use a stronger unattended validation gate.
