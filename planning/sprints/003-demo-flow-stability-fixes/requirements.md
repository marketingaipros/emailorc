# Sprint 003 Requirements - Demo Flow Stability Fixes

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
