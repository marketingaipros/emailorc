# Sprint 011 Auth / Session Design Report

**Project:** EmailORC  
**Sprint:** 011 - Auth / Session Guard Design and Permission Matrix  
**Date:** 2026-05-21  
**Status:** Design/documentation only

## Scope

This sprint designs the target auth/session guard model for future implementation. It does not implement auth, sessions, middleware, API guards, UI guards, schema changes, migrations, seed changes, env changes, deployment changes, database writes, sending, or live integrations.

EmailORC remains MVP/demo-stage. Production readiness is not established.

## 1. Sprint 010 Findings Summary

Sprint 010 found that EmailORC has useful identity data and server-side credential checks, but no production-ready session boundary.

Key findings:

- Login and signup return identity, organization, and role data that the browser stores in `localStorage`.
- No durable server-issued app session cookie, JWT, bearer-token authorization layer, or middleware-enforced session boundary was found.
- `/mvp/*` page access depends primarily on client-side checks in layout/navigation code.
- `/mvp/admin` is client-blocked for non-Super Admin users, but not protected as a server-authoritative boundary.
- `/api/auth/login` and invite acceptance include real server validation.
- `/api/auth/me`, draft approval, and environment production transition include partial server checks but still depend on request-supplied user, role, or organization data.
- Admin, workflow, Brain, billing, usage, account-intelligence, and environment mutation routes need a shared server-authenticated current-user model.
- D1 is the deployed source-of-truth direction; Prisma/SQLite remains local development, fallback, and transition support.
- Demo/local fallback identities such as `org_demo` and `user_super_admin` are production blockers unless isolated to demo.

## 2. Recommended Session Mechanism

The first implementation direction should be a server-issued, HTTP-only session cookie backed by server-verifiable session state.

| Area | Recommendation |
|---|---|
| Session transport | HTTP-only, secure cookie where supported by environment. |
| Session value | Opaque random session id, not a serialized user/role payload. |
| Deployed lookup | D1-backed session/user/membership lookup. |
| Local lookup | Explicit Prisma/local fallback only in local development or demo rules, never silently in production. |
| Expiration | Store explicit expiration and reject expired sessions. |
| Rotation | Rotate or replace session on login and privilege-sensitive changes where practical. |
| Logout | Clear cookie and invalidate the server session when session storage exists. |
| Client state | `localStorage` may mirror display data, but never proves authorization. |

JWT or bearer-token auth should not be the default first step unless a future architecture decision chooses it. The current app already has browser-local identity drift; an opaque server session keeps authority on the server and reduces client-side spoofing risk.

## 3. Current-User / Server Helper Contract

Future implementation should centralize auth checks in server helpers so API routes do not each invent identity behavior.

Recommended helper contracts:

| Helper | Purpose |
|---|---|
| `getOptionalCurrentUser(requestOrContext)` | Resolve current user when available; return `null` for unauthenticated requests. |
| `requireCurrentUser(requestOrContext)` | Resolve current user or return/throw an unauthenticated result. |
| `requireRole(currentUser, allowedRoles)` | Enforce canonical role membership. |
| `requireOrgAccess(currentUser, organizationId, allowedRoles)` | Verify the user belongs to or administers the target organization. |
| `requireEnvironmentPermission(currentUser, targetMode)` | Enforce environment-mode transitions, especially production. |

Expected current-user shape:

| Field | Requirement |
|---|---|
| `userId` | Server-resolved user id. |
| `email` | Server-resolved email. |
| `displayName` | Optional display name. |
| `activeOrganizationId` | Server-resolved active org for request context. |
| `memberships` | Organization memberships and canonical roles. |
| `role` | Canonical role for active org or global context. |
| `environmentMode` | Normalized `demo`, `test-live`, or `production` context. |
| `source` | `d1`, `prisma-local`, or `demo-isolated`; never unlabelled fallback. |

Error behavior should be consistent:

