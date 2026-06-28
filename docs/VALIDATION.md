# Validation Plan

## Overview

Validation proves EmailORC is safe and trustworthy before future feature work, demos, or production decisions.

Current status:

- MVP/demo behavior exists.
- Production readiness is not established.
- Safe local validation gate:
  - `npm run test`
  - `npm run lint`
  - `npm run test:e2e:safe`
  - `npm run build`
- Existing React hook warnings may appear during lint/build and should remain visible until addressed by a future focused cleanup sprint.

## Sprint 069 Validation Results

Sprint 069 lead-management controls were validated on 2026-06-28:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run test -- tests/validation.test.ts` | Passed | 71 tests passed, including lead email status, sort/page normalization, source labels, and no-D1 records fallback. |
| `npm run test` | Passed | 71 tests passed. |
| `npm run lint` | Passed with warnings | Existing hook dependency warnings remain in admin, brain-center, drafts, and export pages. |
| `npm run build` | Passed with warnings | Existing hook dependency warnings remain. |
| Outlook draft creation | Not run | Sprint 069 prohibited Outlook draft creation. |
| Email sending | Not run | No send path was added or used. |
| Direct D1 manipulation | Not run | No D1 CLI, raw SQL, migration, seed, deploy, commit, or push occurred. |

Manual browser checks requiring an authenticated local D1 runtime remain recommended before using Sprint 069 for Outlook-draft UAT preparation.

---

## Sprint 070 Validation Results

Sprint 070 is documentation-only. Validation is limited to pack creation and allowed-file scope.

Required implementation validation for a later Sprint 071:

- Automated tests for import lifecycle state normalization and invalid transition rejection.
- API tests proving unauthenticated lifecycle actions return `401` and wrong-organization actions return `403`.
- Tests proving staged upload cancellation remains pre-persistence only.
- Tests proving completed imports cannot be mislabeled as canceled through a fake client-only action.
- Tests proving archive preserves lead/import/draft/approval/analytics/audit relationships.
- Tests proving demo fallback records are labeled as fallback and not counted as imported/persisted leads.
- Browser UAT in an authenticated local Cloudflare/OpenNext D1 runtime showing import, source metadata, archive, optional restore if approved, and audit-visible evidence.
- Explicit evidence that no direct D1 edits, destructive deletion, Outlook action, email send, deploy, commit, or push occurred unless separately approved.

---

## Sprint 071 Validation Results

Sprint 071 is documentation-only. Validation is limited to pack creation and allowed-file scope.

Required implementation validation for a later Sprint 072 depends on founder-approved decisions, but should include at minimum:

- Automated tests for approved import lifecycle state transitions and invalid transition rejection.
- API tests proving unauthenticated lifecycle actions return `401` and wrong-organization actions return `403`.
- Permission tests for every approved actor/action pair.
- Tests proving mandatory reasons are required where approved.
- Tests proving audit events are written to the approved storage model.
- Tests proving archive preserves lead/import/draft/approval/analytics/audit relationships.
- Tests proving lead archive/restore follows the approved data model.
- Browser UAT in an authenticated local Cloudflare/OpenNext D1 runtime for approved archive/restore behavior.
- Explicit evidence that no direct D1 edits, destructive deletion, Outlook action, email send, deploy, commit, or push occurred unless separately approved.

---

## Sprint 072 Validation Results

Sprint 072 import lifecycle cleanup was validated on 2026-06-28:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run test -- tests/validation.test.ts` | Passed | 72 tests passed, including lifecycle reason normalization, lifecycle permission helpers, demo fallback source labeling, lead readiness, sorting, pagination, and no-D1 records fallback. |
| `npm run test` | Passed | 72 tests passed. |
| `npm run lint` | Passed with existing warnings | Existing hook dependency warnings remain in admin, brain-center, drafts, and export pages. |
| `npm run build` | Passed with existing warnings | Build completed; same existing hook dependency warnings. |
| `npm run test:e2e:safe` | Passed | 2 non-mutating Playwright smoke tests passed. |

Browser UAT remains required in an authenticated local Cloudflare/OpenNext D1 runtime after applying the normal approved migration path for `0012_import_lead_lifecycle.sql`.

