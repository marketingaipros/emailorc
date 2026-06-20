# Architect Pack 003 — Demo Flow Stability Fixes

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `003-demo-flow-stability-fixes`  
**Created:** 2026-05-20  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 003 is the first controlled implementation sprint after Sprint 002 validation.

Sprint 002 confirmed the current safe local validation gate and ranked two P1 demo blockers:

1. Client Admin can directly access `/mvp/admin`.
2. Draft approval is not blocked below QA score 90.

Sprint 003 fixes only those two P1 blockers.

The goal is to improve demo safety without expanding into broader auth redesign, production readiness, E2E mutation cleanup, CSV mapping, campaign board fixes, lint setup, deployment, database work, or live integrations.

---

## Scope Control

### In Scope

- Inspect the current admin access logic for `/mvp/admin`.
- Enforce Super Admin-only access for `/mvp/admin`.
- Inspect the current draft approval logic.
- Block draft approval when QA score is below 90.
- Add or update focused tests for both fixes where practical.
- Run the safe validation gate identified in Sprint 002:
  - `npm run test`
  - `npm run build`
- Update planning and validation docs after the implementation.
- Keep changes small, auditable, and limited to the two P1 blockers.

### Out of Scope

- No full auth/session redesign.
- No production-readiness claim.
- No database schema changes.
- No migrations.
- No env changes.
- No deployment changes.
- No Cloudflare config changes.
- No auto-send enablement.
- No CRM/email integration enablement.
- No CSV field mapping implementation.
- No Campaign Board drag/drop implementation.
- No Playwright state-mutation cleanup.
- No lint tooling setup unless an existing touched test command requires a tiny non-interactive config note only.
- No broad UI redesign.
- No role model invention beyond enforcing the existing Super Admin / Client Admin distinction.
- No secrets inspection or exposure.
- No intentional changes to `prisma/dev.db`.

---

## Source Facts From Sprint 002

Sprint 002 reported:

- `npm run test` passed with 7 tests.
- `npm run build` passed.
- `npm run lint` is blocked by an interactive Next ESLint setup prompt.
- `npm run test:e2e` was skipped because current Playwright tests mutate admin/user/environment state.
- Current safe local validation gate is `npm run test` plus `npm run build`.
- P1 issue: Client Admin can directly access `/mvp/admin`.
- P1 issue: Draft approval is not blocked below QA 90.
- P2 issue: CSV upload flow has no field mapping step.
- P2 issue: Campaign Board movement does not update card column in browser QA.
- P2 issue: Playwright suite mutates app state.
- P3 issue: `npm run lint` is interactive.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-20  
**Current phase:** Sprint 003 — Demo Flow Stability Fixes

---

## Current Status

Sprint 002 is complete.

The current safe local validation gate is:

- `npm run test`
- `npm run build`

Sprint 003 is active and targets the two P1 demo blockers identified by Sprint 002:

1. Client Admin can directly access `/mvp/admin`.
2. Draft approval is not blocked below QA score 90.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/003-demo-flow-stability-fixes/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- `npm run test` passed.
- `npm run build` passed.
- `npm run lint` was documented as interactive.
- E2E was skipped because it currently mutates app/admin/user/environment state.

---

## Next Actions

1. Apply Architect Pack 003 to create Sprint 003 planning files.
2. Have Codex read Sprint 003 files and summarize the plan before implementation.
3. Approve Codex implementation only after the summary is correct.
4. Fix only the two P1 blockers.
5. Run `npm run test` and `npm run build`.
6. Report acceptance status and recommended Sprint 004.

---

## Blockers / Open Items

