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
- Do not claim an email was sent. Language must say "Create Outlook Draft."

### Phase 7 — Validation and Documentation

- Add focused unit/route tests.
- Run current approved validation gates.
- Perform manual test-mailbox confirmation.
- Update State, Decisions, Risks, Questions, API, Data Model, Architecture, and Validation docs.
