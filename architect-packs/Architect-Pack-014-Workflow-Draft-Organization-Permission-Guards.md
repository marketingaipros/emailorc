# Architect Pack 014 — Workflow / Draft Organization Permission Guards

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `014-workflow-draft-organization-permission-guards`  
**Created:** 2026-05-21  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 014 is the next controlled auth/session implementation sprint after Sprint 013.

Sprint 012 established the server current-user/session foundation.

Sprint 013 applied that foundation to the admin API surface by requiring server-authenticated canonical `super_admin` access for `app/api/admin/*`.

Sprint 014 applies the same foundation to workflow and draft API routes that read, create, approve, export, or otherwise expose organization-scoped campaign workflow data.

The goal is to stop workflow/draft routes from trusting request-supplied organization, user, or role values for authorization and instead derive organization/user context from the server-authenticated current user.

This sprint must not broaden into global middleware, page guards, localStorage cleanup, Brain/provider APIs, billing/usage/account APIs, production readiness, database execution, deployment, sending, or live integrations.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Read Sprint 012 and Sprint 013 output and updated durable docs.
- Inspect workflow and draft API routes that handle organization-scoped workflow data.
- Identify which workflow/draft routes currently trust request-supplied `organization_id`, `organizationId`, `user_id`, `userId`, role, actor, or similar identity values.
- Apply the Sprint 012 current-user/session helper to approved workflow/draft API routes.
- Enforce authenticated organization-scoped access for workflow/draft routes.
- Return consistent `401` when no valid server session exists.
- Return consistent `403` when a valid session exists but does not authorize access to the requested organization-scoped resource.
- Replace request-supplied actor/user/org authorization trust with server current-user context where local to touched workflow/draft routes.
- Preserve existing route behavior and response shapes after authorization succeeds where practical.
- Add or update focused tests for unauthenticated, wrong-organization, authorized-user, and fail-closed behavior.
- Update durable docs and planning files after implementation.
- Run safe validation commands.

### Approved Route Discovery Scope

Codex should inspect and report the exact route list before implementation.

Likely candidates include, but are not limited to:

- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- `app/api/workflow/drafts/route.ts`
- `app/api/workflow/export/route.ts`
- `app/api/drafts/approve/route.ts`

Codex may include other routes only if they are clearly workflow/draft API routes and clearly organization-scoped.

If a route is admin-like, Brain/provider-related, billing/usage/account-related, or page/middleware-related, Codex must document it as future work and leave it out of Sprint 014.

### Conditional In Scope

If workflow/draft routes share authorization patterns, Codex may add a small shared helper such as:

- `src/lib/workflow-auth.ts`
- `src/lib/org-auth.ts`

Only add a helper if it keeps route code smaller, clearer, and easier to test.

If tests need lightweight route-handler fixtures or mocks for current-user/session behavior, Codex may add them in the existing test structure.

### Out of Scope

- No admin API guard work except documentation references to Sprint 013.
- No Brain/OpenRouter/provider route guard hardening.
- No billing, plan, usage, or account-intelligence route hardening.
- No global middleware rollout.
- No `/mvp/*` page authorization rewrite.
- No localStorage cleanup.
- No login UI redesign.
- No role dashboard or permission-management UI.
- No schema changes.
- No Prisma schema edits.
- No D1 migration edits.
- No new migrations.
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
- No Sprint 015 work.

---

## Source Facts From Prior Sprints

Sprint 010 audited auth/session readiness and found that EmailORC was not production-auth-ready. The audit found that many API routes trusted request-supplied identity fields and lacked a consistent server-authenticated principal.

Sprint 011 designed the target guard model and permission matrix. Key durable decisions included:

- client-side page guards are UX aids only, not production security boundaries
- API authorization should derive organization, user, and role from a server-authenticated current-user context
- sensitive API/admin behavior must be protected server-side
- implementation should be sequenced to avoid broad auth churn

Sprint 012 implemented the auth/session foundation:

- canonical role normalization
- compatibility role handling
- unknown sensitive roles fail closed
- server session helper
- server current-user helper
- HTTP-only opaque `emailorc_session` cookie
- login session creation
- logout session clearing
- `/api/auth/me` server-authenticated current-user resolution
- focused tests
- minimal D1 `app_sessions` migration file, created but not applied