| Condition | Target Result |
|---|---|
| Missing/invalid session | `401 Unauthorized`. |
| Valid session but insufficient role | `403 Forbidden`. |
| Valid session but wrong organization | `403 Forbidden`. |
| Missing required target resource | `404 Not Found` or scoped not-found where appropriate. |
| Unsafe production fallback | Fail closed, do not fall back to demo/local identity. |

## 4. Canonical Roles And Aliases

Sprint 010 observed role strings such as `SUPER_ADMIN`, `CLIENT_ADMIN`, `EDITOR`, `REVIEWER`, and `VIEWER`, plus aliases such as `admin` and `system_admin`.

Use lowercase underscore canonical roles for server authorization decisions:

| Canonical Role | Observed / Allowed Aliases | Purpose |
|---|---|---|
| `super_admin` | `SUPER_ADMIN`, `admin`, `system_admin`, `Super Admin` | Internal/global admin; cross-org controls; production transition authority. |
| `client_admin` | `CLIENT_ADMIN`, `Client Admin`, `org_admin` | Organization admin; manages organization-scoped workflows/settings where allowed. |
| `editor` | `EDITOR`, `Editor` | Organization workflow user who may create/edit records or drafts where allowed. |
| `reviewer` | `REVIEWER`, `Reviewer` | Organization workflow user who may review/approve drafts where allowed. |
| `viewer` | `VIEWER`, `Viewer`, `user` | Read-oriented organization user. |
| `demo_user` | Demo seeded identities only | Demo-only authority for sample/resettable flows. Not production authority. |

Authorization should normalize aliases before checks. Unknown roles should fail closed for sensitive routes.

## 5. Page Permission Matrix

Page guards improve user experience but are not the production security boundary. API/server enforcement remains required.

| Page / Area | Target Access | Notes |
|---|---|---|
| `/login` | Public | Redirect authenticated users only as UX behavior. |
| `/mvp` | Authenticated user or isolated demo user | Main app shell should require valid server session in future implementation. |
| `/mvp/upload` | `super_admin`, `client_admin`, `editor`; demo allowed only in demo | Upload/import is org-scoped. |
| `/mvp/records` | `super_admin`, `client_admin`, `editor`, `reviewer`, `viewer`; demo allowed only in demo | Read access can be broader than mutation access. |
| `/mvp/drafts` | `super_admin`, `client_admin`, `editor`, `reviewer`; viewer read-only if supported | Approval requires stricter API guard plus QA threshold. |
| `/mvp/export` | `super_admin`, `client_admin`, `reviewer`; editor if explicitly approved later | Export should remain human-reviewed and exclude do-not-contact outputs. |
| `/mvp/campaigns` | Authenticated org users by workflow role | Mutations should be role-scoped through APIs. |
| `/mvp/admin` | `super_admin` only | Client guard plus server/middleware boundary in future implementation. |
| `/mvp/settings` | Authenticated users; admin subsections require `client_admin` or `super_admin` | Section-level authorization may be needed later. |
| `/mvp/profile` | Authenticated current user | Self-scope only unless admin route. |
| `/mvp/brain-center` | `super_admin` for global provider controls; `client_admin` for org-scoped settings if supported | Provider keys and model behavior are sensitive. |
| `/mvp/integrations` | `super_admin` or `client_admin`; live integration enablement remains disabled | No sending enablement in this sprint. |
| `/mvp/reply`, `/mvp/howto` | Authenticated user or public only if explicitly documented | Keep conservative until route purpose is finalized. |

## 6. API Route-Group Permission Matrix

Future API guards must derive user, organization, and role from server-authenticated current-user context, not request-controlled values.