---

## Sprint 063 Validation Results

Sprint 063 recipient-readiness gating was validated on 2026-06-22:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run test -- tests/validation.test.ts` | Passed | 67 tests passed, including valid/missing/malformed recipient readiness and API validation bypass coverage. |
| `npm run test` | Passed | 67 tests passed. |
| `npm run build` | Passed | Existing build warnings, if any, remain outside Sprint 063 scope. |
| Outlook draft creation | Not run | Sprint 063 prohibited Outlook draft creation. |
| Email sending | Not run | No send capability was added or run. |

Recipient readiness now blocks missing or malformed recipient emails before the Drafts UI can start the Outlook action. Server-side `validateOutlookDraftInput` remains the final enforcement layer.

---

## Sprint 066 Read-Only Readiness Audit Results

Sprint 066 closed as PASS for documentation-only, read-only readiness audit.

| Check | Result | Notes |
|---|---|---|
| D1-backed fixture path | Feasible with future approval | A future fixture can be created only through the normal D1-backed import and approval workflow. |
| Direct D1 edits | Not approved | No direct D1 edits are approved as the default fixture path. |
| Outlook browser UAT | Still blocked | No fixture was created, no Outlook draft was created, and browser UAT was not run. |
| Duplicate prevention | Not yet proven sufficient | Current delivery persistence can upsert after Graph creation; future work must prove a pre-creation duplicate block or clear flag before UAT. |
| Remaining blockers | Open | Approved internal test mailbox label/class, exact test case and test-run identity, recipient-correction/replacement-draft decision, duplicate-prevention design/proof, and explicit approval for later D1 import, approval, and Outlook draft creation. |
| Safety | Passed | No production code, database records, migrations, OAuth/Microsoft settings, environment files, packages, deployments, Git history, or production configuration changed. |

Recommended next sprint: `067-safe-outlook-draft-uat-fixture-creation-plan`.

---

## Sprint 015 Validation Focus

Sprint 015 validated one focused improvement:

1. Approved Brain/provider API routes require server-authenticated organization-scoped authorization.

---

## Sprint 015 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Do not run:

- migrations
- seed commands
- Prisma commands
- D1 writes
- deploy commands
- Wrangler deploy
- commands that write to live services
- commands that require secret values
- commands that enable sending or integrations

---

## Sprint 015 Required Test Coverage

Focused tests cover approved Brain/provider route behavior:

- unauthenticated request returns `401`
- authenticated wrong-organization request returns `403`
- authorized current-user request reaches existing successful behavior where practical
- request-supplied organization/user/role/provider/actor identity is not trusted for authorization
- unknown sensitive role fails closed where relevant
- provider keys or secret values are not exposed by auth failures or test output

---

## Sprint 015 Validation Results

Sprint 015 validation passed on 2026-05-21:

| Command | Result | Notes |
|---|---|---|
| `git status --short` | Passed | Dirty worktree remains; unrelated pre-existing entries were preserved. |
| `npm run test` | Passed | 38 tests passed. |
| `npm run lint` | Passed | Existing React hook dependency warnings remain. |
| `npm run test:e2e:safe` | Passed | 2 non-mutating Playwright tests passed. |
| `npm run build` | Passed | Existing React hook dependency warnings remain. |

---

## Sprint 052 — Outlook Draft Integration Validation

### Required automated checks

Run the existing approved local validation gates documented in the repo, expected to include:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Run only commands confirmed safe by the current repo docs. Do not run migrations, seed/reset commands, production D1 writes, or deployment commands.

### Required focused tests

1. OAuth state:
   - missing state rejected
   - expired state rejected
   - reused state rejected
   - state bound to the wrong user/session rejected

2. Connection storage:
   - no token fields returned by status endpoint
   - no token fields written to audit metadata
   - disconnect removes/revokes local usable connection state

3. Outlook draft gate:
   - unauthenticated request returns `401`
   - unauthorized/wrong-org request returns `403`
   - pending/rejected/unapproved EmailORC draft is rejected
   - missing connection is rejected
   - malformed recipient/subject/body is rejected
   - approved, authorized, connected draft calls Graph once

4. No-send guarantee:
   - Graph helper permits only `POST /me/messages`
   - tests fail if `/send` or `/sendMail` is attempted
   - `Mail.Send` is absent from requested scopes/configuration

5. Audit:
   - success event contains only safe identifiers/status
   - failure event contains safe category/code only
   - audit never includes OAuth tokens, secrets, or full email body

### Required manual test

Using the dedicated test mailbox:

1. Sign into EmailORC as an authorized test user.
2. Connect the test mailbox from Integrations.
3. Confirm the status displays connected without exposing credentials.
4. Select an EmailORC draft that is already approved.
5. Click Create Outlook Draft.
6. Confirm it appears in the mailbox's Outlook Drafts folder.
7. Confirm it does **not** appear in Sent Items.
8. Confirm no recipient receives mail.
9. Disconnect the account.
10. Confirm Outlook draft creation becomes unavailable or returns reconnect-required.
11. Confirm CSV/XLSX import, validation, approval, and export still work.

Sprint 052 cannot be marked PASS until the manual mailbox check confirms draft creation and no-send behavior.

### Implementation validation status

Automated validation is required after implementation:

- `npm run test`
- `npm run lint`
- `npm run test:e2e:safe`
- `npm run build`

Manual mailbox validation remains blocked until Microsoft Entra app registration, OAuth secrets, D1 migration application in the selected environment, and a dedicated test mailbox are available.

---

## Future Validation Areas

- Sprint 053 local auth/session validation:
  - local login under `npm run preview`
  - `/api/auth/me` recognizes the server session
  - valid session reaches `/api/integrations/microsoft/connect` without immediate unauthenticated JSON
  - logged-out connect path remains blocked
  - Super Admin can save allowed same-org role updates
  - unauthorized and cross-org role changes remain blocked
  - no session token, password, secret, or Microsoft credential appears in responses, logs, docs, or tests
- Billing/usage/account API guard validation.
- Page/middleware/localStorage cleanup validation.
- Production session storage and D1 `app_sessions` migration application validation.
- Production-readiness validation.
- Provider key redaction and secret-handling validation.

---

## Sprint 053 Validation Results

Sprint 053 validation passed on 2026-06-20:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run test` | Passed | 52 tests passed. |
| `npm run lint` | Passed | Existing React hook dependency warnings remain. |
| `npm run test:e2e:safe` | Passed | 2 non-mutating Playwright tests passed. |
| `npm run build` | Passed | Existing React hook dependency warnings remain. |
| `npm run preview` | Passed | Local Wrangler server started on `http://localhost:8788`. |
| Local Super Admin login | Passed | `admin@demo.com` returned `200` under preview. |
| `/api/auth/me` | Passed | Returned `super_admin`, `org_demo`, `d1_app_sessions`. |
| `/api/integrations/microsoft/connect` authenticated | Passed | Returned `307`, not `Authentication required.` |
| `/api/integrations/microsoft/connect` logged out | Passed | Returned `401`. |
| Same-org role update | Passed | Super Admin role update returned `200` and persisted `client_admin`. |

