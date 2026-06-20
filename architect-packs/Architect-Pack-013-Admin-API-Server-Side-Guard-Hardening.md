# Architect Pack 013 — Admin API Server-Side Guard Hardening

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `013-admin-api-server-side-guard-hardening`  
**Created:** 2026-05-21  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 013 is the next controlled auth/session implementation sprint after Sprint 012.

Sprint 012 established the auth/session foundation:

- canonical role normalization and compatibility role handling
- server session helper
- server current-user helper
- HTTP-only opaque `emailorc_session` cookie
- login session creation
- logout session clearing
- `/api/auth/me` server-authenticated current-user resolution
- focused tests
- minimal D1 `app_sessions` migration file, created but not applied

Sprint 013 applies that foundation to the admin API surface only.

The goal is to enforce server-side `super_admin` access for `app/api/admin/*` routes using the Sprint 012 current-user/session helper.

This sprint must not broaden into workflow/draft route hardening, middleware rollout, page guard rewrites, localStorage cleanup, production readiness, database execution, deployment, sending, or live integrations.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Read Sprint 012 output and updated durable docs.
- Inspect `app/api/admin/*` routes and any admin route helpers.
- Identify current admin API access-control behavior.
- Apply the Sprint 012 current-user helper to admin API routes.
- Enforce server-side `super_admin` authorization for admin API routes that expose or mutate admin-only data.
- Return consistent `401` when no valid server session exists.
- Return consistent `403` when a valid session exists but the user is not `super_admin`.
- Preserve existing admin API response shapes where possible after authorization succeeds.
- Add or update focused tests for:
  - unauthenticated admin API access returns `401`
  - non-super-admin admin API access returns `403`
  - super-admin admin API access reaches the existing route behavior
  - admin route helpers fail closed for unknown roles
- Update durable docs and planning files after implementation.
- Run safe validation commands.

### Conditional In Scope

If admin routes share helper logic that is currently duplicated, Codex may add a small shared admin guard helper, such as `src/lib/admin-auth.ts`, only if it keeps the implementation smaller and clearer.

If tests need lightweight route-handler fixtures or mocks for current-user/session behavior, Codex may add them in the existing test structure.

### Out of Scope

- No workflow API guard hardening.
- No draft API guard hardening.
- No Brain/OpenRouter/provider route guard hardening.
- No billing, plan, usage, account-intelligence route hardening unless those routes are physically inside `app/api/admin/*` and clearly admin-only.
- No global middleware rollout.
- No `/mvp/*` page authorization rewrite.
- No localStorage cleanup.
- No login UI redesign.
- No role dashboard or permission-management UI.
- No schema changes.
- No Prisma schema edits.
- No D1 migration edits except documentation references to the existing Sprint 012 migration if needed.
- No new migrations unless Codex proves an admin guard test requires no database execution and owner approves.
- No migration execution.
- No seed commands.
- No D1 writes.
- No Prisma commands.
- No env file edits.
- No deployment config changes.
- No Wrangler deploy.
- No sending enablement.
- No live CRM/email integration enablement.
- No production-readiness claim.
- No intentional changes to `prisma/dev.db`.
- No Sprint 014 work.

---

## Source Facts From Prior Sprints

Sprint 010 audited auth/session readiness and found that EmailORC was not production-auth-ready. The audit found that page guards were primarily client-side, many API routes trusted request-supplied identity fields, and admin/workflow/Brain/billing/account routes lacked a consistent server-authenticated principal.

Sprint 011 designed the target guard model and permission matrix. Key durable decisions included:

- client-side page guards are UX aids only, not production security boundaries
- API authorization should derive organization, user, and role from a server-authenticated current-user context
- sensitive API/admin behavior must be protected server-side
- implementation should be sequenced to avoid broad auth churn

Sprint 012 implemented the foundation only. Completion review confirmed:

