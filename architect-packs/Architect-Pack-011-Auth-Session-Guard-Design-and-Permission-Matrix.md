# Architect Pack 011 — Auth / Session Guard Design and Permission Matrix

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `011-auth-session-guard-design-and-permission-matrix`  
**Created:** 2026-05-21  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 011 is a focused design and documentation sprint for EmailORC auth/session hardening.

Sprint 010 completed an auth/session readiness audit and found that EmailORC is not production-auth-ready. The current app relies heavily on browser `localStorage`, client-side page guards, request-supplied user/org/role values, demo fallback identities, and inconsistent API-level enforcement.

Sprint 011 should not implement auth/session changes yet.

The goal is to design the approved auth/session guard model before any code changes happen. The output should give future Builder sessions a clear permission matrix, session strategy, server current-user contract, page guard strategy, API guard strategy, middleware boundary plan, environment-mode auth rules, fallback policy, validation plan, and implementation sequencing.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Read Sprint 010 audit report and updated auth/session documentation.
- Define the target auth/session design for future implementation.
- Define the server-side current-user/session contract.
- Define the permission matrix for known roles, pages, and API route groups.
- Define page guard strategy separately from API guard strategy.
- Define middleware boundary expectations.
- Define how auth/session rules differ across:
  - `demo`
  - `test-live`
  - `production`
- Define Prisma local fallback policy for auth/session paths.
- Define how D1 should be treated for deployed auth/session source-of-truth direction.
- Define what localStorage may and may not be trusted for.
- Define validation gates future implementation must pass.
- Define Sprint 012 implementation boundaries.
- Update durable planning and documentation files.
- Create Sprint 011 sprint files.

### Out of Scope

- No auth/session implementation changes.
- No login redesign implementation.
- No middleware implementation.
- No server current-user helper implementation.
- No API route guard implementation.
- No page guard implementation.
- No UI behavior changes.
- No API behavior changes.
- No schema changes.
- No Prisma schema edits.
- No D1 migration edits.
- No new migrations.
- No seed/demo data edits.
- No database writes.
- No env file edits.
- No deployment config changes.
- No Wrangler deploy.
- No Cloudflare D1 write commands.
- No sending enablement.
- No live CRM/email integration enablement.
- No Brain Center/provider behavior changes.
- No production-readiness claim.
- No intentional changes to `prisma/dev.db`.
- No secrets inspection or exposure.
- No direct Sprint 012 implementation.

---

## Source Facts From Prior Sprints

Sprint 001 established EmailORC as an MVP/demo-stage review-and-export email workflow app.

Sprint 003 fixed two P1 demo blockers:

- `/mvp/admin` is Super Admin-only.
- Draft approval requires QA score >= 90.

Sprint 006 established a non-mutating Playwright validation path.

Sprint 007 made lint non-interactive.

Sprint 008 reconciled Prisma / SQLite and Cloudflare D1 data-model direction:

- D1 is the planning direction for deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support unless a future approved sprint changes that.

Sprint 009 defined environment modes:

- `demo` is safe seeded/resettable sample-data mode.
- `test-live` is canonical controlled pre-production live-like validation mode.
- `live-test` is legacy/non-canonical wording.
- `production` is a future target state only.
- Production readiness is not established.

Sprint 010 audited auth/session readiness and found:

- EmailORC currently identifies users through login/signup responses stored in browser `localStorage`.
- No server-issued app session cookie, JWT, bearer-token authorization layer, or middleware-enforced session boundary was found.
- D1 users/memberships are used for login/signup/invite and `/api/auth/me` when DB exists.
- Prisma remains a local fallback in some auth/admin paths.
- `/mvp/*` page access is guarded client-side through `Shell`, `Sidebar`, `Header`, and localStorage role checks.
- `/mvp/admin` has a client-side Super Admin redirect/block, but not server-authoritative protection.
- Server-authoritative checks exist for login password validation and invite token validation.
- Partial checks exist for `/api/auth/me`, draft approval, and production environment transition.
- Many admin/workflow/brain/account/billing routes do not verify a server-authenticated principal before reading or mutating data.
- Production blockers include no durable server session, no middleware boundary, client-side-only page guards, request-controlled `organization_id` / `user_id` / role values, admin APIs without consistent Super Admin enforcement, and demo/local fallback identities.

Sprint 010 validation found:

- `npm run test` passed with 15 tests.
- `npm run lint` passed with existing React hook warnings.
- `npm run test:e2e:safe` passed with 2 tests.
- `npm run build` failed after compile during page data collection with `PageNotFoundError: Cannot find module for page: /_document`.

Known persistent rules:

- EmailORC remains MVP/demo-stage.
- Human review remains required.
- Auto-send remains disabled.
- Live CRM/email integrations remain disabled.
- Secrets must never be exposed.
- `prisma/dev.db` must not be intentionally touched.
- Production readiness is not established.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-21  
**Current phase:** Sprint 011 — Auth / Session Guard Design and Permission Matrix