Sprint 013 implemented admin API server-side guard hardening:

- created `src/lib/admin-auth.ts`
- guarded all approved `app/api/admin/*` routes
- required canonical `super_admin`
- returned `401` for missing/invalid sessions
- returned `403` for authenticated non-super-admin users
- allowed super-admin requests to continue into existing route behavior
- used `currentUser.userId` for local audit actor values in touched admin routes
- passed validation:
  - `npm run test` with 25 tests
  - `npm run lint` with existing React hook warnings
  - `npm run test:e2e:safe` with 2 tests
  - `npm run build` with existing React hook warnings

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
**Current phase:** Sprint 014 — Workflow / Draft Organization Permission Guards

---

## Current Status

Sprint 013 is complete and accepted.

Sprint 013 applied the Sprint 012 auth/session foundation to the admin API surface:

- `app/api/admin/*` routes now require server-authenticated canonical `super_admin`.
- Missing/invalid sessions return `401`.
- Authenticated non-super-admin users return `403`.
- Super-admin requests continue into existing route behavior.
- Unknown sensitive roles fail closed.
- Focused admin API guard tests were added.
- Validation passed: `npm run test`, `npm run lint`, `npm run test:e2e:safe`, and `npm run build`.

Sprint 014 is active and applies the server current-user/session foundation to workflow and draft API routes only.

