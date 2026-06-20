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

---

## Future Validation Areas

- Billing/usage/account API guard validation.
- Page/middleware/localStorage cleanup validation.
- Production session storage and D1 `app_sessions` migration application validation.
- Production-readiness validation.
- Provider key redaction and secret-handling validation.
