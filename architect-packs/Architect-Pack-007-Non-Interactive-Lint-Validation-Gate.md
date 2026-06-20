# Architect Pack 007 — Non-Interactive Lint Validation Gate

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `007-non-interactive-lint-validation-gate`  
**Created:** 2026-05-20  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 007 is a focused validation/tooling sprint to make lint usable as an unattended validation gate.

The known issue: `npm run lint` has remained skipped since Sprint 002 because it triggers an interactive Next ESLint setup prompt.

The goal is to make lint run non-interactively in local Builder sessions and future validation gates without requiring a terminal prompt, without creating broad formatting churn, and without expanding into app feature work.

This sprint must not expand into feature changes, auth redesign, database work, deployment, Playwright redesign, sending, integrations, or production-readiness claims.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Inspect current package scripts and lint-related configuration.
- Identify why `npm run lint` is interactive.
- Add the smallest configuration or script change needed so lint can run without prompts.
- Prefer a stable non-interactive lint command that future Builder sessions can run.
- Run the current safe validation gate:
  - `npm run test`
  - `npm run build`
- Run the new non-interactive lint gate after Codex confirms it will not prompt.
- Update validation docs and planning state after implementation.

### Out of Scope

- No app feature work.
- No broad code formatting rewrite.
- No full ESLint rule overhaul.
- No TypeScript strictness overhaul.
- No Playwright redesign.
- No new E2E behavior.
- No Campaign Board changes.
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

Sprint 006 fixed the validation posture by creating or isolating a non-mutating Playwright validation gate.

Known validation posture before Sprint 007:

- Safe local gate:
  - `npm run test`
  - `npm run build`
  - non-mutating Playwright command from Sprint 006
- Unsafe or incomplete gate:
  - `npm run lint` is interactive and not yet an unattended gate.
- `prisma/dev.db` is already dirty in the worktree and must not be intentionally touched.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-20  
**Current phase:** Sprint 007 — Non-Interactive Lint Validation Gate

---

## Current Status

Sprint 006 is complete locally and accepted by owner review.

Sprint 006 created or isolated a non-mutating Playwright validation path that can be used safely in future sprints.

The current safe local validation gate is:

- `npm run test`
- `npm run build`
- the Sprint 006 non-mutating Playwright command

Sprint 007 is active and targets lint validation safety:

- `npm run lint` currently triggers an interactive Next ESLint setup prompt.
- Sprint 007 should make lint run non-interactively so future Builder sessions can use it as an unattended validation gate.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/007-non-interactive-lint-validation-gate/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- Sprint 003 fixed Super Admin-only access to `/mvp/admin` and blocked draft approval below QA score 90.
- Sprint 004 hardened import mapping and validation.
- Sprint 005 fixed Campaign Board browser-state/card movement.
- Sprint 006 created or isolated a non-mutating Playwright validation path.
- `npm run test` remains a safe local gate.
- `npm run build` remains a safe local gate.
- Non-mutating Playwright validation is available from Sprint 006.
- `npm run lint` remains interactive until Sprint 007 implementation is complete.

---

## Next Actions

1. Apply Architect Pack 007 to create Sprint 007 planning files.
2. Have Codex read Sprint 007 files and summarize the plan before implementation.
3. Approve Codex implementation only after the summary is correct.
4. Inspect current lint scripts and ESLint/Next lint config.
5. Make lint run non-interactively with the smallest safe change.
6. Run `npm run test`, `npm run build`, the Sprint 006 non-mutating Playwright command, and the new non-interactive lint command if confirmed safe.
7. Report acceptance status and recommended Sprint 008.

---

## Blockers / Open Items