- role normalization and permission helpers are implemented and tested
- unknown sensitive roles fail closed
- server session/current-user helpers exist
- login creates the `emailorc_session` HTTP-only opaque cookie
- logout clears the cookie and revokes sessions where supported
- `/api/auth/me` requires a valid server session
- `d1/migrations/0010_app_sessions.sql` was created but not applied
- `npm run test` passed with 21 tests
- `npm run lint` passed with existing React hook warnings
- `npm run test:e2e:safe` passed with 2 tests
- `npm run build` passed with the same existing hook warnings
- pre-existing dirty worktree state remains, including `prisma/dev.db`

Known persistent rules:

- EmailORC remains MVP/demo-stage.
- Human review remains required.
- Auto-send remains disabled.
- Live CRM/email integrations remain disabled.
- Secrets must never be exposed.
- `prisma/dev.db` must not be intentionally touched.
- Production readiness is not established.
- The Sprint 012 D1 session migration remains unapplied until a future approved database step.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-21  
**Current phase:** Sprint 013 — Admin API Server-Side Guard Hardening

---

## Current Status

Sprint 012 is complete and accepted.

Sprint 012 established the auth/session server current-user foundation:

- canonical role normalization and compatibility role support
- unknown sensitive roles fail closed
- server session helper
- server current-user helper
- HTTP-only opaque `emailorc_session` cookie
- login session creation
- logout session clearing
- `/api/auth/me` server-authenticated current-user resolution
- focused tests
- minimal D1 `app_sessions` migration file created but not applied

Sprint 013 is active and applies the Sprint 012 foundation to the admin API surface only.

Sprint 013 should enforce server-side `super_admin` authorization for `app/api/admin/*` using the current-user helper.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/013-admin-api-server-side-guard-hardening/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- Sprint 003 fixed Super Admin-only access to `/mvp/admin` and blocked draft approval below QA score 90.
- Sprint 004 hardened import mapping and validation.
- Sprint 005 fixed Campaign Board browser-state/card movement.
- Sprint 006 created or isolated a non-mutating Playwright validation path.
- Sprint 007 made lint non-interactive.
- Sprint 008 completed Prisma / D1 reconciliation audit.
- Sprint 009 completed environment-mode and data-store decision documentation.
- Sprint 010 completed auth/session readiness audit.
- Sprint 011 completed auth/session guard design and permission matrix.
- Sprint 012 completed auth/session current-user foundation.
- Sprint 012 validation passed: `npm run test`, `npm run lint`, `npm run test:e2e:safe`, and `npm run build`.

---

## Next Actions

1. Apply Architect Pack 013 to create Sprint 013 planning files.
2. Have Codex read Sprint 013 files and summarize the implementation plan before making changes.
3. Approve Codex implementation only after the summary is correct.
4. Inspect `app/api/admin/*` routes.
5. Apply server-side `super_admin` authorization using the Sprint 012 current-user helper.
6. Add focused admin API guard tests.
7. Run safe validation commands.
8. Report acceptance status and recommended Sprint 014.

---

## Blockers / Open Items

- Production readiness is not established.
- Sprint 012 D1 `app_sessions` migration is created but not applied.
- Admin API guard hardening has not started until Sprint 013 implementation is complete.
- Workflow/draft organization permission hardening has not started.
- Page/middleware/localStorage cleanup has not started.
- Production mode remains a future target state only.
- Deployment target and production readiness remain unresolved.
- Dirty working tree existed before Sprint 013, including `prisma/dev.db`; avoid unrelated files.
```

---

# File: planning/DECISIONS.md

```markdown
# Decisions

Record durable decisions future sprints must respect.

---

## Decision Log

