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
