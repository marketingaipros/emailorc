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

Sprint 015 applied the foundation to Brain / provider API routes.

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
| Brain/provider APIs | Guarded in Sprint 015 | Requires valid server session and organization-scoped authorization for approved Brain/provider routes. |
| billing/usage/account APIs | Future work | Not in Sprint 015 unless physically and clearly Brain/provider-scoped. |
| page/middleware/localStorage cleanup | Future work | Client-side guards remain UX aids only. |

---

## Sprint 015 Brain / Provider Guard Contract

Sprint 015 established for approved Brain/provider routes:

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

---

## Sprint 053 Local Auth / Role Focus

Sprint 053 exists because local Outlook Draft testing is blocked before Microsoft OAuth begins.

Observed local behavior:

- `/api/integrations/microsoft/connect` returned `Authentication required.` under local Wrangler testing.
- Super Admin user-role updates reportedly did not save.
- A locally created user was assigned `client_admin`, creating uncertainty about the intended local test user role and session state.

Sprint 053 must prove:

- supported local login creates a valid server session under `npm run preview`
- `/api/auth/me` recognizes that session
- `/api/integrations/microsoft/connect` reaches the authenticated path for a valid session
- logged-out users remain blocked
- Super Admin same-organization role updates save when permitted
- cross-organization or unauthorized role changes remain blocked

Canonical MVP roles for this sprint:

| Role | Intended meaning |
|---|---|
| `super_admin` | Internal system owner with global administrative access. |
| `client_admin` | Customer/account owner within one organization. |
| `editor` | Workflow contributor within one organization. |
| `viewer` | Read-only organization user. |

Sprint 053 does not change Microsoft OAuth scope, Graph draft-only behavior, D1 schema, or Sprint 052 status.

### Sprint 053 Implementation Result

Root cause:

- `npm run preview` serves the production-built Worker over local HTTP.
- The previous session cookie helper set `Secure` whenever `NODE_ENV === "production"`.
- Browsers do not send Secure cookies over `http://localhost`, so `/api/auth/me` and `/api/integrations/microsoft/connect` could not see the session.
- Local D1 also had `app_sessions` but lacked the documented demo Super Admin row.

Fix:

- Session cookie `Secure` behavior now follows the request URL protocol.
- Local HTTP preview cookies are not marked Secure.
- HTTPS requests still receive Secure cookies.
- In demo mode only, and only for local request hosts, login can bootstrap the documented `admin@demo.com` Super Admin when that local D1 user row is absent.
- The local bootstrap path rejects non-local hosts and does not create arbitrary users or roles.

Validated:

- `admin@demo.com` login under `npm run preview`
- `/api/auth/me` returns `super_admin` and `org_demo`
- Microsoft connect no longer returns immediate unauthenticated JSON for that session
- logged-out Microsoft connect still returns `401`

### Sprint 053-A Amendment

Sprint 053-A hardened local demo bootstrap:

- `APP_ENV=demo` alone is not enough to permit bootstrap.
- Bootstrap also requires a local request host: `localhost`, `127.0.0.1`, or `[::1]`.
- Unknown or non-local hosts default blocked.
- Bootstrap creates only the documented demo Super Admin account.

Admin role changes now protect platform-owner access in the admin user paths:

- final Super Admin self-demotion is blocked
- final Super Admin self-deactivation is blocked
- final Super Admin self-archive is blocked
- assignable roles stay canonical
- same-org user updates are allowed when otherwise authorized
- cross-org user updates are rejected
