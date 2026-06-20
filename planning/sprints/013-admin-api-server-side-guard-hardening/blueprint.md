# Sprint 013 Blueprint — Admin API Server-Side Guard Hardening

## Implementation Plan

### 1. Read required files

Codex must read:

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- Sprint 013 `requirements.md`
- Sprint 013 `blueprint.md`
- Sprint 013 `acceptance.md`

### 2. Inspect admin API routes

Inspect:

```text
app/api/admin/*
```

List the routes found before implementation.

Identify:

- method handlers
- current access checks
- request-supplied identity fields
- shared helpers
- response patterns
- data reads/writes

### 3. Choose smallest guard shape

Prefer a small shared helper if more than one route needs the same logic.

Possible helper:

```text
src/lib/admin-auth.ts
```

The helper should use the Sprint 012 current-user/session helper.

Expected behavior:

- return current user when canonical role is `super_admin`
- return `401` response when unauthenticated
- return `403` response when authenticated but not `super_admin`
- fail closed for unknown sensitive roles

If only one admin route exists, inline use of existing helper is acceptable.

### 4. Apply guard to admin API routes

For each approved admin API route:

1. Resolve current user from server session.
2. Check canonical role.
3. Return `401` or `403` before existing logic when unauthorized.
4. Preserve existing successful behavior after authorization passes.

Do not alter unrelated business logic.

### 5. Add focused tests

Add tests in the existing test structure where practical.

Required coverage:

- unauthenticated admin API request returns `401`
- non-super-admin authenticated request returns `403`
- super-admin authenticated request reaches existing route behavior
- unknown sensitive role fails closed

Use local/test-safe helpers and mocks. Do not run migrations or write to D1.

### 6. Update docs/planning

Update:

- `planning/STATE.md`
- `planning/DECISIONS.md`, only if new durable decisions are made
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- Sprint 013 acceptance notes after implementation

### 7. Run validation

Run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Do not run migrations, seeds, Prisma commands, D1 writes, deploys, or commands requiring secrets.

## Expected Files To Modify Or Create

Likely inspect/modify:

- `app/api/admin/*`
- `src/lib/current-user.ts`
- `src/lib/roles.ts`
- `tests/validation.test.ts` or related test files
- docs/planning files

Possible create:

- `src/lib/admin-auth.ts`

Do not modify:

- `prisma/dev.db`
- `.env` files
- deployment config
- migrations, except no change expected to the existing Sprint 012 migration
