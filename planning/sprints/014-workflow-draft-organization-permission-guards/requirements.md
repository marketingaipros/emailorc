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
