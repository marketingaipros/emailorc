# Sprint 014 Acceptance — Workflow / Draft Organization Permission Guards

## Acceptance Criteria

Sprint 014 is complete only when all applicable criteria are satisfied.

### Scope

- [x] Exact workflow/draft route list was inspected and documented before implementation.
- [x] Implementation stayed limited to approved workflow/draft API routes, optional small shared helper, focused tests, and closeout docs/planning.
- [x] No admin API, Brain/provider API, billing/usage/account API, middleware, page guard, localStorage, schema, migration, env, deployment, sending, or live integration work was added.

### Auth Behavior

- [x] Touched workflow/draft routes use the Sprint 012 server current-user/session foundation.
- [x] Missing or invalid session returns `401`.
- [x] Authenticated but unauthorized organization/resource access returns `403`.
- [x] Authorized current user reaches existing successful route behavior where practical.
- [x] Request-supplied organization/user/role values are not trusted for authorization.
- [x] Unknown sensitive roles fail closed where relevant.

### Tests

- [x] Focused tests cover unauthenticated access.
- [x] Focused tests cover forbidden or wrong-organization access.
- [x] Focused tests cover authorized access.
- [x] Focused tests cover request-supplied identity not being trusted or equivalent fail-closed behavior.
- [x] Tests are local-safe and do not require secrets or live services.

### Validation

- [x] `git status --short` was run before and after.
- [x] `npm run test` passed or any failure was documented with cause.
- [x] `npm run lint` passed or any failure was documented with cause.
- [x] `npm run test:e2e:safe` passed or any failure was documented with cause.
- [x] `npm run build` passed or any failure was documented with cause.
- [x] No migrations, seed commands, Prisma commands, D1 writes, deploy commands, Wrangler deploy, or secret-requiring commands were run.

### Documentation

- [x] `planning/STATE.md` updated.
- [x] `planning/RISKS.md` updated.
- [x] `planning/QUESTIONS.md` updated.
- [x] `docs/AUTH_SESSION.md` updated.
- [x] `docs/API.md` updated.
- [x] `docs/ARCHITECTURE.md` updated.
- [x] `docs/VALIDATION.md` updated.
- [x] `planning/DECISIONS.md` updated only if a new durable decision was made.
- [x] Recommended Sprint 015 scope was reported.

## Not Complete If

- Workflow/draft routes still trust request-supplied org/user/role values for authorization.
- Auth failure semantics are inconsistent without explanation.
- Tests are missing for unauthenticated and forbidden cases.
- The sprint expands into middleware, page guards, localStorage cleanup, Brain/provider APIs, billing/usage/account APIs, schema, migrations, env, deployment, or production readiness.
- `prisma/dev.db` is intentionally touched.
