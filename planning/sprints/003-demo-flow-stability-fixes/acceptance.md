# Sprint 003 Acceptance Criteria

Sprint 003 is complete when:

## Scope Control

- [x] Builder read the Sprint 003 requirements, blueprint, and acceptance criteria.
- [x] Builder confirmed the sprint is limited to the two P1 blockers.
- [x] Builder did not implement CSV mapping.
- [x] Builder did not implement Campaign Board drag/drop fixes.
- [x] Builder did not clean up Playwright mutation behavior.
- [x] Builder did not configure lint tooling.
- [x] Builder did not claim production readiness.

## Admin Access Fix

- [x] `/mvp/admin` is restricted to Super Admin users only.
- [x] Client Admin users cannot directly access `/mvp/admin`.
- [x] Unauthorized users cannot access `/mvp/admin`.
- [x] Super Admin users can still access `/mvp/admin`.
- [x] The access behavior follows existing app patterns for redirect or denial.
- [x] No new broad permission system was invented.

## Draft QA Approval Fix

- [x] Drafts with QA score below 90 cannot be approved.
- [x] Drafts with QA score equal to 90 can still be approved if otherwise valid.
- [x] Drafts with QA score above 90 can still be approved if otherwise valid.
- [x] The QA threshold is enforced in the authoritative approval path.
- [x] The fix is not UI-only.
- [x] User-facing behavior is clear when approval is blocked.

## Tests

- [x] Focused test coverage exists for the admin access guard, if practical in the current test structure.
- [x] Focused test coverage exists for the QA approval threshold, if practical in the current test structure.
- [x] If a test could not be added, Codex documents why and describes the manual verification performed.

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
- [x] `npm run test` passes.
- [x] `npm run build` passes.
- [x] `npm run lint` was skipped unless it has been made non-interactive in a separately approved change.
- [x] E2E was skipped unless proven local-safe and non-mutating.

## Documentation

- [x] `planning/STATE.md` is updated.
- [x] `planning/RISKS.md` is updated.
- [x] `planning/QUESTIONS.md` is updated if new questions are found.
- [x] `docs/API.md` is updated if route behavior changed.
- [x] `docs/VALIDATION.md` is updated with Sprint 003 validation results.
- [x] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [x] Builder recommends a specific Sprint 004.
- [x] Builder does not start Sprint 004.
