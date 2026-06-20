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
