# API

## Overview

This document captures known API route behavior and guard expectations.

EmailORC remains MVP/demo-stage and is not production-ready.

API authorization should derive user, organization, and role from a server-authenticated current-user context. Request-supplied identity values must not be trusted for authorization.

---

## Auth Guard Progress

| API group | Guard status | Notes |
|---|---|---|
| `/api/auth/me` | Guarded in Sprint 012 | Uses server current-user/session helper. |
| `app/api/admin/*` | Guarded in Sprint 013 | Requires canonical `super_admin`; returns `401`/`403` consistently. |
| Workflow/draft APIs | Guarded in Sprint 014 | Requires valid session and organization-scoped authorization. |
| Brain/provider APIs | Guarded in Sprint 015 | Approved organization-scoped Brain/provider routes require valid session and organization-scoped authorization. |
| Billing/usage/account APIs | Future work | Not included in Sprint 015 unless clearly part of Brain/provider route surface. |

---

## Brain / Provider API Areas

Sprint 015 inspected current Brain/provider API route files and documented the exact approved route list before implementation.

Candidate areas include:

| Candidate area | Reason to inspect | Sprint 015 treatment |
|---|---|---|
| `app/api/brain/*` | Brain Center configuration, knowledge, playbooks, learning logs, prompt/model behavior. | Include if organization-scoped Brain/provider data is read or mutated. |
| `app/api/openrouter/*` | Provider/model settings and OpenRouter-related behavior. | Include if organization-scoped provider settings or keys are read or mutated. |
| `app/api/provider/*` or `app/api/providers/*` | Provider configuration. | Include if organization-scoped. |
| `app/api/model-settings/*` | Model/provider settings. | Include if organization-scoped. |
| Brain/provider-related settings routes | Possible configuration routes outside obvious folders. | Include only if clearly Brain/provider API scope. |

Sprint 015 left out billing, usage, account-intelligence, admin, workflow/draft, page, middleware, and unrelated settings routes.

### Sprint 015 Guarded Routes

| Route | Sprint 015 status | Notes |
|---|---|---|
| `app/api/brain/api-key/route.ts` | Guarded | Reads/saves OpenRouter key status using server current-user organization scope. |
| `app/api/brain/save-openrouter-key/route.ts` | Guarded by re-export | Re-exports the guarded `api-key` POST handler. |
| `app/api/brain/embed/route.ts` | Guarded | Creates organization-scoped knowledge embeddings and logs usage with server current-user actor. |
| `app/api/brain/knowledge-search/route.ts` | Guarded | Searches organization-scoped knowledge embeddings and logs usage with server current-user actor. |
| `app/api/brain/learning-log/route.ts` | Guarded | Reads/writes organization-scoped learning logs with server current-user actor metadata. |
| `app/api/brain/model-settings/route.ts` | Guarded | Reads/writes organization-scoped model settings and audit metadata. |
| `app/api/brain/models/route.ts` | Guarded | Loads OpenRouter models using server-authorized organization key lookup. |
| `app/api/brain/regenerate-email/route.ts` | Guarded | Regenerates Brain draft output and writes usage/audit metadata with server current-user actor. |
| `app/api/brain/test-chat/route.ts` | Guarded | Tests OpenRouter chat using server-authorized organization key lookup and logs usage. |
| `app/api/brain/test-connection/route.ts` | Guarded | Tests OpenRouter connection using server-authorized organization key lookup and logs usage. |
| `app/api/brain/test-embedding/route.ts` | Guarded | Tests embeddings and logs Brain usage with server current-user actor. |
| `app/api/brain/extract-knowledge/route.ts` | Left out | Current route only performs local text extraction/classification and does not read/write organization-scoped storage, provider keys, Brain settings, usage logs, audit logs, or request identity. |

---

## Sprint 015 Expected Guard Semantics

Approved Brain/provider routes:

- return `401` when no valid server session exists
- return `403` when the current user is authenticated but not authorized for the requested organization-scoped resource
- derive organization/user/role authorization from the Sprint 012 current-user helper
- stop trusting request-supplied organization, user, role, provider-owner, or actor values for authorization
- preserve existing successful response shapes where practical
- avoid exposing provider keys or secret values

---

## Known Workflow / Draft API Contract From Sprint 014

Sprint 014 guarded:

- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- `app/api/workflow/drafts/route.ts`
- `app/api/workflow/export/route.ts`
- `app/api/drafts/approve/route.ts`

Those routes now use server current-user organization context for authorization and no longer trust request-supplied identity fields for authorization.

---

## Outlook Draft Integration — Sprint 052

Exact file paths and response shapes must be validated during preflight before implementation.

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

---

## API Documentation Gaps

Future API documentation should capture for each route:

- Method
- Path
- Request shape
- Response shape
- Auth/session expectation
- Data source
- Validation rules
- Error states
- Environment-mode behavior
- Whether request-supplied identity is ignored, compared as requested scope, or still present only for backward-compatible non-auth behavior
