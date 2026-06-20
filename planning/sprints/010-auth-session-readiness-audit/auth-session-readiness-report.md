# Sprint 010 Auth / Session Readiness Report

**Project:** EmailORC
**Sprint:** 010 - Auth / Session Readiness Audit
**Date:** 2026-05-21
**Status:** Complete as documentation/audit only

## Scope

This sprint audited current auth, session, role, and access-control behavior without changing runtime behavior.

No auth changes, API behavior changes, UI behavior changes, schema changes, migrations, seed changes, env changes, deployment config changes, database writes, Wrangler changes, D1 commands, or Prisma commands were performed.

## Files Inspected

Operating and planning:

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/ENVIRONMENT_MODES.md`
- `docs/VALIDATION.md`
- `planning/sprints/010-auth-session-readiness-audit/requirements.md`
- `planning/sprints/010-auth-session-readiness-audit/blueprint.md`
- `planning/sprints/010-auth-session-readiness-audit/acceptance.md`
- `planning/sprints/010-auth-session-readiness-audit/handoff-prompt.md`

Auth/session/page/source:

- `app/login/page.tsx`
- `app/mvp/layout.tsx`
- `src/components/layout/Shell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `app/mvp/admin/page.tsx`
- `app/mvp/settings/page.tsx`
- `app/mvp/profile/page.tsx`
- `app/mvp/upload/page.tsx`
- `app/mvp/records/page.tsx`
- `app/mvp/drafts/page.tsx`
- `app/mvp/export/page.tsx`
- `app/mvp/brain-center/page.tsx`
- `src/lib/auth-rules.ts`
- `src/lib/roles.ts`
- `src/lib/draft-approval.ts`

API routes:

