# EmailORC Architect Pack 053 — Local Auth, Role Clarity, and Admin Save Fix

## Sprint Status
PLANNED — do not implement until this pack is applied to the project folder and Codex has summarized the sprint plan.

## Why this sprint exists

The local Outlook Draft test is blocked before Microsoft OAuth begins.

Observed local behavior:
- Navigating to `http://localhost:8787/api/integrations/microsoft/connect` returns `{"error":"Authentication required."}`.
- The user also reported that, while acting as Super Admin, user-role updates would not save.
- A locally created user was automatically assigned `client_admin`, creating uncertainty about the correct client role and whether the test account has a valid session/role.

Sprint 052 remains:
`IMPLEMENTED — awaiting Entra configuration, D1 migration application, and Outlook mailbox UAT`

Sprint 052 must not be marked PASS during this sprint.

---

# Architect-Facing Requirements

## Goal

Make local EmailORC authentication and user administration reliable enough to establish a known valid local Super Admin session and a known valid test user before resuming the Outlook Draft UAT.

## In Scope

1. Diagnose and fix the local authentication/session path used by:
   - EmailORC login
   - `/api/auth/me`
   - `/api/integrations/microsoft/connect`
   - local Wrangler/D1 runtime
2. Ensure a valid authenticated local user can reach the Microsoft connect route without the immediate `Authentication required.` response.
3. Diagnose and fix the Super Admin user-role save failure.
4. Make role labels and role assignment behavior clear in the User Administration UI.
5. Document the intended MVP role meanings:
   - `super_admin`
   - `client_admin`
   - `editor`
   - `viewer`
6. Verify locally created users receive the intended default role, or explicitly require selection rather than silently assigning an incorrect role.
7. Preserve Sprint 052 hard limits:
   - no `Mail.Send`
   - no Outlook send capability
   - no Graph `/send` or `/sendMail`
   - no Microsoft secret changes
   - no remote D1 migration
   - no deploy

## Out of Scope

- Microsoft OAuth connection itself, Graph draft creation, or mailbox UAT.
- Changing Outlook scopes, redirect URIs, token encryption, D1 schema, or Sprint 052 implementation unless a direct integration defect is proven.
- Production deployment, remote D1 changes, user-data reset, seed/reset commands, or unrelated environment changes.
- New role types, multi-user permissions redesign, CRM features, or dashboard work.

## Product Role Definitions

| Role | Intended MVP meaning |
|---|---|
| `super_admin` | Internal system owner. Can manage organizations, users, roles, configuration, and all permitted internal administrative workflows. |
| `client_admin` | Customer/account owner. Can manage users and approved workflows within their own organization, but cannot access another organization or global system administration. |
| `editor` | Internal or client user allowed to work assigned workflow records/drafts within their organization, but cannot manage organization users/settings. |
| `viewer` | Read-only organization user. Cannot create, edit, approve, export, connect integrations, or manage users. |

For the immediate Outlook local test:
- The **EmailORC app user** should be a known authenticated `super_admin` only for troubleshooting.
- The **Microsoft mailbox identity** should remain the dedicated test mailbox.
- Do not create a role called “client” unless repository evidence already defines it; use `client_admin` for a client account owner.

## Acceptance Criteria

### Authentication and session
- [ ] A local user can authenticate through the supported app login flow under `npm run preview`.
- [ ] `/api/auth/me` returns the expected authenticated user/session result for that user.
- [ ] `/api/integrations/microsoft/connect` no longer returns immediate unauthenticated JSON for that valid session.
- [ ] A logged-out user still receives a safe unauthenticated response.
- [ ] Session creation, lookup, expiry, and cookie handling work against local D1 with `0010_app_sessions.sql` applied.
- [ ] No session identifier, token, password, or secret is shown in logs, browser responses, docs, or test output.

### User management and roles
- [ ] A Super Admin can save a permitted role update for a user in the same supported local organization.
- [ ] Unauthorized role update attempts remain blocked.
- [ ] The UI clearly labels each available role and its intended use.
- [ ] Local-user creation behavior is documented and deterministic: either default role is intentional, role selection is required, or a safer default is implemented and tested.
- [ ] No user from one organization can be assigned or administered across another organization.

