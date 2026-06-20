# Sprint 012 Blueprint — Auth Session Server Current-User Foundation

## Objective

Implement one narrow foundation:

1. Canonical role normalization.
2. Server current-user/session helper.
3. HTTP-only session cookie create/clear.
4. `/api/auth/me` protected by server current-user.
5. Focused tests and docs.

Do not implement broader auth hardening.

---

## Files to Read First

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/auth-session-design.md`
- `planning/sprints/012-auth-session-server-current-user-foundation/requirements.md`
- `planning/sprints/012-auth-session-server-current-user-foundation/blueprint.md`
- `planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md`

---

## Files to Inspect

Codex should inspect before editing:

- `src/lib/roles.ts`
- `src/lib/auth-rules.ts`
- existing auth/session/current-user helpers, if any
- existing D1 helper files
- existing Prisma fallback helper files
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`, if present
- `app/api/auth/me/route.ts`
- `app/api/auth/signup/route.ts`, for compatibility only
- related auth tests
- `d1/migrations/`, if session storage is needed
- `wrangler.jsonc`, names/config only, no secrets
- `package.json`, scripts only, no dependency/package changes unless explicitly approved

---

## Files to Modify

Expected source/runtime changes:

- role normalization helper file
- server session/current-user helper file
- login route
- logout route
- `/api/auth/me` route
- focused tests

Expected docs/planning changes:

- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `docs/DATA_MODEL.md`, only if session migration is added
- `planning/STATE.md`
- `planning/DECISIONS.md`, only if durable decisions are added
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md`

Conditional:

- one minimal D1 session migration file, only if required and not executed

Do not modify unrelated app/UI/API route groups.

---

## Implementation Plan

### Step 1 — Confirm Current State

- Run `git status --short`.
- Note pre-existing dirty files.
- Confirm no work starts from a mistaken clean-tree assumption.

### Step 2 — Read Sprint 011 Design

- Confirm session direction.
- Confirm canonical roles and aliases.
- Confirm localStorage trust limits.
- Confirm D1/Prisma policy.
- Confirm Sprint 012 foundation scope.

### Step 3 — Role Normalization

- Inspect existing role helpers.
- Consolidate or add helper without broad rewrite.
- Normalize observed aliases into:
  - `super_admin`
  - `client_admin`
  - `user`
  - `demo_user`
- Fail closed for unknown sensitive role checks.
- Add focused tests.

### Step 4 — Session Storage Strategy

- Inspect whether the repo already has server-side session storage.
- If compatible session storage exists, reuse it.
- If no compatible storage exists, add a minimal D1 migration file for session storage.
- Do not run migration commands.
- Do not touch `prisma/dev.db`.

Suggested minimal session concepts:

- opaque session token stored only in cookie
- token hash stored server-side
- user id
- organization id, if needed
- role or role derived through membership lookup
- expiration
- revoked timestamp or active flag
- created/updated timestamps

### Step 5 — Server Current-User Helper

Create or update a helper that can:

- read session cookie from request
- validate session server-side
- resolve user id, organization id, canonical role, and session metadata
- return unauthenticated result when missing/invalid
- provide consistent `401` and `403` response helpers
- avoid localStorage and request body identity as authority

### Step 6 — Login Route

- Preserve existing credential validation.
- On successful login, create server session.
- Set HTTP-only session cookie.
- Preserve existing response compatibility where needed for current UI display state.
- Do not redesign login UI.

### Step 7 — Logout Route

- Clear HTTP-only session cookie.
- Invalidate server session if storage supports it.
- Preserve existing client compatibility where practical.
- Do not redesign logout UI.

### Step 8 — `/api/auth/me`

- Require valid server session.
- Return current user from helper.
- Return `401` for missing/invalid session.
- Do not trust request body/localStorage identity.

### Step 9 — Focused Tests

Add or update tests for:

- role normalization
- unknown role fail-closed behavior
- missing session
- valid session helper path where practical
- `/api/auth/me` unauthenticated path
- login session cookie creation where practical
- logout session clearing where practical

### Step 10 — Docs and Planning

Update durable docs and planning files with:

- what changed
- session cookie name and expiration
- helper contract
- any new D1 session table contract
- validation results
- remaining auth risks
- recommended Sprint 013

### Step 11 — Validation

Run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Document existing React hook warnings if they remain.

---

## Hard Limits

Codex must not:

- implement admin API guard hardening
- implement workflow API guard hardening
- implement global middleware
- rewrite page guards
- clean up localStorage broadly
- change production environment behavior
- run Prisma migrate/db push/db reset/db pull
- run seed commands
- run deploy commands
- run Wrangler deploy
- write to Cloudflare D1
- inspect or print secret values
- enable sending
- enable live integrations
- touch `prisma/dev.db`
- start Sprint 013

---

## Recommended Sprint 013

If Sprint 012 passes, recommend:

`013-admin-api-server-side-guard-hardening`

Expected purpose:

- Apply the Sprint 012 current-user helper to `app/api/admin/*`.
- Enforce server-side `super_admin`.
- Add focused tests.
- Keep workflow/draft/page/middleware work out of Sprint 013 unless separately approved.