| API Route Group | Target Access | Authorization Notes |
|---|---|---|
| `POST /api/auth/login` | Public | Validates credentials; future implementation creates server session. |
| `POST /api/auth/signup` | Public or invite-gated by environment | Creates user/session only under approved signup rules. |
| `GET/POST /api/auth/accept-invite` | Public with token validation | Token validation remains server-authoritative. |
| `GET /api/auth/me` | Authenticated session | Must not fall back to query-provided role/org in test-live or production. |
| Future `/api/auth/logout` | Authenticated or session-tolerant | Clears server session and client display state. |
| `app/api/admin/*` | `super_admin` | Route group should fail closed unless a route is explicitly documented lower-risk. |
| `app/api/workflow/import` | `super_admin`, `client_admin`, `editor` with org access | Do not trust request `organization_id` without membership check. |
| `app/api/workflow/records` | Authenticated org user; mutations role-scoped | Reads and writes must be organization-scoped. |
| `app/api/workflow/drafts` | Authenticated org user; mutations role-scoped | Draft edits and list operations must be organization-scoped. |
| `app/api/workflow/export` | `super_admin`, `client_admin`, `reviewer` with org access | Export approved/non-DNC only. |
| `POST /api/drafts/approve` | `super_admin`, `client_admin`, `reviewer` with org/draft access | Keep QA score >= 90 and content safety checks; do not trust body role. |
| `app/api/brain/*` provider/global settings | `super_admin` | Provider keys/model controls are sensitive. |
| `app/api/brain/*` org-scoped learning/search | `super_admin` or `client_admin`; narrower reads by org user if safe | Separate global provider config from org knowledge use. |
| `app/api/billing/current-plan` | Authenticated org user for read; `client_admin` or `super_admin` for changes | Financial/account controls are sensitive. |
| `app/api/usage/logs` | `super_admin` or scoped org admin/user by purpose | Must not trust query org id alone. |
| `app/api/account-intelligence` | Authenticated org user/admin with org access | Reads/writes are organization-scoped. |
| `GET /api/environment/status` | Authenticated org user or safe public status if explicitly kept | Prefer authenticated org-scoped status for live environments. |
| `POST /api/environment/status` | `super_admin` for production transitions; `client_admin` may manage non-production if approved | Must not trust request body role. |

## 7. Middleware Boundary Plan

Future middleware or equivalent server boundary should be introduced after session creation and current-user helpers exist.

Recommended boundary:

| Route Pattern | Boundary |
|---|---|
| `/login` | Public. |
| `/mvp/:path*` | Requires authenticated app session, except explicit public/demo exceptions. |
| `/mvp/admin/:path*` and `/mvp/admin` | Requires authenticated `super_admin`. |
| `/api/auth/login`, `/api/auth/signup`, `/api/auth/accept-invite` | Public with route-level server validation. |
| `/api/auth/me` | Requires valid server session. |
| `/api/admin/:path*` | Requires `super_admin`. |
| Sensitive `/api/:path*` | Route-level helper checks for user/org/role. |

Do not add middleware until session creation, current-user resolution, and route-level error behavior are designed and tested. Middleware should not break demo mode without explicit demo exceptions.

## 8. Environment-Mode Auth Behavior

| Mode | Auth / Session Behavior |
|---|---|
| `demo` | May allow isolated seeded demo identity and safe resettable demo data. Demo identity must be labelled and isolated. Demo fallback cannot authorize test-live or production behavior. |
| `test-live` | Should use the same server-authenticated boundary intended for production validation, with controlled test data and no production-readiness claim. Demo/browser-local fallback should be disabled outside demo. |
| `production` | Future target only. Must require server-authenticated sessions, D1-backed user/membership truth, server-side API authorization, no demo fallback, no silent Prisma fallback, and consistent 401/403 behavior. |
| `live-test` | Legacy wording. Future implementation should normalize to `test-live` without changing behavior during this design sprint. |

## 9. localStorage Trust Limits

`localStorage` can remain useful for UI display, cached labels, navigation hints, and optimistic UX state. It must not be an authorization source.

Allowed future uses:

- Display name/email/organization labels after server session is established.
- Non-authoritative nav hints.
- Client cache that can be refreshed from `/api/auth/me`.
- UX-only selected organization or environment display after server validation.