## Sprint 053-A Validation Results

Sprint 053-A validation passed on 2026-06-20:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run test` | Passed | 52 tests passed, including local bootstrap, cookie, canonical-role, same-org, cross-org, and final-Super-Admin guard helpers. |
| `npm run lint` | Passed | Existing React hook dependency warnings remain. |
| `npm run test:e2e:safe` | Passed | 2 non-mutating Playwright tests passed. |
| `npm run build` | Passed | Existing React hook dependency warnings remain. |
| `npm run preview` | Passed | Local Wrangler server started on `http://localhost:8789`. |
| Local Super Admin login | Passed | `admin@demo.com` returned `200`. |
| `/api/auth/me` | Passed | Returned `super_admin`, `org_demo`, `d1_app_sessions`. |
| Authenticated Microsoft connect | Passed | Returned `307`, not `Authentication required.` |
| Logged-out Microsoft connect | Passed | Returned `401`. |
| Same-org role update | Passed | Returned `200` and persisted canonical `client_admin`. |
| Cross-org role update | Passed | Returned `403`. |
| Final Super Admin self-demotion | Passed | Returned `403`. |
| Final Super Admin self-deactivation | Passed | Returned `403`. |
| Final Super Admin archive/delete | Passed | Returned `403`. |

## Sprint 055 Required Validation