- Production readiness is not established.
- Full auth/session readiness still needs a future audit.
- CSV mapping remains unresolved.
- Campaign Board movement remains unresolved.
- Playwright state mutation remains unresolved.
- `npm run lint` remains interactive.
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
| 2026-05-20 | Sprint 003 will fix only the two P1 demo blockers from Sprint 002. | Keeps the first implementation sprint after validation controlled and auditable. | Codex must not fix P2/P3 issues during Sprint 003. |
| 2026-05-20 | `/mvp/admin` must be Super Admin-only. | Client Admin direct access is a P1 demo safety issue. | Client Admin must be blocked or redirected from admin-only surface. |
| 2026-05-20 | Draft approval must be blocked below QA score 90. | Sprint 002 identified below-90 approval as a P1 workflow safety issue. | Approval logic must enforce the threshold server-side, and UI should not imply approval is allowed. |
| 2026-05-20 | Sprint 003 validation gate is `npm run test` and `npm run build`. | Sprint 002 confirmed both pass and are safe local gates. | Lint and E2E are not required gates for Sprint 003 unless made non-mutating in a future sprint. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Auth/session model is MVP-style and not production-ready. | High | High | Sprint 003 fixes only admin access guard; full auth audit remains future work. | Open |
| Client Admin direct admin access weakens demo safety. | High | High | Sprint 003 enforces Super Admin-only access to `/mvp/admin`. | Active |
| Drafts below QA 90 can be approved. | High | High | Sprint 003 blocks approval below threshold. | Active |
| Prisma SQLite and Cloudflare D1 schemas may diverge. | Medium | High | Do not change schema in Sprint 003; schedule future data-model sprint. | Open |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep explicit decision that auto-send and live integrations remain disabled unless approved. | Open |
| Existing P2 bugs may be pulled into Sprint 003. | Medium | Medium | Scope is limited to two P1 blockers only. | Active |
| Modified local database file could be accidentally committed. | Medium | Medium | Do not touch `prisma/dev.db`; verify git status before and after. | Open |
| Playwright suite mutates app state. | Medium | Medium | Do not use E2E as Sprint 003 acceptance gate. | Open |
| `npm run lint` is interactive. | High | Low | Do not require lint as Sprint 003 gate; create future tooling cleanup sprint if needed. | Open |
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
| What fields are required in uploaded CSV/account files? | Owner/Architect | Import stabilization sprint | Open | Needed for reliable validation and mapping. |
| Should Playwright tests be rewritten to avoid mutating app state? | Architect/Builder | Future validation sprint | Open | Sprint 002 found E2E is not no-mutation-safe. |
| Should lint be configured to run non-interactively? | Architect/Builder | Future tooling sprint | Open | Sprint 002 found `npm run lint` triggers interactive Next ESLint setup. |
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
- Safe local validation gate from Sprint 002:
  - `npm run test`
  - `npm run build`
- `npm run lint` is not an unattended gate yet because it triggers interactive Next ESLint setup.
- Playwright/E2E is not a no-mutation-safe gate yet.

## Existing Validation Assets

| Asset | Purpose | Notes |
|---|---|---|
| `tests/` | Automated and manual validation | Includes Vitest, Playwright, fixtures, manual QA assets. |
| `tests/BUG_SUMMARY.md` | Known unresolved bugs | Sprint 002 used this for bug prioritization. |
| `playwright.config.ts` | E2E configuration | Do not treat as no-mutation-safe yet. |
| `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md` | Sprint 002 validation findings | Source for Sprint 003 priority. |

## Sprint 003 Validation Focus

Sprint 003 validates two fixes:

1. Client Admin cannot access `/mvp/admin`.
2. Draft approval is blocked when QA score is below 90.

