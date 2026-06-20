# Sprint 007 Acceptance Criteria

Sprint 007 is complete when:

## Scope Control

- [x] Builder read the Sprint 007 requirements, blueprint, and acceptance criteria.
- [x] Builder confirmed the sprint is limited to non-interactive lint validation.
- [x] Builder did not implement app feature work.
- [x] Builder did not redesign lint rules broadly.
- [x] Builder did not perform broad formatting churn.
- [x] Builder did not change Playwright behavior except reading or referencing Sprint 006 docs.
- [x] Builder did not change Campaign Board behavior.
- [x] Builder did not change CSV/import behavior.
- [x] Builder did not change draft approval behavior.
- [x] Builder did not change auth/session behavior.
- [x] Builder did not claim production readiness.

## Lint Safe Gate

- [x] Current lint script/config was inspected.
- [x] Cause of interactive lint prompt was identified.
- [x] A non-interactive lint command exists.
- [x] The non-interactive lint command is documented in `docs/VALIDATION.md`.
- [x] The lint command does not require live credentials.
- [x] The lint command does not mutate database, app/admin/user/environment state, env files, migrations, or deployment config.
- [x] Any lint fixes are narrow, safe, and documented.
- [x] Any broad lint cleanup is deferred to a future sprint instead of expanded into Sprint 007.

## Tests / Verification

- [x] `npm run test` passes.
- [x] `npm run build` passes.
- [x] The Sprint 006 non-mutating Playwright command passes if available and documented.
- [x] The new non-interactive lint command passes, or Codex documents the narrow blocker and closest safe alternative.

## Safety

- [x] No database files changed.
- [x] No migrations changed.
- [x] No env files changed.
- [x] No deployment config changed.
- [x] `prisma/dev.db` was not intentionally touched.
- [x] No secrets were exposed.
- [x] Auto-send remains disabled.
- [x] Live integrations remain disabled.

## Validation

- [x] `git status --short` was run before and after.
- [x] Existing broad `npm run test:e2e` was skipped unless Sprint 006 documented it as non-mutating.
- [x] Existing `npm run test:e2e:report` was skipped unless Sprint 006 documented it as non-mutating.
- [x] The final lint command was run non-interactively.

## Documentation

- [x] `planning/STATE.md` is updated.
- [x] `planning/RISKS.md` is updated.
- [x] `planning/QUESTIONS.md` is updated if new questions are found.
- [x] `docs/VALIDATION.md` is updated with Sprint 007 validation results and lint gate instructions.
- [x] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [x] Builder recommends a specific Sprint 008.
- [x] Builder does not start Sprint 008.