Before Sprint 055 closeout, validate:

- Microsoft mailbox hint parsing uses Microsoft-authorized identity data, not the EmailORC app user email.
- Redaction preserves enough identity signal without exposing full mailbox data.
- Missing or stale Microsoft identity returns a safe connected/unknown state rather than an invented mailbox.
- `GET /api/integrations/microsoft/status` returns only safe connection fields.
- Existing Outlook draft-only safety remains unchanged.
- No `Mail.Send`, `/send`, or `/sendMail` capability is added.

Required commands after approved implementation:

```bash
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

## Sprint 055 Validation Results

Sprint 055 validation passed on 2026-06-20:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run test` | Passed | 55 tests passed, including Microsoft `id_token` claim precedence, invalid/missing identity fallback, no EmailORC user-email mailbox fallback, token-safe status, and no-send guard tests. |
| `npm run lint` | Passed | Existing React hook dependency warnings remain. |
| `npm run test:e2e:safe` | Passed | 2 non-mutating Playwright tests passed. |
| `npm run build` | Passed | Existing React hook dependency warnings remain. |
| Microsoft mailbox hint source | Passed | New successful OAuth connections derive `account_hint` only from safe `id_token` claims: `email`, `preferred_username`, then `upn`. |
| Missing or invalid Microsoft identity | Passed | Stores no invented mailbox hint; status remains connected based on connection state. |
| Permission and send boundary | Passed | No Microsoft scopes, `Mail.Send`, `/send`, `/sendMail`, Graph draft endpoint, reconnect/disconnect, or draft creation behavior changed. |

---

## Sprint 056 Required Validation

Run after approved implementation:

```bash
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Focused validation must prove:

1. Canonical `super_admin` is not blocked by Drafts-page approval affordance because of localStorage casing.
2. A lower-privilege or unknown role remains blocked in UI where appropriate.
3. Server approval authorization remains enforced and unchanged.
4. A real D1-backed eligible draft can be approved through the intended UI/API path.
5. After successful approval, the existing `Create Outlook Draft` action appears for that real D1 draft.
6. No email send path is added or invoked.
7. No Microsoft permission changes are added.
8. No tokens, claims, `.dev.vars`, or database contents are exposed.

Do not run migrations, seed/reset commands, deploys, or commands that write to live services.

## Sprint 056 Validation Results

Sprint 056 implementation validation on 2026-06-20:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run test` | Passed | 58 tests passed, including canonical lowercase `super_admin` approval-affordance coverage, lower/unknown role fail-closed coverage, and D1-backed Outlook action gating. |
| `npm run lint` | Passed with warnings | Existing React hook dependency warnings remain; Drafts page warning remains the documented loader pattern. |
| `npm run test:e2e:safe` | Failed / blocked | First run passed the public-login smoke, then timed out waiting for `/` to redirect to `/login`; the local server on port `3000` returned a 404/missing-error-components page for `/`. Retry timed out at Playwright webServer startup because port `3000` was already occupied by a pre-existing `next dev` process while the config expects `http://localhost:3000`. |
| `npm run build` | Passed | Production build and type check completed; existing React hook dependency warnings remain. |

Manual Outlook UAT was not run. Sprint 056 does not approve Outlook reconnect/disconnect, Outlook draft creation, Sprint 052 mailbox UAT, migrations, deploys, commits, or pushes.

---

## Sprint 057 Required Validation

Sprint 057 is planning and read-only diagnosis only.

Required validation for applying the Architect Pack:

```bash
git status --short
git diff --name-only
```

Required diagnosis validation:

1. Reconstruct the exact `Create Outlook Draft` render condition from source inspection.
2. Document the selected `Marcus Webb / Greenfield Capital` card's relevant field values.
3. Determine whether each field satisfies or fails the render condition.
4. Determine whether any eligible D1-backed approved local draft exists without creating or changing data.
5. Record `Regenerate Email` returning `Authentication required.` only as a separate observation.
6. Confirm no Outlook draft was created and no email was sent.

