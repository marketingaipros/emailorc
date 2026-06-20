# Architect Pack 002 — Stability Validation & Bug Prioritization

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `002-stability-validation-and-bug-prioritization`  
**Created:** 2026-05-20  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 002 validates the current EmailORC MVP/demo app state after Sprint 001 added the 120x operating layer.

This sprint does **not** fix bugs yet.

It identifies, confirms, and prioritizes known issues so the next implementation sprint can be scoped safely.

The goal is to move from “we have known risks” to “we know which bugs and stability gaps matter first.”

---

## Scope Control

### In Scope

- Read the new 120x operating files.
- Read existing test/QA assets, especially `tests/BUG_SUMMARY.md`.
- Inspect current package scripts and validation commands.
- Run safe validation commands that do not mutate app code, database, migrations, env files, or deployment config.
- Confirm which known bugs are still reproducible or still documented as unresolved.
- Prioritize bugs by demo impact, safety impact, and production-readiness impact.
- Produce a Sprint 002 validation report.
- Update planning and validation docs with findings.
- Recommend Sprint 003 implementation scope.

### Out of Scope

- No bug fixes.
- No refactoring.
- No feature work.
- No auth changes.
- No database schema changes.
- No migration changes.
- No env changes.
- No deployment changes.
- No production-readiness claim.
- No auto-send enablement.
- No CRM/email integration enablement.
- No secrets inspection or exposure.
- No committing changes.

---

## Source Facts From Sprint 001

Sprint 001 created the 120x operating layer and confirmed:

- EmailORC is MVP/demo-stage.
- It is not yet production-ready.
- Auto-send remains disabled.
- Human approval remains required.
- Live CRM/email integrations remain disabled.
- Known risks include auth/session readiness, Prisma-vs-D1 model split, stale README/setup docs, existing bugs, environment-mode ambiguity, and Cloudflare deployment assumptions.
- `prisma/dev.db` was already modified before Sprint 001 and must remain untouched.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-20  
**Current phase:** Sprint 002 — Stability Validation & Bug Prioritization

---

## Current Status

Sprint 001 is complete.

The 120x Architect / Builder operating files now exist in the repo.

Sprint 002 is active and will validate the current MVP/demo app state before any bug-fix implementation work.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/002-stability-validation-and-bug-prioritization/`

---

## Recently Completed

- Sprint 001 operating files created.
- README updated only with safe 120x documentation links/status.
- No app code, migrations, database files, env files, deployment config, tests, or package files changed by Sprint 001.
- Existing modified `prisma/dev.db` remains untouched.

---

## Next Actions

1. Read Sprint 002 files.
2. Inspect current validation/test assets.
3. Run safe validation commands only.
4. Confirm and prioritize known bugs/stability gaps.
5. Update validation docs and planning notes.
6. Recommend Sprint 003 implementation scope.

---

## Blockers / Open Items

- Production readiness is not established.
- Known bugs need severity and priority ranking.
- Auth/session model needs future review.
- Prisma SQLite and Cloudflare D1 relationship needs future reconciliation.
- Environment mode definitions need future clarification.
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
| 2026-05-20 | Sprint 002 is validation and prioritization only. | The app has known risks and bugs; fixing before prioritizing can create scope creep. | Codex must not fix bugs during Sprint 002. |
| 2026-05-20 | Bug fixes will be handled in a later implementation sprint after severity and priority are documented. | Keeps Builder from improvising repairs without acceptance criteria. | Sprint 003 should target a controlled set of fixes. |
| 2026-05-20 | Validation should favor safe, non-mutating commands. | The repo has a modified local database file and MVP/demo configuration. | Avoid commands that alter DB, migrations, env, deployment state, or production config. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Auth/session model is MVP-style and not production-ready. | High | High | Create future auth/session readiness sprint before production use. | Open |
| Prisma SQLite and Cloudflare D1 schemas may diverge. | Medium | High | Audit schemas and document source-of-truth model in a future sprint. | Open |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep explicit decision that auto-send and live integrations remain disabled unless approved. | Open |
| README is stale or incomplete. | High | Medium | Sprint 001 only added safe 120x status links; setup cleanup should be scoped later. | Open |
| Existing bugs may block stable demo flow. | High | Medium | Sprint 002 will rank and confirm known bugs before fixes. | Active |
| Modified local database file could be accidentally committed. | Medium | Medium | Do not touch database file; keep visible in git status. | Open |
| Cloudflare deployment assumptions may be stale. | Medium | Medium | Do not deploy in Sprint 002; document deploy-readiness gaps only. | Open |
| Environment modes are unclear. | High | Medium | Define demo/test-live/production meanings in a future sprint. | Open |
| Generated scaffold/bootstrap content may contain old assumptions. | Medium | Medium | Inventory `bootstrap-emailorc.sh` but do not treat as current source of truth. | Open |
| Validation commands may generate reports or artifacts. | Medium | Low | Document any generated artifacts and avoid committing unless approved. | Open |
```

