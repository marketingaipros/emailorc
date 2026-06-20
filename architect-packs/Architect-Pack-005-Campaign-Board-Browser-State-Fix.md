# Architect Pack 005 — Campaign Board Browser State Fix

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `005-campaign-board-browser-state-fix`  
**Created:** 2026-05-20  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 005 is a focused implementation sprint to fix the Campaign Board browser-state issue identified during prior validation.

The known issue: moving a campaign card in the browser does not reliably update the card’s visible column/state.

The goal is to make Campaign Board card movement behave correctly in the browser while keeping the sprint small, demo-safe, and limited to UI/state handling plus focused validation.

This sprint must not expand into database schema work, persistence redesign, auth/session work, CSV/import changes, sending, integrations, lint setup, Playwright cleanup, or production-readiness claims.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Inspect the current Campaign Board UI and state-management logic.
- Identify why card movement does not update the visible card column/state in browser QA.
- Fix the smallest UI/state issue needed so moved cards display in the correct column after movement.
- Preserve current Campaign Board data shape and existing demo behavior where possible.
- Add or update focused tests if practical in the current test structure.
- Run the current safe validation gate:
  - `npm run test`
  - `npm run build`
- Update planning and validation docs after implementation.

### Out of Scope

- No database schema changes.
- No migrations.
- No D1/Prisma reconciliation.
- No persistence redesign.
- No full drag-and-drop library replacement unless Codex proves the existing implementation cannot be repaired safely.
- No broad Campaign Board redesign.
- No auth/session redesign.
- No CSV/import changes.
- No draft QA approval changes.
- No upload validation changes.
- No email sending.
- No live CRM/email integrations.
- No deployment changes.
- No env changes.
- No lint tooling setup.
- No Playwright mutation cleanup.
- No production-readiness claim.
- No intentional changes to `prisma/dev.db`.

---

## Source Facts From Prior Sprints

Sprint 002 identified the Campaign Board browser issue as a P2 core workflow bug.

Sprint 003 intentionally did not fix Campaign Board movement because that sprint was limited to two P1 blockers.

Sprint 004 completed import mapping and validation hardening and recommended Sprint 005 as `005-campaign-board-browser-state-fix`.

Known validation posture:

- `npm run test` is the safe unit/integration test gate.
- `npm run build` is the safe build gate.
- `npm run lint` is skipped because it triggers interactive Next lint setup.
- `npm run test:e2e` is skipped because existing Playwright tests mutate app/admin/user/environment state.
- `prisma/dev.db` is already modified in the dirty worktree and must not be intentionally touched.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-20  
**Current phase:** Sprint 005 — Campaign Board Browser State Fix

---

## Current Status

Sprint 004 is complete locally.

Sprint 004 added shared import mapping and validation, made Email the only blocking import/draft-generation field, and treated identity/renewal gaps as warnings.

The current safe local validation gate remains:

- `npm run test`
- `npm run build`

Sprint 005 is active and targets the Campaign Board browser-state issue:

- Moving a campaign card in the browser should update the visible card column/state correctly.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/005-campaign-board-browser-state-fix/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- Sprint 003 fixed Super Admin-only access to `/mvp/admin` and blocked draft approval below QA score 90.
- Sprint 004 hardened import mapping and validation.
- `npm run test` passed with 14 tests after Sprint 004.
- `npm run build` passed after Sprint 004.
- `npm run lint` remains interactive.
- E2E remains skipped because current Playwright tests mutate app/admin/user/environment state.

---

## Next Actions

1. Apply Architect Pack 005 to create Sprint 005 planning files.
2. Have Codex read Sprint 005 files and summarize the plan before implementation.
3. Approve Codex implementation only after the summary is correct.
4. Fix only the Campaign Board browser-state issue.
5. Run `npm run test` and `npm run build`.
6. Report acceptance status and recommended Sprint 006.

---

## Blockers / Open Items

