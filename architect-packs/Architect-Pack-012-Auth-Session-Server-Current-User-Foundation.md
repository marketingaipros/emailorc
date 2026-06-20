# Architect Pack 012 — Auth Session Server Current-User Foundation

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `012-auth-session-server-current-user-foundation`  
**Created:** 2026-05-21  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 012 is the first controlled auth/session implementation sprint after Sprint 011 design.

Sprint 011 completed the auth/session guard design and permission matrix. It established that future authorization should derive user, organization, and role from a server-authenticated current-user context, not from browser `localStorage` or request-supplied `organization_id`, `user_id`, or role values.

Sprint 012 implements the narrow foundation only:

1. Canonical role normalization and permission helpers.
2. Server current-user/session helper.
3. Server-issued HTTP-only session cookie foundation.
4. Login/logout session create/clear behavior.
5. `/api/auth/me` protected by the server-authenticated current-user helper.
6. Focused tests and validation.

This sprint must not broaden into full auth hardening across admin, workflow, drafts, Brain, billing, usage, middleware, page guards, or localStorage cleanup. Those must be handled in later sprints after the foundation is stable.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Read Sprint 011 design output and updated durable docs.
- Inspect existing auth/session, role, D1, Prisma fallback, and route helper code.
- Add or consolidate canonical role normalization and permission helpers.
- Add a shared server current-user/session helper.
- Add server-issued HTTP-only session cookie support.
- Add session creation to successful login behavior.
- Add session clearing to logout behavior, if a logout route exists or can be added without UI redesign.
- Protect `/api/auth/me` so it derives current user from the server-authenticated session.
- Return consistent unauthenticated/forbidden responses for the new helper and `/api/auth/me`.
- Use D1 as the deployed auth/session source-of-truth direction.
- Keep Prisma/SQLite as local development and transition support only where already present and explicitly documented.
- Add focused tests for role normalization, helper behavior, login/session creation where practical, logout/session clearing where practical, and `/api/auth/me`.
- Update durable docs and planning files.
- Run safe validation commands.

### Conditional In Scope

If no server-side session storage exists in the repo, Codex may add the smallest D1 migration needed for an app session table, but only if this is required to implement the Sprint 011-approved opaque server session direction.

Rules for this conditional migration:

- Add migration file only.
- Do not run the migration.
- Do not write to live D1.
- Do not reset local databases.
- Do not edit `prisma/dev.db`.
- Document the new table contract in `docs/DATA_MODEL.md`, `docs/AUTH_SESSION.md`, and `docs/API.md`.
- Keep the table minimal, such as session token hash, user id, organization id if needed, expiration, created/updated/revoked metadata.

If Codex can implement the foundation safely using an existing session table or existing auth/session storage, prefer that over adding a new migration.

### Out of Scope

- No full production auth-readiness claim.
- No global middleware rollout.
- No broad page guard implementation.
- No `/mvp/*` page authorization rewrite.
- No localStorage cleanup beyond any narrow login/logout display-state compatibility required by existing UI.
- No admin API guard hardening beyond helper creation and docs.
- No workflow API guard hardening.
- No draft approval auth hardening beyond preserving existing QA >= 90 behavior.
- No Brain/OpenRouter/provider route guard implementation.
- No billing, plan, usage, or account-intelligence route guard implementation.
- No environment-mode behavior rewrite.
- No data-store reconciliation beyond the minimal session-storage need.
- No Prisma schema edits unless explicitly proven necessary for existing local fallback tests and approved in the implementation summary.
- No seed/demo data edits.
- No live database writes.
- No env file edits.
- No deployment config changes.
- No Wrangler deploy.
- No sending enablement.
- No live CRM/email integration enablement.
- No secret inspection or exposure.
- No intentional changes to `prisma/dev.db`.
- No Sprint 013 work.

---

## Source Facts From Prior Sprints

Sprint 011 completion review confirmed:

- All Sprint 011 acceptance criteria were complete.
- Sprint 011 stayed documentation/design-only.
- `npm run test` passed with 15 tests.
- `npm run lint` passed with existing React hook warnings.
- `npm run test:e2e:safe` passed with 2 non-mutating Playwright tests.
- `npm run build` passed with existing React hook warnings.
- Existing dirty tree remained visible, including `prisma/dev.db`.

Sprint 011 durable decisions:

