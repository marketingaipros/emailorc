# Sprint 053 Acceptance Criteria - Local Auth, Role Clarity, and Admin Save Fix

## Authentication And Session

- [x] A local user can authenticate through the supported app login flow under `npm run preview`.
- [x] `/api/auth/me` returns the expected authenticated user/session result for that user.
- [x] `/api/integrations/microsoft/connect` no longer returns immediate unauthenticated JSON for that valid session.
- [x] A logged-out user still receives a safe unauthenticated response.
- [x] Session creation, lookup, expiry, and cookie handling work against local D1 with `0010_app_sessions.sql` applied.
- [x] No session identifier, token, password, or secret is shown in logs, browser responses, docs, or test output.

## User Management And Roles

- [x] A Super Admin can save a permitted role update for a user in the same supported local organization.
- [x] Unauthorized role update attempts remain blocked.
- [x] The UI clearly labels each available role and its intended use.
- [x] Local-user creation behavior is documented and deterministic: either default role is intentional, role selection is required, or a safer default is implemented and tested.
- [x] No user from one organization can be assigned or administered across another organization.

## 053-A Hardening

- [x] Demo Super Admin bootstrap cannot run in production, preview deployment, test-live, or non-local request hosts.
- [x] Bootstrap only creates the documented local demo account under explicit local-demo conditions.
- [x] No admin user update path can leave the system without a Super Admin.
- [x] Final Super Admin cannot self-demote, self-deactivate, or self-archive.
- [x] Role updates reject disallowed/cross-org targets under the documented policy.
- [x] `client_admin` is preserved as the client owner role.
- [x] Existing local auth session fix remains working:
  - local HTTP cookie works for local preview
  - HTTPS keeps `Secure`
  - authenticated Outlook connect no longer returns `Authentication required.`

## Regression Boundaries

- [x] Sprint 052 Outlook code remains draft-only.
- [x] No `Mail.Send`, `/send`, or `/sendMail` capability is introduced.
- [x] No remote database operation, deployment, or secret change is performed.
- [x] Existing tests, lint, safe E2E, and build pass.

## Completion Boundary

Sprint 053 is complete only when the local EmailORC auth/session path, Super Admin role-save path, and 053-A bootstrap/admin-guard hardening are validated. Sprint 052 remains awaiting Entra configuration, D1 migration application, and Outlook mailbox UAT.

## Validation Results

Sprint 053 and 053-A validation passed on 2026-06-20:

- `npm run test`: passed, 52 tests
- `npm run lint`: passed with existing React hook warnings
- `npm run test:e2e:safe`: passed, 2 tests
- `npm run build`: passed with existing React hook warnings
- `npm run preview`: started on local Wrangler
- Manual login as `admin@demo.com`: `200`
- Manual `/api/auth/me`: `200`, role `super_admin`, organization `org_demo`
- Manual `/api/integrations/microsoft/connect`: `307`, not `Authentication required.`
- Manual logged-out connect: `401`
- Manual same-org Super Admin role update: `200`, persisted `client_admin`
- Manual cross-org user update: `403`
- Manual final Super Admin self-demotion: `403`
- Manual final Super Admin self-deactivation: `403`
- Manual final Super Admin archive/delete: `403`