- Production readiness is not established.
- Campaign Board browser-state issue remains unresolved until Sprint 005 implementation is complete.
- Playwright state mutation remains unresolved.
- `npm run lint` remains interactive.
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
| 2026-05-20 | Sprint 005 will fix only the Campaign Board browser-state/card movement issue. | Keeps the sprint focused on the next P2 demo/core workflow issue after import hardening. | Codex must not expand into persistence redesign, drag/drop replacement, E2E cleanup, lint setup, auth, import, or sending changes. |
| 2026-05-20 | Sprint 005 validation gate is `npm run test` and `npm run build`. | These remain the safe local validation commands from prior sprints. | Lint and E2E remain skipped unless a future sprint explicitly makes them safe gates. |
| 2026-05-20 | Campaign Board fix should prefer the smallest state-management correction over a broad UI rewrite. | The goal is demo-safe behavior, not a Campaign Board rebuild. | Existing UI/data shape should be preserved unless the current implementation cannot be repaired safely. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Campaign Board card movement does not update visible browser state. | High | Medium | Sprint 005 targets the smallest UI/state fix. | Active |
| Builder expands Campaign Board fix into broad redesign. | Medium | Medium | Scope Sprint 005 to browser-state/card movement only. | Active |
| Existing UI state and persisted state may be out of sync. | Medium | Medium | Inspect current behavior before deciding whether this is local state, API response, or persistence handling. | Active |
| Playwright suite mutates app/admin/user/environment state. | Medium | Medium | Do not use E2E as Sprint 005 acceptance gate. | Open |
| `npm run lint` is interactive. | High | Low | Do not require lint as Sprint 005 gate; create future tooling cleanup sprint if needed. | Open |
| Modified local database file could be accidentally committed. | Medium | Medium | Do not intentionally touch `prisma/dev.db`; verify git status before and after. | Open |
| Prisma SQLite and Cloudflare D1 schemas may diverge. | Medium | High | Do not change schema in Sprint 005; schedule future data-model sprint. | Open |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep explicit decision that auto-send and live integrations remain disabled unless approved. | Open |
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
| Should Playwright tests be rewritten to avoid mutating app state? | Architect/Builder | Future validation sprint | Open | Sprint 002 found E2E is not no-mutation-safe. |
| Should lint be configured to run non-interactively? | Architect/Builder | Future tooling sprint | Open | Sprint 002 found `npm run lint` triggers interactive Next ESLint setup. |
| Should Campaign Board movement persist beyond current browser/session? | Owner/Architect | Future Campaign Board persistence sprint | Open | Sprint 005 only fixes visible browser-state correctness unless existing code already supports persistence safely. |
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes and app-contract behavior from the existing audit and follow-up sprints.

Do not treat this as complete until a Builder performs a route-by-route API inventory.

## Known Workflow Routes

| Route | Purpose | Notes |
|---|---|---|
| `app/api/workflow/import/route.ts` | CSV/contact import | Sprint 004 enforces server-side import validation before persistence/fallback. |
| `app/api/workflow/records/route.ts` | Record retrieval / validation display | Needs route-level documentation. |
| `app/api/workflow/drafts/route.ts` | Draft retrieval | Needs route-level documentation. |
| `app/api/workflow/export/route.ts` | Approved draft export | Selects approved, non-archived drafts and excludes do-not-contact records. |
| `app/api/drafts/approve/route.ts` | Draft approval | Sprint 003 enforces QA score >= 90 before approval. |

## Campaign Board Areas

Sprint 005 should inspect the Campaign Board UI and any supporting API/state logic.

Expected behavior for Sprint 005:

- When a campaign card is moved in the browser, the visible board column/state updates correctly.
- The card should not remain displayed in the old column after a successful move.
- The fix should follow the existing app state pattern where possible.
- The fix should not introduce a new persistence contract unless the existing route/state contract already supports it.
- The fix should not change database schema, migrations, env files, deployment config, sending, or integrations.

## Import Validation Contract From Sprint 004

Sprint 004 behavior:

- Email is the only blocking import/draft-generation field.
- Missing Email header or row value should fail clearly.
- Missing identity or renewal context should produce warnings, not block the whole import.
- Header aliases are explicit, not broad fuzzy matching.

## Admin / Access-Control Areas

Sprint 003 behavior:

- Super Admin can access `/mvp/admin`.
- Client Admin cannot directly access `/mvp/admin`.
- Unauthorized users cannot access `/mvp/admin`.

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
- Playwright/E2E is not a no-mutation-safe gate yet.

## Existing Validation Assets

| Asset | Purpose | Notes |
|---|---|---|
| `tests/` | Automated and manual validation | Includes Vitest, Playwright, fixtures, manual QA assets. |
| `tests/BUG_SUMMARY.md` | Known unresolved bugs | Sprint 002 used this for bug prioritization. |
| `playwright.config.ts` | E2E configuration | Do not treat as no-mutation-safe yet. |
| `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md` | Sprint 002 validation findings | Source for P1/P2 priorities. |
| `tests/validation.test.ts` | Focused validation tests | Sprint 004 added import validation coverage. |

## Sprint 005 Validation Focus

Sprint 005 validates one focused behavior:

1. Moving a Campaign Board card updates the visible browser board state/column correctly.

## Sprint 005 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run build
```

Focused unit/component tests should be added or updated if practical in the current test structure.

Manual browser verification should be documented if automated browser-safe coverage is not practical.

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

- Non-mutating Playwright/E2E gate.
- Non-interactive lint gate.
- Campaign Board persistence behavior, if needed.
- Environment mode behavior.
- D1 persistence behavior.
- Auth/session readiness.
- Production deployment readiness.
```

---

# File: planning/sprints/005-campaign-board-browser-state-fix/requirements.md

