# Sprint 004 Acceptance Criteria

Sprint 004 is complete when:

## Scope Control

- [x] Builder read the Sprint 004 requirements, blueprint, and acceptance criteria.
- [x] Builder confirmed the sprint is limited to import mapping and validation hardening.
- [x] Builder did not implement CRM integration.
- [x] Builder did not implement Salesforce integration.
- [x] Builder did not enable sending or auto-send.
- [x] Builder did not implement Campaign Board drag/drop fixes.
- [x] Builder did not clean up Playwright mutation behavior.
- [x] Builder did not configure lint tooling.
- [x] Builder did not redesign auth/session.
- [x] Builder did not claim production readiness.

## Import Field Discovery

- [x] Current import source files were inspected.
- [x] Existing tests/fixtures/samples were inspected where available.
- [x] Required import fields were identified from existing evidence.
- [x] Any ambiguity about required fields was documented instead of guessed.

## Mapping Behavior

- [x] Header normalization handles casing and spacing differences where practical.
- [x] Supported aliases are explicit and documented if aliases are added.
- [x] Mapping avoids unsafe broad fuzzy matching.
- [x] Valid import headers map to the expected internal fields.
- [x] Valid imports continue to work.

## Validation Behavior

- [x] Missing required headers are blocked with clear feedback.
- [x] Unmapped required fields are blocked or clearly surfaced.
- [x] Missing required row values are blocked or clearly reported according to the implemented rule.
- [x] Invalid imports do not silently create misleading records.
- [x] Validation is enforced in the authoritative import path.
- [x] The fix is not UI-only.

## UI Feedback

- [x] Upload/import UI clearly communicates missing or unmapped required fields.
- [x] UI changes are limited to the import validation feedback need.
- [x] No broad upload page redesign was introduced.

## Tests

- [x] Focused test coverage exists for valid import mapping, if practical in the current test structure.
- [x] Focused test coverage exists for missing required headers, if practical in the current test structure.
- [x] Focused test coverage exists for missing required row values or documented validation behavior, if practical in the current test structure.
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
- [x] `docs/VALIDATION.md` is updated with Sprint 004 validation results.
- [x] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Next Sprint

- [x] Builder recommends a specific Sprint 005.
- [x] Builder does not start Sprint 005.
