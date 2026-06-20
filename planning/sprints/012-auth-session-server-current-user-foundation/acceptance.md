# Sprint 012 Acceptance — Auth Session Server Current-User Foundation

## Acceptance Checklist

### Scope Control

- [x] Sprint stayed limited to role helpers, server session/current-user helper, login/logout, `/api/auth/me`, focused tests, and docs.
- [x] No broad admin API guard hardening was implemented.
- [x] No workflow API guard hardening was implemented.
- [x] No global middleware rollout was implemented.
- [x] No page guard rewrite was implemented.
- [x] No broad localStorage cleanup was implemented.
- [x] No production-readiness claim was made.
- [x] No sending or live integrations were enabled.
- [x] `prisma/dev.db` was not intentionally touched.

### Role Normalization

- [x] Canonical roles are documented and implemented or consolidated.
- [x] Observed aliases normalize to canonical roles.
- [x] Unknown sensitive roles fail closed.
- [x] Focused role tests exist or a clear reason is documented.

### Session / Current-User Helper

- [x] Server current-user/session helper exists.
- [x] Helper reads and validates server session/cookie.
- [x] Helper resolves user id, organization id, canonical role, and session state where supported by current data.
- [x] Missing/invalid session produces unauthenticated behavior.
- [x] Helper does not trust localStorage or request body identity values as authorization truth.
- [x] Consistent `401` and future `403` response helpers or equivalents exist.

### Login / Logout / Me

- [x] Successful login creates a server session and sets HTTP-only cookie.
- [x] Logout clears HTTP-only cookie and invalidates session where supported.
- [x] `/api/auth/me` requires valid server session.
- [x] `/api/auth/me` returns `401` for missing/invalid session.
- [x] `/api/auth/me` returns current user from server-authenticated context for valid session.
- [x] Existing UI compatibility is preserved as much as practical without broad UI redesign.

### Session Storage

- [ ] Existing compatible session storage was reused, or
- [x] Minimal D1 session migration was added only if required.
- [x] No migration was executed.
- [x] No live D1 write command was run.
- [x] Any new session table contract is documented.

### Documentation / Planning

- [x] `docs/AUTH_SESSION.md` updated.
- [x] `docs/API.md` updated.
- [x] `docs/ARCHITECTURE.md` updated.
- [x] `docs/VALIDATION.md` updated.
- [x] `docs/DATA_MODEL.md` updated if session migration was added.
- [x] `planning/STATE.md` updated.
- [x] `planning/DECISIONS.md` updated if durable decisions changed.
- [x] `planning/RISKS.md` updated.
- [x] `planning/QUESTIONS.md` updated.
- [x] Sprint 013 recommendation documented.

### Validation

- [x] `git status --short` run before and after.
- [x] `npm run test` passed or failure documented.
- [x] `npm run lint` passed or failure documented.
- [x] `npm run test:e2e:safe` passed or failure documented.
- [x] `npm run build` passed or failure documented.
- [x] No forbidden commands were run.

## Completion Standard

Sprint 012 is complete only when:

- The server current-user/session foundation is implemented.
- `/api/auth/me` no longer depends on browser/localStorage identity.
- Tests and docs support the new foundation.
- Safe validation has been run.
- Acceptance criteria are checked honestly.
- Any unresolved risks are documented.

## Acceptance Notes

- Existing compatible session storage was not found, so `d1/migrations/0010_app_sessions.sql` was added.
- The migration was not executed during Sprint 012.
- D1-backed login sessions require the migration to be applied in a future approved database step.
