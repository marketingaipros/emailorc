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
