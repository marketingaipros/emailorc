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