### Regression boundaries
- [ ] Sprint 052 Outlook code remains draft-only.
- [ ] No `Mail.Send`, `/send`, or `/sendMail` capability is introduced.
- [ ] No remote database operation, deployment, or secret change is performed.
- [ ] Existing tests, lint, safe E2E, and build pass.

---

# Builder-Facing Implementation Plan

## Required discovery before edits

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
- `wrangler.toml` / Cloudflare config and `.dev.vars.example` without printing secrets
- migrations `0010_app_sessions.sql` and `0011_microsoft_outlook_drafts.sql`

Before code changes, report:
1. Why the valid local app user did not have a recognized session at `/api/integrations/microsoft/connect`.
2. Whether this is login-flow, cookie-domain/secure-cookie, preview-runtime, D1-binding, migration, user bootstrap, or role-authorization behavior.
3. The exact existing role enum and allowed role transitions.
4. The exact endpoint/UI path used to save a user role.
5. The smallest fix set.

## Likely implementation surfaces (confirm before modifying)

Potentially relevant:
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

## Validation

Run after implementation:
- `npm run test`
- `npm run lint`
- `npm run test:e2e:safe`
- `npm run build`

Manual local validation:
1. Start with `npm run preview`.
2. Use supported local login/bootstrap flow to establish a known local Super Admin session.
3. Confirm `/api/auth/me` recognizes that session.
4. Open the Integrations page and click Outlook Connect.
5. Expected: OAuth redirect begins or a safe Microsoft configuration error appears; not `Authentication required.` for the valid session.
6. Confirm logged-out path remains blocked.
7. Confirm Super Admin can edit an allowed same-org user role.
8. Confirm client_admin/editor/viewer restrictions remain correct.

Do not connect Microsoft or create an Outlook draft during this sprint unless the owner explicitly approves resuming Sprint 052 UAT after this sprint passes.

---

# Documentation Updates Required

Create/update:
- `planning/STATE.md`
- `planning/DECISIONS.md` if role/default-session decisions change
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md` if role update/login/session contracts change
- `docs/VALIDATION.md`
- `planning/sprints/053-local-auth-role-admin-fix/requirements.md`
- `planning/sprints/053-local-auth-role-admin-fix/blueprint.md`
- `planning/sprints/053-local-auth-role-admin-fix/acceptance.md`
- `planning/sprints/053-local-auth-role-admin-fix/handoff-prompt.md`

---

# Risks

1. Local session cookies may behave differently under Wrangler preview than under another local runtime.
2. The initial local user may have been created in a different organization or without a usable session.
3. A role save failure may be an intentional authorization guard, a UI payload mismatch, or missing D1 state.
4. Fixing roles without proving the existing authorization matrix could weaken cross-org protection.
5. Do not misinterpret a Microsoft OAuth redirect error as an EmailORC session error.

---

# Decisions

- Outlook testing pauses until local EmailORC authentication is proven.
- `Mail.Send` remains removed and prohibited.
- Sprint 053 is a corrective local auth/role sprint; it does not expand Outlook scope.
- Client-facing account-owner role is `client_admin` unless repository evidence indicates a different canonical model.
- The dedicated Outlook account is still only a test mailbox, not an EmailORC authorization role.

---

# Codex Handoff Prompt

Read and apply this Architect Pack into the project folder first.

Create/update the required Sprint 053 planning and documentation files listed in this pack.

Do not implement code yet.

After applying the pack, read:
- Sprint 053 requirements.md
- blueprint.md
- acceptance.md
- handoff-prompt.md
- relevant current auth/session/admin/role files

Then summarize:
1. The root-cause hypotheses you will test for the local `Authentication required.` response.
2. The files you expect to modify.
3. The exact session/login and role-save paths you will trace.
4. The tests and manual validation you will run.
5. Any blockers or ambiguity.

Do not implement until the owner approves that summary.
