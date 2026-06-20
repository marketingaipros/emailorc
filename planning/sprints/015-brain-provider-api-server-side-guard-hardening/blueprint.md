# Sprint 015 Blueprint — Brain / Provider API Server-Side Guard Hardening

## Build Strategy

Keep this sprint focused on one route group: Brain / provider APIs.

Use the Sprint 012 current-user/session helper as the source of user, organization, and role context.

Follow the same route-group hardening pattern used by Sprint 013 and Sprint 014.

## Step 1 — Read Required Context

Read:

- `AGENTS.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- Sprint 012 files
- Sprint 013 files
- Sprint 014 files
- Sprint 015 requirements, blueprint, acceptance, and handoff prompt

## Step 2 — Inspect Route Surface

Inspect likely Brain/provider API areas:

- `app/api/brain/*`
- `app/api/openrouter/*`
- `app/api/provider/*`
- `app/api/providers/*`
- `app/api/model-settings/*`
- Brain/provider-related settings routes, only if clearly in scope

Document:

- exact routes found
- routes approved for Sprint 015
- routes explicitly left out as future work
- identity fields currently trusted, if any
- provider key or secret handling risks

Do not implement until the approved route list is clear.

## Step 3 — Add or Reuse Small Guard Helper

Prefer a small helper if it reduces repeated route code.

Possible helper names:

- `src/lib/brain-auth.ts`
- `src/lib/provider-auth.ts`
- reuse `src/lib/workflow-auth.ts` only if its contract is generic enough and docs remain clear

The helper should:

- call the Sprint 012 current-user/session helper
- return `401` for missing/invalid sessions
- compare requested organization scope to `currentUser.organizationId` where a route accepts requested org scope
- return `403` for wrong organization or fail-closed cases
- expose `currentUser.userId`, `currentUser.organizationId`, and `currentUser.role` to route handlers after auth passes
- never log or expose secret values

## Step 4 — Update Approved Routes

For each approved Brain/provider route:

1. Add server current-user authorization at the start of the handler.
2. Treat body/query org values only as requested scope.
3. Replace authorization use of request-supplied user/org/role/actor with current-user context.
4. Preserve existing successful behavior where practical.
5. Keep provider/model request values as config/resource inputs only.
6. Avoid changing data model, persistence, deployment, or env behavior.

## Step 5 — Add Focused Tests

Add or update tests in the existing test structure.

Coverage must include:

- unauthenticated Brain/provider request returns `401`
- wrong-organization request returns `403`
- authorized request reaches existing successful route behavior where practical
- request-supplied org/user/role/provider/actor values are not trusted for authorization
- unknown sensitive roles fail closed where relevant
- provider secrets are not exposed in auth failure responses or test output

## Step 6 — Update Docs and Planning

Update:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `planning/sprints/015-brain-provider-api-server-side-guard-hardening/acceptance.md`

Update `planning/DECISIONS.md` only if a new durable decision is discovered.

## Step 7 — Validate

Run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Do not run migrations, seed commands, Prisma commands, D1 writes, deploy commands, Wrangler commands, or anything requiring secrets.

## Expected Files To Modify

Likely implementation files:

- approved Brain/provider route files under `app/api/`
- optional small helper under `src/lib/`
- focused tests under `tests/`

Likely docs/planning files:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `planning/sprints/015-brain-provider-api-server-side-guard-hardening/acceptance.md`

## Explicitly Protected Files / Areas

Do not touch:

- `prisma/dev.db`
- Prisma schema
- D1 migrations
- seed files
- env files
- deployment config
- middleware
- page guards
- localStorage cleanup
- Brain Center UI unless a route test requires no UI change
- billing/usage/account APIs
- workflow/draft APIs
- admin APIs
- sending or live integration code