---

## Current Status

Sprint 010 is complete and accepted.

Sprint 010 audited EmailORC auth/session readiness and found that production-auth readiness is not established.

Key findings:

- Current user identity is primarily trusted from browser `localStorage`.
- No durable server-issued app session boundary was found.
- `/mvp/*` page guards are mostly client-side.
- `/mvp/admin` is client-blocked for non-Super Admin users, but not server-authoritative.
- Many API routes trust request-supplied `organization_id`, `user_id`, or role context.
- Admin, workflow, Brain, billing, usage, and account-related APIs need a consistent server-authenticated principal and permission matrix.
- Demo fallback identities such as `org_demo` and `user_super_admin` remain production blockers.

Sprint 011 is active and will design the auth/session guard model and permission matrix before implementation.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/011-auth-session-guard-design-and-permission-matrix/`

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

---

## Next Actions

1. Apply Architect Pack 011 to create Sprint 011 planning files.
2. Have Codex read Sprint 011 files and summarize the design/documentation plan before making changes.
3. Approve Codex design work only after the summary is correct.
4. Use Sprint 010 findings to design:
   - session mechanism
   - current-user helper contract
   - permission matrix
   - page guard strategy
   - API guard strategy
   - middleware boundary
   - environment-specific auth rules
   - Prisma fallback policy
   - Sprint 012 implementation sequence
5. Update durable docs and planning files.
6. Run safe validation commands.
7. Report acceptance status and recommended Sprint 012.

---

## Blockers / Open Items

- Production readiness is not established.
- Auth/session implementation has not started.
- Production mode remains a future target state only.
- Environment normalization implementation has not started.
- Production data-store implementation has not started.
- Deployment target and production readiness remain unresolved.
- `npm run build` failed in Sprint 010 with `PageNotFoundError: Cannot find module for page: /_document`; this must remain visible as a validation risk until resolved.
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
| 2026-05-21 | Sprint 011 is an auth/session guard design and permission matrix sprint only. | Sprint 010 identified production-auth blockers that require architecture decisions before implementation. | Codex must not change runtime auth behavior, UI behavior, API behavior, middleware, schema, env, deployment, or data files during Sprint 011. |
| 2026-05-21 | Auth/session implementation must not begin until the session mechanism and permission matrix are documented. | Current auth behavior is mixed across localStorage, D1, Prisma fallback, request bodies, and client-side guards. | Sprint 012 or later implementation must build from Sprint 011 design artifacts. |
| 2026-05-21 | Client-side page guards are UX aids only and must not be treated as production security boundaries. | Sprint 010 found page guards are primarily localStorage/client-side. | Sensitive API and admin behavior must be protected server-side in future implementation. |
| 2026-05-21 | API authorization should derive organization, user, and role from a server-authenticated current-user context, not from request-controlled values. | Sprint 010 found request-supplied `organization_id`, `user_id`, and role values are production blockers. | Future route guards should not trust client-provided identity/role fields for authorization. |
| 2026-05-21 | Production auth readiness requires an explicit middleware and server-helper boundary. | Sprint 010 found no durable server-issued app session or middleware-enforced session boundary. | Future implementation must define where unauthenticated users are blocked and how API routes resolve current user. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Auth/session model is demo-style, mixed, or not production-ready. | High | High | Sprint 011 designs the target guard model and permission matrix before implementation. | Active |
| Builder implements auth changes during design sprint. | Medium | High | Sprint 011 explicitly forbids runtime, API, middleware, UI, schema, config, and deployment changes. | Active |
| Permission model is too broad or overbuilt. | Medium | Medium | Keep roles tied to current EmailORC surfaces and production-readiness blockers only. | Active |
| Middleware boundary breaks demo flow if implemented too aggressively later. | Medium | Medium | Sprint 011 should define environment-specific behavior and implementation sequence before code changes. | Active |
| API guard strategy overlooks route groups outside workflow/admin. | Medium | High | Sprint 011 must map known route groups from Sprint 010 and classify required access. | Active |
| localStorage identity remains trusted in future sensitive paths. | High | High | Document localStorage as display/UX state only, not an authorization source. | Active |
| Prisma fallback role conflicts with D1 deployed source-of-truth direction. | Medium | Medium | Sprint 011 must define local fallback policy without implementing data changes. | Active |
| `npm run build` remains failing after Sprint 010. | Medium | Medium | Carry forward as a validation risk; do not fix in Sprint 011 unless owner explicitly changes scope. | Open |
| Secrets or credentials are exposed during design review. | Low | High | Inspect names and contracts only; never print secret values. | Open |
| `prisma/dev.db` is touched or committed accidentally. | Medium | Medium | Verify git status before and after; do not run mutating Prisma commands. | Open |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep auto-send and live integrations disabled unless an approved future sprint changes them. | Open |
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
| Which session mechanism should be implemented first? | Architect/Builder | Sprint 011 | Active | Sprint 011 should recommend the simplest server-authenticated session approach that fits current stack. |
| Which roles should exist in the first production-ready permission matrix? | Architect/Builder | Sprint 011 | Active | Sprint 010 found Super Admin, Client Admin, demo/local fallback identities, and user-like paths. |
| Which route groups require Super Admin, organization admin, authenticated user, or public access? | Builder/Architect | Sprint 011 | Active | Sprint 011 should define a route-group permission matrix. |
| Should demo mode allow seeded demo login without production-grade auth? | Owner/Architect | Sprint 011 | Active | Must be separated from test-live and production behavior. |
| Should Prisma remain an auth fallback in local development? | Architect/Builder | Sprint 011 | Active | Sprint 011 should define fallback policy without changing code. |
| Should the Sprint 010 build failure become Sprint 012, or stay separate from auth/session implementation? | Architect/Owner | Sprint 011 or Sprint 012 planning | Active | `npm run build` failed with `PageNotFoundError: Cannot find module for page: /_document`. |
| What auth/session validation gate is required before production mode can be considered? | Architect/Builder | Sprint 011 | Active | Sprint 011 should define required tests and manual checks for future implementation. |
```

