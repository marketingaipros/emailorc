# Architect Pack 052 — Outlook Draft Integration

**Project:** EmailORC  
**Sprint:** `052-outlook-draft-integration`  
**Created:** 2026-06-19  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Add a controlled Microsoft Outlook connection so an already-approved EmailORC draft can be created in a connected test mailbox’s Outlook **Drafts** folder.

This sprint is deliberately narrow:

- Connect a test Microsoft account through Microsoft Entra ID OAuth.
- Use Microsoft Graph delegated access.
- Create Outlook drafts only.
- Never send mail.
- Keep the existing import, validation, generation, approval, and financial-data exclusion rules intact.
- Reuse the existing Integrations page and Outlook / M365 card where practical.
- Record safe, redacted audit events for connection and draft-creation outcomes.

This sprint does **not** implement Microsoft Copilot. Copilot is a separate later sprint after Outlook draft creation is accepted in a test account.

The handoff is the project folder, not this conversation.

---

## Mandatory Preflight Gate

The Codex planning output reported that it could not find `AGENTS.md`, `planning/`, or most durable docs in the repo snapshot it inspected.

Before any code is written, Codex must:

1. Confirm it is in the actual EmailORC repository.
2. Confirm the intended branch and current git status.
3. Locate and read the active 120x project files:
   - `AGENTS.md`
   - `planning/STATE.md`
   - `planning/DECISIONS.md`
   - `planning/DOMAIN.md`
   - `planning/RISKS.md`
   - `planning/QUESTIONS.md`
   - `docs/ARCHITECTURE.md`
   - `docs/API.md`
   - `docs/DATA_MODEL.md`
   - `docs/VALIDATION.md`
4. Stop and report if those files are truly absent rather than recreating them blindly.
5. Inspect existing migrations and determine the next migration number. Do **not** create `0010_microsoft_outlook_drafts.sql` because Sprint 012 already used `0010_app_sessions.sql`.

No implementation begins until this preflight summary is approved.

---

## Architect-Facing Requirements

### Business Goal

EmailORC must let an authorized user take an email that has already passed the existing human approval workflow and place it in a connected test Outlook mailbox’s Drafts folder.

### In Scope

- Per-user delegated Microsoft connection.
- One test Microsoft account first.
- Microsoft Entra authorization-code flow for a server-side web application.
- OAuth anti-forgery state validation.
- PKCE where compatible with the selected authorization-code implementation.
- Secure server-side storage of OAuth connection material.
- Microsoft Graph `POST /me/messages` for draft creation.
- Server-side revalidation that the EmailORC draft is approved before Graph is called.
- Safe connection status and disconnect behavior.
- Safe audit events for:
  - Outlook connected
  - Outlook disconnected
  - Outlook draft created
  - Outlook draft creation failed
  - token refresh/reconnect required
- Focused automated tests and manual test-account validation.
- Documentation updates for setup, API contract, data model, and validation.

### Strictly Out of Scope

- No email sending.
- No `Mail.Send` permission.
- No `/send`, `/sendMail`, or equivalent Microsoft Graph send operation.
- No Microsoft Copilot integration.
- No Salesforce integration.
- No ColdFusion integration.
- No CRM integration.
- No changes to CSV/XLSX import mapping, validation, or financial-data exclusion rules.
- No email-generation prompt redesign.
- No broad UI redesign.
- No production-readiness claim.
- No migration execution, production D1 writes, reset/seed commands, deployment, or secret exposure.
- No OAuth tokens, refresh tokens, client secrets, passwords, or message bodies in git, logs, audit metadata, browser storage, or screenshots.

### Required Product Decision

Sprint 052 uses this default unless the owner changes it before implementation:

> **Per-user delegated connection, tested with one dedicated test Outlook mailbox first.**

Each app user may later connect their own mailbox, but this sprint only proves the pattern using a single test user/mailbox. The app must never use a shared organization mailbox or administrator-wide application permission in this sprint.

---

# File: planning/STATE.md

Add or update the active-sprint section with:

```markdown
## Current Status

Sprint 052 is planned: Outlook Draft Integration.

Goal:
- Connect a test Outlook account through Microsoft Entra OAuth.
- Create Microsoft Outlook drafts only from EmailORC drafts that are already approved.
- Do not send email.
- Do not connect Microsoft Copilot, Salesforce, ColdFusion, or any CRM.

Current status:
- Architect Pack prepared.
- Awaiting Codex preflight confirmation that it is operating in the correct EmailORC repository and that current planning/docs files are present.
- No code, migration, deployment, OAuth secret, or Microsoft configuration change has been made by this sprint plan.

## Active Sprint

`planning/sprints/052-outlook-draft-integration/`

## Next Actions

1. Apply this Architect Pack to the correct EmailORC repo.
2. Run the mandatory preflight and summarize findings.
3. Confirm Microsoft Entra app-registration settings for the test account.
4. Implement only after the preflight summary is approved.
5. Run the approved validation gates and manual Outlook Drafts verification.
```

---

# File: planning/DECISIONS.md

Add these decisions:

```markdown
| Date | Decision | Reason | Impact |
|---|---|---|---|
| 2026-06-19 | Sprint 052 creates Outlook drafts only, never sends email. | The product remains human-in-the-loop and test-first. | No `Mail.Send` scope, no Microsoft Graph send endpoint, and no automatic sending behavior may be added. |
| 2026-06-19 | Sprint 052 uses delegated per-user Microsoft Graph access. | The initial use case is a user creating drafts in their own connected mailbox. | Do not use application permissions, shared mailbox access, or tenant-wide mailbox access in this sprint. |
| 2026-06-19 | Sprint 052 starts with one dedicated test Outlook mailbox. | Limits risk and simplifies validation. | Production or multi-user mailbox rollout needs a later approved sprint. |
| 2026-06-19 | Microsoft Copilot is excluded from Sprint 052. | Outlook draft creation must work and be validated before adding a second Microsoft integration. | Copilot requires a separate Architect Pack after Outlook acceptance. |
| 2026-06-19 | OAuth and Microsoft connection material must remain server-side and encrypted at rest. | Refresh tokens and client secrets are sensitive credentials. | Tokens must never be returned to the browser, committed, logged, or placed in audit metadata. |
| 2026-06-19 | Migration numbering must be derived from the actual repository. | The earlier Codex proposal incorrectly suggested `0010_microsoft_outlook_drafts.sql`, while prior work already used `0010_app_sessions.sql`. | Inspect migrations before creating any new migration file. |
```

---

# File: planning/RISKS.md

Add these risks:

```markdown
| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Codex may be operating in the wrong repo or incomplete checkout. | Medium | High | Mandatory preflight verifies root files, branch, repo path, and current planning docs before implementation. | Active |
| OAuth tokens or client secrets could be exposed. | Medium | High | Server-side storage only; encryption at rest; redacted logs/audits; no browser token access. | Active |
| Outlook action could accidentally send email. | Low | High | No `Mail.Send` scope; allowlist only `POST /me/messages`; tests must prove no send endpoint is invoked. | Active |
| Unapproved EmailORC drafts could be pushed to Outlook. | Medium | High | Recheck approval and authorization server-side in the Outlook draft route. | Active |
| Personal Microsoft account consent or tenant policy may block testing. | Medium | Medium | Confirm supported account type, redirect URI, delegated permissions, and test-mailbox access before coding. | Open |
| Token refresh or storage may require schema support. | Medium | Medium | Inspect existing D1 tables/migrations first; add a minimal next-numbered migration only if required. | Open |
| Existing session migration remains unapplied in D1. | High | Medium | Do not apply migrations in Sprint 052; document whether the connection flow can be tested locally without it. | Open |
| Outlook work could expand into Copilot or CRM work. | Medium | Medium | Keep Copilot, Salesforce, ColdFusion, and CRM scope explicitly excluded. | Active |
```

---

# File: planning/QUESTIONS.md

Add or update:

```markdown
| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Which Microsoft account will serve as the dedicated test mailbox? | Owner | Before OAuth testing | Open | Use one test mailbox only for Sprint 052. |
| Is the Entra app allowed to support personal Microsoft accounts, work/school accounts, or both? | Owner / Microsoft admin | Before implementation | Open | Default recommendation: support accounts in any organizational directory and personal Microsoft accounts, subject to the actual tenant/app-registration options. |
| Is user consent allowed for the chosen Microsoft tenant? | Owner / Microsoft admin | Before OAuth testing | Open | If tenant policy blocks user consent, an admin must grant consent for the delegated permission. |
| Where should encrypted connection material live in the deployed D1 design? | Architect / Builder | Before implementation | Open | Prefer a minimal D1-backed integration-connection table with encrypted payloads and rotation-ready key handling, if no existing secure store is already present. |
| Does the current runtime have a secure encryption-key binding pattern? | Builder | Preflight | Open | Inspect binding names/contracts only. Do not reveal secret values. |
| Is local validation using Next dev server, Wrangler local runtime, or a deployed test-live URL? | Owner / Builder | Before manual QA | Open | Choose one documented path that supports session, D1, OAuth callback, and safe test mailbox validation. |
```

---

# File: docs/ARCHITECTURE.md

Add a concise integration section:

```markdown
## Outlook Draft Integration — Sprint 052 Target

EmailORC will use Microsoft Entra delegated OAuth and Microsoft Graph to create drafts in a connected user’s Outlook Drafts folder.

Boundary:

1. EmailORC user signs in through the existing app session.
2. User initiates Microsoft connection from the existing Integrations page.
3. Server starts OAuth authorization-code flow with state validation and PKCE where supported.
4. Callback validates the state, exchanges the authorization code server-side, and stores connection material encrypted at rest.
5. User approves an EmailORC draft through the existing approval workflow.
6. User explicitly requests Outlook draft creation.
7. Server resolves the authenticated EmailORC user, rechecks organization access and draft approval, loads the user’s secure Microsoft connection, and calls Graph `POST /me/messages`.
8. Microsoft Graph creates a mailbox draft. EmailORC does not send the message.
9. EmailORC writes a redacted audit event.

Never allowed in Sprint 052:

- `Mail.Send`
- `/send`
- `/sendMail`
- application permissions
- browser-held tokens
- shared/admin mailbox behavior
- Copilot or CRM behavior
```

---

# File: docs/API.md

Add the proposed contracts. Exact file paths and response shapes must be validated during preflight before implementation.

```markdown
## Outlook Draft Integration — Sprint 052

### `GET /api/integrations/microsoft/connect`

Starts the Microsoft authorization-code flow.

Server requirements:

- Requires authenticated EmailORC user.
- Generates and stores a short-lived OAuth state record tied to the authenticated user/session.
- Uses the approved delegated Graph scopes only.
- Redirects to Microsoft authorization endpoint.
- Must not expose client secret or token material.

### `GET /api/integrations/microsoft/callback`

Handles the Microsoft OAuth callback.

Server requirements:

- Validates OAuth state and expiration.
- Exchanges authorization code server-side.
- Stores encrypted connection material server-side only.
- Returns to the Integrations screen with safe success/failure status.
- Never logs authorization code, access token, refresh token, client secret, or message content.

### `GET /api/integrations/microsoft/status`

Returns safe connection status for the current authenticated user.

Allowed fields:

- `connected`
- redacted mailbox display identifier when safe
- `connectedAt`
- `lastSuccessAt`
- `reconnectRequired`

Forbidden fields:

- access token
- refresh token
- token expiry raw value if it creates disclosure risk
- client secret
- raw Microsoft error payloads

### `POST /api/integrations/microsoft/disconnect`

Revokes or deletes locally stored connection material for the current authenticated user.

### `POST /api/drafts/{draftId}/outlook`

Creates an Outlook draft from an already-approved EmailORC draft.

Server requirements:

- Requires authenticated EmailORC user.
- Resolves user and organization from server session, not request body.
- Requires authorized access to the target EmailORC draft.
- Requires EmailORC draft approval status of `APPROVED`.
- Requires valid recipient, subject, and body.
- Requires an active Microsoft connection for the current user.
- Calls only Microsoft Graph `POST /me/messages`.
- Returns safe result metadata only, such as EmailORC draft ID, provider message ID, and status.
- Writes a safe audit event for success or failure.
```