Do not run migrations, seed/reset commands, Prisma commands, D1 writes, deploys, Microsoft reconnect/disconnect actions, Outlook draft creation, or email sending.

Sprint 057 does not require automated runtime commands because no runtime code, tests, package scripts, Playwright configuration, Microsoft integration files, Outlook routes, database files, migrations, seed data, environment files, deployment files, or Sprint 056 runtime behavior may be changed.

## Sprint 057 Diagnosis Results

Sprint 057 read-only diagnosis completed on 2026-06-20:

| Check | Result | Notes |
|---|---|---|
| `Create Outlook Draft` render condition | Diagnosed | The action appears only when `draft.status === "Approved"` and the draft is D1-backed by `isD1Backed === true`, `source === "d1"`, or `storageSource === "d1"`. |
| Marcus Webb / Greenfield Capital selected card | Not eligible | The source-defined demo card is `Approved` with `QA 88`, but has no D1-backed marker. |
| QA threshold | Not direct blocker | QA score is not part of the Outlook action render helper. |
| Server session/auth | Separate concern | Plain read-only GETs without browser session cookies returned `401 Authentication required`; this prevented shell enumeration of local D1 drafts but does not change the Marcus render-condition failure. |
| Eligible local D1-backed approved draft | Not confirmed | No existing qualifying local draft was identified without authenticated browser evidence or database inspection. |
| Safety | Passed | No Outlook draft was created, no email was sent, no Microsoft reconnect/disconnect occurred, and no runtime/test/config/database/deployment files were changed. |

---

## Sprint 058 Required Validation

Run only safe local validation after approved runtime implementation:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Add focused validation showing:

1. Normal app bootstrap does not treat a localStorage/header role as a server-authenticated session.
2. A valid existing login/bootstrap route creates or restores a server session through the approved mechanism.
3. Protected Microsoft integration start behavior receives an authenticated principal only after valid session setup.
4. Unauthenticated behavior remains `401` and does not start OAuth or mutate Microsoft connection state.
5. No Outlook draft is created and no email is sent.

Do not run Microsoft OAuth completion, Microsoft reconnect/disconnect, Outlook draft creation, email sending, migrations, seed/reset commands, Prisma commands, D1 writes, deploys, commits, or pushes.

## Sprint 058 Validation Results

Sprint 058 validation passed on 2026-06-20:

| Command / Check | Result | Notes |
|---|---|---|
| `git status --short` | Passed | Dirty worktree remains; existing unrelated/pre-existing dirty files were preserved. |
| `npm run test -- tests/validation.test.ts` | Passed | 60 focused tests passed. |
| `npm run test` | Passed | 60 tests passed. |
| `npm run lint` | Passed with warnings | Existing React hook dependency warnings remain. |
| `npm run test:e2e:safe` | Passed | 2 non-mutating Playwright tests passed. |
| `npm run build` | Passed with warnings | Production build completed; existing React hook dependency warnings remain. |
| Local/header display identity alone | Passed | Spoofed Microsoft Connect request with local-display-style query/header identity returned `401 Authentication required`. |
| Valid server session path | Passed | A valid `emailorc_session` allowed Microsoft Connect to reach its existing D1 storage requirement behavior without completing OAuth. |
| Mailbox safety | Passed | No Microsoft OAuth completion, reconnect/disconnect, Outlook draft creation, email sending, mailbox mutation, migration, seed/reset, deploy, commit, or push occurred. |

---

## Sprint 059 Required Validation

Sprint 059 is planned implementation work. After approval and implementation, run:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

Focused validation must prove:

1. Local Prisma-fallback login creates a durable server-resolvable session.
2. `GET /api/auth/me` returns `200` immediately after valid local demo login.
3. Invalid, stale, expired, or unknown `emailorc_session` cookies return `401`.
4. Logout clears the browser cookie and invalidates or makes unusable the local fallback session.
5. Stale localStorage alone does not redirect the user away from `/login`.
6. A valid server-authenticated `/api/auth/me` response allows the intended login redirect.
7. Protected MVP pages and Outlook/Integrations actions remain blocked without server-authenticated session proof.
8. D1-backed session behavior is not weakened by local fallback changes.

