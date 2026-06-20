# Sprint 014 Blueprint — Workflow / Draft Organization Permission Guards

## Implementation Sequence

### 1. Read Required Context

Read:

- `AGENTS.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- Sprint 012 files
- Sprint 013 files
- Sprint 014 requirements, blueprint, acceptance, and handoff prompt

### 2. Inspect Route Surface

Inspect likely workflow/draft API routes:

- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- `app/api/workflow/drafts/route.ts`
- `app/api/workflow/export/route.ts`
- `app/api/drafts/approve/route.ts`

Also inspect nearby route folders only to determine whether any additional clearly workflow/draft organization-scoped route belongs in Sprint 014.

Stop and summarize the exact route list before implementation.

### 3. Inspect Existing Auth Helpers

Inspect:

- Sprint 012 current-user/session helper
- role normalization helpers
- admin auth helper from Sprint 013
- existing tests in `tests/validation.test.ts`

Reuse existing helpers where possible.

### 4. Add Small Shared Helper If Useful

If route code would duplicate authorization behavior, add a small helper such as:

- `src/lib/workflow-auth.ts`
- `src/lib/org-auth.ts`

Helper behavior should:

- resolve current user through the server current-user helper
- return or expose `401` unauthenticated response behavior
- check organization authorization
- return or expose `403` forbidden behavior
- fail closed when role/org context is unknown or incompatible

Do not overbuild a permission framework.

### 5. Apply Route Guards

For each approved workflow/draft route:

1. Resolve current user at the top of the handler.
2. Return `401` if missing/invalid session.
3. Compare requested organization context to server current-user organization context where the route has org-scoped input.
4. Return `403` for conflicts or unauthorized access.
5. Use server current-user user/org context for touched-route actor metadata where local and safe.
6. Continue existing route behavior after authorization passes.

Preserve existing response shapes after auth succeeds where practical.

### 6. Add Focused Tests

Update `tests/validation.test.ts` or adjacent existing test files.

Cover:

- unauthenticated request returns `401`
- authenticated wrong-organization or unauthorized request returns `403`
- authenticated authorized request reaches route behavior
- request-supplied org/user/role is not trusted
- unknown sensitive role fails closed where relevant

Prefer non-mutating or low-risk routes for success-path tests where possible.

### 7. Update Docs and Planning

Update:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `planning/sprints/014-workflow-draft-organization-permission-guards/acceptance.md`

Update `planning/DECISIONS.md` only if a new durable decision is made.

### 8. Run Validation

Run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Do not run migrations, seed commands, Prisma commands, D1 write commands, deploy commands, or commands requiring secrets.

## File Boundaries

Expected possible code/test files:

- workflow/draft route files approved after inspection
- optional small shared workflow/org auth helper
- `tests/validation.test.ts` or existing focused auth test file

Expected docs/planning files:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- Sprint 014 `acceptance.md`

Do not touch:

- `prisma/dev.db`
- migrations
- env files
- deployment config
- package files unless absolutely required and approved first
- admin routes except documentation references
- Brain/provider routes
- billing/usage/account routes
- middleware
- page guards
- localStorage cleanup