Sprint 014 should enforce authenticated organization-scoped access for approved workflow/draft routes and stop those routes from trusting request-supplied organization/user/role values for authorization.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/014-workflow-draft-organization-permission-guards/`

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
- Sprint 013 completed admin API server-side guard hardening.

---

## Next Actions

1. Apply Architect Pack 014 to create Sprint 014 planning files.
2. Have Codex read Sprint 014 files and summarize the implementation plan before making changes.
3. Approve Codex implementation only after the summary is correct.
4. Inspect workflow/draft API routes and identify exact approved route list.
5. Apply authenticated organization-scoped authorization using the Sprint 012 current-user helper.
6. Add focused workflow/draft guard tests.
7. Run safe validation commands.
8. Report acceptance status and recommended Sprint 015.

---

## Blockers / Open Items

- Production readiness is not established.
- Sprint 012 D1 `app_sessions` migration is created but not applied.
- Workflow/draft organization permission hardening has not started until Sprint 014 implementation is complete.
- Brain/provider APIs remain unguarded unless already handled elsewhere.
- Billing/usage/account APIs remain future work unless already handled elsewhere.
- Page/middleware/localStorage cleanup has not started.
- Production mode remains a future target state only.
- Deployment target and production readiness remain unresolved.
- Dirty working tree existed before Sprint 014, including `prisma/dev.db`; avoid unrelated files.
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
| 2026-05-21 | Sprint 014 will harden only workflow/draft API organization permission guards. | Sprint 013 completed admin API guard hardening; workflow/draft routes are the next highest-risk organization-scoped route group. | Codex must not expand into Brain, billing, usage, account, middleware, page guards, localStorage cleanup, or production-readiness work. |
| 2026-05-21 | Workflow/draft API authorization must derive organization and user context from the server-authenticated current-user helper. | Sprint 010 found request-controlled identity values were production blockers. | Workflow/draft routes must not trust client-provided organization/user/role values for authorization. |
| 2026-05-21 | Workflow/draft guards should return `401` for unauthenticated requests and `403` for authenticated users who are not authorized for the requested organization-scoped resource. | Clear auth failure semantics make future route hardening and tests consistent. | Tests should assert missing session, wrong-organization/forbidden, authorized behavior, and fail-closed behavior. |
| 2026-05-21 | Sprint 014 must not apply or modify the Sprint 012 D1 session migration. | Migration execution is a separate database operation and was intentionally deferred. | Codex must not run migrations, seed commands, D1 writes, Prisma commands, or deployment commands. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready after workflow/draft guard work. | Medium | High | Continue documenting EmailORC as MVP/demo-stage until full production readiness is validated. | Open |
| Sprint 014 expands into broad auth hardening. | Medium | High | Limit scope to approved workflow/draft API routes and focused tests only. | Active |
| Workflow/draft API routes continue trusting request-supplied identity. | Medium | High | Replace authorization trust with Sprint 012 current-user helper and organization-scoped checks. | Active |
| Organization scoping is inconsistent across workflow/draft routes. | Medium | High | Inspect each route before implementation and document route-level assumptions. | Active |
| Some workflow-like routes live outside obvious workflow/draft paths. | Medium | Medium | Document them as future work unless clearly approved as workflow/draft API scope. | Active |
| New guards break existing demo workflow flows. | Medium | Medium | Use focused tests and preserve successful authorized route behavior after auth passes. | Active |
| Session migration remains unapplied in D1 environments. | High | Medium | Keep visible as a blocker for D1-backed login sessions; do not apply migration in Sprint 014. | Open |
| Brain/provider APIs remain unprotected after Sprint 014. | Medium | High | Carry as known risk for future focused guard sprint. | Open |
| Billing/usage/account APIs remain unprotected after Sprint 014. | Medium | High | Carry as known risk for future focused guard sprint. | Open |
| Middleware/page guards remain client-heavy after Sprint 014. | High | Medium | Carry as known risk for a later page/middleware/localStorage cleanup sprint. | Open |
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
| Which exact workflow/draft routes are in Sprint 014 scope? | Builder | Sprint 014 | Active | Codex should inspect and list routes before implementation. |
| Which workflow/draft routes currently trust request-supplied organization/user identity values? | Builder | Sprint 014 | Active | Codex should document route-level findings before implementation. |
| How should organization mismatch be detected when a request includes an organization value that conflicts with current user context? | Builder/Architect | Sprint 014 | Active | Preferred default: server current-user organization wins; conflicting requested org returns `403`. |
| Should Brain/provider API authorization be the next sprint after workflow/draft guards? | Architect/Builder | Sprint 015 planning | Open | Recommended candidate if remaining high-risk provider settings routes are unguarded. |
| Should billing/usage/account route hardening be grouped together or split? | Architect/Builder | Future guard sprint | Open | Keep future guard sprints small and route-group based. |
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

Sprint 013 applied the foundation to admin API routes:

- `app/api/admin/*` routes require server-authenticated canonical `super_admin`.
- Missing/invalid sessions return `401`.
- Authenticated non-super-admin users return `403`.
- Unknown sensitive roles fail closed.

Sprint 014 applies the foundation to workflow/draft API organization permission guards.

EmailORC remains MVP/demo-stage. Sprint 014 does not make the app production-ready.

---

## Current Target Direction

| Area | Direction |
|---|---|
| Session mechanism | Server-issued HTTP-only opaque session cookie backed by server-side lookup. |
| Deployed source of truth | D1 for auth/session/user/membership direction. |
| Local fallback | Prisma/SQLite only for local development and transition support where explicitly documented. |
| Role enforcement | Normalize aliases into canonical roles before checking permissions. |
| Unknown sensitive roles | Fail closed. |
| Admin API authorization | Server current-user must be canonical `super_admin`. |
| Workflow/draft API authorization | Server current-user must be authenticated and authorized for the organization-scoped resource. |
| localStorage | UX/display/navigation hints only; not authorization truth. |

---

## Sprint 014 Implementation Contract

Sprint 014 should establish:

| Contract | Requirement |
|---|---|
| Workflow/draft current user | Touched workflow/draft routes resolve user/org/role through the server current-user helper. |
| Organization scoping | Routes must not trust request-supplied organization/user/role values for authorization. |
| Missing session | Return `401`. |
| Forbidden organization/resource access | Return `403`. |
| Authorized access | Preserve existing successful route behavior where practical. |
| Actor/user metadata | Use server current-user context for touched-route actor identity where local and safe. |
| Unknown sensitive roles | Fail closed. |
| Tests | Cover unauthenticated, forbidden/wrong-org, authorized, and fail-closed behavior. |

---

## Remaining Auth / Session Work

| Area | Status |
|---|---|
| Admin API guards | Completed in Sprint 013 for `app/api/admin/*`. |
| Workflow/draft API guards | Sprint 014 target. |
| Brain/provider route guards | Future work. |
| Billing/usage/account route guards | Future work. |
| Middleware/page guards | Future work. |
| localStorage cleanup | Future work. |
| D1 app session migration application | Future approved database/deployment step. |
| Production readiness | Not established. |
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes and app-contract behavior from existing audits and follow-up sprints.

Sprint 014 should update this document where workflow/draft organization permission expectations are clarified.

Do not treat this as a complete route-by-route production contract until a future API inventory or production-readiness sprint.

## Auth / Session Contract

Current direction:

- API routes that expose sensitive or organization-scoped data should derive user, organization, and role from the server-authenticated current-user/session helper.
- API routes should not trust request-supplied `organization_id`, `organizationId`, `user_id`, `userId`, or role values for authorization.
- Missing/invalid session should return `401`.
- Authenticated but unauthorized access should return `403`.
- Unknown sensitive roles should fail closed.

## Admin API Contract From Sprint 013

Sprint 013 behavior:

- `app/api/admin/*` routes require server-authenticated canonical `super_admin`.
- Missing/invalid sessions return `401`.
- Authenticated non-super-admin users return `403`.
- Super-admin requests continue into existing route behavior.
- Existing audit actor writes in touched admin routes use `currentUser.userId` where local to the route.

## Workflow / Draft API Contract For Sprint 014

Sprint 014 should inspect and harden workflow/draft routes.

Expected behavior:

- Workflow/draft routes that expose or mutate organization-scoped workflow data require a valid server session.
- Routes derive organization/user context from the server current-user helper.
- Client-provided organization/user/role fields are not authorization truth.
- If a request includes an organization value that conflicts with the current user’s organization context, return `403`.
- Authorized requests should preserve existing successful response behavior where practical.
- Workflow/draft route hardening should not change sending, integrations, schema, migrations, middleware, page guards, or localStorage behavior.

Likely route candidates:

| Route | Purpose | Sprint 014 Status |
|---|---|---|
| `app/api/workflow/import/route.ts` | CSV/contact import | Inspect and harden if organization-scoped. |
| `app/api/workflow/records/route.ts` | Record retrieval / validation display | Inspect and harden if organization-scoped. |
| `app/api/workflow/drafts/route.ts` | Draft retrieval | Inspect and harden if organization-scoped. |
| `app/api/workflow/export/route.ts` | Approved draft export | Inspect and harden if organization-scoped. |
| `app/api/drafts/approve/route.ts` | Draft approval | Inspect and harden if organization-scoped. |

## Future API Guard Areas

| Area | Status |
|---|---|
| Brain/OpenRouter/provider APIs | Future focused guard sprint. |
| Billing/plan/usage/account APIs outside admin surface | Future focused guard sprint. |
| Middleware/page guards | Future page/middleware sprint. |
| Full route-by-route API inventory | Future production-readiness sprint. |
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
- Sprint 012 established server current-user/session foundation.
- Sprint 013 hardened admin API server-side guards.
- Sprint 014 targets workflow/draft organization permission guards.

## Auth / Session Architecture

| Layer | Current Status |
|---|---|
| Session foundation | Implemented in Sprint 012 with HTTP-only opaque `emailorc_session` and server current-user helper. |
| Role normalization | Implemented in Sprint 012 with compatibility roles and fail-closed behavior. |
| `/api/auth/me` | Uses server-authenticated current-user behavior after Sprint 012. |
| Admin API guards | `app/api/admin/*` hardened in Sprint 013 with `super_admin` requirement. |
| Workflow/draft API guards | Sprint 014 target. |
| Brain/provider API guards | Future work. |
| Billing/usage/account API guards | Future work. |
| Page/middleware guards | Future work. |
| localStorage trust cleanup | Future work. |

## Sprint 014 Architecture Direction

Workflow/draft API routes should use layered server-side authorization:

1. Resolve current user from server session.
2. Return `401` if no valid current user exists.
3. Determine route-level organization scope from server current-user context and safe route parameters.
4. Return `403` if requested organization/resource context conflicts with current user authorization.
5. Continue existing route logic only after server authorization succeeds.

Client-side page state and localStorage may support UI display, but must not be authorization truth.

## Known Architecture Gaps

- Workflow/draft organization permission guards are not complete until Sprint 014 implementation is accepted.
- Brain/provider APIs need a future focused guard sprint.
- Billing/usage/account APIs need a future focused guard sprint if not already protected through admin route hardening.
- Middleware/page guard cleanup remains future work.
- Production data-store implementation is not approved yet.
- D1 `app_sessions` migration exists but remains unapplied.
- Production deployment path needs validation.
- Production readiness is not established.
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
- Safe local validation gate:
  - `npm run test`
  - `npm run lint`
  - `npm run test:e2e:safe`
  - `npm run build`

Sprint 014 should use the same validation gate unless implementation discovers a documented blocker.

## Existing Validation Assets

| Asset | Purpose | Notes |
|---|---|---|
| `tests/validation.test.ts` | Focused validation tests | Includes import validation, Campaign Board movement, auth/session, and admin API guard coverage after Sprint 013. |
| `tests/E2E_RUNBOOK.md` | Browser validation runbook | Documents safe Playwright command. |
| `playwright.config.ts` | E2E configuration | Safe subset should remain non-mutating. |
| `package.json` scripts | Validation command entry points | Lint is non-interactive after Sprint 007. |

## Sprint 014 Validation Focus

Sprint 014 validates one focused improvement:

1. Workflow/draft API routes use server-authenticated current-user organization permission guards.

## Sprint 014 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

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

## Sprint 014 Test Requirements

Focused tests should cover:

- missing/invalid session returns `401`
- authenticated user without organization permission returns `403`
- authorized user reaches existing successful route behavior
- request-supplied organization/user/role values are not trusted for authorization
- unknown sensitive roles fail closed where relevant

## Future Validation Areas

- Brain/provider API guard coverage.
- Billing/usage/account API guard coverage.
- Middleware/page guard behavior.
- localStorage cleanup validation.
- D1 session migration application validation.
- Production deployment readiness.
```

---

# File: planning/sprints/014-workflow-draft-organization-permission-guards/requirements.md

```markdown
# Sprint 014 Requirements — Workflow / Draft Organization Permission Guards

## Goal

Harden workflow and draft API routes so organization-scoped workflow data is protected by server-authenticated current-user/session authorization.

## Business Objective

Reduce production-readiness auth risk by ensuring workflow/draft APIs do not trust request-supplied organization, user, or role values for authorization.

## User / Operator Need

As the project owner, I need workflow and draft routes to enforce organization boundaries server-side before EmailORC can move closer to a production-ready auth model.

## In Scope

- Inspect workflow/draft API routes.
- Identify routes that expose or mutate organization-scoped workflow data.
- Apply the Sprint 012 current-user/session helper to approved workflow/draft API routes.
- Return `401` for missing/invalid sessions.
- Return `403` for authenticated users who are not authorized for the requested organization-scoped resource.
- Preserve successful route behavior where practical.
- Add focused tests.
- Update durable docs and planning files.

## Out of Scope

- Admin API guard work.
- Brain/provider API guard work.
- Billing/usage/account API guard work.
- Middleware rollout.
- Page guard rewrite.
- localStorage cleanup.
- Schema, migration, seed, database, env, deployment, sending, or live integration changes.
- Production-readiness claims.

## Requirements

1. Codex must list the exact workflow/draft routes in scope before implementation.
2. Touched workflow/draft routes must derive current user and organization context from the server session/current-user helper.
3. Touched workflow/draft routes must not trust client-provided organization/user/role fields for authorization.
4. Missing or invalid session must return `401`.
5. Authenticated but unauthorized organization/resource access must return `403`.
6. Authorized access must preserve current successful behavior where practical.
7. Tests must cover unauthenticated, forbidden, authorized, and fail-closed behavior.
8. Safe validation commands must pass or failures must be documented.
9. No out-of-scope files or commands may be touched or run.
```

---

# File: planning/sprints/014-workflow-draft-organization-permission-guards/blueprint.md

```markdown
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
```

---

# File: planning/sprints/014-workflow-draft-organization-permission-guards/acceptance.md

```markdown
# Sprint 014 Acceptance — Workflow / Draft Organization Permission Guards

## Acceptance Criteria

Sprint 014 is complete only when all applicable criteria are satisfied.

### Scope

- [ ] Exact workflow/draft route list was inspected and documented before implementation.
- [ ] Implementation stayed limited to approved workflow/draft API routes, optional small shared helper, focused tests, and closeout docs/planning.
- [ ] No admin API, Brain/provider API, billing/usage/account API, middleware, page guard, localStorage, schema, migration, env, deployment, sending, or live integration work was added.

### Auth Behavior

- [ ] Touched workflow/draft routes use the Sprint 012 server current-user/session foundation.
- [ ] Missing or invalid session returns `401`.
- [ ] Authenticated but unauthorized organization/resource access returns `403`.
- [ ] Authorized current user reaches existing successful route behavior where practical.
- [ ] Request-supplied organization/user/role values are not trusted for authorization.
- [ ] Unknown sensitive roles fail closed where relevant.

### Tests

- [ ] Focused tests cover unauthenticated access.
- [ ] Focused tests cover forbidden or wrong-organization access.
- [ ] Focused tests cover authorized access.
- [ ] Focused tests cover request-supplied identity not being trusted or equivalent fail-closed behavior.
- [ ] Tests are local-safe and do not require secrets or live services.

### Validation

- [ ] `git status --short` was run before and after.
- [ ] `npm run test` passed or any failure was documented with cause.
- [ ] `npm run lint` passed or any failure was documented with cause.
- [ ] `npm run test:e2e:safe` passed or any failure was documented with cause.
- [ ] `npm run build` passed or any failure was documented with cause.
- [ ] No migrations, seed commands, Prisma commands, D1 writes, deploy commands, Wrangler deploy, or secret-requiring commands were run.

### Documentation

- [ ] `planning/STATE.md` updated.
- [ ] `planning/RISKS.md` updated.
- [ ] `planning/QUESTIONS.md` updated.
- [ ] `docs/AUTH_SESSION.md` updated.
- [ ] `docs/API.md` updated.
- [ ] `docs/ARCHITECTURE.md` updated.
- [ ] `docs/VALIDATION.md` updated.
- [ ] `planning/DECISIONS.md` updated only if a new durable decision was made.
- [ ] Recommended Sprint 015 scope was reported.

## Not Complete If

- Workflow/draft routes still trust request-supplied org/user/role values for authorization.
- Auth failure semantics are inconsistent without explanation.
- Tests are missing for unauthenticated and forbidden cases.
- The sprint expands into middleware, page guards, localStorage cleanup, Brain/provider APIs, billing/usage/account APIs, schema, migrations, env, deployment, or production readiness.
- `prisma/dev.db` is intentionally touched.
```

---

# File: planning/sprints/014-workflow-draft-organization-permission-guards/handoff-prompt.md

```markdown
# Sprint 014 Handoff Prompt — Workflow / Draft Organization Permission Guards

Use this prompt with Codex after the Architect Pack has been applied to the project folder.

```text
You are working in:

/Users/Dmoney/Documents/development/apps/emailorc

Sprint 014 planning/docs have already been applied.

Before making any code or test changes, read these files:

- AGENTS.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/DOMAIN.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/VALIDATION.md
- planning/sprints/012-auth-session-server-current-user-foundation/requirements.md
- planning/sprints/012-auth-session-server-current-user-foundation/blueprint.md
- planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md
- planning/sprints/013-admin-api-server-side-guard-hardening/requirements.md
- planning/sprints/013-admin-api-server-side-guard-hardening/blueprint.md
- planning/sprints/013-admin-api-server-side-guard-hardening/acceptance.md
- planning/sprints/014-workflow-draft-organization-permission-guards/requirements.md
- planning/sprints/014-workflow-draft-organization-permission-guards/blueprint.md
- planning/sprints/014-workflow-draft-organization-permission-guards/acceptance.md

Then inspect, but do not modify yet:

- app/api/workflow/*
- app/api/drafts/*
- Sprint 012 current-user/session helpers
- Sprint 013 admin-auth helper for pattern reference only
- existing tests related to auth, sessions, roles, workflow routes, draft routes, and API route handlers

After reading and inspection, stop and summarize:

1. What Sprint 014 is supposed to accomplish.
2. Which workflow/draft API routes exist and which ones you believe are in scope.
3. Which routes currently trust request-supplied organization, user, role, or actor identity values.
4. Which files you expect to modify.
5. Whether you expect to add a small shared workflow/org auth helper.
6. Which tests you expect to add or update.
7. Which validation commands you expect to run.
8. Any blockers, ambiguities, or risks before implementation.
9. How you will avoid touching out-of-scope files, including prisma/dev.db, migrations, env files, deployment config, admin APIs, Brain/provider APIs, billing/usage/account APIs, middleware, page guards, package files, and localStorage cleanup.

Do not implement anything yet.
Do not edit code, tests, docs, package files, database files, migrations, env files, or deployment files until I approve your summary.
```
```