| Date | Decision | Reason | Impact |
|---|---|---|---|
| 2026-05-21 | Sprint 013 will harden only the admin API surface with server-side `super_admin` enforcement. | Sprint 012 established the current-user helper; admin APIs are the next highest-risk route group. | Codex must not expand into workflow/draft APIs, middleware, page guards, localStorage cleanup, or production-readiness work. |
| 2026-05-21 | Admin API authorization must derive from the server-authenticated current-user helper, not request-supplied identity fields. | Sprint 010 found request-controlled identity values were production blockers. | Admin routes must use the Sprint 012 server current-user/session foundation. |
| 2026-05-21 | Admin API guards should return `401` for unauthenticated requests and `403` for authenticated non-super-admin requests. | Clear auth failure semantics make future route hardening and tests consistent. | Tests should assert both missing session and insufficient permission behavior. |
| 2026-05-21 | Sprint 013 must not apply or modify the Sprint 012 D1 session migration. | Migration execution is a separate database operation and was intentionally deferred. | Codex must not run migrations, seed commands, D1 writes, Prisma commands, or deployment commands. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready after admin API guard work. | Medium | High | Continue documenting EmailORC as MVP/demo-stage until full production readiness is validated. | Open |
| Sprint 013 expands into broad auth hardening. | Medium | High | Limit scope to `app/api/admin/*` and focused tests only. | Active |
| Admin API routes continue trusting request-supplied identity. | Medium | High | Replace admin route authorization with Sprint 012 current-user helper. | Active |
| Some admin-like routes live outside `app/api/admin/*`. | Medium | Medium | Document them as future work unless the route is clearly in the Sprint 013 admin API surface. | Active |
| New guard behavior breaks local/demo admin flows. | Medium | Medium | Use focused tests and preserve successful super-admin route behavior after auth passes. | Active |
| Session migration remains unapplied in D1 environments. | High | Medium | Keep visible as a blocker for D1-backed login sessions; do not apply migration in Sprint 013. | Open |
| Workflow/draft APIs remain unprotected after Sprint 013. | High | High | Carry as known risk and recommend Sprint 014 for workflow/draft organization permission guards. | Open |
| Middleware/page guards remain client-heavy after Sprint 013. | High | Medium | Carry as known risk for a later page/middleware/localStorage cleanup sprint. | Open |
| Dirty worktree causes accidental unrelated changes. | Medium | Medium | Check `git status --short` before and after; avoid unrelated runtime/package/database files. | Active |
| `prisma/dev.db` is touched or committed accidentally. | Medium | Medium | Do not run mutating database/Prisma commands; do not touch `prisma/dev.db`. | Active |
| Secrets or credentials are exposed. | Low | High | Inspect names and contracts only; never print secret values. | Open |
| Auto-send or live integrations are enabled accidentally. | Low | High | Keep auto-send and live integrations disabled. | Open |
```

---

# File: planning/QUESTIONS.md

```markdown
# Open Questions

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Is EmailORC intended for internal AI Hub use only, client demos, or paid client production use? | Owner | Production readiness sprint | Open | Affects auth, deployment, compliance, data retention, and sending rules. |
| What is the correct production target: Cloudflare only, local/server deploy, or another host? | Owner | Production readiness sprint | Open | Current audit history found Cloudflare D1 and OpenNext Cloudflare path. |
| Should direct email sending ever be enabled, or should the product remain review/export only? | Owner | Integration roadmap | Open | Current decision: no auto-send unless future sprint approves it. |
| Which exact routes are present under `app/api/admin/*`? | Builder | Sprint 013 | Active | Codex should inspect and list routes before implementation. |
| Do any admin-like APIs live outside `app/api/admin/*`? | Builder/Architect | Sprint 013 or future admin/API inventory | Active | Sprint 013 should document but not broaden unless the route is clearly part of the approved admin API surface. |
| Should workflow/draft authorization be the next sprint after admin APIs? | Architect/Builder | Sprint 014 planning | Open | Recommended Sprint 014: workflow/draft organization permission guards. |
| When should the Sprint 012 D1 session migration be applied? | Owner/Builder | Future database/deployment step | Open | Migration file exists but was intentionally not applied. |
| When should middleware/page guard cleanup happen? | Architect/Builder | Future page/middleware sprint | Open | Recommended after server helper and API guard foundations pass validation. |
```

---

# File: docs/AUTH_SESSION.md

```markdown
# Auth / Session

## Overview

EmailORC auth/session behavior is being hardened in stages.

Sprint 010 audited the current behavior and found production-auth readiness was not established.

Sprint 011 defined the target guard design and permission matrix.