```markdown
# Sprint 005 Requirements — Campaign Board Browser State Fix

## Goal

Fix the Campaign Board browser-state issue so moving a card updates the visible card column/state correctly.

## Business Objective

Make the EmailORC demo flow feel reliable by ensuring Campaign Board movement reflects the user’s action in the browser.

## User Story

As the project owner, I want Campaign Board cards to visibly move to the selected/target column when I move them, so the board does not look broken during demos.

## In Scope

- Inspect existing Campaign Board UI/state logic.
- Inspect any supporting API/state helpers used by the Campaign Board.
- Fix the smallest browser-state/card movement issue.
- Preserve existing board design and data shape where possible.
- Add or update focused tests if practical.
- Document manual verification if automated browser-safe coverage is not practical.
- Run `npm run test`.
- Run `npm run build`.
- Update Sprint 005 docs and project state.

## Out of Scope

- Full Campaign Board redesign.
- Full drag-and-drop library replacement unless the existing implementation cannot be repaired safely.
- New persistence model.
- Database schema changes.
- Migrations.
- D1/Prisma reconciliation.
- Auth/session changes.
- CSV/import changes.
- Draft approval changes.
- Email sending.
- Live CRM/email integrations.
- Env changes.
- Deployment changes.
- Lint tooling setup.
- Playwright mutation cleanup.
- Production-readiness claim.

## Business Rules

- Moved cards should display in the correct target column after movement.
- A card should not appear in both old and new columns after movement.
- A card should not snap back to the old column after a successful local move.
- If the existing code has a save/persist action, keep its behavior unless the bug is directly caused by stale state after save.
- Do not invent a new board workflow.
- Do not change campaign statuses/stages beyond what is needed for card movement.
- Auto-send remains disabled.
- Live integrations remain disabled.
- EmailORC remains MVP/demo-stage.

## Expected Output

Create:

- `planning/sprints/005-campaign-board-browser-state-fix/requirements.md`
- `planning/sprints/005-campaign-board-browser-state-fix/blueprint.md`
- `planning/sprints/005-campaign-board-browser-state-fix/acceptance.md`
- `planning/sprints/005-campaign-board-browser-state-fix/handoff-prompt.md`

Update as needed:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- Targeted Campaign Board source/test files required to implement the fix

## Success Definition

Sprint 005 succeeds when:

- Campaign Board card movement updates the visible browser state correctly.
- The moved card appears in the intended target column.
- The moved card no longer appears in the old column after successful movement.
- Existing valid board behavior is preserved.
- `npm run test` passes.
- `npm run build` passes.
- No out-of-scope changes are introduced.
```

---

# File: planning/sprints/005-campaign-board-browser-state-fix/blueprint.md

```markdown
# Sprint 005 Blueprint — Campaign Board Browser State Fix

## Objective

Implement one focused fix:

1. Campaign Board card movement must update visible browser board state/column correctly.

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
- `planning/sprints/005-campaign-board-browser-state-fix/requirements.md`
- `planning/sprints/005-campaign-board-browser-state-fix/blueprint.md`
- `planning/sprints/005-campaign-board-browser-state-fix/acceptance.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before editing.

Likely areas:

- `app/mvp/campaigns/`
- `app/mvp/campaigns/page.tsx`
- Campaign Board components under `src/components/` if present
- Campaign-related helpers under `src/`
- Campaign state/orchestration files, possibly `src/services/campaign-orchestrator.ts`
- Domain/status types under `src/types/`
- Existing tests under `tests/`
- Any fixtures related to campaigns/cards

Do not assume exact paths without checking the repo.

## Files to Create

- `planning/sprints/005-campaign-board-browser-state-fix/requirements.md`
- `planning/sprints/005-campaign-board-browser-state-fix/blueprint.md`
- `planning/sprints/005-campaign-board-browser-state-fix/acceptance.md`
- `planning/sprints/005-campaign-board-browser-state-fix/handoff-prompt.md`

## Files to Modify

Expected categories:

- Campaign Board page/component state file(s)
- Campaign status/stage helper file(s), only if needed
- Focused test file(s), if practical
- `docs/API.md`, only if route/state contract is clarified or changed
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

2. Confirm `prisma/dev.db` is not intentionally touched.
3. Inspect Sprint 002 validation report and Sprint 004 completion state.
4. Inspect Campaign Board files and current state movement logic.
5. Summarize planned file edits before making source changes.

### Step 2 — Diagnose board movement failure

Determine whether the visible card movement failure is caused by:

- Local state not being updated after movement.
- Status/stage field mismatch.
- Card list grouped from stale source data.
- Mutation/update function changing the wrong property.
- Optimistic update missing or being overwritten.
- API response not being merged back into UI state.
- Drag/drop event handler using an old column key.

Document the actual cause in the final report.

