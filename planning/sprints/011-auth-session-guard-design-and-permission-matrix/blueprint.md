# Sprint 011 Blueprint — Auth / Session Guard Design and Permission Matrix

## Objective

Create durable design documentation for auth/session hardening without implementing behavior changes.

## Files to Read First

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `docs/AUTH_SESSION.md`
- `planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md`
- `planning/sprints/010-auth-session-readiness-audit/requirements.md`
- `planning/sprints/010-auth-session-readiness-audit/blueprint.md`
- `planning/sprints/010-auth-session-readiness-audit/acceptance.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/requirements.md`

## Files / Areas To Inspect Read-Only

Use Sprint 010 report first. Inspect source files only to confirm design context, not to implement.

Likely read-only areas:

- `app/login/page.tsx`
- `app/mvp/*`
- `src/components/layout/*`
- `src/lib/auth-rules.ts`
- `src/lib/roles.ts`
- `src/lib/*auth*`
- `src/lib/*session*`
- `app/api/auth/*`
- `app/api/admin/*`
- `app/api/workflow/*`
- `app/api/drafts/approve/route.ts`
- Brain / billing / usage / account API samples
- `app/api/environment/status/route.ts`
- `next.config.mjs`
- `wrangler.jsonc`, names/config only, no secrets

## Files To Create

Create if useful:

- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/auth-session-design.md`

This design report should include:

1. Sprint 010 findings summary.
2. Target auth/session principles.
3. Recommended session mechanism.
4. Server current-user/helper contract.
5. Canonical role model and aliases.
6. Page permission matrix.
7. API route-group permission matrix.
8. Middleware boundary design.
9. Environment-specific auth rules.
10. localStorage trust limits.
11. Prisma/D1 fallback policy.
12. Validation requirements.
13. Sprint 012 implementation sequence.
14. Risks and unresolved questions.

## Files To Update

Update:

- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md`

Only update these files with design/documentation content. Do not change application behavior.

## Design Requirements

### Session Mechanism

Document the recommended first implementation direction:

- Server-issued HTTP-only session cookie or equivalent server-verifiable token.
- D1-backed deployed user/membership lookup.
- Explicit local fallback rules.
- Expiration and logout expectations.
- No production reliance on localStorage identity.

### Current-User Helper Contract

Define a future helper contract such as:

- `requireCurrentUser(request/context)`
- `getOptionalCurrentUser(request/context)`
- `requireRole(currentUser, allowedRoles)`
- `requireOrgAccess(currentUser, organizationId, allowedRoles)`

The exact function names may remain recommendations unless the repo already has naming patterns.

Document expected return shape:

- user id
- email
- organization id(s)
- active organization id
- canonical role
- environment mode
- source of truth
- errors for unauthenticated/forbidden states

### Permission Matrix

Define target access for:

- public auth routes
- `/mvp/*`
- `/mvp/admin`
- workflow import/records/drafts/export
- draft approval
- admin APIs
- Brain/provider APIs
- billing/plan/usage APIs
- account intelligence APIs
- environment status and transition APIs

### Environment Rules

Document:

- Demo may use isolated seeded demo identity and sample data.
- Test-live should use production-like auth boundary with controlled data.
- Production must require server-authenticated sessions and D1-backed source-of-truth behavior.
- `live-test` should be treated as legacy wording normalized to `test-live`.

### Fallback Policy

Document:

- D1 is deployed auth/workflow source-of-truth direction.
- Prisma remains local fallback/development unless a future sprint changes it.
- Production must not silently fall back to Prisma/local/demo identity.
- localStorage is display/UX state only.

## Validation Plan

Run only safe validation commands after documentation updates:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

If `npm run build` fails with the known Sprint 010 `/_document` page module error, document it and do not fix it in Sprint 011.

Do not run:

- database commands
- Prisma migrate/db push/db pull/db reset/generate
- seed commands
- deployment commands
- Wrangler deploy
- D1 write commands
- sending commands
- live integration commands

## Completion Steps

1. Read required docs and Sprint 010 report.
2. Confirm Sprint 011 is documentation/design only.
3. Create/update Sprint 011 design artifacts.
4. Update durable docs and planning state.
5. Run safe validation commands.
6. Mark acceptance items complete/incomplete with notes.
7. Recommend Sprint 012 implementation scope.
8. Stop. Do not start Sprint 012.