Sprint 012 implemented the first narrow foundation:

- canonical role normalization
- compatibility roles
- server session helper
- server current-user helper
- HTTP-only opaque `emailorc_session` cookie
- login session creation
- logout session clearing
- `/api/auth/me` server-authenticated current-user behavior

Sprint 013 applies that foundation to admin API routes only.

EmailORC remains MVP/demo-stage. Sprint 013 does not make the app production-ready.

---

## Current Session Contract

| Area | Direction |
|---|---|
| Cookie name | `emailorc_session` |
| Session mechanism | Server-issued HTTP-only opaque session cookie backed by server-side lookup. |
| Token storage | Raw token stored only in cookie; SHA-256 token hash stored server-side. |
| Cookie options | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` only in production, 7-day expiration. |
| Deployed source of truth | D1 for auth/session/user/membership direction. |
| Local fallback | Server-memory fallback for tests/local compatibility only where documented. |
| Role enforcement | Normalize aliases into canonical roles before checking permissions. |
| Unknown sensitive roles | Fail closed. |
| localStorage | UX/display/navigation hints only; not authorization truth. |

---

## Admin API Guard Contract

Sprint 013 should establish this admin API behavior:

| Case | Expected Response |
|---|---|
| Missing or invalid `emailorc_session` | `401 Unauthorized` |
| Valid session but role is not `super_admin` | `403 Forbidden` |
| Valid session with canonical `super_admin` role | Continue to existing admin route behavior. |
| Unknown or unrecognized sensitive role | Fail closed; do not grant admin access. |

Admin API guards must derive user, organization, and role from the server current-user helper.

Admin API guards must not trust request-supplied `user_id`, `organization_id`, `email`, or `role` as authorization truth.

---

## Future Sprints

Recommended sequence after Sprint 013:

1. Sprint 014 — Workflow / Draft Organization Permission Guards.
2. Sprint 015 — Page, Middleware, and localStorage Trust Cleanup.
3. Future database/deployment step — Apply `d1/migrations/0010_app_sessions.sql` in an approved environment.
4. Later — Production readiness validation and deployment hardening.
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes and app-contract behavior from existing audits and follow-up sprints.

Sprint 012 created the server current-user/session foundation and moved `/api/auth/me` to server-authenticated current-user resolution.

Sprint 013 applies the Sprint 012 foundation to `app/api/admin/*` only.

Do not treat this as a complete route-by-route production contract until future API guard sprints are complete.

---

## Auth / Session Contract

| Route / Area | Current Contract |
|---|---|
| Login | Successful login creates a server session and sets `emailorc_session`. |
| Logout | Clears `emailorc_session` and revokes session where supported. |
| `/api/auth/me` | Requires valid server session and returns server-derived current user. |
| Admin API routes | Sprint 013 should require valid server session and canonical `super_admin`. |
| Workflow/draft routes | Future sprint; not hardened in Sprint 013. |
| Page guards | Future sprint; client-side guards remain UX aids only. |

---

## Admin API Guard Requirements

Sprint 013 should inspect the current routes under:

```text
app/api/admin/*
```

Expected behavior:

- Unauthenticated requests return `401`.
- Authenticated non-super-admin requests return `403`.
- Authenticated super-admin requests proceed to the existing route behavior.
- Unknown sensitive roles fail closed.
- Authorization uses the Sprint 012 server current-user helper.
- Authorization does not trust request body/query/header values for `user_id`, `organization_id`, `email`, or `role`.

---

## Known Workflow Routes

These remain out of scope for Sprint 013 unless physically inside `app/api/admin/*`:

| Route | Purpose | Auth / Access Notes |
|---|---|---|
| `app/api/workflow/import/route.ts` | CSV/contact import | Future workflow authorization sprint. |
| `app/api/workflow/records/route.ts` | Record retrieval / validation display | Future workflow authorization sprint. |
| `app/api/workflow/drafts/route.ts` | Draft retrieval | Future workflow authorization sprint. |
| `app/api/workflow/export/route.ts` | Approved draft export | Future workflow authorization sprint. |
| `app/api/drafts/approve/route.ts` | Draft approval | Sprint 003 enforces QA score >= 90; auth hardening remains future work. |

---

## API Documentation Gaps

Future API documentation should capture for each route:

- Method
- Path
- Request shape
- Response shape
- Auth/session expectation
- Role/permission requirement
- Data source
- Validation rules
- Error states
- Environment-mode behavior
```

---

# File: docs/ARCHITECTURE.md

```markdown
# Architecture

## Overview

EmailORC is an existing Next.js email campaign/workflow MVP.

It supports CSV/contact/account import, validation, draft review, draft approval, export, admin/settings areas, Brain Center configuration, environment-mode handling, local development data files, Cloudflare D1 deployment/demo data, and staged auth/session hardening.

Current status:

- MVP/demo-stage.
- Not confirmed production-ready.
- Human approval required.
- Auto-send disabled.
- Live CRM/email integrations disabled.
- D1 is the planning direction for deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support only.
- Sprint 012 established the server current-user/session foundation.
- Sprint 013 hardens admin API routes only.

---

## Auth / Session Architecture

| Layer | Current / Target Behavior |
|---|---|
| Session cookie | `emailorc_session`, HTTP-only opaque cookie. |
| Session lookup | Server-side lookup by SHA-256 token hash. |
| Current user | Resolved through server helper from session, not request-supplied identity. |
| Role normalization | Canonical role helper with fail-closed behavior for sensitive checks. |
| `/api/auth/me` | Uses server-authenticated current-user resolution. |
| Admin APIs | Sprint 013 should require server-authenticated `super_admin`. |
| Workflow/draft APIs | Future sprint. |
| Page/middleware guards | Future sprint. |
| localStorage | UX/display hints only; not auth truth. |

---

## Known Architecture Gaps

- Admin API guard hardening is incomplete until Sprint 013 is implemented and accepted.
- Workflow/draft API authorization remains future work.
- Middleware/page guard cleanup remains future work.
- Sprint 012 D1 session migration exists but has not been applied.
- Production data-store implementation is not approved yet.
- Production deployment path needs validation.
- Production readiness is not established.
```

---

# File: docs/DATA_MODEL.md

```markdown
# Data Model

## Overview

Sprint 008 reconciled EmailORC’s current Prisma / SQLite and Cloudflare D1 data-model layers.

Current documented posture:

- D1 contains the richer deployed workflow data model.
- D1 is the planning direction for deployed workflow source-of-truth.
- Prisma remains local fallback/development unless future approved work changes that.
- Browser localStorage, static/demo data, fixtures, request-only flows, and fallback paths still support some MVP/demo behavior.

---

## Session Storage

Sprint 012 added migration text for D1-backed app sessions:

```text
d1/migrations/0010_app_sessions.sql
```

The migration was created but not applied.

Sprint 013 must not apply or modify this migration.

Admin API guard hardening should use the server current-user/session helper created in Sprint 012. If the runtime environment lacks applied D1 session storage, local/test fallback behavior may support validation only as documented by Sprint 012. It must not be treated as production authority.

---

## Known Rules That Must Remain True

- Do-not-contact records must not appear in approved export.
- Approved export should only include approved, non-archived drafts.
- Human approval is required before draft output is considered usable.
- Draft approval requires QA score >= 90.
- Admin API access requires server-authenticated `super_admin` after Sprint 013 implementation.
- Auto-send remains disabled.
- Live integrations remain disabled.
- Secrets must not be exposed.
```

---

# File: docs/VALIDATION.md

```markdown
# Validation Plan

## Overview

Validation proves EmailORC is safe and trustworthy before future feature work, demos, or production decisions.

Current status:

- MVP/demo behavior exists.
- Production readiness is not established.
- Sprint 012 validation passed:
  - `npm run test`
  - `npm run lint`
  - `npm run test:e2e:safe`
  - `npm run build`
- `npm run lint` passes with existing React hook warnings.
- `npm run test:e2e:safe` is the current non-mutating browser gate.

---

## Sprint 013 Validation Focus

Sprint 013 validates one focused improvement:

1. Admin API routes under `app/api/admin/*` require server-authenticated `super_admin` access.

---

## Sprint 013 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Focused tests should cover:

- admin API unauthenticated request returns `401`
- admin API authenticated non-super-admin request returns `403`
- admin API authenticated super-admin request reaches existing route behavior
- unknown sensitive roles fail closed

Do not run:

- migrations
- seed commands
- Prisma commands
- D1 write commands
- deploy commands
- Wrangler deploy
- commands that write to live services
- commands that require secret values
- commands that enable sending or integrations

---

## Future Validation Areas

- Workflow/draft organization permission guards.
- Page/middleware/localStorage trust cleanup.
- D1 app session migration application in an approved database step.
- Production deployment readiness.
```

---

# File: planning/sprints/013-admin-api-server-side-guard-hardening/requirements.md

```markdown
# Sprint 013 Requirements — Admin API Server-Side Guard Hardening

## Goal

Apply the Sprint 012 server current-user/session foundation to the admin API surface.

## Business Objective

Prevent non-super-admin users and unauthenticated requests from accessing admin API behavior through direct API calls.

## User Story

As the project owner, I want admin API routes protected by server-side `super_admin` authorization, so the app no longer relies on client-side admin page guards as the only admin boundary.

## In Scope

- Inspect `app/api/admin/*` routes.
- Identify current admin API authorization behavior.
- Apply the Sprint 012 current-user helper to admin API routes.
- Enforce canonical `super_admin` authorization server-side.
- Return `401` for unauthenticated requests.
- Return `403` for authenticated non-super-admin requests.
- Preserve existing successful route behavior for authenticated super admins.
- Add or update focused tests.
- Update docs and planning files.
- Run safe validation commands.

## Out of Scope

- Workflow API guard hardening.
- Draft API guard hardening.
- Brain/provider route hardening unless physically under `app/api/admin/*` and clearly admin-only.
- Billing/usage/account route hardening unless physically under `app/api/admin/*` and clearly admin-only.
- Middleware rollout.
- Page guard rewrite.
- localStorage cleanup.
- Login UI redesign.
- Schema changes.
- Migration edits or execution.
- Seed commands.
- D1 writes.
- Prisma commands.
- Env edits.
- Deployment config changes.
- Production-readiness claim.

## Requirements

1. Admin API routes must not trust request-supplied `user_id`, `organization_id`, `email`, or `role` for authorization.
2. Admin API routes must derive current user and role from the Sprint 012 server current-user/session helper.
3. Missing or invalid session must return `401`.
4. Valid session with non-super-admin role must return `403`.
5. Valid session with canonical `super_admin` role must continue to existing admin route behavior.
6. Unknown sensitive roles must fail closed.
7. Tests must cover the main guard outcomes.
8. Docs/planning must record implemented behavior and any unresolved admin route gaps.
```

---

# File: planning/sprints/013-admin-api-server-side-guard-hardening/blueprint.md

```markdown
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
```

---

# File: planning/sprints/013-admin-api-server-side-guard-hardening/acceptance.md

```markdown
# Sprint 013 Acceptance — Admin API Server-Side Guard Hardening

## Scope Control

- [ ] Sprint stayed limited to admin API server-side guard hardening.
- [ ] No workflow/draft API hardening was implemented.
- [ ] No middleware rollout was implemented.
- [ ] No page guard rewrite was implemented.
- [ ] No localStorage cleanup was implemented.
- [ ] No env files were edited.
- [ ] No deployment config was changed.
- [ ] No Prisma commands were run.
- [ ] No seed commands were run.
- [ ] No D1 write commands were run.
- [ ] No migrations were run.
- [ ] `prisma/dev.db` was not intentionally touched.

## Admin API Guard Behavior

- [ ] Admin API routes under the approved Sprint 013 surface use server-authenticated current-user resolution.
- [ ] Admin API routes do not trust request-supplied `user_id`, `organization_id`, `email`, or `role` for authorization.
- [ ] Missing or invalid session returns `401`.
- [ ] Authenticated non-super-admin returns `403`.
- [ ] Authenticated canonical `super_admin` reaches existing route behavior.
- [ ] Unknown sensitive roles fail closed.
- [ ] Existing successful admin route response behavior is preserved where practical.

## Tests

- [ ] Focused tests cover unauthenticated admin API access.
- [ ] Focused tests cover authenticated non-super-admin admin API access.
- [ ] Focused tests cover authenticated super-admin admin API access.
- [ ] Focused tests cover unknown sensitive role fail-closed behavior, if not already covered by Sprint 012 tests.

## Documentation / Planning

- [ ] `docs/AUTH_SESSION.md` documents admin API guard behavior.
- [ ] `docs/API.md` documents admin API auth expectations.
- [ ] `docs/ARCHITECTURE.md` reflects Sprint 013 status.
- [ ] `docs/VALIDATION.md` reflects Sprint 013 validation.
- [ ] `planning/STATE.md` is updated.
- [ ] `planning/RISKS.md` is updated.
- [ ] `planning/QUESTIONS.md` is updated.
- [ ] `planning/DECISIONS.md` is updated only if new durable decisions are made.

## Validation

- [ ] `git status --short` was run before/after or at minimum before final report.
- [ ] `npm run test` passes.
- [ ] `npm run lint` passes or any warnings are documented as pre-existing.
- [ ] `npm run test:e2e:safe` passes.
- [ ] `npm run build` passes.

## Completion Standard

Sprint 013 is complete only when:

- Admin API routes in scope are protected server-side by `super_admin` authorization.
- Tests and validation pass or exceptions are clearly documented.
- No out-of-scope auth hardening was introduced.
- Docs and planning are updated.
- Remaining workflow/draft/page/middleware auth gaps are carried forward for future sprints.
```

---

# File: planning/sprints/013-admin-api-server-side-guard-hardening/handoff-prompt.md

```markdown
# Sprint 013 Handoff Prompt — Admin API Server-Side Guard Hardening

Use this prompt with Codex from the EmailORC repo root.

```text
Read the following files before making changes:

- AGENTS.md
- CODEX.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/VALIDATION.md
- planning/sprints/013-admin-api-server-side-guard-hardening/requirements.md
- planning/sprints/013-admin-api-server-side-guard-hardening/blueprint.md
- planning/sprints/013-admin-api-server-side-guard-hardening/acceptance.md

Then inspect the relevant admin API source files, but do not change any files yet.

Summarize:

1. What Sprint 013 is supposed to accomplish.
2. Which routes exist under app/api/admin/*.
3. The exact files you expect to modify or create.
4. How you will apply the Sprint 012 current-user/session helper.
5. How unauthenticated requests will return 401.
6. How authenticated non-super-admin requests will return 403.
7. How super-admin requests will preserve existing behavior.
8. What tests you expect to add or update.
9. What validation commands you will run.
10. Any blockers, risks, or ambiguities.

Important scope rules:

- Do not start implementation until I approve your summary.
- Do not implement workflow/draft API guard hardening.
- Do not implement Brain/provider route hardening unless physically under app/api/admin/* and clearly admin-only.
- Do not implement billing/usage/account route hardening unless physically under app/api/admin/* and clearly admin-only.
- Do not add middleware.
- Do not rewrite /mvp/* page guards.
- Do not clean up localStorage.
- Do not edit Prisma schema.
- Do not run migrations.
- Do not run seed commands.
- Do not write to D1.
- Do not run Prisma commands.
- Do not edit env files.
- Do not change deployment config.
- Do not touch prisma/dev.db.
- Do not enable sending or live integrations.
- Do not claim production readiness.

Sprint 013 is admin API guard hardening only:

- use Sprint 012 current-user/session helper
- require canonical super_admin for app/api/admin/*
- return 401 for unauthenticated
- return 403 for authenticated but unauthorized
- preserve successful super-admin behavior
- add focused tests
- update durable docs/planning

Stop after the summary and wait for approval.
```
```