---

# File: docs/DATA_MODEL.md

Add the target entities. Do not create a migration until preflight confirms the current schema and next migration number.

```markdown
## Outlook Connection and Delivery Tracking — Sprint 052 Target

Potential minimal D1 entities:

### `integration_connections`

Purpose: one encrypted Microsoft connection record per EmailORC user/provider/environment.

Suggested fields:

- `id`
- `organization_id`
- `user_id`
- `provider` (`microsoft_outlook`)
- `account_hint` or redacted mailbox identifier
- `encrypted_token_payload`
- `token_key_version`
- `scope_summary`
- `connected_at`
- `last_success_at`
- `reconnect_required_at`
- `revoked_at`
- `created_at`
- `updated_at`

### `oauth_authorization_states`

Purpose: short-lived, single-use OAuth state/PKCE verifier records.

Suggested fields:

- `id`
- `user_id`
- `organization_id`
- `provider`
- `state_hash`
- `pkce_verifier_encrypted` or equivalent protected storage
- `redirect_uri`
- `expires_at`
- `consumed_at`
- `created_at`

### `outlook_draft_deliveries`

Purpose: idempotent record of Outlook draft-creation attempts without storing full mail content.

Suggested fields:

- `id`
- `emailorc_draft_id`
- `organization_id`
- `user_id`
- `connection_id`
- `provider`
- `provider_message_id`
- `status`
- `error_category`
- `created_at`
- `updated_at`

Constraints:

- No raw OAuth token values outside the encrypted payload.
- No client secret in database.
- No full email body in delivery/audit metadata.
- Use a uniqueness/idempotency constraint appropriate to one Outlook-draft creation per EmailORC draft and connected mailbox unless a future explicit retry policy says otherwise.
```

---

# File: docs/VALIDATION.md

Add the following Sprint 052 gate:

```markdown
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
6. Confirm it appears in the mailbox’s Outlook Drafts folder.
7. Confirm it does **not** appear in Sent Items.
8. Confirm no recipient receives mail.
9. Disconnect the account.
10. Confirm Outlook draft creation becomes unavailable or returns reconnect-required.
11. Confirm CSV/XLSX import, validation, approval, and export still work.

Sprint 052 cannot be marked PASS until the manual mailbox check confirms draft creation and no-send behavior.
```

---

# File: planning/sprints/052-outlook-draft-integration/requirements.md

```markdown
# Sprint 052 Requirements — Outlook Draft Integration

## Goal

Enable an authorized EmailORC user to create a Microsoft Outlook draft from an EmailORC draft that has already been approved.

## Required Behavior

1. A user can connect a dedicated test Microsoft mailbox through the existing Integrations page.
2. The connection uses delegated Microsoft Graph authorization.
3. The app stores Microsoft connection material server-side only and encrypted at rest.
4. The app exposes only safe connection status to the browser.
5. A user can explicitly create an Outlook draft only from an EmailORC draft with status `APPROVED`.
6. The server independently validates authentication, organization authorization, approval state, connection state, recipient, subject, and body.
7. The Graph integration creates a draft through `POST /me/messages`.
8. The system never sends the message.
9. The system never requests or uses `Mail.Send`.
10. Success and failure produce redacted audit records.
11. Disconnecting the integration removes/revokes usable local connection material.
12. Existing import, validation, generation, approval, export, and financial-data exclusion behavior remains unchanged.

## Acceptance Boundary

This sprint is complete only after the dedicated test mailbox shows a created email in Outlook Drafts and confirms no message was sent.
```

---

# File: planning/sprints/052-outlook-draft-integration/blueprint.md

