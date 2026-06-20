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
