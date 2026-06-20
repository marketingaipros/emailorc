# Sprint 053 Requirements - Local Auth, Role Clarity, and Admin Save Fix

## Goal

Make local EmailORC authentication and user administration reliable enough to establish a known valid local Super Admin session and a known valid test user before resuming Outlook Draft UAT.

Sprint 052 remains `IMPLEMENTED - awaiting Entra configuration, D1 migration application, and Outlook mailbox UAT`. Sprint 052 must not be marked PASS during this sprint.

## Required Behavior

1. Diagnose and fix the local authentication/session path used by:
   - EmailORC login
   - `/api/auth/me`
   - `/api/integrations/microsoft/connect`
   - local Wrangler/D1 runtime
2. Ensure a valid authenticated local user can reach the Microsoft connect route without the immediate `Authentication required.` response.
3. Diagnose and fix the Super Admin user-role save failure.
4. Make role labels and role assignment behavior clear in User Administration.
5. Document intended MVP role meanings:
   - `super_admin`
   - `client_admin`
   - `editor`
   - `viewer`
6. Verify locally created users receive the intended default role, or explicitly require role selection rather than silently assigning an incorrect role.
7. Preserve Sprint 052 hard limits:
   - no `Mail.Send`
   - no Outlook send capability
   - no Graph `/send` or `/sendMail`
   - no Microsoft secret changes
   - no remote D1 migration
   - no deploy

## 053-A Hardening Amendment

Before Sprint 053 can be committed, apply the approved 053-A hardening amendment:

1. Demo Super Admin bootstrap must be local-only and must not be enabled by `APP_ENV=demo` alone.
2. Bootstrap must default to blocked when the runtime is uncertain.
3. Bootstrap must not run against remote D1, preview deployments, production, test-live, or any non-local runtime.
4. Bootstrap may create only the documented local demo Super Admin account.
5. Admin user updates must not allow the final Super Admin to remove their own final Super Admin access.
6. Admin user updates must explicitly handle same-organization and cross-organization boundaries.
7. Assignable roles remain `super_admin`, `client_admin`, `editor`, `reviewer`, and `viewer`.

## Out Of Scope

- Microsoft OAuth connection itself, Graph draft creation, or mailbox UAT.
- Changing Outlook scopes, redirect URIs, token encryption, D1 schema, or Sprint 052 implementation unless a direct integration defect is proven.
- Production deployment, remote D1 changes, user-data reset, seed/reset commands, or unrelated environment changes.
- New role types, multi-user permissions redesign, CRM features, or dashboard work.
- Remote D1 commands, preview deployment changes, and production bootstrap behavior.

## Product Role Definitions

| Role | Intended MVP meaning |
|---|---|
| `super_admin` | Internal system owner. Can manage organizations, users, roles, configuration, and all permitted internal administrative workflows. |
| `client_admin` | Customer/account owner. Can manage users and approved workflows within their own organization, but cannot access another organization or global system administration. |
| `editor` | Internal or client user allowed to work assigned workflow records/drafts within their organization, but cannot manage organization users/settings. |
| `viewer` | Read-only organization user. Cannot create, edit, approve, export, connect integrations, or manage users. |

## Immediate Outlook Local Test Clarification

- The EmailORC app user should be a known authenticated `super_admin` only for troubleshooting.
- The Microsoft mailbox identity remains the dedicated test mailbox.
- Do not create a role called `client` unless repository evidence already defines it; use `client_admin` for a client account owner.
