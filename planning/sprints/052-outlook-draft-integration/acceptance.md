# Sprint 052 Acceptance Criteria — Outlook Draft Integration

## Preflight

- [x] Codex confirms it is operating in the intended EmailORC repository.
- [x] Codex reads existing active planning/docs files or clearly reports their absence before modifying anything.
- [x] Codex inspects migration numbering and does not reuse an existing number.
- [x] Owner approves Codex preflight summary before implementation.

## Microsoft OAuth

- [x] OAuth uses delegated authorization for the connected user.
- [x] Requested scopes include only the approved minimum scopes.
- [x] `Mail.Send` is absent.
- [x] OAuth state is user/session-bound, short-lived, validated, and single-use.
- [x] Token exchange occurs server-side.
- [x] Browser responses do not expose access or refresh tokens.
- [x] Connection material is encrypted at rest and not committed/logged.

## Outlook Draft Creation

- [x] Only authenticated, authorized users can request draft creation.
- [x] The route derives user and organization context from server session, not request-supplied identity fields.
- [x] Only an EmailORC draft with `APPROVED` status can be created in Outlook.
- [x] Invalid recipient, missing subject, or missing body is rejected.
- [x] Missing/disconnected Microsoft connection is rejected safely.
- [x] Graph call uses only `POST /me/messages`.
- [x] No Graph send endpoint is present or reachable.
- [ ] The connected test mailbox receives the message in Drafts.
- [ ] The message does not appear in Sent Items.
- [ ] No recipient receives email.

## Auditing and Data Safety

- [x] Success/failure audit events are written with safe metadata only.
- [x] No secret, token, authorization code, client secret, password, or full email body appears in audit metadata.
- [x] Duplicate calls do not silently create uncontrolled duplicate Outlook drafts.
- [x] Disconnect removes/revokes usable local connection state.

## Regression and Documentation

- [ ] Existing import, validation, approval, and export flows remain unchanged.
- [ ] Current approved automated validation gates pass.
- [ ] Manual Outlook test is documented as PASS.
- [ ] `planning/STATE.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `planning/QUESTIONS.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATA_MODEL.md`, and `docs/VALIDATION.md` are updated as applicable.
- [ ] Sprint 052 is not marked PASS until all criteria above are satisfied.