## Sprint 003 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run build
```

Optional targeted tests may be added or run if they are local-safe.

Do not run E2E unless Codex proves the specific command is local-safe and does not mutate app/admin/user/environment state.

Do not run:

- migrations
- seed commands
- deploy commands
- wrangler deploy
- commands that write to live services
- commands that require secret values
- commands that enable sending or integrations

## Future Validation Areas

- Import CSV parsing and field mapping.
- Record validation rules.
- Export filtering rules.
- Campaign board drag/drop behavior.
- Environment mode behavior.
- D1 persistence behavior.
- Auth/session readiness.
- Production deployment readiness.
- Non-mutating Playwright/E2E gate.
- Non-interactive lint gate.
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes from the existing audit.

Do not treat this as complete until a Builder performs a route-by-route API inventory.

## Known Workflow Routes

| Route | Purpose | Notes |
|---|---|---|
| `app/api/workflow/import/route.ts` | CSV/contact import | Stores leads/drafts in D1 when `DB` is available. |
| `app/api/workflow/records/route.ts` | Record retrieval / validation display | Needs route-level documentation. |
| `app/api/workflow/drafts/route.ts` | Draft retrieval | Needs route-level documentation. |
| `app/api/workflow/export/route.ts` | Approved draft export | Selects approved, non-archived drafts and excludes do-not-contact records. |
| `app/api/drafts/approve/route.ts` | Draft approval | Sprint 003 should enforce QA score >= 90 before approval. |

## Admin / Access-Control Areas

Sprint 003 should inspect the route/page/middleware path that controls `/mvp/admin`.

Expected behavior:

- Super Admin can access `/mvp/admin`.
- Client Admin cannot directly access `/mvp/admin`.
- Non-authorized users cannot access `/mvp/admin`.
- If current app patterns use redirect behavior, follow the existing pattern.
- If current app patterns use an access-denied message, follow the existing pattern.
- Do not invent a new auth system.

## Other API Areas Identified

- Auth
- Admin
- Environment status
- Billing
- Brain/OpenRouter
- Usage logs
- Account intelligence

## API Documentation Gaps

Future API documentation should capture for each route:

- Method
- Path
- Request shape
- Response shape
- Auth/session expectation
- Data source
- Validation rules
- Error states
- Environment-mode behavior
```

---

# File: planning/sprints/003-demo-flow-stability-fixes/requirements.md

```markdown
# Sprint 003 Requirements — Demo Flow Stability Fixes

## Goal

Fix the two P1 demo blockers identified in Sprint 002.

## Business Objective

Make the EmailORC MVP/demo flow safer by preventing unauthorized admin access and preventing below-threshold draft approval.

## User Stories

### Admin Access

As the project owner, I want `/mvp/admin` restricted to Super Admin users only, so Client Admin users cannot access global/admin-only functionality during demos.

### Draft Approval QA Guardrail

As the project owner, I want draft approval blocked when QA score is below 90, so low-quality drafts cannot be marked approved.

## In Scope

- Inspect existing admin access control patterns.
- Enforce Super Admin-only access for `/mvp/admin`.
- Inspect existing draft approval route/action/UI logic.
- Enforce QA score >= 90 for draft approval.
- Add or update targeted tests where practical.
- Run `npm run test`.
- Run `npm run build`.
- Update Sprint 003 docs and project state.

## Out of Scope

- Full auth/session redesign.
- Production auth readiness claim.
- New role system.
- New permissions dashboard.
- CSV field mapping.
- Campaign Board drag/drop.
- Playwright mutation cleanup.
- Lint tooling setup.
- Database schema changes.
- Migrations.
- Env changes.
- Deployment changes.
- Auto-send.
- Live CRM/email integrations.

## Business Rules

- Super Admin is the only role allowed to access `/mvp/admin`.
- Client Admin must not directly access `/mvp/admin`.
- Drafts with QA score below 90 must not be approved.
- QA threshold for Sprint 003 is 90.
- Approval blocking should happen server-side or in the authoritative approval path, not UI-only.
- UI may also disable/hide approval action for below-threshold drafts, but UI-only enforcement is not sufficient.
- Human review remains required.
- Auto-send remains disabled.
- Live integrations remain disabled.
- EmailORC remains MVP/demo-stage.

## Expected Output

Create:

- `planning/sprints/003-demo-flow-stability-fixes/requirements.md`
- `planning/sprints/003-demo-flow-stability-fixes/blueprint.md`
- `planning/sprints/003-demo-flow-stability-fixes/acceptance.md`
- `planning/sprints/003-demo-flow-stability-fixes/handoff-prompt.md`

Update as needed:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/VALIDATION.md`
- `docs/API.md`
- Targeted app/test files required to implement the two P1 fixes