- Production readiness is not established.
- `npm run lint` remains interactive until Sprint 007 implementation is complete.
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
| 2026-05-20 | Sprint 007 will focus only on making lint non-interactive as a validation gate. | Lint has remained skipped because it prompts for setup, reducing unattended validation strength. | Codex must not expand into feature work, broad formatting churn, auth redesign, database work, Playwright redesign, or deployment changes. |
| 2026-05-20 | Sprint 007 should prefer the smallest stable lint configuration or script change. | The goal is an unattended validation gate, not a lint standards overhaul. | Avoid broad code rewrites unless required to make the gate pass. |
| 2026-05-20 | Formatting-only churn is out of scope unless directly required by the lint gate. | Large formatting diffs make the sprint harder to review and increase risk. | Any code edits should be minimal, targeted, and justified by lint results. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| `npm run lint` prompts interactively and blocks unattended validation. | High | Medium | Sprint 007 creates a non-interactive lint gate. | Active |
| Builder expands lint cleanup into broad formatting or style churn. | Medium | Medium | Limit changes to the smallest config/script/code edits needed to make the gate run and pass. | Active |
| New lint rules surface many existing warnings/errors. | Medium | Medium | Document failures first; fix only small, low-risk issues needed for the gate, or record follow-up if broad cleanup is required. | Active |
| Lint configuration conflicts with current Next.js version or package setup. | Medium | Medium | Inspect installed packages and current scripts before changing config. | Active |
| Playwright safe gate is accidentally changed while working on lint. | Low | Medium | Do not modify Playwright files unless Sprint 006 docs require a validation-doc reference only. | Open |
| Modified local database file could be accidentally committed. | Medium | Medium | Do not intentionally touch `prisma/dev.db`; verify git status before and after. | Open |
| Prisma SQLite and Cloudflare D1 schemas may diverge. | Medium | High | Do not change schema in Sprint 007; schedule future data-model sprint. | Open |
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
| Which lint command should become the permanent unattended gate? | Architect/Builder | Sprint 007 | Active | Sprint 007 should define and document the command. |
| If lint exposes many pre-existing issues, should broad lint cleanup become a separate sprint? | Architect/Builder | Sprint 007 | Active | Sprint 007 should avoid broad cleanup and document follow-up if needed. |
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
- Safe local validation gate before Sprint 007:
  - `npm run test`
  - `npm run build`
  - non-mutating Playwright command from Sprint 006
- `npm run lint` is not an unattended gate yet because it triggers interactive Next ESLint setup.

## Existing Validation Assets

| Asset | Purpose | Notes |
|---|---|---|
| `tests/` | Automated and manual validation | Includes Vitest, Playwright, fixtures, manual QA assets. |
| `tests/BUG_SUMMARY.md` | Known unresolved bugs | Sprint 002 used this for bug prioritization. |
| `playwright.config.ts` | E2E configuration | Sprint 006 isolated safe browser validation. |
| `tests/E2E_RUNBOOK.md` | Browser validation runbook | Sprint 006 should have documented safe and unsafe Playwright commands. |
| `tests/validation.test.ts` | Focused validation tests | Includes import validation and Campaign Board movement coverage after Sprint 005. |
| `package.json` scripts | Validation command entry points | Sprint 007 should make lint non-interactive. |

## Sprint 007 Validation Focus

Sprint 007 validates one focused improvement:

1. Make lint run non-interactively so it can be used as an unattended validation gate.

## Sprint 007 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run build
```

Codex should run the Sprint 006 non-mutating Playwright command if available and documented.

Codex should run the new non-interactive lint command after confirming it will not prompt.

Do not run:

- migrations
- seed commands
- deploy commands
- wrangler deploy
- commands that write to live services
- commands that require secret values
- commands that enable sending or integrations

## Non-Interactive Lint Gate Requirements

A future accepted lint gate should:

- Run without terminal prompts.
- Not require live credentials.
- Not mutate database, app/admin/user/environment state, env files, migrations, or deployment config.
- Avoid broad formatting churn.
- Be documented with the exact command future builders should run.
- Make failures clear enough for Builder sessions to fix or document.

## Future Validation Areas

- Data model Prisma/D1 reconciliation audit.
- Environment mode behavior.
- Auth/session readiness.
- Production deployment readiness.
- Campaign Board true browser movement E2E, if still needed after safe browser gate.
```

---

# File: planning/sprints/007-non-interactive-lint-validation-gate/requirements.md