```markdown
# Sprint 052 Blueprint — Outlook Draft Integration

## Implementation Sequence

### Phase 0 — Preflight

- Confirm correct EmailORC repository and branch.
- Read all mandatory project files.
- Inspect current session/current-user helpers, workflow authorization helpers, D1 schema, migration numbering, existing audit conventions, runtime bindings, and Integrations/Drafts UI.
- Produce a file-by-file implementation summary.
- Stop for owner approval.

### Phase 1 — Microsoft Configuration Contract

- Add non-secret configuration names and typed bindings only as necessary.
- Document local/test setup without adding credentials to repo.
- Use delegated scopes only:
  - `openid`
  - `profile`
  - `email`
  - `offline_access`
  - `https://graph.microsoft.com/Mail.ReadWrite`
- Do not request `Mail.Send`.
- Configure supported account type appropriate to the dedicated test mailbox.

### Phase 2 — Secure OAuth Connection Layer

- Add OAuth start/callback/status/disconnect routes.
- Bind authorization state to authenticated app user/session.
- Make state short-lived and one-time use.
- Use PKCE where supported by the selected server-side authorization-code implementation.
- Exchange code server-side.
- Encrypt connection material at rest using a runtime-held encryption key.
- Do not return token material to the browser.

### Phase 3 — Persistence

- Reuse an existing secure integration/session storage pattern where possible.
- If new storage is required, create only the smallest next-numbered migration after confirming repository state.
- Do not execute any migration.
- Add unique/idempotency protection against unintended duplicate Outlook draft creation.

### Phase 4 — Microsoft Graph Adapter

- Add a narrow Graph helper with a strict endpoint allowlist.
- Permit only `POST /me/messages`.
- Map EmailORC recipient/subject/body into Graph message format.
- Reject unsupported outbound actions.
- Handle expired token/reconnect-required state without leaking token details.

### Phase 5 — Server-Side Outlook Draft Route

- Use server current-user/session helper.
- Reuse workflow/draft organization authorization patterns.
- Recheck the EmailORC draft is `APPROVED`.
- Load connection for the current authorized user.
- Call Graph helper.
- Record safe audit/delivery records.
- Return safe success/failure response.

### Phase 6 — UI

- Reuse the Outlook / M365 card on Integrations for connect/status/disconnect.
- Add Create Outlook Draft action only where:
  - user is authorized
  - EmailORC draft is approved
  - connection is active
- Do not redesign unrelated pages.
- Do not claim an email was sent. Language must say “Create Outlook Draft.”

### Phase 7 — Validation and Documentation

- Add focused unit/route tests.
- Run current approved validation gates.
- Perform manual test-mailbox confirmation.
- Update State, Decisions, Risks, Questions, API, Data Model, Architecture, and Validation docs.
```

---

# File: planning/sprints/052-outlook-draft-integration/acceptance.md

```markdown
# Sprint 052 Acceptance Criteria — Outlook Draft Integration

## Preflight

- [ ] Codex confirms it is operating in the intended EmailORC repository.
- [ ] Codex reads existing active planning/docs files or clearly reports their absence before modifying anything.
- [ ] Codex inspects migration numbering and does not reuse an existing number.
- [ ] Owner approves Codex preflight summary before implementation.

## Microsoft OAuth

- [ ] OAuth uses delegated authorization for the connected user.
- [ ] Requested scopes include only the approved minimum scopes.
- [ ] `Mail.Send` is absent.
- [ ] OAuth state is user/session-bound, short-lived, validated, and single-use.
- [ ] Token exchange occurs server-side.
- [ ] Browser responses do not expose access or refresh tokens.
- [ ] Connection material is encrypted at rest and not committed/logged.

## Outlook Draft Creation

- [ ] Only authenticated, authorized users can request draft creation.
- [ ] The route derives user and organization context from server session, not request-supplied identity fields.
- [ ] Only an EmailORC draft with `APPROVED` status can be created in Outlook.
- [ ] Invalid recipient, missing subject, or missing body is rejected.
- [ ] Missing/disconnected Microsoft connection is rejected safely.
- [ ] Graph call uses only `POST /me/messages`.
- [ ] No Graph send endpoint is present or reachable.
- [ ] The connected test mailbox receives the message in Drafts.
- [ ] The message does not appear in Sent Items.
- [ ] No recipient receives email.

