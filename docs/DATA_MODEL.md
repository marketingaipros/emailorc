# Data Model

## Overview

EmailORC currently has multiple data-model layers:

1. Prisma / SQLite local development layer under `prisma/`.
2. Cloudflare D1 migration and demo/test-live layer under `d1/`.
3. Runtime API paths that use D1 when a `DB` binding is available.
4. Runtime fallback paths that use Prisma, browser localStorage, static defaults, request-only responses, or empty/default responses.

Sprint 008 reconciled these layers from repo evidence only. No schema, migration, seed, env, deployment config, app source, test source, or database files were intentionally changed.

EmailORC remains MVP/demo-stage. Production readiness is not established.

## Current Source-of-Truth Status

| Area | Status | Notes |
|---|---|---|
| Local development schema | Known | Prisma uses SQLite via `file:./dev.db` and current `schema.prisma`. |
| Deployed/demo schema | Known from files | D1 migrations define a broader workflow schema and are bound in `wrangler.jsonc` as `DB`. |
| Runtime persistence | Mixed | D1 is primary for deployed workflow paths; Prisma remains fallback in some auth/admin/usage paths; browser localStorage remains active in UI flows. |
| Production data model | Unknown | Wrangler production D1 database ID is a placeholder; production readiness is not established. |
| Data migration plan | Not defined | Out of scope for Sprint 008. |

## Sprint 009 Data-Store Direction Decision

Sprint 009 records a documentation/planning decision for future implementation:

- Cloudflare D1 is the planning direction for EmailORC's deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support only unless a future approved sprint changes that decision.
- Production D1 remains unconfirmed/provisioning-required because repo evidence shows a placeholder production D1 database ID.
- Browser localStorage remains part of visible MVP behavior, but it should not become a production source of truth for critical records.
- No schema, migration, seed, env, deployment config, app source, test source, database file, or runtime behavior change was made for this decision.

Environment mode definitions now live in `docs/ENVIRONMENT_MODES.md`.

## Prisma Layer

Prisma configuration:

- Generator: `prisma-client-js`
- Datasource: SQLite
- URL: `file:./dev.db`

Current Prisma models:

| Model | Notes |
|---|---|
| `Organization` | Local org model with plan, subscription status, AI credits, status, users, invites, campaigns, usage logs, and model settings. |
| `User` | Local user model with email, names, job title, password hash, status, last login, memberships, audit logs, usage logs, login history. |
| `Membership` | User-to-organization role/status join. |
| `LoginHistory` | Prisma-only login event history. |
| `Invite` | Prisma invite model; structurally different from D1 `invite_tokens`. |
| `AuditLog` | Local audit log. |
| `Campaign` | Local campaign shell. |
| `CampaignRow` | Local campaign row; closest D1 workflow concept is `leads`, but they are not equivalent. |
| `UsageLog` | Local usage log. |
| `ModelSetting` | Local model-setting concept; closest D1 table is `brain_settings`. |
| `SubscriptionPlan` | Local plan catalog. |
| `CreditRule` | Local credit-cost catalog. |

Current Prisma schema does not include explicit models for D1 `leads`, `drafts`, `import_batches`, `approvals`, `export_batches`, `analytics_events`, `api_secrets`, `knowledge_items`, `knowledge_embeddings`, `account_intelligence`, `subscriptions`, or `reset_audit`.

## D1 Layer

`wrangler.jsonc` defines D1 binding `DB`:

- default/demo: `emailorc-demo-db`
- `demo`: `emailorc-demo-db`
- `test-live`: `emailorc-test-live-db`
- `production`: placeholder database ID

D1 migrations create or alter:

- Core auth/account tables: `organizations`, `users`, `memberships`, `audit_log`
- Plan/credit/usage tables: `subscription_plans`, `subscriptions`, `credit_rules`, `usage_logs`
- Workflow tables: `leads`, `drafts`, `import_batches`, `field_mappings`, `approvals`, `export_batches`, `analytics_events`
- Brain/data tables: `brain_settings`, `campaign_playbooks`, `learning_log`, `knowledge_items`, `knowledge_embeddings`, `offer_library`, `account_intelligence`
- Invite/secrets/reset tables: `api_secrets`, `invite_tokens`, `reset_audit`

`d1/seed/demo.sql` seeds demo organizations, demo users, memberships, plan/credit catalogs, brain settings, campaign playbooks, usage logs, and an audit event.

## Entity Reconciliation