- First session mechanism should be a server-issued HTTP-only opaque session cookie backed by server-side lookup.
- D1 is the deployed auth/session source-of-truth direction.
- Prisma/SQLite is local development and transition support only.
- Canonical server roles should normalize observed aliases before enforcement and fail closed for unknown sensitive roles.

Sprint 011 durable docs now align around:

- Target API guard contract and route-group permission matrix.
- Session direction, current-user helpers, role aliases, localStorage limits, and D1/Prisma rules.
- Layered target guard architecture.
- Future auth validation requirements.

Sprint 011 recommended split:

- `012A`: role/session helpers and `/api/auth/me`.
- `012B`: admin/workflow API guards.
- `012C`: page/middleware/localStorage cleanup.

This Architect Pack treats Sprint 012 as `012A`.

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
**Current phase:** Sprint 012 — Auth Session Server Current-User Foundation

---

## Current Status

Sprint 011 is complete and accepted.

Sprint 011 produced the auth/session guard design and permission matrix. The project now has a durable target direction for:

- server-issued HTTP-only session cookies
- server current-user helper contract
- canonical role normalization
- API guard strategy
- page guard strategy
- environment-mode auth rules
- D1 deployed auth/session source-of-truth direction
- Prisma/SQLite local fallback and transition policy
- future implementation sequencing

Sprint 012 is active and implements the first narrow auth/session foundation only.

