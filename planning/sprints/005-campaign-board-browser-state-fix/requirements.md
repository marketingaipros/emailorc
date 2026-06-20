# Sprint 005 Requirements — Campaign Board Browser State Fix

## Goal

Fix the Campaign Board browser-state issue so moving a card updates the visible card column/state correctly.

## Business Objective

Make the EmailORC demo flow feel reliable by ensuring Campaign Board movement reflects the user's action in the browser.

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
