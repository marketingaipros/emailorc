# Architecture

## Overview

EmailORC is an existing Next.js email campaign/workflow MVP.

It supports CSV/contact/account import, validation, draft review, draft approval, export, admin/settings areas, Brain Center configuration, environment-mode handling, local development data files, Cloudflare D1 deployment/demo data, and staged auth/session hardening.

Current status:

- MVP/demo-stage.
- Not confirmed production-ready.
- Human approval required.
- Auto-send disabled.
- Live CRM/email integrations disabled.
- D1 is the planning direction for deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support only.
- Server current-user/session foundation exists from Sprint 012.
- Admin API guard hardening was completed in Sprint 013.
- Workflow/draft API organization permission guard hardening was completed in Sprint 014.
- Brain/provider API organization permission guard hardening was completed in Sprint 015.

---

## System Components

| Component | Location | Purpose |
|---|---|---|
| Next.js App Router | `app/` | Pages and API routes. |
| API routes | `app/api/` | Auth, workflow import/export, drafts, admin, billing, brain/OpenRouter, usage, account intelligence. |
| MVP UI | `app/mvp/` | Main screens for upload, records, drafts, campaigns, export, admin, integrations, reply, brain center, settings. |
| Shared source | `src/` | Components, domain types, validation utilities, auth/billing helpers, email invite helper, orchestration services. |
| Auth/session helpers | `src/lib/` | Server current-user/session helper and route-group guard helpers. |
| Local data | `prisma/` | Prisma schema, local SQLite dev database, seed/migration assets. |
| Deployed/demo data | `d1/` | Cloudflare D1 migrations and demo seed data. |
| Tests | `tests/` | Vitest, Playwright, fixtures, manual QA, bug docs, E2E runbook. |
| Cloudflare config | `wrangler.jsonc` | Worker/D1/assets/service binding and environment-mode configuration. |

---

## Auth / API Guard Architecture

Target architecture:

1. Browser localStorage may support display/navigation hints only.
2. Sensitive API authorization must use server-authenticated current-user context.
3. Route groups should use small focused guard helpers where helpful.
4. Sensitive routes should return clear `401`/`403` auth failures.
5. Unknown sensitive roles should fail closed.
6. Provider keys and secret values must never be exposed.

---

## Guarded Route Groups

| Route group | Status | Architecture note |
|---|---|---|
| Auth current user | Completed in Sprint 012 | `/api/auth/me` resolves from server session. |
| Admin APIs | Completed in Sprint 013 | Requires canonical `super_admin`. |
| Workflow/draft APIs | Completed in Sprint 014 | Requires authenticated organization-scoped access. |
| Brain/provider APIs | Completed in Sprint 015 | Requires authenticated organization-scoped access for approved route surface. |
| Billing/usage/account APIs | Future work | Should be hardened in a separate focused sprint. |
| Middleware/page guards/localStorage cleanup | Future work | Should happen after key API route groups are guarded. |

---

## Outlook Draft Integration — Sprint 052 Target

EmailORC will use Microsoft Entra delegated OAuth and Microsoft Graph to create drafts in a connected user's Outlook Drafts folder.

Boundary:

1. EmailORC user signs in through the existing app session.
2. User initiates Microsoft connection from the existing Integrations page.
3. Server starts OAuth authorization-code flow with state validation and PKCE where supported.
4. Callback validates the state, exchanges the authorization code server-side, and stores connection material encrypted at rest.
5. User approves an EmailORC draft through the existing approval workflow.
6. User explicitly requests Outlook draft creation.
7. Server resolves the authenticated EmailORC user, rechecks organization access and draft approval, loads the user's secure Microsoft connection, and calls Graph `POST /me/messages`.
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

---

## Sprint 015 Architecture Direction

Brain/provider API routes use layered server-side authorization:

1. Resolve current user from server session.
2. Return `401` if no valid current user exists.
3. Treat request-supplied organization values only as requested scope.
4. Return `403` if requested organization scope conflicts with current user authorization.
5. Continue existing route logic only after server authorization succeeds.
6. Use server current-user actor metadata for touched usage/audit/learning-log writes.

Sprint 015 centralizes this check in `src/lib/brain-auth.ts` for the approved Brain/provider route surface.

## Known Architecture Gaps After Sprint 015

- `app/api/brain/extract-knowledge/route.ts` remains unguarded because the current route is local text extraction/classification only.
- Billing/usage/account APIs still need a future focused guard sprint.
- Page/middleware/localStorage cleanup remains future work.
- Sprint 012 D1 session migration remains unapplied.
- Production session storage deployment path remains unresolved.
- Production readiness is not established.
