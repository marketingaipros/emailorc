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

- Moving a card updates the card's status/stage/column value.
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