---

# File: planning/QUESTIONS.md

```markdown
# Open Questions

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Is EmailORC intended for internal AI Hub use only, client demos, or paid client production use? | Owner | Sprint 003 planning | Open | Affects auth, deployment, compliance, and sending rules. |
| What is the correct production target: Cloudflare only, local/server deploy, or another host? | Owner | Production readiness sprint | Open | Current audit found Cloudflare D1 and OpenNext Cloudflare path. |
| Should Prisma SQLite remain only for local development? | Architect/Builder | Data model sprint | Open | Needs schema reconciliation with D1. |
| What should demo, test-live, and production mean in business terms? | Owner/Architect | Environment mode sprint | Open | Must be documented before behavior changes. |
| Should the product ever send emails directly, or should it remain review/export only? | Owner | Integration roadmap | Open | Current decision: no auto-send unless future sprint approves it. |
| Which existing bugs are highest priority? | Owner/Builder | Sprint 002 | Active | Sprint 002 must rank known bugs by demo impact, safety, and readiness. |
| What is the required QA score threshold for approving drafts? | Owner | Draft QA sprint | Open | Existing bug notes mention below-90 QA approval. |
| What fields are required in uploaded CSV/account files? | Owner/Architect | Import stabilization sprint | Open | Needed for reliable validation and mapping. |
| Which validation command should be the default acceptance gate for future app changes? | Builder/Architect | Sprint 002 | Active | Determine from package scripts and current test reliability. |
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
- Existing tests and QA docs exist.
- Known bugs are documented and need prioritization.

## Existing Validation Assets

| Asset | Purpose | Notes |
|---|---|---|
| `tests/` | Automated and manual validation | Includes Vitest, Playwright, fixtures, manual QA assets. |
| `tests/BUG_SUMMARY.md` | Known unresolved bugs | Sprint 002 should rank and verify these. |
| `playwright.config.ts` | E2E configuration | Review before relying on E2E as a gate. |
| Existing manual QA checklist | Manual flow validation | Location to be confirmed in test inventory. |

## Sprint 002 Validation Focus

Sprint 002 should answer:

1. What tests/checks currently exist?
2. Which validation commands are safe to run?
3. Which commands pass?
4. Which commands fail?
5. Which failures are known/documented?
6. Which failures block demos?
7. Which failures block production readiness?
8. Which issues should become Sprint 003?

## Safe Validation Command Approach

Codex should inspect `package.json` first.

Run only commands that are safe and do not mutate:

- app code
- database files
- migrations
- env files
- deployment config
- production/live services

Likely safe candidates, if defined:

```bash
npm run lint
npm run test
npm run build
```

Playwright/E2E commands may be run only if they are local-safe and do not require live integrations or production credentials.

Do not run:

- migrations
- seed commands
- deploy commands
- wrangler deploy
- commands that write to live services
- commands that require secret values
- commands that enable sending or integrations

## Sprint 002 Output

Sprint 002 should produce or update:

- `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DECISIONS.md`, only if new durable decisions are made

## Future Validation Areas

- Import CSV parsing and field mapping.
- Record validation rules.
- Draft QA scoring and approval threshold.
- Export filtering rules.
- Admin access controls.
- Campaign board drag/drop behavior.
- Environment mode behavior.
- D1 persistence behavior.
- Auth/session readiness.
- Production deployment readiness.
```

---

# File: planning/sprints/002-stability-validation-and-bug-prioritization/requirements.md

```markdown
# Sprint 002 Requirements — Stability Validation & Bug Prioritization

## Goal

Validate the current EmailORC MVP/demo app state and prioritize known bugs before any implementation fixes.

## Business Objective

Give the owner and future Builder sessions a clear picture of:

- What currently works.
- What is broken.
- What is risky.
- What blocks demos.
- What blocks production readiness.
- What should be fixed first.

## User Story

As the project owner, I want Codex to validate and prioritize the current EmailORC issues before fixing anything, so future work is controlled and focused.

## In Scope

- Read current 120x operating files.
- Read `tests/BUG_SUMMARY.md`.
- Inspect test and QA assets.
- Inspect `package.json` scripts.
- Run safe validation commands.
- Document pass/fail results.
- Confirm known bugs and gaps.
- Prioritize issues.
- Recommend Sprint 003 scope.
- Update planning and validation docs.

## Out of Scope

- Bug fixes.
- Refactoring.
- Feature work.
- Auth/session redesign.
- Database schema changes.
- D1/Prisma reconciliation.
- Env changes.
- Deployment.
- Auto-send.
- Live integrations.
- Production readiness claim.

## Known Bug Areas To Investigate

From Sprint 001 audit:

- Client Admin direct admin access.
- Below-90 QA approval.
- Missing CSV field mapping step.
- Campaign board drag/drop behavior.

## Business Rules

- Keep auto-send disabled.
- Keep live integrations disabled.
- Do not expose secrets.
- Do not touch `prisma/dev.db`.
- Do not modify migrations.
- Do not modify env files.
- Do not change deployment config.
- Do not fix bugs during this sprint.

## Required Output

Create:

- `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md`

Update as needed:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/VALIDATION.md`
- `planning/DECISIONS.md`, only if durable decisions are made
```

---

# File: planning/sprints/002-stability-validation-and-bug-prioritization/blueprint.md

```markdown
# Sprint 002 Blueprint — Stability Validation & Bug Prioritization