## Auditing and Data Safety

- [ ] Success/failure audit events are written with safe metadata only.
- [ ] No secret, token, authorization code, client secret, password, or full email body appears in audit metadata.
- [ ] Duplicate calls do not silently create uncontrolled duplicate Outlook drafts.
- [ ] Disconnect removes/revokes usable local connection state.

## Regression and Documentation

- [ ] Existing import, validation, approval, and export flows remain unchanged.
- [ ] Current approved automated validation gates pass.
- [ ] Manual Outlook test is documented as PASS.
- [ ] `planning/STATE.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `planning/QUESTIONS.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATA_MODEL.md`, and `docs/VALIDATION.md` are updated as applicable.
- [ ] Sprint 052 is not marked PASS until all criteria above are satisfied.
```

---

# File: planning/sprints/052-outlook-draft-integration/handoff-prompt.md

```markdown
# Codex Handoff — Sprint 052 Outlook Draft Integration

Read these files before making any changes:

- `AGENTS.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/052-outlook-draft-integration/requirements.md`
- `planning/sprints/052-outlook-draft-integration/blueprint.md`
- `planning/sprints/052-outlook-draft-integration/acceptance.md`

Do not implement yet.

First, run the mandatory preflight:

1. Confirm the current repo root, branch, and `git status --short`.
2. Confirm whether the listed planning/docs files exist in this repo.
3. Inspect existing migration files and report the actual next migration number.
4. Inspect existing server session/current-user helpers, workflow authorization helpers, audit conventions, D1 access helpers, Integrations UI, Drafts UI, and runtime secret-binding patterns.
5. Identify the exact files you expect to change.
6. Identify whether a new D1 migration is actually required.
7. Explain how you will implement:
   - delegated Microsoft OAuth
   - OAuth state and PKCE
   - encrypted token storage
   - safe token refresh/reconnect behavior
   - Graph `POST /me/messages` only
   - approved-draft server gate
   - no-send tests
8. Confirm the requested Microsoft Graph scopes and explicitly confirm `Mail.Send` will not be requested.
9. List the exact local/test runtime setup required, without printing or requesting secret values.
10. List the tests and manual verification you will run.

Then stop.

Do not modify code, migrations, environment files, deployment config, or Microsoft configuration until the owner approves your summary.

Hard limits:

- Create Outlook drafts only.
- Never send email.
- Do not request or use `Mail.Send`.
- Do not call `/send` or `/sendMail`.
- Do not implement Copilot, Salesforce, ColdFusion, CRM, or any other integration.
- Do not change CSV/XLSX import, validation, email generation, financial-data exclusion, approval threshold, or unrelated UI behavior.
- Do not expose tokens, secrets, authorization codes, passwords, or full email bodies.
- Do not run migrations, seed/reset commands, D1 writes, deployment commands, or production commands.
```

---

## Microsoft Configuration Checklist

Create the Microsoft Entra app registration only after the implementation preflight is approved.

Use this initial setup:

- **Platform:** Web
- **Test account mode:** Match the dedicated test mailbox; support personal Microsoft accounts only if the selected app-registration account type supports them.
- **Redirect URIs:**
  - Local development: `http://localhost:3000/api/integrations/microsoft/callback`
  - Add a controlled test-live URL only when it exists and is approved.
- **Delegated Microsoft Graph permissions:**
  - `openid`
  - `profile`
  - `email`
  - `offline_access`
  - `Mail.ReadWrite`
- **Do not add:**
  - `Mail.Send`
  - application permissions
  - mailbox-wide admin permissions
- **Consent:** Verify whether user consent works for the test account or whether tenant policy requires admin consent.
- **Secrets:** Put the client secret only in local secret storage and the deployed runtime secret store. Never commit it.

Microsoft Graph documents `POST /me/messages` as a draft-message creation endpoint. The `/me` endpoint requires delegated authentication, which fits the per-user connection model. Microsoft’s authorization-code flow and scope guidance support the delegated OAuth direction, including `offline_access` for refresh-token use. citeturn281716search2turn281716search3turn281716search5turn281716search10
