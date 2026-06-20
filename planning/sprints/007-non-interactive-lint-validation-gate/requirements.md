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