## Objective

Run a controlled validation pass and prioritize current EmailORC issues without implementing fixes.

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
- `planning/sprints/002-stability-validation-and-bug-prioritization/requirements.md`
- `planning/sprints/002-stability-validation-and-bug-prioritization/blueprint.md`
- `planning/sprints/002-stability-validation-and-bug-prioritization/acceptance.md`

## Existing Files to Inspect

- `package.json`
- `tests/BUG_SUMMARY.md`
- `tests/`
- `playwright.config.ts`
- `README.md`
- `docs/CLOUDFLARE_DEMO_DEPLOY.md`
- `app/mvp/`
- `app/api/`
- `src/utils/validation.ts`
- `src/services/campaign-orchestrator.ts`
- `src/prompts/templates.ts`

## Files to Create

- `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md`

## Files to Update

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/VALIDATION.md`
- `planning/DECISIONS.md`, only if durable decisions are made

## Implementation Plan

1. Confirm git status.
2. Confirm Sprint 001 files exist.
3. Read the active Sprint 002 files.
4. Inspect `package.json` scripts.
5. Inspect existing tests and QA docs.
6. Read `tests/BUG_SUMMARY.md`.
7. Identify safe validation commands.
8. Before running validation, summarize planned commands and risks.
9. Run approved safe validation commands.
10. Record command output summary, not excessive raw logs.
11. Compare results against known bug summary.
12. Rank issues using:
    - Demo blocker
    - Data safety risk
    - Sending/integration safety risk
    - Production-readiness blocker
    - User workflow impact
    - Fix complexity, if obvious
13. Create `validation-report.md`.
14. Update planning and validation docs.
15. Recommend Sprint 003 scope.

## Suggested Issue Priority Labels

- P0 — Safety or data-risk blocker
- P1 — Demo blocker
- P2 — Core workflow bug
- P3 — Polish or documentation gap
- Future — Requires separate product decision

## Forbidden Changes

Do not modify:

- `app/`
- `src/`
- `prisma/dev.db`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `d1/`
- `.env`
- `.env.example`
- `.dev.vars`
- `.dev.vars.example`
- `wrangler.jsonc`
- package files

Do not run:

- deploy commands
- migrations
- seed commands
- commands requiring live credentials
- commands that send email
- commands that enable integrations

## Validation Commands

Start with:

```bash
git status --short
cat package.json
find tests -maxdepth 3 -type f | sort
```

Then run safe scripts only if they exist and appear local-safe.

Likely candidates:

```bash
npm run lint
npm run test
npm run build
```

Only run Playwright if local-safe and no live credentials or external sending are required.

## Report Format

`validation-report.md` should include:

- Date
- Commands run
- Commands skipped and why
- Pass/fail summary
- Known bugs reviewed
- Confirmed blockers
- Issues prioritized
- Recommended Sprint 003
- Remaining open questions
```

---

# File: planning/sprints/002-stability-validation-and-bug-prioritization/acceptance.md

```markdown
# Sprint 002 Acceptance Criteria

Sprint 002 is complete when:

## Readiness

- [ ] Builder read the Sprint 002 requirements, blueprint, and acceptance criteria.
- [ ] Builder confirmed no bug fixes will be made during Sprint 002.
- [ ] Builder inspected `package.json` scripts.
- [ ] Builder inspected existing test and QA assets.
- [ ] Builder reviewed `tests/BUG_SUMMARY.md`.

## Validation

- [ ] Safe validation commands were identified.
- [ ] Unsafe commands were skipped and documented.
- [ ] Validation commands were run only if local-safe.
- [ ] Results were summarized clearly.
- [ ] No secrets were exposed.
- [ ] No app code was changed.
- [ ] No database files were changed.
- [ ] No migrations were changed.
- [ ] No env files were changed.
- [ ] No deployment config was changed.

## Bug Prioritization

- [ ] Known bugs were reviewed.
- [ ] Bugs were ranked by priority.
- [ ] Demo blockers were identified.
- [ ] Production-readiness blockers were identified.
- [ ] Any uncertain bug status was marked uncertain, not guessed.

## Documentation

- [ ] `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md` exists.
- [ ] `docs/VALIDATION.md` is updated with Sprint 002 findings.
- [ ] `planning/STATE.md` is updated.
- [ ] `planning/RISKS.md` is updated if validation changed risk status.
- [ ] `planning/QUESTIONS.md` is updated if new questions are found.
- [ ] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [ ] Builder recommends a specific Sprint 003.
- [ ] Builder does not start Sprint 003.
```