## Success Definition

Sprint 003 succeeds when:

- Client Admin cannot directly access `/mvp/admin`.
- Super Admin can still access `/mvp/admin`.
- Drafts below QA 90 cannot be approved.
- Drafts at or above QA 90 can still follow the intended approval path.
- `npm run test` passes.
- `npm run build` passes.
- No out-of-scope changes are introduced.
```

---

# File: planning/sprints/003-demo-flow-stability-fixes/blueprint.md

```markdown
# Sprint 003 Blueprint — Demo Flow Stability Fixes

## Objective

Implement two focused P1 fixes:

1. Restrict `/mvp/admin` to Super Admin only.
2. Block draft approval below QA score 90.

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
- `planning/sprints/003-demo-flow-stability-fixes/requirements.md`
- `planning/sprints/003-demo-flow-stability-fixes/blueprint.md`
- `planning/sprints/003-demo-flow-stability-fixes/acceptance.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before editing.

Likely areas:

- `app/mvp/admin/`
- `app/mvp/admin/page.tsx`
- admin layout or guard components, if present
- auth/session utilities under `src/`, `app/api/auth/`, or related helpers
- `app/api/drafts/approve/route.ts`
- draft review UI under `app/mvp/drafts/`, `app/mvp/`, or related components
- draft types or validators under `src/`
- existing unit tests under `tests/`

Do not assume exact paths without checking the repo.

## Files to Create

- `planning/sprints/003-demo-flow-stability-fixes/requirements.md`
- `planning/sprints/003-demo-flow-stability-fixes/blueprint.md`
- `planning/sprints/003-demo-flow-stability-fixes/acceptance.md`
- `planning/sprints/003-demo-flow-stability-fixes/handoff-prompt.md`

## Files to Modify

Expected categories:

- Admin access guard file(s)
- Draft approval route/action file(s)
- Draft approval UI file(s), only if needed to align user-facing behavior
- Focused tests for admin access and QA approval guardrail
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
3. Inspect Sprint 002 validation report.
4. Inspect relevant admin and draft approval files.
5. Summarize planned file edits before making changes.

### Step 2 — Fix `/mvp/admin` access

1. Identify how the app currently represents roles.
2. Identify the existing role names or flags for Super Admin and Client Admin.
3. Follow existing auth/session patterns.
4. Add a guard so `/mvp/admin` allows only Super Admin.
5. Client Admin should be redirected or denied using the existing app pattern.
6. Do not create a new broad permission system.

### Step 3 — Fix draft approval below QA 90

1. Identify the authoritative approval path.
2. Enforce QA score >= 90 in that path.
3. Return a clear error/status when approval is blocked.
4. Keep successful approval behavior unchanged for QA score >= 90.
5. Add UI disabling or warning only if practical and consistent with current UI.
6. Do not rely on UI-only enforcement.

### Step 4 — Add focused tests

Add or update tests where practical for:

- Super Admin can access admin path or admin guard allows Super Admin.
- Client Admin is blocked from admin path or admin guard denies Client Admin.
- Draft with QA score below 90 cannot be approved.
- Draft with QA score 90 or above can be approved.

If route-level tests are hard due to existing test structure, add focused utility tests around extracted guard/approval logic, but keep code changes minimal.

### Step 5 — Validate

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

### Step 6 — Update docs/state

Update:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/DECISIONS.md`, only if durable decisions were made

Recommend Sprint 004 based on remaining P2/P3 items.

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
2. Admin access behavior before/after.
3. Draft QA approval behavior before/after.
4. Tests added/updated.
5. Commands run and results.
6. Commands skipped and why.
7. Acceptance criteria complete/incomplete.
8. Any risks introduced.
9. Recommended Sprint 004.
```

---

# File: planning/sprints/003-demo-flow-stability-fixes/acceptance.md

```markdown
# Sprint 003 Acceptance Criteria