| Entity | Prisma | D1 | Match Status |
|---|---:|---:|---|
| Organization | `Organization` | `organizations` | Partial match; D1 adds environment/trial/credit fields. |
| User | `User` | `users` | Partial match; D1 adds phone/notes/invite fields. |
| Membership | `Membership` | `memberships` | Strong conceptual match. |
| Invite | `Invite` | `invite_tokens` and user invite fields | Divergent. |
| Audit log | `AuditLog` | `audit_log` | Partial match. |
| Login history | `LoginHistory` | none found | Prisma-only. |
| Campaign | `Campaign` | none found | Prisma-only; Campaign Board remains browser-local in current MVP docs. |
| Campaign row | `CampaignRow` | closest: `leads` | Divergent. |
| Lead/imported record | none | `leads` | D1-only. |
| Draft | none | `drafts` | D1-only. |
| Import/export/approval events | none | `import_batches`, `export_batches`, `approvals`, `analytics_events` | D1-only. |
| Usage log | `UsageLog` | `usage_logs` | Partial match; D1 has richer provider/environment fields. |
| Model/brain settings | `ModelSetting` | `brain_settings` | Partial match with different table/field names. |
| Knowledge/search | none current | `knowledge_items`, `knowledge_embeddings` | D1-only. |
| Learning log | none current | `learning_log` | D1 plus browser-local fallback. |
| Account intelligence | none | `account_intelligence` | D1 plus browser-local fallback. |
| Subscription plan | `SubscriptionPlan` | `subscription_plans` | Partial match. |
| Subscription | none | `subscriptions` | D1-only. |
| Credit rule | `CreditRule` | `credit_rules` | Partial match. |
| Reset audit | none | `reset_audit` | D1-only. |

## Runtime Persistence Summary

| Area | Runtime Data Path |
|---|---|
| Login/admin users/orgs | D1 first when `DB` binding exists; Prisma fallback in several local paths. |
| Signup/invite acceptance | D1-only; returns service unavailable without D1. |
| Workflow import/records/drafts/export | D1-centered; browser/local fallback behavior exists when DB is unavailable. |
| Draft approval | Validates request and writes D1 when available; without D1 it returns approved response but does not persist. |
| Billing/current plan | D1 first; static trial fallback without DB. |
| Environment status | D1 organization environment when DB exists; app/process fallback otherwise. |
| Brain model settings | D1 for persisted model settings; UI defaults/localStorage when unavailable. |
| Brain knowledge embeddings/search | D1 storage required for persisted knowledge vectors. |
| Brain test chat/connection/usage | Provider calls plus usage logging to D1 or Prisma fallback. |
| Account intelligence | D1 when available; browser-only/localStorage fallback otherwise. |
| Campaign Board | Browser-local/shared helper behavior per prior sprint docs; no D1 `campaigns` table found. |

## Confirmed Data Model Gaps

- D1 is richer than Prisma for current workflow persistence.
- Prisma fallback paths may not exercise deployed D1-only workflow tables.
- UI localStorage remains part of visible behavior for drafts, Brain Center context, offer/mapping templates, account context, and environment cache.
- Environment naming is inconsistent: `live-test` and `test-live` both appear.
- Production D1 is not confirmed because `wrangler.jsonc` contains a placeholder production D1 ID.

Sprint 009 resolves the naming direction for planning: `test-live` is canonical, and `live-test` is legacy/non-canonical wording to normalize in a future implementation sprint. `live-test` must not become a separate data partition.

## Sprint 012 App Session Storage

Sprint 012 requires server-side session storage to support the approved HTTP-only opaque session cookie direction.

Sprint 012 added `d1/migrations/0010_app_sessions.sql`. The migration was not executed during Sprint 012.

The `app_sessions` table contract is:

| Column | Purpose |
|---|---|
| `id` | Session id. |
| `token_hash` | SHA-256 hash of the opaque cookie token. |
| `user_id` | Authenticated user id. |
| `organization_id` | Active organization id when available. |
| `role` | Session role captured at login. |
| `expires_at` | Absolute session expiration timestamp. |
| `revoked_at` | Logout/revocation timestamp. |
| `created_at` | Creation timestamp. |
| `updated_at` | Last update timestamp. |

The raw opaque token is stored only in the `emailorc_session` HTTP-only cookie. D1 stores only `token_hash`.

## Outlook Connection and Delivery Tracking — Sprint 052 Target

Do not create a migration until implementation preflight confirms the current schema and next migration number. Current repository preflight found D1 migrations through `0010_app_sessions.sql`; the next available migration number is `0011`.

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

## Planning Recommendation

Based on Sprint 008 repo evidence and Sprint 009 planning approval, D1 should be treated as the future deployed workflow source-of-truth direction. Prisma should remain documented as a local fallback/development/transition layer until a future approved sprint decides whether to preserve, reconcile, or retire it in implementation.

This is still not a production-readiness claim. Production D1 must be provisioned and validated in a future approved sprint before production can be treated as established.

See the full Sprint 008 report:

`planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`
