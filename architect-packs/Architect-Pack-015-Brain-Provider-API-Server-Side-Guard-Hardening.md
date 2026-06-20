# Architect Pack 015 — Brain / Provider API Server-Side Guard Hardening

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `015-brain-provider-api-server-side-guard-hardening`  
**Created:** 2026-05-21  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 015 is the next controlled auth/session implementation sprint after Sprint 014.

Sprint 012 established the server current-user/session foundation.

Sprint 013 applied that foundation to the admin API surface.

Sprint 014 applied that foundation to workflow and draft API routes that expose organization-scoped campaign workflow data.

Sprint 015 applies the same foundation to Brain / provider API routes that expose or mutate organization-scoped AI provider settings, model settings, business knowledge, playbooks, learning logs, prompts, or related Brain Center configuration.

The goal is to stop Brain / provider API routes from trusting request-supplied organization, user, role, provider, or actor identity values for authorization and instead derive authorization context from the server-authenticated current user.

This sprint must not broaden into billing, usage, account-intelligence APIs, global middleware, page guards, localStorage cleanup, production readiness, database execution, deployment, sending, or live integrations.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Read Sprint 012, Sprint 013, and Sprint 014 output and updated durable docs.
- Inspect Brain / provider API routes that handle organization-scoped AI/provider configuration or Brain Center data.
- Identify which Brain / provider routes currently trust request-supplied `organization_id`, `organizationId`, `user_id`, `userId`, role, actor, provider, model owner, or similar identity/context values for authorization.
- Apply the Sprint 012 current-user/session helper to approved Brain / provider API routes.
- Enforce authenticated organization-scoped access for Brain / provider routes.
- Return consistent `401` when no valid server session exists.
- Return consistent `403` when a valid session exists but does not authorize access to the requested organization-scoped resource.
- Replace request-supplied actor/user/org authorization trust with server current-user context where local to touched Brain / provider routes.
- Use `currentUser.userId` for touched audit actor metadata where the route writes it.
- Preserve existing successful route behavior and response shapes after authorization succeeds where practical.
- Add or update focused tests for unauthenticated, wrong-organization, authorized-user, request-supplied identity not trusted, and fail-closed behavior.
- Update durable docs and planning files after implementation.
- Run safe validation commands.

### Approved Route Discovery Scope

Codex must inspect and report the exact route list before implementation.

Likely candidate areas include, but are not limited to:

- `app/api/brain/*`
- `app/api/openrouter/*`
- `app/api/provider/*`
- `app/api/providers/*`
- `app/api/model-settings/*`
- `app/api/settings/*` only where the route is clearly Brain/provider/model related
- any route physically under an existing Brain Center / AI provider API area

Codex may include other routes only if they are clearly Brain / provider API routes and clearly organization-scoped.

If a route is billing, usage, account-intelligence, workflow/draft, admin, page/middleware-related, or unrelated general settings, Codex must document it as future work and leave it out of Sprint 015.

### Conditional In Scope

If Brain / provider routes share authorization patterns, Codex may add a small shared helper such as:

- `src/lib/brain-auth.ts`
- `src/lib/provider-auth.ts`
- `src/lib/org-auth.ts`, only if not already present and only if it keeps route code smaller, clearer, and easier to test

If an existing Sprint 014 helper can be reused safely for organization-scoped authorization, Codex may reuse it rather than create a new helper, but it must keep Brain/provider semantics clear in docs and tests.

If tests need lightweight route-handler fixtures or mocks for current-user/session behavior, Codex may add them in the existing test structure.

### Out of Scope

- No admin API guard work except documentation references to Sprint 013.
- No workflow/draft API guard work except documentation references to Sprint 014.
- No billing, plan, usage, subscription, credit, or account-intelligence route hardening.
- No global middleware rollout.
- No `/mvp/*` page authorization rewrite.
- No Brain Center UI redesign.
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
- No Sprint 016 work.

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
  - `npm run test`
  - `npm run lint`
  - `npm run test:e2e:safe`
  - `npm run build`

Sprint 014 implemented workflow/draft organization permission guards:

- created `src/lib/workflow-auth.ts`
- guarded approved workflow/draft API routes
- returned `401` for missing/invalid sessions
- returned `403` for authenticated wrong-organization access
- used `currentUser.organizationId` as the organization authorization source
- used `currentUser.userId` for touched actor/user metadata where routes write it
- stopped trusting request-supplied org/user/role values for authorization
- passed validation:
  - `npm run test` with 31 tests
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
**Current phase:** Sprint 015 — Brain / Provider API Server-Side Guard Hardening

---

## Current Status

Sprint 014 is complete and accepted.

Sprint 014 applied the Sprint 012 auth/session foundation to workflow and draft API routes:

- approved workflow/draft routes now require a valid server session
- missing/invalid sessions return `401`
- authenticated wrong-organization access returns `403`
- touched routes derive organization authorization from `currentUser.organizationId`
- touched routes use `currentUser.userId` for actor/user metadata where they write it
- request-supplied org/user/role values are no longer trusted for authorization
- focused workflow/draft guard tests were added
- validation passed: `npm run test`, `npm run lint`, `npm run test:e2e:safe`, and `npm run build`

Sprint 015 is active and applies the server current-user/session foundation to Brain / provider API routes only.

Sprint 015 should enforce authenticated organization-scoped access for approved Brain / provider routes and stop those routes from trusting request-supplied organization/user/role/provider/actor values for authorization.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/015-brain-provider-api-server-side-guard-hardening/`

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
- Sprint 014 completed workflow/draft organization permission guards.

---

## Next Actions

1. Apply Architect Pack 015 to create Sprint 015 planning files.
2. Have Codex read Sprint 015 files and summarize the implementation plan before making changes.
3. Approve Codex implementation only after the summary is correct.
4. Inspect Brain / provider API routes and identify exact approved route list.
5. Apply authenticated organization-scoped authorization using the Sprint 012 current-user helper.
6. Add focused Brain / provider guard tests.
7. Run safe validation commands.
8. Report acceptance status and recommended Sprint 016.

---

## Blockers / Open Items

- Production readiness is not established.
- Sprint 012 D1 `app_sessions` migration is created but not applied.
- Brain / provider API guard hardening has not started until Sprint 015 implementation is complete.
- Billing/usage/account APIs remain future work unless already handled elsewhere.
- Page/middleware/localStorage cleanup has not started.
- Production mode remains a future target state only.
- Deployment target and production readiness remain unresolved.
- Dirty working tree existed before Sprint 015, including `prisma/dev.db`; avoid unrelated files.
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
| 2026-05-21 | Sprint 015 will harden only Brain / provider API organization permission guards. | Sprint 014 completed workflow/draft guard hardening; Brain/provider routes are the next focused organization-scoped route group. | Codex must not expand into billing, usage, account, middleware, page guards, localStorage cleanup, or production-readiness work. |
| 2026-05-21 | Brain / provider API authorization must derive organization and user context from the server-authenticated current-user helper. | Sprint 010 found request-controlled identity values were production blockers. | Brain/provider routes must not trust client-provided organization/user/role/provider/actor values for authorization. |
| 2026-05-21 | Brain / provider guards should return `401` for unauthenticated requests and `403` for authenticated users who are not authorized for the requested organization-scoped resource. | Clear auth failure semantics make future route hardening and tests consistent. | Tests should assert missing session, wrong-organization/forbidden, authorized behavior, and fail-closed behavior. |
| 2026-05-21 | Sprint 015 must not apply or modify the Sprint 012 D1 session migration. | Migration execution is a separate database operation and was intentionally deferred. | Codex must not run migrations, seed commands, D1 writes, Prisma commands, or deployment commands. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready after Brain/provider guard work. | Medium | High | Continue documenting EmailORC as MVP/demo-stage until full production readiness is validated. | Open |
| Sprint 015 expands into broad auth hardening. | Medium | High | Limit scope to approved Brain/provider API routes and focused tests only. | Active |
| Brain/provider API routes continue trusting request-supplied identity. | Medium | High | Replace authorization trust with Sprint 012 current-user helper and organization-scoped checks. | Active |
| Provider/model settings expose or mutate organization-sensitive configuration without server authorization. | Medium | High | Inspect provider/model/Brain Center routes and guard approved organization-scoped endpoints. | Active |
| Secrets or provider keys are exposed during implementation or tests. | Medium | High | Never print secret values; test authorization behavior with mocks or redacted fixtures only. | Active |
| Organization scoping is inconsistent across Brain/provider routes. | Medium | High | Inspect each route before implementation and document route-level assumptions. | Active |
| Some Brain-like routes live outside obvious Brain/provider paths. | Medium | Medium | Document them as future work unless clearly approved as Brain/provider API scope. | Active |
| New guards break existing demo Brain Center flows. | Medium | Medium | Use focused tests and preserve successful authorized route behavior after auth passes. | Active |
| Session migration remains unapplied in D1 environments. | High | Medium | Keep visible as a blocker for D1-backed login sessions; do not apply migration in Sprint 015. | Open |
| Billing/usage/account APIs remain unprotected after Sprint 015. | Medium | High | Carry as known risk for future focused guard sprint. | Open |
| Middleware/page guards remain client-heavy after Sprint 015. | High | Medium | Carry as known risk for a later page/middleware/localStorage cleanup sprint. | Open |
| Dirty worktree causes accidental unrelated changes. | Medium | Medium | Check `git status --short` before and after; avoid unrelated runtime/package/database files. | Active |
| `prisma/dev.db` is touched or committed accidentally. | Medium | Medium | Do not run mutating database/Prisma commands; do not touch `prisma/dev.db`. | Active |
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
| Which exact Brain/provider routes are present in the repo? | Builder | Sprint 015 | Active | Codex should inspect and list routes before implementation. |
| Which Brain/provider routes expose provider keys, model settings, business knowledge, playbooks, learning logs, or prompt configuration? | Builder | Sprint 015 | Active | Codex should classify route sensitivity and scope before implementation. |
| Do any Brain/provider-like APIs live outside obvious Brain/provider route folders? | Builder/Architect | Sprint 015 or future API inventory | Active | Sprint 015 should document but not broaden unless the route is clearly part of the approved Brain/provider API surface. |
| Should billing/usage/account APIs be hardened in Sprint 016? | Architect/Owner | Sprint 016 planning | Open | Recommended next focused guard group after Brain/provider, unless page/middleware cleanup is prioritized. |
| When should middleware/page/localStorage cleanup happen? | Architect/Builder | Future page/session sprint | Open | Recommended after high-risk API route groups are guarded. |
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
- server current-user/session helper
- HTTP-only session cookie support
- login session creation
- logout session clearing
- `/api/auth/me` server-authenticated current-user behavior

Sprint 013 applied the foundation to admin API routes.

Sprint 014 applied the foundation to workflow/draft API routes.

Sprint 015 applies the foundation to Brain / provider API routes.

EmailORC remains MVP/demo-stage. Sprint 015 does not make the app production-ready.

---

## Current Target Direction

| Area | Direction |
|---|---|
| Session mechanism | Server-issued HTTP-only opaque session cookie backed by server-side lookup. |
| Deployed source of truth | D1 for auth/session/user/membership direction. |
| Local fallback | Prisma/SQLite only for local development and transition support where explicitly documented. |
| Role enforcement | Normalize aliases into canonical roles before checking permissions. |
| Unknown sensitive roles | Fail closed. |
| localStorage | UX/display/navigation hints only; not authorization truth. |
| API authorization | Derive organization/user/role from server-authenticated current-user context. |

---

## Guarded API Progress

| Route group | Status | Notes |
|---|---|---|
| `/api/auth/me` | Guarded in Sprint 012 | Uses server-authenticated current-user/session helper. |
| `app/api/admin/*` | Guarded in Sprint 013 | Requires canonical `super_admin`. |
| workflow/draft APIs | Guarded in Sprint 014 | Requires valid server session and organization-scoped authorization. |
| Brain/provider APIs | Sprint 015 target | Must use server current-user context and organization-scoped authorization. |
| billing/usage/account APIs | Future work | Not in Sprint 015 unless physically and clearly Brain/provider-scoped. |
| page/middleware/localStorage cleanup | Future work | Client-side guards remain UX aids only. |

---

## Sprint 015 Brain / Provider Guard Contract

Sprint 015 should establish for approved Brain/provider routes:

| Contract | Requirement |
|---|---|
| Missing or invalid session | Return `401`. |
| Valid session but unauthorized organization scope | Return `403`. |
| Organization source | Use `currentUser.organizationId`, not request-supplied org identity, for authorization. |
| User/actor source | Use `currentUser.userId` for touched actor metadata where routes write it. |
| Role source | Use `currentUser.role`, not body/query role values, where role checks are needed. |
| Provider/model context | Treat request values as requested resource/config inputs only, not authorization truth. |
| Secrets/provider keys | Never print or expose secret values in logs, docs, tests, or responses. |
| Unknown sensitive roles | Fail closed. |

---

## Known Remaining Auth Work After Sprint 015

- Billing/usage/account API guard hardening.
- Account-intelligence route guard hardening, if not covered by billing/account sprint.
- Page/middleware/localStorage cleanup.
- Production session storage deployment path and Sprint 012 D1 session migration application.
- Production-readiness validation.
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API route behavior and guard expectations.

EmailORC remains MVP/demo-stage and is not production-ready.

API authorization should derive user, organization, and role from a server-authenticated current-user context. Request-supplied identity values must not be trusted for authorization.

---

## Auth Guard Progress

| API group | Guard status | Notes |
|---|---|---|
| `/api/auth/me` | Guarded in Sprint 012 | Uses server current-user/session helper. |
| `app/api/admin/*` | Guarded in Sprint 013 | Requires canonical `super_admin`; returns `401`/`403` consistently. |
| Workflow/draft APIs | Guarded in Sprint 014 | Requires valid session and organization-scoped authorization. |
| Brain/provider APIs | Sprint 015 target | Must be inspected and guarded where organization-scoped. |
| Billing/usage/account APIs | Future work | Not included in Sprint 015 unless clearly part of Brain/provider route surface. |

---

## Brain / Provider API Areas

Sprint 015 should inspect current Brain/provider API route files and document the exact approved route list before implementation.

Candidate areas include:

| Candidate area | Reason to inspect | Sprint 015 treatment |
|---|---|---|
| `app/api/brain/*` | Brain Center configuration, knowledge, playbooks, learning logs, prompt/model behavior. | Include if organization-scoped Brain/provider data is read or mutated. |
| `app/api/openrouter/*` | Provider/model settings and OpenRouter-related behavior. | Include if organization-scoped provider settings or keys are read or mutated. |
| `app/api/provider/*` or `app/api/providers/*` | Provider configuration. | Include if organization-scoped. |
| `app/api/model-settings/*` | Model/provider settings. | Include if organization-scoped. |
| Brain/provider-related settings routes | Possible configuration routes outside obvious folders. | Include only if clearly Brain/provider API scope. |

Sprint 015 must leave out billing, usage, account-intelligence, admin, workflow/draft, page, middleware, and unrelated settings routes.

---

## Sprint 015 Expected Guard Semantics

Approved Brain/provider routes should:

- return `401` when no valid server session exists
- return `403` when the current user is authenticated but not authorized for the requested organization-scoped resource
- derive organization/user/role authorization from the Sprint 012 current-user helper
- stop trusting request-supplied organization, user, role, provider-owner, or actor values for authorization
- preserve existing successful response shapes where practical
- avoid exposing provider keys or secret values

---

## Known Workflow / Draft API Contract From Sprint 014

Sprint 014 guarded:

- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- `app/api/workflow/drafts/route.ts`
- `app/api/workflow/export/route.ts`
- `app/api/drafts/approve/route.ts`

Those routes now use server current-user organization context for authorization and no longer trust request-supplied identity fields for authorization.

---

## API Documentation Gaps

Future API documentation should capture for each route:

- Method
- Path
- Request shape
- Response shape
- Auth/session expectation
- Data source
- Validation rules
- Error states
- Environment-mode behavior
- Whether request-supplied identity is ignored, compared as requested scope, or still present only for backward-compatible non-auth behavior
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
- Server current-user/session foundation exists from Sprint 012.
- Admin API guard hardening was completed in Sprint 013.
- Workflow/draft API organization permission guard hardening was completed in Sprint 014.
- Brain/provider API guard hardening is the target of Sprint 015.

---

## System Components

| Component | Location | Purpose |
|---|---|---|
| Next.js App Router | `app/` | Pages and API routes. |
| API routes | `app/api/` | Auth, workflow import/export, drafts, admin, billing, brain/OpenRouter, usage, account intelligence. |
| MVP UI | `app/mvp/` | Main screens for upload, records, drafts, campaigns, export, admin, integrations, reply, brain center, settings. |
| Shared source | `src/` | Components, domain types, validation utilities, auth/billing helpers, email invite helper, orchestration services. |
| Auth/session helpers | `src/lib/` | Server current-user/session helper and route-group guard helpers. |
| Local data | `prisma/` | Prisma schema, local SQLite dev database, seed/migration assets. |
| Deployed/demo data | `d1/` | Cloudflare D1 migrations and demo seed data. |
| Tests | `tests/` | Vitest, Playwright, fixtures, manual QA, bug docs, E2E runbook. |
| Cloudflare config | `wrangler.jsonc` | Worker/D1/assets/service binding and environment-mode configuration. |

---

## Auth / API Guard Architecture

Target architecture:

1. Browser localStorage may support display/navigation hints only.
2. Sensitive API authorization must use server-authenticated current-user context.
3. Route groups should use small focused guard helpers where helpful.
4. Sensitive routes should return clear `401`/`403` auth failures.
5. Unknown sensitive roles should fail closed.
6. Provider keys and secret values must never be exposed.

---

## Guarded Route Groups

| Route group | Status | Architecture note |
|---|---|---|
| Auth current user | Completed in Sprint 012 | `/api/auth/me` resolves from server session. |
| Admin APIs | Completed in Sprint 013 | Requires canonical `super_admin`. |
| Workflow/draft APIs | Completed in Sprint 014 | Requires authenticated organization-scoped access. |
| Brain/provider APIs | Sprint 015 target | Should require authenticated organization-scoped access. |
| Billing/usage/account APIs | Future work | Should be hardened in a separate focused sprint. |
| Middleware/page guards/localStorage cleanup | Future work | Should happen after key API route groups are guarded. |

---

## Known Architecture Gaps After Sprint 015 Planning

- Brain/provider API guard implementation has not started until Sprint 015 is applied and implemented.
- Billing/usage/account APIs still need a future focused guard sprint.
- Page/middleware/localStorage cleanup remains future work.
- Sprint 012 D1 session migration remains unapplied.
- Production session storage deployment path remains unresolved.
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
- Existing React hook warnings may appear during lint/build and should remain visible until addressed by a future focused cleanup sprint.

---

## Sprint 015 Validation Focus

Sprint 015 validates one focused improvement:

1. Approved Brain/provider API routes require server-authenticated organization-scoped authorization.

---

## Sprint 015 Required Validation

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
- D1 writes
- deploy commands
- Wrangler deploy
- commands that write to live services
- commands that require secret values
- commands that enable sending or integrations

---

## Sprint 015 Required Test Coverage

Focused tests should cover approved Brain/provider route behavior:

- unauthenticated request returns `401`
- authenticated wrong-organization request returns `403`
- authorized current-user request reaches existing successful behavior where practical
- request-supplied organization/user/role/provider/actor identity is not trusted for authorization
- unknown sensitive role fails closed where relevant
- provider keys or secret values are not exposed by auth failures or test output

---

## Future Validation Areas

- Billing/usage/account API guard validation.
- Page/middleware/localStorage cleanup validation.
- Production session storage and D1 `app_sessions` migration application validation.
- Production-readiness validation.
- Provider key redaction and secret-handling validation.
```

---

# File: planning/sprints/015-brain-provider-api-server-side-guard-hardening/requirements.md

```markdown
# Sprint 015 Requirements — Brain / Provider API Server-Side Guard Hardening

## Goal

Harden Brain / provider API routes so organization-scoped AI/provider configuration and Brain Center data are protected by server-authenticated current-user/session authorization.

## Background

Sprint 012 created the server current-user/session foundation.

Sprint 013 applied it to admin APIs.

Sprint 014 applied it to workflow/draft APIs.

Sprint 015 applies the same pattern to Brain / provider API routes.

## Requirements

1. Codex must inspect Brain/provider route files and document the exact approved route list before implementation.
2. Approved Brain/provider routes must use the Sprint 012 current-user/session helper.
3. Approved Brain/provider routes must return `401` when no valid server session exists.
4. Approved Brain/provider routes must return `403` when the authenticated current user is not authorized for the requested organization-scoped resource.
5. Approved Brain/provider routes must derive organization, user, and role authorization from server current-user context.
6. Approved Brain/provider routes must not trust request-supplied organization/user/role/provider/actor values for authorization.
7. Request-supplied organization may be treated only as a requested scope to compare against `currentUser.organizationId`.
8. Provider/model values may be treated as requested configuration/resource values, not authorization truth.
9. Provider keys and secret values must not be exposed in logs, docs, test output, or responses.
10. Existing successful route behavior and response shapes should be preserved where practical after authorization passes.
11. Focused tests must cover unauthenticated, wrong-organization, authorized, request-supplied identity, and fail-closed behavior.
12. Closeout docs and planning files must be updated.
13. Validation must pass using the current safe local validation gate.

## Non-Goals

- No billing/usage/account API guard hardening.
- No workflow/draft API guard hardening.
- No admin API guard hardening.
- No global middleware rollout.
- No page guard rewrite.
- No localStorage cleanup.
- No UI redesign.
- No schema changes.
- No migrations.
- No database commands.
- No env or deployment changes.
- No sending or live integrations.
- No production-readiness claim.
```

---

# File: planning/sprints/015-brain-provider-api-server-side-guard-hardening/blueprint.md

```markdown
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
```

---

# File: planning/sprints/015-brain-provider-api-server-side-guard-hardening/acceptance.md

```markdown
# Sprint 015 Acceptance — Brain / Provider API Server-Side Guard Hardening

Sprint 015 is complete only when all applicable criteria below are satisfied.

## Scope Acceptance

- [ ] Exact Brain/provider route list was inspected and documented.
- [ ] Exact approved Sprint 015 route list was documented before implementation.
- [ ] Implementation stayed limited to approved Brain/provider API routes, optional small helper, focused tests, and closeout docs/planning.
- [ ] No billing/usage/account APIs were modified.
- [ ] No workflow/draft APIs were modified except documentation references.
- [ ] No admin APIs were modified except documentation references.
- [ ] No middleware, page guard, or localStorage cleanup was implemented.
- [ ] No schema, migration, seed, env, deployment, Prisma, D1, Wrangler, sending, or live integration work occurred.
- [ ] `prisma/dev.db` was not intentionally touched.

## Behavior Acceptance

- [ ] Approved Brain/provider routes use the Sprint 012 server current-user/session helper.
- [ ] Missing/invalid server session returns `401`.
- [ ] Authenticated wrong-organization access returns `403` where an organization scope is requested or required.
- [ ] Authorized current-user requests reach existing successful route behavior where practical.
- [ ] Request-supplied organization/user/role/provider/actor values are not trusted for authorization.
- [ ] Request-supplied organization values, if accepted, are treated only as requested scope compared to `currentUser.organizationId`.
- [ ] `currentUser.userId` is used for touched actor/user metadata where routes write it.
- [ ] Provider/model values remain resource/configuration inputs, not authorization truth.
- [ ] Unknown sensitive roles fail closed where relevant.
- [ ] Provider keys and secret values are not exposed in logs, docs, tests, or responses.

## Test Acceptance

- [ ] Focused tests cover unauthenticated `401` behavior.
- [ ] Focused tests cover wrong-organization or forbidden `403` behavior.
- [ ] Focused tests cover authorized successful behavior where practical.
- [ ] Focused tests cover request-supplied identity not being trusted for authorization.
- [ ] Focused tests cover fail-closed behavior where relevant.
- [ ] Tests do not require live credentials or expose secret values.

## Documentation Acceptance

- [ ] `planning/STATE.md` reflects Sprint 015 completion status after implementation.
- [ ] `planning/RISKS.md` reflects any new or reduced Brain/provider guard risks.
- [ ] `planning/QUESTIONS.md` captures remaining open questions.
- [ ] `docs/AUTH_SESSION.md` reflects Brain/provider guard status.
- [ ] `docs/API.md` documents approved Brain/provider route guard behavior.
- [ ] `docs/ARCHITECTURE.md` reflects updated auth/API guard architecture.
- [ ] `docs/VALIDATION.md` reflects Sprint 015 validation coverage and commands.
- [ ] `planning/DECISIONS.md` is updated only if a new durable decision was made.

## Validation Acceptance

- [ ] `git status --short` was run before and after.
- [ ] `npm run test` passed.
- [ ] `npm run lint` passed or existing known warnings were documented.
- [ ] `npm run test:e2e:safe` passed.
- [ ] `npm run build` passed or any failure was clearly documented with cause and follow-up.
- [ ] No migration, seed, Prisma, D1 write, Wrangler/deploy, env, secret-requiring, sending, or live integration command was run.

## Completion Report Acceptance

Completion report must include:

1. Exact routes inspected.
2. Exact routes modified.
3. How each modified route derives authorization from server current-user context.
4. Which request-supplied identity/config fields are no longer trusted for authorization.
5. Tests added or updated.
6. Validation results.
7. Files changed.
8. Any incomplete acceptance criteria or follow-up work.
9. Confirmation that protected files/areas were not touched.
```

---

# File: planning/sprints/015-brain-provider-api-server-side-guard-hardening/handoff-prompt.md

```markdown
# Sprint 015 Handoff Prompt — Brain / Provider API Server-Side Guard Hardening

Read the following files before making changes:

- AGENTS.md
- planning/STATE.md
- planning/DECISIONS.md
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
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/requirements.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/blueprint.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/acceptance.md

Then summarize before making changes:

1. What Sprint 015 is supposed to accomplish.
2. The exact Brain/provider API routes you expect to inspect.
3. The exact files you expect to modify.
4. The tests or validation steps you expect to run.
5. Any blockers, ambiguities, or scope risks.

Do not start implementation until I approve your summary.

Stay strictly inside Sprint 015.

Approved scope:

- Brain/provider API server-side guard hardening
- server-authenticated current-user context
- organization-scoped authorization
- `401` for missing/invalid session
- `403` for authenticated but unauthorized organization access
- focused tests
- docs/planning updates after implementation

Do not modify:

- admin APIs
- workflow/draft APIs
- billing/usage/account APIs
- global middleware
- page guards
- localStorage cleanup
- schemas
- migrations
- seed data
- env files
- deployment config
- `prisma/dev.db`

Do not run:

- migrations
- seed commands
- Prisma commands
- D1 writes
- Wrangler/deploy commands
- anything requiring secrets
- sending or live integration commands

Also confirm that you will not expose provider keys or secret values.
```

---

## Codex Apply-Pack Prompt

Use this prompt first to apply the Architect Pack to the project folder.

```text
Apply Architect Pack 015 as a planning/docs-only step.

Create or update the files listed in the pack:

- planning/STATE.md
- planning/DECISIONS.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/VALIDATION.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/requirements.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/blueprint.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/acceptance.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/handoff-prompt.md

Rules:

- This is planning/docs only.
- Do not inspect Brain/provider route code yet.
- Do not implement Sprint 015 yet.
- Do not modify runtime/source/test/package/db/deploy/env files.
- Do not touch `prisma/dev.db`.
- Do not run migrations, seed commands, Prisma commands, D1 writes, Wrangler/deploy commands, or anything requiring secrets.
- Preserve existing dirty worktree entries as unrelated unless the pack explicitly updates that file.

After applying the pack, report:

1. Files created.
2. Files updated.
3. Files skipped and why.
4. Any assumptions.
5. Confirm that no runtime/source implementation started.
```

---

## Next Prompt After Pack Is Applied

Use this only after Codex applies the Architect Pack.

```text
Read the following files before making changes:

- AGENTS.md
- planning/STATE.md
- planning/DECISIONS.md
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
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/requirements.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/blueprint.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/acceptance.md

Then summarize:

1. What Sprint 015 is supposed to accomplish.
2. The exact Brain/provider API routes you expect to inspect.
3. The exact files you expect to modify.
4. The tests or validation steps you expect to run.
5. Any blockers, ambiguities, or scope risks.

Do not start implementation until I approve your summary.

Stay strictly inside Sprint 015.

Do not modify runtime/source/test/package/db/deploy/env files until I approve your summary.

Confirm that you will not touch `prisma/dev.db`, schemas, migrations, seed data, env files, deployment config, admin APIs, workflow/draft APIs, billing/usage/account APIs, middleware, page guards, localStorage cleanup, sending, live integrations, or provider secrets.
```
