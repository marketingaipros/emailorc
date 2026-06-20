# Sprint 053 Blueprint - Local Auth, Role Clarity, and Admin Save Fix

## Required Discovery Before Edits

Read:

- `AGENTS.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- Sprint 052 files
- current login/session/current-user/admin role routes and admin UI
- `wrangler.jsonc` and `.dev.vars.example` without printing secrets
- migrations `0010_app_sessions.sql` and `0011_microsoft_outlook_drafts.sql`

Before code changes, report:

1. Why the valid local app user did not have a recognized session at `/api/integrations/microsoft/connect`.
2. Whether this is login-flow, cookie-domain/secure-cookie, preview-runtime, D1-binding, migration, user bootstrap, or role-authorization behavior.
3. The exact existing role enum and allowed role transitions.
4. The exact endpoint/UI path used to save a user role.
5. The smallest fix set.

## Likely Implementation Surfaces

Confirm before modifying:

- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `src/lib/server-session.ts`
- `src/lib/current-user.ts`
- `src/lib/admin-auth.ts`
- `src/lib/auth-rules.ts`
- `src/lib/roles.ts`
- relevant admin user API routes
- relevant User Administration page
- Outlook connect route only if it incorrectly bypasses the established session convention
- tests for session/auth/admin roles
- docs and Sprint 053 planning files

Do not modify Sprint 052 OAuth, Graph, encryption, scopes, or migration unless the root cause proves a direct compatibility issue.

## Implementation Sequence

1. Trace local login under Wrangler preview through D1 lookup, session creation, cookie setting, and `/api/auth/me` lookup.
2. Confirm whether local D1 has `app_sessions` from `0010_app_sessions.sql` and whether the selected user has a valid membership/role.
3. Trace `/api/integrations/microsoft/connect` through `getCurrentUser` and confirm whether it fails at missing cookie, missing D1 session, expired/revoked session, missing organization, or role normalization.
4. Trace Super Admin role save through the admin UI payload and admin user update route.
5. Fix the smallest proven incompatibility.
6. Add focused tests for the proven failure and guardrails.
7. Update docs/planning after implementation.

## 053-A Hardening Sequence

After the Sprint 053 local auth/session fix and before commit:

1. Inspect existing runtime signals available without reading secrets.
2. Add an `isLocalDemoRuntime` guard that requires demo environment intent and an explicit local runtime condition, and defaults false when uncertain.
3. Gate `bootstrapDemoSuperAdminIfMissing()` behind that guard.
4. Confirm bootstrap cannot run in remote D1, deployed preview, production, test-live, or any non-demo environment.
5. Harden `PATCH /api/admin/users/[id]` to validate target user/membership, enforce organization-boundary policy, prevent final Super Admin self-demotion, prevent final Super Admin self-deactivation/archive, prevent zero-Super-Admin outcomes, and preserve canonical role normalization.
6. Add focused tests for all new guard decisions.
7. Rerun validation gates.

## Validation

Run after implementation:

```bash
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Manual local validation:

1. Start with `npm run preview`.
2. Use supported local login/bootstrap flow to establish a known local Super Admin session.
3. Confirm `/api/auth/me` recognizes that session.
4. Open Integrations and click Outlook Connect.
5. Expected: OAuth redirect begins or a safe Microsoft configuration error appears; not `Authentication required.` for the valid session.
6. Confirm logged-out path remains blocked.
7. Confirm Super Admin can edit an allowed same-org user role.
8. Confirm `client_admin`, `editor`, and `viewer` restrictions remain correct.
9. Confirm final Super Admin self-demotion/self-deactivation is rejected.
10. Confirm cross-org user update behavior matches the documented policy.

Do not connect Microsoft or create an Outlook draft during this sprint unless the owner explicitly approves resuming Sprint 052 UAT after Sprint 053 passes.
