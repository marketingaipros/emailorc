# Sprint 005 Acceptance Criteria

Sprint 005 is complete when:

## Scope Control

- [x] Builder read the Sprint 005 requirements, blueprint, and acceptance criteria.
- [x] Builder confirmed the sprint is limited to the Campaign Board browser-state/card movement issue.
- [x] Builder did not redesign the Campaign Board.
- [x] Builder did not replace drag/drop infrastructure unless required and documented.
- [x] Builder did not implement persistence redesign.
- [x] Builder did not change auth/session behavior.
- [x] Builder did not change CSV/import behavior.
- [x] Builder did not change draft approval behavior.
- [x] Builder did not configure lint tooling.
- [x] Builder did not claim production readiness.

## Campaign Board Fix

- [x] Moving a Campaign Board card updates the visible browser state correctly.
- [x] The moved card appears in the intended target column after movement.
- [x] The moved card no longer appears in the old column after successful movement.
- [x] Existing valid board/card behavior is preserved.
- [x] The fix uses the existing board data model/status values where possible.
- [x] The root cause is documented in the final report.

## Tests / Verification

- [x] Focused test coverage exists for movement/state grouping logic, if practical in the current test structure.
- [x] If automated coverage could not be added, Codex documents why.
- [x] Manual browser verification steps are documented if component/E2E coverage is not practical.

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
- [x] `docs/API.md` is updated if route/state behavior changed or was clarified.
- [x] `docs/VALIDATION.md` is updated with Sprint 005 validation results.
- [x] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [x] Builder recommends a specific Sprint 006.
- [x] Builder does not start Sprint 006.
