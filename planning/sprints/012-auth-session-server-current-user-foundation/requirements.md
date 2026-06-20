# Sprint 012 Requirements — Auth Session Server Current-User Foundation

## Goal

Implement the first narrow auth/session foundation for EmailORC.

## Business Objective

Move EmailORC away from trusting browser `localStorage` and request-supplied identity for current-user resolution by establishing a server-authenticated session and shared current-user helper.

## User Story

As the project owner, I want EmailORC to have a server-authenticated current-user foundation, so future admin, workflow, draft, Brain, billing, and page guard work can reuse one trusted auth/session boundary.

## In Scope

- Read Sprint 011 design and auth/session docs.
- Inspect existing auth/session routes and helpers.
- Add or consolidate role normalization and permission helpers.
- Add server current-user/session helper.
- Add HTTP-only session cookie creation after successful login.
- Add logout session clearing.
- Protect `/api/auth/me` with server-authenticated current-user helper.
- Add focused tests.
- Update durable docs and planning files.
- Run safe validation commands.

## Conditional In Scope

If no server session storage exists, Codex may add a minimal D1 migration file for session storage, but must not execute it.

## Out of Scope

- Full auth hardening.
- Admin API guard implementation.
- Workflow API guard implementation.
- Draft approval auth/org guard implementation.
- Brain/provider route guard implementation.
- Billing/usage/account route guard implementation.
- Global middleware rollout.
- Page guard rewrite.
- localStorage cleanup beyond narrow login/logout compatibility.
- Production-readiness claim.
- Env changes.
- Deployment config changes.
- Live D1 writes.
- Prisma database writes.
- Seed changes.
- Sending or integration enablement.
- Sprint 013 work.

## Business Rules

- Server session/current-user context is the source of truth for `/api/auth/me`.
- localStorage is not authorization truth.
- Request body `organization_id`, `user_id`, and role values are not authorization truth.
- D1 is deployed auth/session source-of-truth direction.
- Prisma/SQLite remains local development and transition support only.
- Unknown sensitive roles fail closed.
- Auto-send remains disabled.
- Live integrations remain disabled.
- `prisma/dev.db` must not be touched.
- EmailORC remains MVP/demo-stage.

## Expected Output

Create:

- `planning/sprints/012-auth-session-server-current-user-foundation/requirements.md`
- `planning/sprints/012-auth-session-server-current-user-foundation/blueprint.md`
- `planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md`
- `planning/sprints/012-auth-session-server-current-user-foundation/handoff-prompt.md`

Potential source files to create or update, subject to Codex inspection:

- `src/lib/roles.ts`
- `src/lib/auth-rules.ts`
- `src/lib/server-session.ts` or equivalent
- `src/lib/current-user.ts` or equivalent
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- focused test files under `tests/`

Conditional:

- a minimal D1 migration file for session storage, only if no compatible session storage exists

Update as needed:

- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `docs/DATA_MODEL.md`, if a D1 session migration is added
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`

## Success Definition

Sprint 012 succeeds when:

- Role normalization is centralized or clearly consolidated.
- Server current-user/session helper exists.
- Successful login creates the server session/cookie.
- Logout clears the session/cookie.
- `/api/auth/me` uses the server current-user/session helper.
- Missing/invalid session returns consistent `401`.
- Focused tests cover the new foundation.
- Safe validation commands pass or documented skips/failures are clear.
- No out-of-scope auth hardening is implemented.
- No live DB writes, deployments, env changes, sending, or integrations occur.
- Sprint 013 recommendation is clear.