### Step 3 — Apply smallest safe fix

1. Use the current board data model and status/stage names.
2. Update the state transition so moved cards render under the correct column.
3. Ensure moved cards are removed from the old column.
4. Avoid broad UI redesign.
5. Avoid replacing drag/drop infrastructure unless the current code cannot be repaired safely.
6. Avoid schema, persistence, env, deployment, or integration changes.

### Step 4 — Add focused tests if practical

Add or update tests where practical for:

- Moving a card updates the card’s status/stage/column value.
- Grouping/render-state logic places the moved card only in the target column.
- Existing valid board state remains valid.

If component/browser testing is not practical in the current test structure, Codex should:

- Add utility-level tests around extracted movement/grouping logic if feasible.
- Document manual browser verification steps.

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
- `docs/VALIDATION.md`
- `docs/API.md`, only if needed
- `planning/DECISIONS.md`, only if durable decisions were made

Recommend Sprint 006 based on remaining P2/P3 items.

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
2. Campaign Board movement behavior before/after.
3. Root cause found.
4. Tests added/updated.
5. Manual verification steps, if any.
6. Commands run and results.
7. Commands skipped and why.
8. Acceptance criteria complete/incomplete.
9. Any risks introduced.
10. Recommended Sprint 006.
```

---

# File: planning/sprints/005-campaign-board-browser-state-fix/acceptance.md

```markdown
# Sprint 005 Acceptance Criteria

Sprint 005 is complete when:

## Scope Control

- [ ] Builder read the Sprint 005 requirements, blueprint, and acceptance criteria.
- [ ] Builder confirmed the sprint is limited to the Campaign Board browser-state/card movement issue.
- [ ] Builder did not redesign the Campaign Board.
- [ ] Builder did not replace drag/drop infrastructure unless required and documented.
- [ ] Builder did not implement persistence redesign.
- [ ] Builder did not change auth/session behavior.
- [ ] Builder did not change CSV/import behavior.
- [ ] Builder did not change draft approval behavior.
- [ ] Builder did not configure lint tooling.
- [ ] Builder did not claim production readiness.

## Campaign Board Fix

- [ ] Moving a Campaign Board card updates the visible browser state correctly.
- [ ] The moved card appears in the intended target column after movement.
- [ ] The moved card no longer appears in the old column after successful movement.
- [ ] Existing valid board/card behavior is preserved.
- [ ] The fix uses the existing board data model/status values where possible.
- [ ] The root cause is documented in the final report.

## Tests / Verification

- [ ] Focused test coverage exists for movement/state grouping logic, if practical in the current test structure.
- [ ] If automated coverage could not be added, Codex documents why.
- [ ] Manual browser verification steps are documented if component/E2E coverage is not practical.

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
- [ ] `docs/API.md` is updated if route/state behavior changed or was clarified.
- [ ] `docs/VALIDATION.md` is updated with Sprint 005 validation results.
- [ ] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [ ] Builder recommends a specific Sprint 006.
- [ ] Builder does not start Sprint 006.
```

---

# File: planning/sprints/005-campaign-board-browser-state-fix/handoff-prompt.md

```markdown
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
```

---

# Codex Apply Architect Pack 005 Prompt

Use this prompt in Codex after saving this Architect Pack at the EmailORC repo root.

```text
You are the Builder Layer for EmailORC.

Apply Architect Pack 005 — Campaign Board Browser State Fix.

Important:
- This is Sprint 005.
- The sprint is limited to the Campaign Board browser-state/card movement issue.
- Do not implement fixes yet.
- First apply/create the Sprint 005 planning files from the Architect Pack.
- Then read the Sprint 005 files and summarize the implementation plan.
- Stop after the summary and wait for approval.

Create/update the planning and docs files described in the Architect Pack.

Hard limits:
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
- Do not intentionally touch prisma/dev.db.

After applying the pack, summarize:

1. What Sprint 005 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. Which tests you expect to add or update.
5. Which validation commands you plan to run.
6. Which commands you will skip and why.
7. Any blockers or ambiguities.

Stop after the summary and wait for my approval before implementing.
```

---

# Recommended Sprint 006 Direction

Do not start Sprint 006 yet.

Sprint 006 should be selected only after Sprint 005 is complete.

Likely candidates:

1. `006-playwright-non-mutating-validation-gate`
2. `006-lint-tooling-cleanup`
3. `006-campaign-board-persistence-clarification`
4. `006-environment-mode-definition`
5. `006-data-model-prisma-d1-reconciliation-audit`

Recommended default if Sprint 005 passes:

`006-playwright-non-mutating-validation-gate`

Reason:

The app now has several demo/core workflow fixes, but browser-level validation is still not safe because current Playwright tests mutate app/admin/user/environment state. A non-mutating browser validation gate would make future demo QA safer.