- `app/api/auth/login/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/signup/route.ts`
- `app/api/auth/accept-invite/route.ts`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[id]/route.ts`
- `app/api/admin/users/[id]/invite/route.ts`
- `app/api/admin/organizations/route.ts`
- `app/api/admin/organizations/[id]/plan/route.ts`
- `app/api/admin/reset-data/route.ts`
- `app/api/admin/system-health/route.ts`
- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- `app/api/workflow/drafts/route.ts`
- `app/api/workflow/export/route.ts`
- `app/api/drafts/approve/route.ts`
- `app/api/environment/status/route.ts`
- `app/api/billing/current-plan/route.ts`
- `app/api/usage/logs/route.ts`
- `app/api/account-intelligence/route.ts`
- Brain route samples under `app/api/brain/`

Config/tests:

- `next.config.mjs`
- `wrangler.jsonc` read for environment/binding context only
- `package.json` scripts
- `tests/validation.test.ts`
- `tests/e2e/non-mutating-smoke.spec.ts`
- `tests/manual-qa-checklist.md`
- `tests/BUG_SUMMARY.md`

## Current Auth / Session Summary

EmailORC identifies users through login/signup responses and browser localStorage. The current UI session is not backed by an observed server-issued session cookie, JWT, bearer token, or middleware-authenticated request context.

The app has real password verification in `/api/auth/login`, D1/Prisma identity records, memberships, and roles. However, most page access checks are client-side, and most API routes trust IDs or roles supplied by the browser.

## Login / Signup / Session Flow Map

| Flow | Behavior | Evidence |
|---|---|---|
| Login | `/login` posts email/password to `/api/auth/login`; route verifies password against D1 or Prisma and returns identity/org/role fields. | `app/login/page.tsx`, `app/api/auth/login/route.ts` |
| Signup | `/login` signup form posts to `/api/auth/signup`; route requires D1 and creates a trial org, user, membership, subscription, Brain settings, and audit log. | `app/login/page.tsx`, `app/api/auth/signup/route.ts` |
| Browser session | Login/signup stores `userRole`, `userEmail`, `userName`, `userOrg`, `orgId`, `userId`, plan/credits, and `sessionCreatedAt` in localStorage. | `app/login/page.tsx` |
| Protected UI entry | `Shell` checks localStorage for `userId`, `userEmail`, `userRole`; missing values clear storage and redirect to `/login`. | `src/components/layout/Shell.tsx` |
| Current user diagnostics | `/api/auth/me` reads D1 active membership by user id/email if DB exists; otherwise falls back to query-provided role/org context. | `app/api/auth/me/route.ts` |
| Logout | Header/sidebar logout clears all localStorage and redirects to `/login`. | `src/components/layout/Header.tsx`, `src/components/layout/Sidebar.tsx` |

## Current Roles And Role Normalization

Observed role names:

- `SUPER_ADMIN`
- `CLIENT_ADMIN`
- `EDITOR`
- `REVIEWER`
- `VIEWER`

Observed aliases:

- `admin` and `system_admin` normalize to `super_admin` in `src/lib/roles.ts`.

Normalization behavior:

- `src/lib/auth-rules.ts` normalizes to uppercase underscore role strings for client route and nav checks.
- `src/lib/roles.ts` normalizes to lowercase underscore role strings for API diagnostics and permission objects.
- `src/lib/draft-approval.ts` normalizes approval roles to uppercase underscore strings.

## Page-Level Guard Map

| Page / Area | Guard | Classification |
|---|---|---|
| `/login` | Redirects to `/mvp` when localStorage has user id/email/role. | Client-side only |
| `/mvp/*` shell | Redirects missing localStorage session to `/login`; uses `canAccessPath` for route access. | Client-side only |
| Sidebar nav | Filters nav by localStorage role; Admin Console link is Super Admin-only. | Client-side only |
| Header profile/mode menu | Reads localStorage role/name/email; Super Admin mode switch shown by localStorage role. | Client-side only |
| `/mvp/admin` | Client-side normalized role check redirects non-Super Admin to `/mvp`; fetches admin APIs only after client check. | Client-side only |
| `/mvp/drafts` approval | Client-side `canApprove` reads localStorage role and allows `SUPER_ADMIN`, `CLIENT_ADMIN`, `REVIEWER`. | Client-side only plus API partial check |
| Environment production switch UI | Client-side `canTransitionProduction` based on current role diagnostics/localStorage. | Client-side only plus API partial check |

## API-Level Guard Map

| Route / Family | Guard Observed | Classification |
|---|---|---|
| `POST /api/auth/login` | Password verification and user status check against D1 or Prisma. | Server-authoritative for credentials |
| `POST /api/auth/signup` | Field validation and duplicate-email check; public signup creates `CLIENT_ADMIN`. | Public route with server validation |
| `GET/POST /api/auth/accept-invite` | Token existence, expiration, accepted status, and password length. | Server-authoritative for invite token |
| `GET /api/auth/me` | D1 active membership lookup when DB exists; query fallback without DB or on error. | Partial |
| `POST /api/drafts/approve` | Server validates supplied `user_role`, QA score, spam risk, and subjects. Role comes from request body. | Partial |
| `POST /api/environment/status` | Blocks production unless request body role normalizes to `super_admin`; persists organization environment in D1. | Partial |
| `GET/POST/PATCH/DELETE /api/admin/*` | No consistent server session or role enforcement observed; mutates users, plans, invites, reset data based on route/body. | Not production-ready |
| `/api/workflow/*` | Reads/writes by request `organization_id`, `user_id`, and environment, with demo defaults. | Not production-ready |
| `/api/brain/*` | Uses request org/user IDs and saved/server provider keys; no session authorization observed. | Not production-ready |
| `/api/account-intelligence` | Reads/writes by request org/user IDs. | Not production-ready |
| `/api/billing/current-plan`, `/api/usage/logs` | Reads by query org id. | Not production-ready |

## Client-Side-Only Guard Findings

- Page access for `/mvp/*` depends on localStorage and client redirects.
- Admin page access depends on localStorage role before rendering/fetching.
- Sidebar/nav visibility is not authoritative access control.
- Logout is localStorage clearing only.
- Profile, billing, environment badge, workflow org context, and several user/org IDs come from localStorage.

## Server-Authoritative / Partial Findings

Server-authoritative checks observed:

- Login password validation.
- Invite token validation and acceptance.
- D1 signup creation and duplicate-email check.

Partial checks observed:

- `/api/auth/me` uses D1 membership when DB exists, but falls back to query role/org data when DB is unavailable or lookup fails.
- `/api/drafts/approve` validates role/QA/spam/subjects server-side, but trusts `user_role` from the request.
- `/api/environment/status` blocks production mode for non-Super Admin roles, but trusts `role` from the request body.

## Auth / Session Data-Store Findings

| Data Store | Finding |
|---|---|
| D1 | Primary deployed identity/membership store for login, signup, invite, admin, environment, and workflow routes when `DB` exists. |
| Prisma / SQLite | Still active as fallback for login, admin users/orgs, and usage logs when D1 is unavailable. |
| localStorage | Current browser session and route guard source; stores user, org, role, plan, credits, session timestamp, and environment cache. |
| Request body/query | Many API routes trust browser-provided `organization_id`, `user_id`, `role`, or environment. |
| Cookies/JWT/bearer | No app-level session cookie, JWT, or bearer auth enforcement observed. |

## Environment-Mode Observations

- Environment status uses D1 organization environment when available and falls back to app environment.
- `demo` enables sample/fallback outputs in metadata.
- `test-live` is documented as canonical, but runtime still recognizes `live-test` and `test-live`.
- Signup defaults to `live-test`.
- Production transition requires a Super Admin role in request body, but not a server-verified session principal.
- Many workflow/brain/API routes still accept environment and org context from the browser.

## Demo / Local-Only Assumptions

- Demo quick-access accounts are shown directly on `/login`.
- `org_demo` and `user_super_admin` are common fallback IDs.
- Several routes return local/browser fallback responses when D1 is unavailable.
- Browser state can drive behavior when backend state is missing.
- Test docs from earlier QA mention direct admin access bugs; current source adds client-side redirect and tests for `canAccessPath`, but production readiness still needs server-side enforcement.

## Production-Readiness Blockers

1. No durable server-issued session mechanism observed.
2. No middleware-enforced protected route boundary observed.
3. Page guards are client-side localStorage checks.
4. Admin API routes lack consistent server-authoritative role enforcement.
5. Workflow/Brain/account/billing APIs generally trust request org/user IDs.
6. Role checks on sensitive APIs may trust request body role.
7. Production environment switch trusts request body role.
8. D1 and Prisma auth/admin paths remain mixed.
9. Demo defaults remain embedded in request handling.
10. Logout does not invalidate a server session.
11. No route-level permission matrix exists yet.

## Risks

- A user could bypass UI-only restrictions by calling APIs directly if deployed without stronger server guards.
- Cross-organization access risk exists where routes accept arbitrary `organization_id`.
- Audit logs may record spoofed actor IDs where routes trust `user_id` from request body.
- Production mode could be attempted with spoofed role data unless server session verification is added.
- Local fallback behavior can hide production auth gaps during validation.

## Recommendations

- Do not claim production auth readiness.
- Keep EmailORC MVP/demo-stage until session and API guards are implemented.
- Treat localStorage as display/cache state only in production plans.
- Require a server-authenticated principal before sensitive reads/writes.
- Use D1 membership as the likely deployed role source of truth, with a clear local dev strategy.
- Build an explicit route permission matrix before coding.

## Proposed Sprint 011

Sprint 011 should be **Auth / Session Guard Design and Permission Matrix**.

Recommended deliverables:

- Decide session mechanism: HTTP-only signed cookie, JWT, or approved auth provider.
- Define `getCurrentUser` / `requireUser` / `requireRole` server helpers.
- Map every API route to required role and organization scope.
- Define middleware/page guard strategy.
- Define demo/test-live/production auth differences.
- Decide Prisma fallback behavior for local auth.
- Produce an implementation blueprint, but do not implement until approved.

## Validation

Validation commands for this documentation audit:

```bash
git status --short
npm run test
npm run build
npm run lint
npm run test:e2e:safe
```

Results:

- `git status --short` completed and confirmed the repo had pre-existing modified/untracked files, including `prisma/dev.db`.
- `npm run test` passed: 15 tests passed.
- `npm run lint` passed with existing React hook dependency warnings.
- `npm run test:e2e:safe` passed: 2 Playwright tests passed.
- `npm run build` failed after compiling successfully during page data collection with `PageNotFoundError: Cannot find module for page: /_document`.

Unsafe commands skipped:

- Broad `npm run test:e2e`.
- Prisma migrate/db push/db pull/db reset/generate.
- Seed commands.
- Wrangler deploy.
- Cloudflare D1 write commands.
- Secret-dependent commands.
- Sending and live integration commands.

## Files Created

- `docs/AUTH_SESSION.md`
- `planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md`

## Files Updated

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/sprints/010-auth-session-readiness-audit/acceptance.md`