Sprint 003 is complete when:

## Scope Control

- [ ] Builder read the Sprint 003 requirements, blueprint, and acceptance criteria.
- [ ] Builder confirmed the sprint is limited to the two P1 blockers.
- [ ] Builder did not implement CSV mapping.
- [ ] Builder did not implement Campaign Board drag/drop fixes.
- [ ] Builder did not clean up Playwright mutation behavior.
- [ ] Builder did not configure lint tooling.
- [ ] Builder did not claim production readiness.

## Admin Access Fix

- [ ] `/mvp/admin` is restricted to Super Admin users only.
- [ ] Client Admin users cannot directly access `/mvp/admin`.
- [ ] Unauthorized users cannot access `/mvp/admin`.
- [ ] Super Admin users can still access `/mvp/admin`.
- [ ] The access behavior follows existing app patterns for redirect or denial.
- [ ] No new broad permission system was invented.

## Draft QA Approval Fix

- [ ] Drafts with QA score below 90 cannot be approved.
- [ ] Drafts with QA score equal to 90 can still be approved if otherwise valid.
- [ ] Drafts with QA score above 90 can still be approved if otherwise valid.
- [ ] The QA threshold is enforced in the authoritative approval path.
- [ ] The fix is not UI-only.
- [ ] User-facing behavior is clear when approval is blocked.

## Tests

- [ ] Focused test coverage exists for the admin access guard, if practical in the current test structure.
- [ ] Focused test coverage exists for the QA approval threshold, if practical in the current test structure.
- [ ] If a test could not be added, Codex documents why and describes the manual verification performed.

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
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run lint` was skipped unless it has been made non-interactive in a separately approved change.
- [ ] E2E was skipped unless proven local-safe and non-mutating.

## Documentation

- [ ] `planning/STATE.md` is updated.
- [ ] `planning/RISKS.md` is updated.
- [ ] `planning/QUESTIONS.md` is updated if new questions are found.
- [ ] `docs/API.md` is updated if route behavior changed.
- [ ] `docs/VALIDATION.md` is updated with Sprint 003 validation results.
- [ ] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [ ] Builder recommends a specific Sprint 004.
- [ ] Builder does not start Sprint 004.
```

---

# File: planning/sprints/003-demo-flow-stability-fixes/handoff-prompt.md

```markdown
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
```

---

# Codex Apply Architect Pack 003 Prompt

Use this prompt in Codex after saving this Architect Pack at the EmailORC repo root.

```text
You are the Builder Layer for EmailORC.

Apply Architect Pack 003 — Demo Flow Stability Fixes.

Important:
- This is Sprint 003.
- The sprint is limited to the two P1 demo blockers from Sprint 002.
- Do not implement fixes yet.
- First apply/create the Sprint 003 planning files from the Architect Pack.
- Then read the Sprint 003 files and summarize the implementation plan.
- Stop after the summary and wait for approval.

Create/update the planning and docs files described in the Architect Pack.

Hard limits:
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
- Do not intentionally touch prisma/dev.db.

After applying the pack, summarize:

1. What Sprint 003 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. Which tests you expect to add or update.
5. Which validation commands you plan to run.
6. Which commands you will skip and why.
7. Any blockers or ambiguities.

Stop after the summary and wait for my approval before implementing.
```

---

# Recommended Sprint 004 Direction

Do not start Sprint 004 yet.

Sprint 004 should be selected only after Sprint 003 is complete.

Likely candidates:

1. `004-import-mapping-and-validation-hardening`
2. `004-campaign-board-browser-state-fix`
3. `004-playwright-non-mutating-validation-gate`
4. `004-lint-tooling-cleanup`

Recommended default if Sprint 003 passes:

`004-import-mapping-and-validation-hardening`

Reason:

CSV field mapping was the next P2 core workflow issue from Sprint 002 and affects upload reliability.