---

# File: planning/sprints/002-stability-validation-and-bug-prioritization/handoff-prompt.md

```markdown
# Sprint 002 Builder Handoff Prompt

You are the Builder Layer for the existing EmailORC repo.

This is Sprint 002:

`002-stability-validation-and-bug-prioritization`

This sprint validates and prioritizes. It does not fix bugs.

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
12. `planning/sprints/002-stability-validation-and-bug-prioritization/requirements.md`
13. `planning/sprints/002-stability-validation-and-bug-prioritization/blueprint.md`
14. `planning/sprints/002-stability-validation-and-bug-prioritization/acceptance.md`

Then inspect:

- `package.json`
- `tests/BUG_SUMMARY.md`
- `tests/`
- `playwright.config.ts`
- `README.md`
- `docs/CLOUDFLARE_DEMO_DEPLOY.md`

## Task

Create a controlled validation and bug-prioritization report.

Create:

- `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md`

Update as needed:

- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DECISIONS.md`, only if durable decisions were made

## Hard Rules

- Do not fix bugs.
- Do not refactor.
- Do not write features.
- Do not change app code.
- Do not modify database files.
- Do not modify migrations.
- Do not modify env files.
- Do not modify deployment config.
- Do not expose secrets.
- Do not enable auto-send.
- Do not enable live integrations.
- Do not mark the app production-ready.
- Do not touch `prisma/dev.db`.

## Before Running Commands

Summarize:

1. What Sprint 002 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to create or update.
4. Which validation commands you plan to run.
5. Which commands you will skip and why.
6. Any blockers or ambiguities.

Stop and wait for approval before running validation commands or writing files.

## After Approval

Run only safe validation commands.

Start with:

```bash
git status --short
cat package.json
find tests -maxdepth 3 -type f | sort
```

Then run safe local scripts only if they exist and do not mutate protected files.

Likely candidates:

```bash
npm run lint
npm run test
npm run build
```

Run Playwright only if local-safe and no live credentials, live integrations, or email sending are involved.

## After Changes

Report:

1. Files created.
2. Files updated.
3. Files intentionally untouched.
4. Commands run.
5. Commands skipped and why.
6. Test/build/validation result summary.
7. Prioritized issue list.
8. Acceptance criteria complete/incomplete.
9. Recommended Sprint 003.
```

---

# Codex Sprint 002 Start Prompt

Use this prompt in a new Codex chat inside the EmailORC repo.

```text
You are the Builder Layer for EmailORC.

Start Sprint 002:

planning/sprints/002-stability-validation-and-bug-prioritization/

Read the following files before making changes:

- AGENTS.md
- CODEX.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/DOMAIN.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/DATA_MODEL.md
- docs/VALIDATION.md
- planning/sprints/002-stability-validation-and-bug-prioritization/requirements.md
- planning/sprints/002-stability-validation-and-bug-prioritization/blueprint.md
- planning/sprints/002-stability-validation-and-bug-prioritization/acceptance.md

Then inspect:

- package.json
- tests/BUG_SUMMARY.md
- tests/
- playwright.config.ts
- README.md
- docs/CLOUDFLARE_DEMO_DEPLOY.md

Do not fix bugs.
Do not refactor.
Do not write features.
Do not change app code.
Do not modify database files.
Do not modify migrations.
Do not modify env files.
Do not modify deployment config.
Do not expose secrets.
Do not enable auto-send.
Do not enable live integrations.
Do not mark the app production-ready.
Do not touch prisma/dev.db.

Summarize:

1. What Sprint 002 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to create or update.
4. Which validation commands you plan to run.
5. Which commands you will skip and why.
6. Any blockers or ambiguities.

Stop after the summary and wait for approval.
```

---

# Recommended Sprint 003 Direction

Do not start Sprint 003 yet.

Sprint 003 should be selected only after Sprint 002 ranks the issues.

Likely candidates:

1. `003-demo-flow-stability-fixes`
2. `003-draft-qa-approval-guardrails`
3. `003-import-mapping-and-validation-hardening`
4. `003-auth-session-readiness-audit`

The recommended Sprint 003 should be based on Sprint 002 findings, not assumptions.