---

# File: docs/ARCHITECTURE.md

```markdown
# Architecture

## Overview

EmailORC is an existing Next.js email campaign/workflow MVP.

It supports CSV/contact/account import, validation, draft review, draft approval, export, admin/settings areas, Brain Center configuration, environment-mode handling, local development data files, Cloudflare D1 deployment/demo data, and auth/session behavior that is not production-ready.

Current status:

- MVP/demo-stage.
- Not confirmed production-ready.
- Human approval required.
- Auto-send disabled.
- Live CRM/email integrations disabled.
- D1 is the planning direction for deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support only.
- Sprint 010 found auth/session readiness is not established.
- Sprint 011 designs the target auth/session guard model before implementation.

## System Components

| Component | Location | Purpose |
|---|---|---|
| Next.js App Router | `app/` | Pages and API routes. |
| API routes | `app/api/` | Auth, workflow import/export, drafts, admin, billing, brain/OpenRouter, usage, account intelligence. |
| MVP UI | `app/mvp/` | Main screens for upload, records, drafts, campaigns, export, admin, integrations, reply, brain center, settings. |
| Shared source | `src/` | Components, domain types, validation utilities, auth/billing helpers, email invite helper, orchestration services. |
| Local data | `prisma/` | Prisma schema, local SQLite dev database, seed/migration assets. |
| Deployed/demo data | `d1/` | Cloudflare D1 migrations and demo seed data. |
| Tests | `tests/` | Vitest, Playwright, fixtures, manual QA, bug docs, E2E runbook. |
| Cloudflare config | `wrangler.jsonc` | Worker/D1/assets/service binding and environment-mode configuration. |

## Auth / Session Current State

Sprint 010 found:

| Area | Current Status |
|---|---|
| User identity | Primarily stored and trusted from browser `localStorage` after login/signup. |
| Server session | No durable server-issued app session cookie, JWT, bearer-token authorization layer, or middleware boundary found. |
| D1 auth data | Used for login/signup/invite and `/api/auth/me` when DB exists. |
| Prisma auth data | Used as local fallback in some auth/admin paths. |
| Page guards | Mostly client-side through Shell/Sidebar/Header/localStorage role checks. |
| Admin page guard | `/mvp/admin` blocks/redirects non-Super Admin client-side, but not as a full server-authoritative boundary. |
| API guards | Mixed; login/invite are authoritative, many other routes do not verify a server-authenticated principal. |
| Production readiness | Not established. |

## Target Auth / Session Design Areas

Sprint 011 should define:

| Design Area | Required Output |
|---|---|
| Session mechanism | How a server-authenticated app session should be represented. |
| Current-user helper | How API routes and server-side boundaries resolve the authenticated user. |
| Permission matrix | Which roles can access each page and API route group. |
| Page guard strategy | How UI redirects/blocks users without treating client checks as security. |
| API guard strategy | How sensitive APIs enforce organization/user/role authorization server-side. |
| Middleware boundary | Which routes require auth before page/API code executes. |
| Environment rules | How demo, test-live, and production auth/session behavior differ. |
| Fallback policy | What Prisma/local/demo fallback behavior is allowed and where. |
| Validation strategy | What tests prove auth/session guard behavior later. |

## Known Architecture Gaps

- Auth/session guard model is not implemented.
- Permission matrix is not yet durable until Sprint 011 is complete.
- Environment normalization implementation has not started.
- Production data-store implementation is not approved yet.
- Production deployment path needs validation.
- Production readiness is not established.
- `npm run build` failed during Sprint 010 and remains a validation risk.
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes and app-contract behavior from existing audits and follow-up sprints.

Sprint 010 found that API access control is mixed and not production-ready.

Sprint 011 should define the target API guard strategy and permission matrix without changing API behavior.

Do not treat this as a complete route-by-route production contract until a future API inventory or implementation sprint applies the guard model.

## Auth / Session Current Findings

| Area | Sprint 010 Finding |
|---|---|
| Login / signup | Server-side password and invite validation exist. |
| Session source | Browser `localStorage` is the main current identity store after login/signup. |
| Current-user lookup | `/api/auth/me` can use D1 when DB exists, but production session boundary is not established. |
| Route identity trust | Many routes trust request-supplied `organization_id`, `user_id`, or role context. |
| Admin APIs | No consistent server-side Super Admin enforcement across admin route group. |
| Workflow APIs | Need current-user and organization authorization strategy. |
| Brain/billing/usage/account APIs | Need route-group permission classification and guard strategy. |

## Target API Guard Contract

Sprint 011 should define these contracts for future implementation:

| Contract | Required Design |
|---|---|
| Current user | API routes should resolve user/org/role from a server-authenticated session. |
| Organization access | Routes should verify the authenticated user belongs to or administers the target organization. |
| Role checks | Sensitive actions should require normalized role checks server-side. |
| Admin access | Super Admin-only APIs should not trust client-provided role values. |
| Public routes | Login, signup, invite acceptance, health/status, and safe public routes should be explicitly listed. |
| Demo behavior | Demo-only fallback identities must be isolated from test-live and production. |
| Error behavior | Unauthorized and forbidden responses should be consistent. |

## Permission Matrix To Define In Sprint 011

Sprint 011 should create a matrix for:

| Route Group | Current Risk | Target Access |
|---|---|---|
| `app/api/auth/*` | Mixed session/current-user behavior | Public only where required; current-user route requires server session. |
| `app/api/admin/*` | Admin APIs need consistent server-side Super Admin enforcement | Super Admin unless a route is explicitly lower-risk. |
| `app/api/workflow/*` | Workflow routes may trust request org/user context | Authenticated organization user/admin with org membership. |
| `app/api/drafts/approve/route.ts` | QA threshold enforced; auth context still needs guard model | Authenticated user with permission for draft/org. |
| Brain / OpenRouter routes | Sensitive provider and model behavior | Super Admin or org admin depending on route purpose. |
| Billing / plan / usage routes | Financial/account controls may be sensitive | Super Admin or org admin by route purpose. |
| Environment status / transition routes | Production transition has partial guard; status may be lower-risk | Status can be read-only as designed; transitions require server-authoritative admin permission. |

## Existing Business Rules

- Auto-send remains disabled.
- Live integrations remain disabled.
- Do-not-contact records must not appear in approved export.
- Draft approval requires QA score >= 90.
- Human approval remains required.
- Production readiness is not established.
- Client-side-only protection is not sufficient for production-sensitive operations.
- Request-supplied identity and role values must not be treated as authoritative in future production-sensitive routes.
```

---

# File: docs/VALIDATION.md

```markdown
# Validation Plan

## Overview

Validation proves EmailORC is safe and trustworthy before future feature work, demos, or production decisions.

Current safe local validation gate should include:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
```

`npm run build` remains a required validation target, but Sprint 010 found it currently fails after compile during page data collection with:

```text
PageNotFoundError: Cannot find module for page: /_document
```

Until fixed, future sprints should run build, document the result, and avoid claiming full build validation passes.

## Sprint 011 Validation Focus

Sprint 011 validates one focused architecture/design outcome:

1. Auth/session guard design is documented.
2. Permission matrix is documented.
3. Page guard and API guard strategies are separated.
4. Environment-specific auth rules are documented.
5. Future implementation constraints are clear.
6. No app behavior, API behavior, middleware behavior, UI behavior, schema, migrations, env files, deployment config, data files, or database state are changed.

## Sprint 011 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

If any command is unavailable or unsafe, skip it and document why.

If `npm run build` fails with the same known `/ _document` page data collection issue, document it as an unresolved validation risk rather than fixing it in Sprint 011.

Do not run:

- `prisma migrate`
- `prisma db push`
- `prisma db pull`
- `prisma db reset`
- `prisma generate`, unless separately approved
- database reset commands
- seed commands
- deploy commands
- `wrangler deploy`
- Cloudflare D1 write commands
- commands requiring secret values
- commands that send email
- commands that enable integrations

## Auth / Session Design Validation Requirements

Future implementation sprints should validate:

- Server-authenticated current-user helper rejects unauthenticated requests.
- Sensitive pages are protected by an appropriate server/middleware boundary.
- Sensitive API routes enforce access control independent of localStorage/UI state.
- Super Admin-only APIs reject non-Super Admin users server-side.
- Organization-scoped APIs verify membership or organization admin permissions.
- Request-supplied `organization_id`, `user_id`, and role values are not trusted for authorization.
- Demo fallback identities are unavailable or safely isolated outside demo mode.
- `demo`, `test-live`, and `production` auth/session behavior is clearly separated.
- Unauthorized and forbidden responses are consistent.
- Secrets are not logged, exposed, or stored in repo files.

## Future Validation Areas

- Auth/session implementation after Sprint 011 design is accepted.
- Build failure resolution for `PageNotFoundError: Cannot find module for page: /_document`.
- Environment-mode normalization implementation.
- Production data-store readiness.
- Production deployment readiness.
- Integration/sending readiness, only if future owner-approved roadmap includes direct sending.
```

---

# File: docs/AUTH_SESSION.md

```markdown
# Auth / Session

## Overview

EmailORC auth/session behavior is not production-ready.

Sprint 010 audited the current state. Sprint 011 defines the target guard design before implementation.

This document should be treated as the durable source for auth/session direction once Sprint 011 is complete.

---

## Current State From Sprint 010

| Area | Current Behavior |
|---|---|
| User identity | Login/signup responses are stored in browser `localStorage`. |
| Server session | No durable server-issued app session cookie, JWT, bearer-token layer, or middleware boundary was found. |
| D1 auth data | D1 users/memberships support login/signup/invite and `/api/auth/me` when DB exists. |
| Prisma fallback | Prisma is used as local fallback in some auth/admin paths. |
| Page guards | Mostly client-side through Shell/Sidebar/Header/localStorage role checks. |
| Admin page | `/mvp/admin` blocks non-Super Admin users client-side, but is not a production security boundary. |
| API guards | Mixed and incomplete. Many routes need server-authenticated current-user enforcement. |
| Production readiness | Not established. |

---

## Target Design Principles

- Server-authenticated session state must be the source of truth for authorization.
- `localStorage` may support UX display and client navigation, but must not authorize sensitive behavior.
- API routes must derive current user, organization, and role from server-authenticated context.
- Client-provided `organization_id`, `user_id`, and role values must be treated as inputs to validate, not authorization truth.
- Super Admin-only behavior must be enforced server-side for sensitive admin routes.
- Organization-scoped workflow routes must verify membership or admin rights.
- Demo fallback identities must be isolated to demo mode and must not leak into test-live or production.
- Production mode must not depend on demo-only or local-only trust assumptions.

---

## Target Session Mechanism

Sprint 011 should choose and document the first implementation direction.

Recommended first direction:

| Area | Target |
|---|---|
| Session representation | Server-issued, HTTP-only session cookie or equivalent server-verifiable token. |
| Session storage | D1-backed deployed session/user/membership lookup, with explicit local fallback only where documented. |
| Current-user helper | Shared server helper that resolves authenticated user, organization membership, normalized role, and environment context. |
| Route usage | API routes call the current-user helper before sensitive reads/writes. |
| Page usage | Middleware and/or server boundaries protect sensitive route groups; client UI still uses role state for display only. |
| Expiration | Session expiration should be explicit in future implementation design. |
| Logout | Logout should clear server session state and client display state. |

Sprint 011 should not implement this mechanism. It should design the contract and sequence implementation for Sprint 012 or later.

---

## Role Model To Normalize

Sprint 011 should define the durable role names and aliases.

Recommended first matrix:

| Canonical Role | Purpose |
|---|---|
| `super_admin` | Internal/global admin. Can access global admin surfaces and cross-org controls. |
| `client_admin` | Organization admin. Can manage organization-scoped workflows/settings where allowed. |
| `user` | Organization user. Can use assigned workflow surfaces. |
| `demo_user` | Demo-only identity for sample/demo-safe flows. Not production authority. |

Aliases such as display labels or older strings should normalize to canonical roles before enforcement.

---

## Page Guard Strategy

| Page / Area | Target Guard |
|---|---|
| `/login` | Public for unauthenticated users. Redirect authenticated users if appropriate. |
| `/mvp/*` | Authenticated app user required, except any explicitly public demo route. |
| `/mvp/admin` | Server/middleware or server-side Super Admin boundary plus client UX guard. |
| `/mvp/settings` | Authenticated user; settings subsections may require org admin or Super Admin. |
| Brain Center / provider settings pages | Super Admin or organization admin depending on route purpose. |
| Export / draft approval pages | Authenticated organization user with workflow permission. |

Client-side guards may improve navigation and messaging, but they do not replace server/API guards.

---

## API Guard Strategy

| API Route Group | Target Guard |
|---|---|
| `app/api/auth/login` | Public. Validates credentials server-side. Creates server session in future implementation. |
| `app/api/auth/signup` | Public or invite-gated. Creates user and session only under defined rules. |
| `app/api/auth/me` | Requires valid server session. Returns current user from server-authenticated context. |
| `app/api/auth/logout` | Requires or tolerates session. Clears server session and client display state. |
| `app/api/admin/*` | Super Admin unless explicitly documented otherwise. |
| `app/api/workflow/*` | Authenticated organization user/admin with membership in target org. |
| `app/api/drafts/approve` | Authenticated organization user/admin with draft permission plus QA threshold >= 90. |
| Brain / OpenRouter / provider APIs | Super Admin for global provider settings; org admin for org-scoped settings if supported. |
| Billing / plan APIs | Super Admin or org admin depending on mutation sensitivity. |
| Usage / account intelligence APIs | Authenticated and organization-scoped unless explicitly public/read-only. |
| Environment transition APIs | Server-authoritative admin permission required for transitions. |

---

## Environment-Specific Auth Rules

| Mode | Auth / Session Rule |
|---|---|
| `demo` | May allow seeded demo users and safe resettable data, but demo identity must be clearly isolated and non-production. |
| `test-live` | Should use the same auth/session boundary intended for production validation, with controlled test data and no production claims. |
| `production` | Future target only. Must require server-authenticated sessions, server-side API authorization, no demo fallback identity, and explicit D1-backed source-of-truth behavior. |
| `live-test` | Legacy wording only. Normalize to `test-live` in future implementation. |

---

## Prisma / D1 Fallback Policy

| Context | Policy |
|---|---|
| Deployed source of truth | D1 remains planning direction for deployed workflow/auth source of truth. |
| Prisma | Local development, fallback, and transition support only unless future sprint changes decision. |
| Production | Must not silently fall back to Prisma/local/demo identities if D1/session validation fails. |
| Demo | May use seeded or fallback demo behavior if clearly isolated. |
| Test-live | Should behave like production auth boundary with controlled data, not demo fallback. |

---

## Sprint 012 Candidate Implementation Sequence

A future implementation sprint should be split if needed.

Recommended sequence:

1. Create shared role normalization and permission helpers if not already sufficient.
2. Create server current-user/session helper.
3. Add session creation and clearing to login/logout paths.
4. Protect `/api/auth/me` with server session.
5. Protect admin API route group with Super Admin enforcement.
6. Protect workflow route group with organization membership checks.
7. Add middleware/page boundary for `/mvp/*` and `/mvp/admin`.
8. Update client localStorage usage to display-only where needed.
9. Add focused tests for helper, role matrix, admin rejection, workflow org-scope rejection, and `/api/auth/me`.
10. Run full safe validation gate.

Do not combine all production-readiness work into one sprint if the implementation diff becomes broad.
```

---

# File: planning/sprints/011-auth-session-guard-design-and-permission-matrix/requirements.md

```markdown
# Sprint 011 Requirements — Auth / Session Guard Design and Permission Matrix

## Goal

Design the target auth/session guard model and permission matrix before implementation.

## Business Objective

Give the project owner and future Builder sessions a clear, durable auth/session design so production-readiness work can proceed safely without Codex inventing security rules during implementation.

## User Story

As the project owner, I want the auth/session mechanism, current-user contract, page/API guard strategy, role matrix, and environment-specific rules documented before implementation, so Sprint 012 can make controlled changes based on approved architecture.

## In Scope

- Read Sprint 010 audit findings and `docs/AUTH_SESSION.md`.
- Define the target server-authenticated session mechanism.
- Define the server current-user/helper contract.
- Define canonical roles and role normalization requirements.
- Define permission matrix for known pages and API route groups.
- Separate page guard strategy from API guard strategy.
- Define middleware boundary expectations.
- Define localStorage trust limits.
- Define demo/test-live/production auth behavior.
- Define Prisma/D1 auth fallback policy.
- Define validation requirements for future implementation.
- Recommend Sprint 012 implementation scope and sequencing.
- Update durable docs and planning files.

## Out of Scope

- Auth/session code changes.
- Middleware code changes.
- API guard code changes.
- UI/page behavior changes.
- Login/logout behavior changes.
- Schema changes.
- Migrations.
- Seed changes.
- Database writes.
- Env changes.
- Deployment config changes.
- Wrangler/Cloudflare config changes.
- Build failure fix.
- Auto-send or live integration changes.
- Production-readiness claim.

## Business Rules

- Server-authenticated session state should become the source of truth for authorization.
- localStorage must not be treated as authorization truth for production-sensitive behavior.
- API routes should derive user/org/role from server-authenticated current-user context.
- Request-supplied `organization_id`, `user_id`, and role values should be validated against server truth, not trusted.
- Sensitive admin routes require server-side Super Admin enforcement.
- Organization-scoped workflow routes require authenticated user membership or admin permission for that organization.
- Demo fallback identities must be isolated to demo mode.
- Test-live should validate production-like auth behavior without production claims.
- Production mode must not depend on demo/local fallback auth.
- EmailORC remains MVP/demo-stage until future readiness sprints pass.

## Required Output

Create:

- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/requirements.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/blueprint.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/handoff-prompt.md`

Update as needed:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `docs/AUTH_SESSION.md`

Optional create:

- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/auth-session-design.md`

## Success Definition

Sprint 011 succeeds when:

- Target session mechanism is documented.
- Server current-user/helper contract is documented.
- Canonical roles and role normalization expectations are documented.
- Page permission matrix is documented.
- API route-group permission matrix is documented.
- Page guard strategy and API guard strategy are clearly separated.
- Middleware boundary expectations are documented.
- Environment-specific auth behavior is documented.
- Prisma/D1 fallback policy is documented.
- Validation requirements for future implementation are documented.
- Sprint 012 implementation recommendation is documented.
- No runtime/app/API/UI/schema/config/data behavior is changed.
```

---

# File: planning/sprints/011-auth-session-guard-design-and-permission-matrix/blueprint.md

```markdown
# Sprint 011 Blueprint — Auth / Session Guard Design and Permission Matrix

## Objective

Create durable design documentation for auth/session hardening without implementing behavior changes.

## Files to Read First

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `docs/AUTH_SESSION.md`
- `planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md`
- `planning/sprints/010-auth-session-readiness-audit/requirements.md`
- `planning/sprints/010-auth-session-readiness-audit/blueprint.md`
- `planning/sprints/010-auth-session-readiness-audit/acceptance.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/requirements.md`

## Files / Areas To Inspect Read-Only

Use Sprint 010 report first. Inspect source files only to confirm design context, not to implement.

Likely read-only areas:

- `app/login/page.tsx`
- `app/mvp/*`
- `src/components/layout/*`
- `src/lib/auth-rules.ts`
- `src/lib/roles.ts`
- `src/lib/*auth*`
- `src/lib/*session*`
- `app/api/auth/*`
- `app/api/admin/*`
- `app/api/workflow/*`
- `app/api/drafts/approve/route.ts`
- Brain / billing / usage / account API samples
- `app/api/environment/status/route.ts`
- `next.config.mjs`
- `wrangler.jsonc`, names/config only, no secrets

## Files To Create

Create if useful:

- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/auth-session-design.md`

This design report should include:

1. Sprint 010 findings summary.
2. Target auth/session principles.
3. Recommended session mechanism.
4. Server current-user/helper contract.
5. Canonical role model and aliases.
6. Page permission matrix.
7. API route-group permission matrix.
8. Middleware boundary design.
9. Environment-specific auth rules.
10. localStorage trust limits.
11. Prisma/D1 fallback policy.
12. Validation requirements.
13. Sprint 012 implementation sequence.
14. Risks and unresolved questions.

## Files To Update

Update:

- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md`

Only update these files with design/documentation content. Do not change application behavior.

## Design Requirements

### Session Mechanism

Document the recommended first implementation direction:

- Server-issued HTTP-only session cookie or equivalent server-verifiable token.
- D1-backed deployed user/membership lookup.
- Explicit local fallback rules.
- Expiration and logout expectations.
- No production reliance on localStorage identity.

### Current-User Helper Contract

Define a future helper contract such as:

- `requireCurrentUser(request/context)`
- `getOptionalCurrentUser(request/context)`
- `requireRole(currentUser, allowedRoles)`
- `requireOrgAccess(currentUser, organizationId, allowedRoles)`

The exact function names may remain recommendations unless the repo already has naming patterns.

Document expected return shape:

- user id
- email
- organization id(s)
- active organization id
- canonical role
- environment mode
- source of truth
- errors for unauthenticated/forbidden states

### Permission Matrix

Define target access for:

- public auth routes
- `/mvp/*`
- `/mvp/admin`
- workflow import/records/drafts/export
- draft approval
- admin APIs
- Brain/provider APIs
- billing/plan/usage APIs
- account intelligence APIs
- environment status and transition APIs

### Environment Rules

Document:

- Demo may use isolated seeded demo identity and sample data.
- Test-live should use production-like auth boundary with controlled data.
- Production must require server-authenticated sessions and D1-backed source-of-truth behavior.
- `live-test` should be treated as legacy wording normalized to `test-live`.

### Fallback Policy

Document:

- D1 is deployed auth/workflow source-of-truth direction.
- Prisma remains local fallback/development unless a future sprint changes it.
- Production must not silently fall back to Prisma/local/demo identity.
- localStorage is display/UX state only.

## Validation Plan

Run only safe validation commands after documentation updates:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

If `npm run build` fails with the known Sprint 010 `/ _document` page module error, document it and do not fix it in Sprint 011.

Do not run:

- database commands
- Prisma migrate/db push/db pull/db reset/generate
- seed commands
- deployment commands
- Wrangler deploy
- D1 write commands
- sending commands
- live integration commands

## Completion Steps

1. Read required docs and Sprint 010 report.
2. Confirm Sprint 011 is documentation/design only.
3. Create/update Sprint 011 design artifacts.
4. Update durable docs and planning state.
5. Run safe validation commands.
6. Mark acceptance items complete/incomplete with notes.
7. Recommend Sprint 012 implementation scope.
8. Stop. Do not start Sprint 012.
```

---

# File: planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md

```markdown
# Sprint 011 Acceptance — Auth / Session Guard Design and Permission Matrix

## Scope Control

- [ ] Sprint 011 remains documentation/design only.
- [ ] No app/runtime behavior is changed.
- [ ] No API behavior is changed.
- [ ] No UI/page behavior is changed.
- [ ] No middleware behavior is changed.
- [ ] No schema, migration, seed, database, env, deployment, Wrangler, or Cloudflare config files are changed.
- [ ] No database, Prisma, D1, seed, deploy, sending, or live integration commands are run.
- [ ] `prisma/dev.db` is not intentionally touched.
- [ ] Sprint 012 is not started.

## Required Design Outputs

- [ ] Target auth/session design is documented.
- [ ] Recommended session mechanism is documented.
- [ ] Server current-user/helper contract is documented.
- [ ] Canonical roles and role normalization expectations are documented.
- [ ] Page guard strategy is documented.
- [ ] API guard strategy is documented separately from page guards.
- [ ] Middleware boundary expectations are documented.
- [ ] Page permission matrix is documented.
- [ ] API route-group permission matrix is documented.
- [ ] localStorage trust limits are documented.
- [ ] Demo/test-live/production auth rules are documented.
- [ ] Prisma/D1 fallback policy is documented.
- [ ] Future validation requirements are documented.
- [ ] Sprint 012 implementation recommendation is documented.

## Required Files

- [ ] `planning/sprints/011-auth-session-guard-design-and-permission-matrix/requirements.md` exists.
- [ ] `planning/sprints/011-auth-session-guard-design-and-permission-matrix/blueprint.md` exists.
- [ ] `planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md` exists.
- [ ] `planning/sprints/011-auth-session-guard-design-and-permission-matrix/handoff-prompt.md` exists.
- [ ] `docs/AUTH_SESSION.md` is updated.
- [ ] `docs/API.md` is updated where route guard strategy is clarified.
- [ ] `docs/ARCHITECTURE.md` is updated where auth/session architecture is clarified.
- [ ] `docs/VALIDATION.md` is updated where auth/session validation requirements are clarified.
- [ ] `planning/STATE.md` is updated.
- [ ] `planning/DECISIONS.md` is updated if durable decisions are added.
- [ ] `planning/RISKS.md` is updated.
- [ ] `planning/QUESTIONS.md` is updated.

## Validation

- [ ] `git status --short` is run and documented.
- [ ] `npm run test` is run and documented, or skipped with reason.
- [ ] `npm run lint` is run and documented, or skipped with reason.
- [ ] `npm run test:e2e:safe` is run and documented, or skipped with reason.
- [ ] `npm run build` is run and documented.
- [ ] If `npm run build` fails with the known `/ _document` issue, the failure is documented and carried forward as a risk.

## Acceptance Review

- [ ] Acceptance status is updated in this file.
- [ ] Files created and changed are reported.
- [ ] Any risks introduced are documented.
- [ ] Any unresolved questions are documented.
- [ ] Recommended Sprint 012 is documented.
```

---

# File: planning/sprints/011-auth-session-guard-design-and-permission-matrix/handoff-prompt.md

```markdown
# Sprint 011 Handoff Prompt — Auth / Session Guard Design and Permission Matrix

Use this prompt with Codex after Architect Pack 011 has been applied and the owner approves starting Sprint 011 design work.

```text
Read Sprint 011 planning files and summarize the design/documentation plan before making changes.

Repo path:

/Users/Dmoney/Documents/development/apps/emailorc

Read these files first:

- AGENTS.md
- CODEX.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/DOMAIN.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/VALIDATION.md
- docs/AUTH_SESSION.md
- planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/requirements.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/blueprint.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md

Then summarize:

1. What Sprint 011 is supposed to accomplish.
2. Which files and folders you expect to inspect.
3. Which files you expect to create or update.
4. The proposed auth/session design sections you will produce.
5. What validation commands you expect to run.
6. What files and commands are strictly off-limits.
7. Any blockers, ambiguities, or risks before starting.

Important rules:

- Do not start design edits yet.
- Do not implement auth changes.
- Do not change app behavior.
- Do not change API behavior.
- Do not change UI behavior.
- Do not change middleware behavior.
- Do not change schema, migrations, seed files, database files, env files, deployment config, or Wrangler/Cloudflare config.
- Do not run database commands.
- Do not touch `prisma/dev.db`.
- Do not expose secrets.
- Do not start Sprint 012.

Stop after the summary and wait for my approval.
```

After owner approval, proceed with the design/documentation sprint only.

Create if useful:

- planning/sprints/011-auth-session-guard-design-and-permission-matrix/auth-session-design.md

Update only as needed:

- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/VALIDATION.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/RISKS.md
- planning/QUESTIONS.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md

Run safe validation commands and document results:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

If `npm run build` fails with the known Sprint 010 `/ _document` issue, document it and carry it forward. Do not fix it during Sprint 011 unless the owner explicitly changes scope.

When complete, report:

1. Files inspected.
2. Files created.
3. Files updated.
4. Auth/session design summary.
5. Permission matrix summary.
6. Page guard design.
7. API guard design.
8. Environment-mode auth rules.
9. Prisma/D1 fallback policy.
10. Validation commands run and results.
11. Acceptance criteria status.
12. Recommended Sprint 012.

Do not start Sprint 012.
```