Disallowed as auth truth:

- Proving a user is logged in for sensitive pages.
- Proving a role such as `super_admin`.
- Authorizing admin APIs.
- Authorizing workflow imports, exports, draft approvals, billing, Brain/provider actions, or environment transitions.
- Supplying trusted `organization_id`, `user_id`, or role values for server decisions.

## 10. D1 And Prisma Fallback Policy

| Context | Policy |
|---|---|
| Deployed test-live/production-like runtime | D1 is the source-of-truth direction for user, membership, role, environment, and workflow auth checks. |
| Local development | Prisma/SQLite may remain a local fallback if explicitly labelled and never confused with production auth readiness. |
| Demo mode | Seeded/fallback demo identities may exist only as isolated demo behavior. |
| Test-live | Should behave like production auth boundary with controlled data; no demo fallback identity. |
| Production | Must fail closed when D1/session validation is unavailable. No silent Prisma/local/demo fallback. |
| Documentation | Any fallback must be named in reports as `d1`, `prisma-local`, or `demo-isolated`. |

## 11. Validation Requirements For Future Implementation

Future implementation sprints should include unit and route tests for:

- Role normalization aliases and unknown-role fail-closed behavior.
- `requireCurrentUser` unauthenticated rejection.
- `/api/auth/me` requiring a server session.
- Admin API rejection for non-Super Admin users.
- Workflow API rejection for wrong-organization requests.
- Draft approval preserving QA >= 90 and using server role, not body role.
- Environment production transition requiring server-authoritative `super_admin`.
- Demo fallback unavailable in `test-live` and `production`.
- Consistent `401 Unauthorized` and `403 Forbidden`.
- localStorage tampering not granting API access.

Safe sprint validation should continue to run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

The known Sprint 010 build failure with `PageNotFoundError: Cannot find module for page: /_document` remains a validation risk until fixed in an approved sprint.

## 12. Sprint 012 Recommended Implementation Sequence

Sprint 012 should be implementation-focused only after this design is accepted. Keep it narrow enough to verify.

Recommended first implementation sequence:

1. Add shared role normalization and permission matrix helpers or consolidate existing helpers.
2. Add server current-user/session helper with consistent 401/403 results.
3. Add server session creation to login and session clearing to logout behavior.
4. Protect `/api/auth/me` with the server session.
5. Protect `app/api/admin/*` with server-side `super_admin` enforcement.
6. Protect workflow routes with organization membership checks.
7. Protect draft approval with server role/draft/org checks while preserving QA threshold.
8. Add middleware/page boundary for `/mvp/*` and `/mvp/admin` only after helpers are stable.
9. Convert client `localStorage` role use to display/navigation hints where needed.
10. Add focused validation tests and run the safe gate.

Recommended split if scope grows:

- Sprint 012A: role normalization, session helper, `/api/auth/me`.
- Sprint 012B: admin/workflow API guards.
- Sprint 012C: page/middleware guard and localStorage display-only cleanup.

## 13. Risks And Open Questions

Risks:

- Overbroad middleware could break demo flows if added before session behavior is stable.
- Permission mapping could be too narrow for current MVP users if `EDITOR`, `REVIEWER`, and `VIEWER` are collapsed too aggressively.
- Silent fallback between D1 and Prisma could hide production auth failures.
- Existing client-side role checks may create false confidence until API guards exist.
- The known build failure may block full production validation even after auth work.

Open questions:

- Should public signup remain enabled outside demo/test-live, or become invite-only before production?
- Should `EDITOR`, `REVIEWER`, and `VIEWER` stay as separate production roles or map into a simpler `user` role for first implementation?
- Which Brain Center routes are global provider controls versus organization-scoped knowledge actions?
- Should `GET /api/environment/status` remain public/read-only or require authenticated org scope in test-live and production?
- Should the Sprint 010 build failure be fixed before or alongside Sprint 012 auth implementation?
