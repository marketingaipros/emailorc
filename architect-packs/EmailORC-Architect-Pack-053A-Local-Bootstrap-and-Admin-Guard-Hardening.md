# EmailORC Architect Pack 053-A — Local Bootstrap and Admin Guard Hardening

**Status:** Approved architect amendment  
**Parent sprint:** 053-local-auth-role-admin-fix  
**Scope:** Narrow hardening before Sprint 053 commit  
**Out of scope:** Outlook OAuth, Graph scopes/routes, D1 migrations, Entra configuration, remote D1, deploy, `.dev.vars`, `prisma/dev.db`

## Architect-facing requirements

### Problem
Sprint 053 fixed local HTTP session cookies and restored local authentication. Read-only review found two unresolved safety gaps:

1. The demo Super Admin bootstrap can execute in any environment with `APP_ENV=demo`, including a remote/deployed demo environment.
2. Admin user update allows unsafe privilege changes: self-demote/self-archive of the final Super Admin and no explicit organization-boundary check for normal admin-user management.

### Required decisions
1. `admin@demo.com` bootstrap is **local-only**. It must require an explicit local-only runtime signal that cannot be satisfied merely by `APP_ENV=demo`.
2. No automatic bootstrap may occur against remote D1 or deployed/preview environments.
3. A Super Admin may not demote, archive, deactivate, or otherwise remove their own final Super Admin access.
4. Role update boundaries must be explicit:
   - `super_admin` is internal/global and may manage user roles only under the documented policy.
   - Normal organization-bound management must reject cross-organization target users.
5. Canonical assignable roles remain:
   `super_admin`, `client_admin`, `editor`, `reviewer`, `viewer`.
6. `client_admin` remains the client/business-owner role. `editor`, `reviewer`, and `viewer` are non-owner roles.

## Builder-facing implementation plan

1. Inspect how Wrangler/local runtime is detectable in the existing app.
2. Add a narrowly scoped `isLocalDemoRuntime` guard. It must require:
   - demo environment intent, and
   - an explicit local runtime condition or local-only flag documented for local preview,
   - and must default to false when uncertain.
3. Gate `bootstrapDemoSuperAdminIfMissing()` behind that guard.
4. Ensure bootstrap cannot execute for remote D1, deployed preview, production, or test-live.
5. Harden `PATCH /api/admin/users/[id]`:
   - validate target user exists;
   - enforce the intended org boundary where applicable;
   - prevent final Super Admin self-demote/self-deactivate/self-archive;
   - prevent leaving the system with zero Super Admins;
   - preserve canonical role normalization.
6. Add focused tests for:
   - demo bootstrap rejected outside local runtime;
   - demo bootstrap allowed only under explicit local-demo runtime;
   - self-demotion of final Super Admin rejected;
   - final Super Admin deactivation/archive rejected;
   - cross-org update rejected where policy requires;
   - canonical allowed role update still succeeds.
7. Update Sprint 053 docs/acceptance/validation to record the safeguards.

## Acceptance criteria

- [ ] Demo Super Admin bootstrap cannot run in production, preview deployment, remote D1, test-live, or any uncertain runtime.
- [ ] Bootstrap only creates the documented local demo account under explicit local-demo conditions.
- [ ] No path can leave the system without a Super Admin.
- [ ] Final Super Admin cannot self-demote, self-deactivate, or self-archive.
- [ ] Role updates reject disallowed/cross-org targets under the documented policy.
- [ ] `client_admin` is preserved as the client owner role.
- [ ] Existing local auth session fix remains working:
  - local HTTP cookie works for local preview;
  - HTTPS keeps `Secure`;
  - authenticated Outlook connect no longer returns `Authentication required.`
- [ ] `npm run test`, `npm run lint`, `npm run test:e2e:safe`, and `npm run build` pass.
- [ ] No Outlook code, secrets, migration execution, remote D1 command, deploy, or `.dev.vars` change occurs.
- [ ] `prisma/dev.db` remains untouched and uncommitted.

## Codex handoff prompt

Apply this amendment to Sprint 053 planning/docs first, then read the active sprint files and summarize:
1. the local-only bootstrap rule,
2. the Super Admin protection rules,
3. exact files to modify,
4. exact tests to add,
5. any ambiguity.

Do not implement until the summary is approved.

After approval, implement only the hardening described in this amendment. Do not run migrations, deploy, use remote D1, modify Outlook integration, inspect/print secrets, or touch `prisma/dev.db`. Do not commit or push. Report root cause, changed files, validation results, manual local-auth regression result, and remaining git status.
