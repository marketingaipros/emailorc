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