Manual local UAT after implementation should confirm:

- clean browser state starts at login;
- demo login works with `admin@demo.com` / `DemoAdmin123!`;
- `/api/auth/me` resolves the authenticated session;
- Integrations does not bounce back to login while the valid local session is present;
- Outlook card is active only after server-authenticated session proof;
- Connect is not clicked unless separately approved.

Do not run migrations, seed/reset commands, Prisma write commands, D1 write commands, Microsoft OAuth completion, Microsoft reconnect/disconnect, Outlook draft creation, email sending, mailbox mutation, deploy, commit, or push.

## Sprint 059 Validation Results

Sprint 059 implementation validation passed on 2026-06-20:

| Command / Check | Result | Notes |
|---|---|---|
| `git status --short` before | Passed | Dirty worktree existed before implementation; unrelated dirty files were preserved. |
| `npm run test -- tests/validation.test.ts` | Passed | 60 focused tests passed, including local file-backed session source, token-hash behavior, auth/me session resolution, logout revocation, and Microsoft auth gating. |
| `npm run test` | Passed | 60 tests passed. |
| `npm run lint` | Passed with warnings | Existing React hook dependency warnings remain. |
| `npm run test:e2e:safe` | Passed | 2 non-mutating Playwright smoke tests passed. |
| `npm run build` | Passed with warnings | Production build completed; existing React hook dependency warnings remain. |
| Clean browser state starts at login | Passed | Local browser automation on `http://localhost:3001/login` after clearing storage stayed on login. |
| Stale localStorage alone | Passed | Stale `userId`, `userEmail`, and `userRole` did not redirect away from `/login`. |
| Demo login | Passed | `admin@demo.com` / `DemoAdmin123!` reached `/mvp`. |
| `/api/auth/me` after login | Passed | Returned `200` with `email: admin@demo.com`. |
| Integrations access after login | Passed | `/mvp/integrations` remained accessible with the valid server session. |
| Outlook Connect button after login | Blocked by storage | The button was visible but disabled because `/api/integrations/microsoft/status` returned `200` with `storageAvailable:false`; Connect was not clicked. |
| Safety | Passed | No Microsoft OAuth completion, reconnect/disconnect, Outlook draft creation, email sending, mailbox mutation, migration, seed/reset, Prisma command, D1 command, Wrangler command, deploy, commit, or push occurred. |

Sprint 059 is complete for local session-store and login redirect alignment.

Authenticated Outlook Connect availability remains blocked by `storageAvailable:false`. That readiness gate is moved to Sprint 060: Microsoft integration storage availability / D1-backed connection persistence readiness.

Sprint 059 did not perform OAuth flow completion, Outlook draft creation, email sending, mailbox mutation, migration, deploy, commit, or push.

---

## Sprint 060 Validation Results

Sprint 060 local-only D1 readiness validation passed on 2026-06-21:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run db:migrate` | Passed | Targeted only `emailorc-demo-db --local --env demo`; no migrations were pending. |
| `npm run db:seed` | Passed | Executed successfully against local Wrangler D1 state. |
| `npm run preview` | Passed | Started OpenNext/Wrangler at `http://localhost:8787`; local Cloudflare runtime exposed `env.DB` for `emailorc-demo-db`. |
| Local demo login | Passed | Approved demo login flow succeeded; credentials are intentionally not repeated here. |
| `/api/auth/me` | Passed | Returned `200` with `session_source: "d1_app_sessions"` and organization `org_demo`. |
| `/api/integrations/microsoft/status` | Passed | Returned `200` with `storageAvailable:true`, `connected:false`, and `reconnectRequired:false`. |
| `/mvp/integrations` | Passed | Loaded successfully and Outlook / M365 Connect readiness was available. |
| Outlook Connect click | Not run by design | Connect was not clicked; no OAuth began. |
| Safety | Passed | No mailbox changes, Outlook drafts, email sends, production D1 access, deploy, commit, or push occurred. Existing dirty worktree files were not touched. |

Observed follow-ups:

- A Prisma OpenSSL warning appeared during local login but did not block the successful request.
- `docs/CLOUDFLARE_DEMO_DEPLOY.md` contains stale localStorage wording and should be corrected in a later docs-only cleanup.

---

## Sprint 062 Validation Results

Sprint 062 local OAuth redirect source fix validation on 2026-06-21:

| Command / Check | Result | Notes |
|---|---|---|
| `npm run test` | Passed | 63 tests passed, including focused local callback and callback return URL behavior. |
| Redirect URI loading | Implemented | `MICROSOFT_REDIRECT_URI` resolution prefers `process.env` and falls back to the Cloudflare/OpenNext runtime binding without printing values. |
| Microsoft authorize callback | Implemented | When configured, the local callback remains `http://localhost:8787/api/integrations/microsoft/callback`. |
| Callback return URL | Implemented | When the local configured callback is HTTP, `/mvp/integrations?microsoft=...` is built from that HTTP origin instead of an HTTPS-normalized `request.url`. |
| Next route export compatibility | Implemented | Callback return URL helper moved to `src/lib/microsoft/oauth.ts` so the callback route exports only valid Next.js route fields. |
| UAT status | Not run | Local preview and Microsoft OAuth UAT were not rerun as part of the source-only fix. |
| Safety | Passed | No Entra, `.dev.vars`, dependencies, lockfiles, Prisma, D1, production settings, deployment settings, Microsoft scopes, Outlook drafts, or email sends were changed. |

---

## Sprint 063 Planning Validation

Sprint 063 planning pack created on 2026-06-21:

| Check | Result | Notes |
|---|---|---|
| Outlook draft attempt diagnosis | Recorded | Three attempts returned HTTP `400` validation failures. |
| Outlook draft creation | Not created | No Outlook draft was created. |
| Outlook message ID storage | Not stored | No Outlook message ID was stored for the selected draft. |
| Email send | Not sent | No email was sent. |
| Recipient state | Blocker identified | Selected approved D1-backed draft had a malformed recipient value; full recipient value is intentionally not documented. |
| UI action gate | Gap identified | UI can expose `Create Outlook Draft` from approval, D1-backed status, and session/Microsoft connection state without recipient readiness. |
| Endpoint validation | Preserved | Existing endpoint correctly blocks malformed recipients before Microsoft Graph draft creation. |
| Planning files | Created | Sprint 063 requirements, blueprint, acceptance, and handoff prompt were added. |
| Safety | Passed | No implementation, recipient data change, Outlook draft creation, email sending, Entra change, `.dev.vars` change, D1 change, deployment change, commit, or push occurred during planning. |

---

## Sprint 064 Pre-UAT Validation

Sprint 064 browser UAT was blocked on 2026-06-22 and was not run.

| Check | Result | Notes |
|---|---|---|
| Approved non-archived D1-backed draft availability | Found one | Safe reference: `draft_5cff6a04-4d86-4516-ba24-05ae9af8ad65`. |
| Valid recipient readiness | Blocked | The only approved non-archived D1-backed draft has a malformed recipient missing `@`; full recipient value is intentionally not documented. |
| Internal/safe recipient confirmation | Blocked | The recipient is not confirmed as an internal/safe test recipient from existing approved project data. |
| Microsoft connection readiness | Data-level ready | Read-only inspection found Microsoft D1 tables, an active non-revoked Outlook connection for the demo Super Admin, and active demo Super Admin sessions. Browser UAT was still not run. |
| Missing/malformed recipient protection | Read-only evidence only | Protection was confirmed through data inspection and prior Sprint 063 validation, not browser UAT. |
| Valid-recipient browser scenario | Not run | No qualifying safe valid-recipient D1-backed draft exists. |
| Missing-recipient browser scenario | Not run | Browser UAT was not run. |
| Malformed-recipient browser scenario | Not run | Browser UAT was not run. |
| Safety | Passed | No code, database record, Microsoft, Entra, OAuth, scope, tenant, environment, package, deploy, commit, or push change occurred. No draft was created, corrected, replaced, approved, archived, or deleted. |

Sprint 064 final status: BLOCKED. A future Architect Pack is required before any data correction or safe UAT-fixture creation.