```markdown
# Sprint 007 Requirements — Non-Interactive Lint Validation Gate

## Goal

Make lint run non-interactively so future Builder sessions can use it as an unattended validation gate.

## Business Objective

Strengthen EmailORC validation by adding lint to the safe local validation workflow without blocking Codex on an interactive setup prompt.

## User Story

As the project owner, I want `npm run lint` or a clearly named lint command to run without prompts, so Codex can validate code quality during future sprints without manual terminal interaction.

## In Scope

- Inspect `package.json` scripts.
- Inspect existing Next.js, ESLint, TypeScript, and lint-related config files.
- Identify why lint prompts interactively.
- Add or update the smallest config/script needed to make lint non-interactive.
- Fix only small lint issues required for the non-interactive gate, if safe and narrow.
- Document the final lint command in `docs/VALIDATION.md`.
- Run `npm run test`.
- Run `npm run build`.
- Run the Sprint 006 non-mutating Playwright command if available and documented.
- Run the new non-interactive lint command if confirmed safe.
- Update Sprint 007 docs and project state.

## Out of Scope

- Broad lint rule redesign.
- Broad formatting sweep.
- Full TypeScript strictness migration.
- App feature work.
- Playwright redesign.
- New E2E behavior.
- Campaign Board changes.
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

- Lint must run without prompting for setup choices.
- The final lint command must be documented.
- Lint changes should be minimal and auditable.
- Do not use this sprint to rewrite style conventions.
- If lint reveals many pre-existing issues, document them and recommend a separate cleanup sprint rather than expanding scope.
- `prisma/dev.db` must not be intentionally touched.
- Auto-send remains disabled.
- Live integrations remain disabled.
- EmailORC remains MVP/demo-stage.

## Expected Output

Create:

- `planning/sprints/007-non-interactive-lint-validation-gate/requirements.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/blueprint.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/handoff-prompt.md`

Update as needed:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/VALIDATION.md`
- `package.json`, only if a script change is needed
- ESLint/Next lint config files, only if needed
- Minimal source files, only if required to pass lint and safe to change

## Success Definition

Sprint 007 succeeds when:

- A lint command runs without interactive prompts.
- The lint command is documented as part of validation.
- `npm run test` passes.
- `npm run build` passes.
- The Sprint 006 non-mutating Playwright command passes if available and documented.
- The new non-interactive lint command passes, or Codex documents a narrow blocker and closest safe path.
- No out-of-scope changes are introduced.
```

---

# File: planning/sprints/007-non-interactive-lint-validation-gate/blueprint.md

```markdown
# Sprint 007 Blueprint — Non-Interactive Lint Validation Gate

## Objective

Implement one focused validation improvement:

1. Make lint run non-interactively as an unattended validation gate.

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
- `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/requirements.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/blueprint.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before editing.

Likely areas:

- `package.json`
- `next.config.*`
- `.eslintrc*`
- `eslint.config.*`
- `tsconfig.json`
- `.eslintignore`, if present
- `.gitignore`
- existing docs or runbooks under `docs/` and `tests/`
- source files only if lint failures require narrow fixes

Do not assume exact paths without checking the repo.

## Files to Create

- `planning/sprints/007-non-interactive-lint-validation-gate/requirements.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/blueprint.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/handoff-prompt.md`

## Files to Modify

Expected categories:

- `package.json`, only if a script change is needed
- ESLint/Next lint config files, only if needed
- Minimal source files, only if lint errors are narrow and safe to fix
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
4. Inspect current lint-related files.
5. Inspect Sprint 006 validation docs to identify the safe Playwright command.

### Step 2 — Diagnose lint interactivity

Determine why lint prompts interactively:

- Missing ESLint config.
- Next.js lint command wants to scaffold config.
- Script uses `next lint` with no existing setup.
- Installed packages/config are mismatched.
- Existing lint files are missing or incomplete.

Document the actual cause in the final report.

### Step 3 — Design the smallest safe lint gate

Prefer one of these approaches, based on the existing repo:

1. Add a minimal ESLint config compatible with the current Next.js version.
2. Update the lint script to use a non-interactive command that respects existing config.
3. Add a clearly named script if preserving `npm run lint` is risky, such as:
   - `lint:safe`
   - `lint:check`
   - `validate:lint`

Default preference:

- Keep or make `npm run lint` the standard unattended command if practical.
- Avoid broad rule customizations.
- Avoid style opinions beyond what the app already uses.

### Step 4 — Implement minimal lint changes

1. Add or update only the minimum lint config/script files needed.
2. Run the lint command.
3. If lint surfaces small, obvious issues, fix them narrowly.
4. If lint surfaces broad existing issues, stop and document them instead of creating a large cleanup diff.
5. Do not change app behavior to satisfy lint unless the change is safe, obvious, and covered by validation.

### Step 5 — Validate

Run:

```bash
npm run test
npm run build
```

Run the Sprint 006 non-mutating Playwright command if available and documented.

Run the new non-interactive lint command after confirming it will not prompt.

Do not require or run:

```bash
npm run test:e2e
npm run test:e2e:report
```

unless those commands are already documented by Sprint 006 as non-mutating and safe.

### Step 6 — Update docs/state

Update:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/VALIDATION.md`
- `planning/DECISIONS.md`, only if durable decisions were made

