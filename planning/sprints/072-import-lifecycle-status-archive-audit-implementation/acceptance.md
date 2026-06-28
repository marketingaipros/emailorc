# Sprint 072 Acceptance

## Acceptance Checks

- [x] Required first-read files reviewed.
- [x] Sprint 069, 070, and 071 planning context reviewed.
- [x] Medical/demo source traced to hardcoded demo fallback data for BluePath Health and campaign-board seed data.
- [x] Demo fallback records are labeled as fallback and remain gated to demo-mode fallback use.
- [x] Source/import information is visible through records API/UI metadata.
- [x] Staged import cancellation requires a reason and writes `IMPORT_STAGED_CANCELED` when D1 audit storage is available.
- [x] Completed imports support archive and restore with required reasons.
- [x] Completed-import cancellation is explicitly rejected.
- [x] Import lifecycle actions write to existing `audit_log`.
- [x] Lead archive and restore are reversible and require a reason.
- [x] Lead lifecycle actions write to existing `audit_log`.
- [x] Lead source/import linkage is preserved.
- [x] No destructive rollback implemented.
- [x] No direct D1/manual cleanup steps added.
- [x] No Outlook/Microsoft behavior or sending changed.

## Validation Results

- `npm run test -- tests/validation.test.ts`: passed, 72 tests.
- `npm run test`: passed, 72 tests.
- `npm run lint`: passed with existing hook dependency warnings.
- `npm run build`: passed with existing hook dependency warnings.
- `npm run test:e2e:safe`: passed, 2 non-mutating Playwright smoke tests.

## Browser UAT Status

Browser UAT is still required in an authenticated local Cloudflare/OpenNext D1 runtime after applying the normal migration path. Automated helper validation passed, but full in-browser lifecycle proof is not complete yet.
