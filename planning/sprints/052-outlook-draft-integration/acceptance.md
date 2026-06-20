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