Sprint 012 should create the server current-user/session foundation, update login/logout and `/api/auth/me`, and add focused tests.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/012-auth-session-server-current-user-foundation/`

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
- Sprint 011 validation passed: `npm run test`, `npm run lint`, `npm run test:e2e:safe`, and `npm run build`.

---

## Next Actions

1. Apply Architect Pack 012 to create Sprint 012 planning files.
2. Have Codex read Sprint 012 files and summarize the implementation plan before making changes.
3. Approve Codex implementation only after the summary is correct.
4. Implement only the Sprint 012 foundation:
   - role normalization / permission helper consolidation
   - server current-user/session helper
   - login session creation
   - logout session clearing
   - `/api/auth/me` server-session protection
   - focused tests
5. Run safe validation commands.
6. Report acceptance status and recommended Sprint 013.

---

## Blockers / Open Items

- Production readiness is not established.
- Full admin API guard hardening has not started.
- Workflow/draft organization permission hardening has not started.
- Page/middleware/localStorage cleanup has not started.
- Production mode remains a future target state only.
- Deployment target and production readiness remain unresolved.
- Dirty working tree existed before Sprint 012, including `prisma/dev.db`; avoid unrelated files.
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
| 2026-05-21 | Sprint 012 implements only the auth/session server current-user foundation. | Sprint 011 recommended splitting implementation to avoid broad auth churn. | Admin/workflow/page/middleware hardening remains future work. |
| 2026-05-21 | `/api/auth/me` is the first route to move to server-authenticated current-user resolution. | It is the safest route to validate the new session boundary before guarding larger API groups. | Future routes should reuse the same helper after Sprint 012 acceptance. |
| 2026-05-21 | Role normalization must fail closed for unknown sensitive roles. | Sprint 011 identified role aliases and unknown roles as a future implementation risk. | Sensitive authorization must not grant access based on unknown or unnormalized role strings. |
| 2026-05-21 | Sprint 012 must not implement broad middleware or page guard changes. | Middleware/page boundaries can break demo flow if introduced before helpers are stable. | Page/middleware cleanup should be a later sprint after server helper and route behavior pass validation. |
| 2026-05-21 | Any new D1 session storage migration must be minimal and must not be executed during Sprint 012. | Session storage may be necessary for opaque session cookies, but live or local DB writes increase risk. | Codex may add migration text only if needed, but must not run migration, seed, reset, or deploy commands. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready after session foundation work. | Medium | High | Continue documenting EmailORC as MVP/demo-stage until full production readiness is validated. | Open |
| Sprint 012 expands into broad auth hardening. | Medium | High | Limit scope to role helpers, session helper, login/logout, `/api/auth/me`, and focused tests. | Active |
| New session behavior breaks existing login/demo flow. | Medium | High | Preserve current UI compatibility where possible and test login/session/current-user behavior. | Active |
| Session storage requires schema support. | Medium | Medium | Prefer existing session storage; if absent, add minimal D1 migration only and do not run it. | Active |
| Role aliases are collapsed incorrectly. | Medium | High | Add focused role normalization tests and fail closed on unknown sensitive roles. | Active |
| `/api/auth/me` behavior changes may expose current-user inconsistencies. | Medium | Medium | Return clear `401` when unauthenticated and document any local/demo fallback limits. | Active |
| Prisma fallback conflicts with D1 deployed direction. | Medium | Medium | Keep Prisma fallback local/dev/transition only and document any use explicitly. | Active |
| Middleware/page guard changes are introduced too early. | Medium | Medium | Keep middleware/page changes out of Sprint 012. | Active |
| Admin/workflow APIs remain unprotected after Sprint 012. | High | High | Carry as known risk and recommend Sprint 013 for admin API guard hardening. | Open |
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
| Does the repo already contain a usable server-side session table or helper? | Builder | Sprint 012 | Active | Codex should inspect before adding migration or helper files. |
| What exact cookie name and expiration should Sprint 012 use? | Builder/Architect | Sprint 012 | Active | Use a clear app-specific name and conservative expiration; document the value in `docs/AUTH_SESSION.md`. |
| Should login immediately stop returning user identity for localStorage display state? | Architect/Builder | Future page/localStorage sprint | Open | Sprint 012 should avoid broad UI cleanup and may preserve display compatibility. |
| Which admin route group should be hardened first after `/api/auth/me`? | Architect/Builder | Sprint 013 planning | Open | Recommended next sprint: admin API server-side Super Admin guard hardening. |
| Should workflow/draft authorization be grouped with admin hardening or separate? | Architect/Builder | Sprint 014 planning | Open | Recommended separate sprint to avoid auth scope creep. |
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

Sprint 012 implements the first narrow foundation:

- canonical role normalization
- server current-user/session helper
- HTTP-only session cookie support
- login session creation
- logout session clearing
- `/api/auth/me` server-authenticated current-user behavior

EmailORC remains MVP/demo-stage. Sprint 012 does not make the app production-ready.

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

---

## Sprint 012 Implementation Contract

Sprint 012 should establish:

| Contract | Requirement |
|---|---|
| Role normalization | Shared helper normalizes observed role strings into canonical roles. |
| Permission checks | Shared helper supports basic checks needed by `/api/auth/me` and future route guards. |
| Session cookie | Cookie is HTTP-only, same-site, path scoped, expiring, and server-verifiable. |
| Session creation | Successful login creates a server session and sets the cookie. |
| Session clearing | Logout clears the cookie and invalidates session server-side if session storage supports it. |
| Current-user helper | Server helper resolves current user, organization, role, and session state from the cookie/session lookup. |
| `/api/auth/me` | Requires a valid server session and returns current user from server-authenticated context. |
| Error behavior | Missing/invalid session returns `401`; insufficient permission helper supports `403` for future use. |

---

## Canonical Roles

| Canonical Role | Purpose |
|---|---|
| `super_admin` | Internal/global admin. |
| `client_admin` | Organization admin. |
| `user` | Organization user. |
| `demo_user` | Demo-only identity for sample/demo-safe flows. |

Aliases observed in prior audits should normalize before enforcement, including uppercase variants and legacy display strings.

Unknown roles must not be granted sensitive permissions.

---

## Session Storage Policy

| Context | Policy |
|---|---|
| Existing D1 session table/helper exists | Prefer reusing it if compatible with the Sprint 011 design. |
| No server session storage exists | Add minimal D1 migration text for session storage if required; do not execute migration during Sprint 012. |
| Local development | Use existing local fallback only if already present or narrowly needed for tests. |
| Production | Must not silently fall back to Prisma/local/demo identity if D1/session validation fails. |
| Demo | Demo fallback may exist only if clearly isolated and not treated as production authority. |

---

## localStorage Policy

`localStorage` may continue to support current UI display compatibility during Sprint 012.

It must not be used as authorization truth for `/api/auth/me` or future sensitive API routes.

Future page/middleware/localStorage cleanup should move role display and navigation hints toward server-derived current-user state.

---

## Future Sprints

Recommended sequence after Sprint 012:

1. Sprint 013 — Admin API Server-Side Guard Hardening.
2. Sprint 014 — Workflow / Draft Organization Permission Guards.
3. Sprint 015 — Page, Middleware, and localStorage Trust Cleanup.
4. Later — Production readiness validation and deployment hardening.
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API route contracts and target guard behavior.

Sprint 012 implements only the auth/session current-user foundation.

Do not treat the API layer as production-ready after Sprint 012. Admin, workflow, drafts, Brain, billing, usage, and page/middleware hardening remain future work.

---

## Sprint 012 API Contract

| Route / Area | Sprint 012 Target |
|---|---|
| `app/api/auth/login` | Public route. Validates credentials server-side. On success, creates server session and sets HTTP-only session cookie. |
| `app/api/auth/logout` | Clears HTTP-only session cookie and invalidates server session if supported. |
| `app/api/auth/me` | Requires valid server-authenticated session. Returns current user from server helper. Returns `401` when unauthenticated. |
| Shared current-user helper | Resolves session, user, organization, canonical role, and environment context from server-side data. |
| Role helper | Normalizes role aliases and fails closed for unknown sensitive roles. |

---

## Out-of-Scope API Groups For Sprint 012

These route groups remain documented risks and should not be hardened in Sprint 012 unless explicitly approved later:

| Route Group | Future Target |
|---|---|
| `app/api/admin/*` | Sprint 013 should enforce server-side Super Admin checks. |
| `app/api/workflow/*` | Sprint 014 should enforce organization membership checks. |
| `app/api/drafts/approve/route.ts` | Future sprint should enforce authenticated draft/org permission while preserving QA >= 90. |
| Brain / OpenRouter / provider APIs | Future sprint should classify Super Admin vs organization admin access. |
| Billing / plan / usage APIs | Future sprint should classify mutation sensitivity and server-side role requirements. |
| Environment transition APIs | Future sprint should enforce server-authoritative admin permission. |

---

## Current-User Helper Expected Shape

The exact TypeScript shape may vary with the existing codebase, but the helper should support these concepts:

```ts
type CurrentUser = {
  userId: string
  organizationId: string | null
  role: "super_admin" | "client_admin" | "user" | "demo_user"
  email?: string
  name?: string
  environmentMode?: "demo" | "test-live" | "production"
}
```

Expected helper behavior:

- Return current user when a valid session exists.
- Return unauthenticated result when no valid session exists.
- Support consistent `401` response creation.
- Support `403` response creation for future permission checks.
- Avoid trusting request body identity fields as authorization truth.
- Avoid trusting localStorage.

---

## Existing Business Rules

- Auto-send remains disabled.
- Live integrations remain disabled.
- Do-not-contact records must not appear in approved export.
- Draft approval requires QA score >= 90.
- Human approval remains required.
- Production readiness is not established.
- Request-supplied identity and role values must not be treated as authoritative in production-sensitive routes.
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
- D1 is the planning direction for deployed workflow and auth/session source of truth.
- Prisma / SQLite remains local development, fallback, and transition support only.
- Sprint 011 designed the target auth/session guard model.
- Sprint 012 implements the first server current-user/session foundation.

## Auth / Session Architecture

Sprint 012 should establish a layered foundation:

| Layer | Sprint 012 Target |
|---|---|
| Role normalization | Shared helper canonicalizes role aliases and fails closed for unknown sensitive roles. |
| Session cookie | HTTP-only server-issued cookie identifies a server-side session. |
| Session lookup | Server helper resolves session to user, organization, and canonical role. |
| Current-user helper | Shared server helper gives API routes a consistent current-user contract. |
| `/api/auth/me` | First route protected by the server current-user helper. |
| Login/logout | Login creates session cookie; logout clears session cookie. |

## Deferred Architecture Work

Sprint 012 does not implement:

- full middleware boundary
- `/mvp/*` page guard rewrite
- admin API group hardening
- workflow API group hardening
- draft/org authorization hardening
- Brain/provider route classification
- billing/usage/account-intelligence hardening
- localStorage cleanup
- production-readiness claim

These should be sequenced after the current-user foundation passes validation.

## Known Architecture Gaps After Sprint 012

- Admin APIs still need server-side Super Admin guard hardening.
- Workflow APIs still need organization membership checks.
- Draft approval still needs auth/org permission hardening while preserving QA >= 90.
- Page/middleware/localStorage trust cleanup remains future work.
- Production mode remains a future target state only.
- Production deployment path needs validation.
```

---

# File: docs/VALIDATION.md

```markdown
# Validation Plan

## Overview

Validation proves EmailORC is safe and trustworthy before future feature work, demos, or production decisions.

Sprint 012 validates the first auth/session server current-user foundation.

Passing Sprint 012 does not mean EmailORC is production-ready.

---

## Sprint 012 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

If any command is unavailable or unsafe, skip it and document why.

---

## Sprint 012 Focused Test Requirements

Sprint 012 should add or update focused tests for:

- Role normalization from observed aliases to canonical roles.
- Unknown sensitive role behavior fails closed.
- Session helper returns unauthenticated for missing/invalid session.
- Current-user helper resolves valid user/session where practical.
- `/api/auth/me` returns `401` without a valid session.
- `/api/auth/me` returns server-derived current user with valid session where practical.
- Login sets an HTTP-only session cookie where practical to test.
- Logout clears the session cookie where practical to test.

If full route tests are impractical in the current structure, Codex should test helper behavior and document any manual/local verification gaps.

---

## Commands Not Allowed

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

---

## Future Validation Areas

- Admin API server-side Super Admin guard tests.
- Workflow organization membership tests.
- Draft approval auth/org permission tests while preserving QA >= 90.
- Middleware/page boundary tests.
- localStorage display-only behavior tests.
- Environment-mode auth behavior tests.
- Production readiness validation.
```

---

# File: planning/sprints/012-auth-session-server-current-user-foundation/requirements.md

```markdown
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
```

---

# File: planning/sprints/012-auth-session-server-current-user-foundation/blueprint.md

```markdown
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
```

---

# File: planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md

```markdown
# Sprint 012 Acceptance — Auth Session Server Current-User Foundation

## Acceptance Checklist

### Scope Control

- [ ] Sprint stayed limited to role helpers, server session/current-user helper, login/logout, `/api/auth/me`, focused tests, and docs.
- [ ] No broad admin API guard hardening was implemented.
- [ ] No workflow API guard hardening was implemented.
- [ ] No global middleware rollout was implemented.
- [ ] No page guard rewrite was implemented.
- [ ] No broad localStorage cleanup was implemented.
- [ ] No production-readiness claim was made.
- [ ] No sending or live integrations were enabled.
- [ ] `prisma/dev.db` was not intentionally touched.

### Role Normalization

- [ ] Canonical roles are documented and implemented or consolidated.
- [ ] Observed aliases normalize to canonical roles.
- [ ] Unknown sensitive roles fail closed.
- [ ] Focused role tests exist or a clear reason is documented.

### Session / Current-User Helper

- [ ] Server current-user/session helper exists.
- [ ] Helper reads and validates server session/cookie.
- [ ] Helper resolves user id, organization id, canonical role, and session state where supported by current data.
- [ ] Missing/invalid session produces unauthenticated behavior.
- [ ] Helper does not trust localStorage or request body identity values as authorization truth.
- [ ] Consistent `401` and future `403` response helpers or equivalents exist.

### Login / Logout / Me

- [ ] Successful login creates a server session and sets HTTP-only cookie.
- [ ] Logout clears HTTP-only cookie and invalidates session where supported.
- [ ] `/api/auth/me` requires valid server session.
- [ ] `/api/auth/me` returns `401` for missing/invalid session.
- [ ] `/api/auth/me` returns current user from server-authenticated context for valid session.
- [ ] Existing UI compatibility is preserved as much as practical without broad UI redesign.

### Session Storage

- [ ] Existing compatible session storage was reused, or
- [ ] Minimal D1 session migration was added only if required.
- [ ] No migration was executed.
- [ ] No live D1 write command was run.
- [ ] Any new session table contract is documented.

### Documentation / Planning

- [ ] `docs/AUTH_SESSION.md` updated.
- [ ] `docs/API.md` updated.
- [ ] `docs/ARCHITECTURE.md` updated.
- [ ] `docs/VALIDATION.md` updated.
- [ ] `docs/DATA_MODEL.md` updated if session migration was added.
- [ ] `planning/STATE.md` updated.
- [ ] `planning/DECISIONS.md` updated if durable decisions changed.
- [ ] `planning/RISKS.md` updated.
- [ ] `planning/QUESTIONS.md` updated.
- [ ] Sprint 013 recommendation documented.

### Validation

- [ ] `git status --short` run before and after.
- [ ] `npm run test` passed or failure documented.
- [ ] `npm run lint` passed or failure documented.
- [ ] `npm run test:e2e:safe` passed or failure documented.
- [ ] `npm run build` passed or failure documented.
- [ ] No forbidden commands were run.

## Completion Standard

Sprint 012 is complete only when:

- The server current-user/session foundation is implemented.
- `/api/auth/me` no longer depends on browser/localStorage identity.
- Tests and docs support the new foundation.
- Safe validation has been run.
- Acceptance criteria are checked honestly.
- Any unresolved risks are documented.
```

---

# File: planning/sprints/012-auth-session-server-current-user-foundation/handoff-prompt.md

```markdown
# Sprint 012 Handoff Prompt — Auth Session Server Current-User Foundation

Use this prompt with Codex after Architect Pack 012 has been applied to the EmailORC repo.

```text
You are the Builder Layer for EmailORC.

Read these files before making changes:

- AGENTS.md
- CODEX.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/DOMAIN.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/VALIDATION.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/auth-session-design.md
- planning/sprints/012-auth-session-server-current-user-foundation/requirements.md
- planning/sprints/012-auth-session-server-current-user-foundation/blueprint.md
- planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md

Then inspect the relevant auth/session files, but do not make changes yet.

Summarize:

1. What Sprint 012 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. Whether existing server-side session storage exists.
5. Whether you expect to need a minimal D1 session migration file.
6. How you will implement role normalization.
7. How you will implement the current-user/session helper.
8. How login, logout, and `/api/auth/me` will change.
9. What focused tests you will add or update.
10. What validation commands you will run.
11. Any blockers, conflicts, or ambiguities.

Stop after the summary and wait for approval before implementing.

Hard limits:

- Do not implement admin API guard hardening.
- Do not implement workflow API guard hardening.
- Do not implement draft approval auth/org hardening beyond preserving existing QA >= 90 behavior.
- Do not implement global middleware.
- Do not rewrite page guards.
- Do not broadly clean up localStorage.
- Do not change production environment behavior.
- Do not edit env files.
- Do not edit deployment config.
- Do not run migrations.
- Do not run seed commands.
- Do not run deploy commands.
- Do not run Wrangler deploy.
- Do not run Cloudflare D1 write commands.
- Do not inspect or print secret values.
- Do not enable sending.
- Do not enable live integrations.
- Do not touch prisma/dev.db.
- Do not start Sprint 013.

Only after I approve your summary may you implement Sprint 012.
```
```

---

# Codex Apply Architect Pack 012 Prompt

Use this first, before the Sprint 012 handoff prompt above.

```text
You are the Builder Layer for EmailORC.

Apply Architect Pack 012 — Auth Session Server Current-User Foundation.

Repo path:

/Users/Dmoney/Documents/development/apps/emailorc

Important:
- This is Sprint 012.
- First apply/create the Sprint 012 planning and documentation files from the Architect Pack.
- Do not implement Sprint 012 code yet.
- Do not change runtime behavior while applying the pack.
- Do not change UI behavior while applying the pack.
- Do not change API behavior while applying the pack.
- Do not edit schema, migration, seed, env, deployment config, package, or database files while applying the pack.
- Do not touch prisma/dev.db.
- Do not start Sprint 013.

Create:

- planning/sprints/012-auth-session-server-current-user-foundation/requirements.md
- planning/sprints/012-auth-session-server-current-user-foundation/blueprint.md
- planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md
- planning/sprints/012-auth-session-server-current-user-foundation/handoff-prompt.md

Update:

- planning/STATE.md
- planning/DECISIONS.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/VALIDATION.md

Update docs/DATA_MODEL.md only if the pack content creates a documented conditional session-storage requirement. Do not implement the migration during pack application.

After applying the pack, report:

1. Files created.
2. Files updated.
3. Files intentionally not changed.
4. Any assumptions.
5. Any conflicts.
6. Whether Sprint 012 planning files are ready for Builder review.

Stop after applying the pack. Do not implement Sprint 012.
```

---

# After Pack Application

After Codex applies the pack, use the handoff prompt stored in:

`planning/sprints/012-auth-session-server-current-user-foundation/handoff-prompt.md`

Codex must summarize the plan and stop for approval before implementation.
