# Sprint 006 Acceptance Criteria

Sprint 006 is complete when:

## Scope Control

- [x] Builder read the Sprint 006 requirements, blueprint, and acceptance criteria.
- [x] Builder confirmed the sprint is limited to Playwright non-mutating validation.
- [x] Builder did not rewrite the full E2E suite unless required and documented.
- [x] Builder did not configure lint tooling.
- [x] Builder did not implement app feature work.
- [x] Builder did not change Campaign Board behavior.
- [x] Builder did not change CSV/import behavior.
- [x] Builder did not change draft approval behavior.
- [x] Builder did not change auth/session behavior.
- [x] Builder did not claim production readiness.

## Playwright Safe Gate

- [x] Existing Playwright tests/config were inspected.
- [x] Mutating Playwright tests were identified or isolated.
- [x] A safe non-mutating Playwright validation path exists.
- [x] The safe Playwright path is documented in `docs/VALIDATION.md`.
- [x] The safe Playwright command does not mutate app/admin/user/environment state.
- [x] The safe Playwright command does not require live credentials.
- [x] The safe Playwright command does not send email or enable integrations.
- [x] Mutating E2E tests are not part of the safe gate.

## Tests / Verification

- [x] `npm run test` passes.
- [x] `npm run build` passes.
- [x] The new safe Playwright command passes if implemented and confirmed safe.
- [x] If the safe Playwright command could not be fully implemented, Codex documents why and provides the closest safe alternative.

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
- [x] Existing broad `npm run test:e2e` was skipped unless proven non-mutating.
- [x] Existing `npm run test:e2e:report` was skipped unless proven non-mutating.
- [x] `npm run lint` was skipped because lint cleanup is out of Sprint 006 scope.

## Documentation

- [x] `planning/STATE.md` is updated.
- [x] `planning/RISKS.md` is updated.
- [x] `planning/QUESTIONS.md` is updated if new questions are found.
- [x] `docs/VALIDATION.md` is updated with Sprint 006 validation results and safe browser gate instructions.
- [x] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [x] Builder recommends a specific Sprint 007.
- [x] Builder does not start Sprint 007.