Recommend Sprint 008 based on remaining risks.

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

Required after made non-interactive:

```bash
npm run lint
```

If Codex creates a different safe lint command, document it and run it.

Optional if documented by Sprint 006:

```bash
npm run test:e2e:safe
```

The exact Sprint 006 safe script name may differ.

Skipped unless separately approved:

```bash
npm run test:e2e
npm run test:e2e:report
```

## Report Format

After implementation, Codex should report:

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
```

---

# File: planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md

```markdown
# Sprint 007 Acceptance Criteria

Sprint 007 is complete when:

## Scope Control

- [ ] Builder read the Sprint 007 requirements, blueprint, and acceptance criteria.
- [ ] Builder confirmed the sprint is limited to non-interactive lint validation.
- [ ] Builder did not implement app feature work.
- [ ] Builder did not redesign lint rules broadly.
- [ ] Builder did not perform broad formatting churn.
- [ ] Builder did not change Playwright behavior except reading or referencing Sprint 006 docs.
- [ ] Builder did not change Campaign Board behavior.
- [ ] Builder did not change CSV/import behavior.
- [ ] Builder did not change draft approval behavior.
- [ ] Builder did not change auth/session behavior.
- [ ] Builder did not claim production readiness.

## Lint Safe Gate

- [ ] Current lint script/config was inspected.
- [ ] Cause of interactive lint prompt was identified.
- [ ] A non-interactive lint command exists.
- [ ] The non-interactive lint command is documented in `docs/VALIDATION.md`.
- [ ] The lint command does not require live credentials.
- [ ] The lint command does not mutate database, app/admin/user/environment state, env files, migrations, or deployment config.
- [ ] Any lint fixes are narrow, safe, and documented.
- [ ] Any broad lint cleanup is deferred to a future sprint instead of expanded into Sprint 007.

## Tests / Verification

- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] The Sprint 006 non-mutating Playwright command passes if available and documented.
- [ ] The new non-interactive lint command passes, or Codex documents the narrow blocker and closest safe alternative.

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
- [ ] Existing broad `npm run test:e2e` was skipped unless Sprint 006 documented it as non-mutating.
- [ ] Existing `npm run test:e2e:report` was skipped unless Sprint 006 documented it as non-mutating.
- [ ] The final lint command was run non-interactively.

## Documentation

- [ ] `planning/STATE.md` is updated.
- [ ] `planning/RISKS.md` is updated.
- [ ] `planning/QUESTIONS.md` is updated if new questions are found.
- [ ] `docs/VALIDATION.md` is updated with Sprint 007 validation results and lint gate instructions.
- [ ] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [ ] Builder recommends a specific Sprint 008.
- [ ] Builder does not start Sprint 008.
```

---

# File: planning/sprints/007-non-interactive-lint-validation-gate/handoff-prompt.md

```markdown
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
```

---

# Codex Apply Architect Pack 007 Prompt

Use this prompt in Codex after saving this Architect Pack at the EmailORC repo root.

```text
You are the Builder Layer for EmailORC.

Apply Architect Pack 007 — Non-Interactive Lint Validation Gate.

Important:
- This is Sprint 007.
- The sprint is limited to making lint run non-interactively as a validation gate.
- Do not implement changes yet.
- First apply/create the Sprint 007 planning files from the Architect Pack.
- Then read the Sprint 007 files and summarize the implementation plan.
- Stop after the summary and wait for approval.

Architect Pack file:
Architect-Pack-007-Non-Interactive-Lint-Validation-Gate.md

Create/update the planning and docs files described in the Architect Pack.

Hard limits:
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
- Do not intentionally touch prisma/dev.db.

After applying the pack, summarize:

1. What Sprint 007 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. What you believe is causing lint to prompt interactively.
5. What lint command/config change you plan to try.
6. Which validation commands you plan to run.
7. Which commands you will skip and why.
8. Any blockers or ambiguities.

Stop after the summary and wait for my approval before implementing.
```

---

# Recommended Sprint 008 Direction

Do not start Sprint 008 yet.

Recommended default if Sprint 007 passes:

`008-data-model-prisma-d1-reconciliation-audit`

Reason:

The validation gates will be stronger after Sprint 006 and Sprint 007. The next highest durable risk is the unresolved Prisma SQLite and Cloudflare D1 relationship. Sprint 008 should audit and document the data model split without changing schema or migrations.
