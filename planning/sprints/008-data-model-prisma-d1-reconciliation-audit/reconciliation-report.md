# Sprint 008 Reconciliation Report - Data Model Prisma / D1

Date: 2026-05-20

## Scope

Sprint 008 audited EmailORC's Prisma / SQLite and Cloudflare D1 data-model relationship from repo files only.

No schema, migration, seed, env, deployment config, app source, test source, or database files were intentionally changed.

EmailORC remains MVP/demo-stage. This report does not establish production readiness.

## Files Inspected

Planning and docs:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/requirements.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/blueprint.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/acceptance.md`
- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`

Data model and configuration:

- `package.json`
- `prisma/schema.prisma`
- `prisma/migrations/20260506063455_init_enterprise_schema_v2/migration.sql`
- `prisma/migrations/20260506070839_add_user_management_fields/migration.sql`
- `prisma/migrations/migration_lock.toml`
- `prisma/seed.ts`
- `prisma/seed.js`
- `d1/migrations/0001_account_growth_schema.sql`
- `d1/migrations/0002_api_secrets.sql`
- `d1/migrations/0003_workflow_persistence.sql`
- `d1/migrations/0004_openrouter_usage_details.sql`
- `d1/migrations/0005_knowledge_embeddings.sql`
- `d1/migrations/0006_learning_log.sql`
- `d1/migrations/0007_user_invites.sql`
- `d1/migrations/0008_account_intelligence.sql`
- `d1/migrations/0009_trial_signup_billing_reset.sql`
- `d1/seed/demo.sql`
- `wrangler.jsonc`
- `.env.example`
- `.dev.vars.example`

Runtime access paths:

- `src/lib/cloudflare-db.ts`
- `src/lib/prisma.ts`
- `src/lib/brain/openrouter.ts`
- `src/lib/brain/embeddings.ts`
- `src/lib/admin/invite-service.ts`
- `src/lib/billing.ts`
- `src/lib/brain-service.ts`
- `src/lib/brain-context.ts`
- `src/types/domain.ts`
- `src/services/campaign-orchestrator.ts`
- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- `app/api/workflow/drafts/route.ts`
- `app/api/workflow/export/route.ts`
- `app/api/drafts/approve/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/signup/route.ts`
- `app/api/auth/accept-invite/route.ts`
- `app/api/admin/organizations/route.ts`
- `app/api/admin/organizations/[id]/plan/route.ts`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[id]/route.ts`
- `app/api/admin/users/[id]/invite/route.ts`
- `app/api/admin/reset-data/route.ts`
- `app/api/admin/system-health/route.ts`
- `app/api/account-intelligence/route.ts`
- `app/api/billing/current-plan/route.ts`
- `app/api/usage/logs/route.ts`
- `app/api/environment/status/route.ts`
- `app/api/brain/api-key/route.ts`
- `app/api/brain/model-settings/route.ts`
- `app/api/brain/learning-log/route.ts`
- `app/api/brain/knowledge-search/route.ts`
- `app/api/brain/embed/route.ts`
- `app/api/brain/regenerate-email/route.ts`
- `app/api/brain/test-chat/route.ts`
- `app/api/brain/test-connection/route.ts`
- `app/api/brain/models/route.ts`
- `app/api/brain/save-openrouter-key/route.ts`
- `app/api/brain/extract-knowledge/route.ts`
- `app/api/brain/test-embedding/route.ts`
- `app/mvp/`
- `src/components/layout/`
- `tests/`

## Files Intentionally Not Touched

- `prisma/dev.db`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `d1/`
- `.env`
- `.env.example`
- `.dev.vars`
- `.dev.vars.example`
- `wrangler.jsonc`
- app/source files
- test files
- seed/demo data

## Prisma Schema Summary

Datasource and generator:

- Generator: `prisma-client-js`
- Datasource: SQLite
- URL: `file:./dev.db`

Current Prisma models:

| Model | Purpose / Notes |
|---|---|
| `Organization` | Local org/account owner model with `name`, `slug`, `plan`, `subscriptionStatus`, `aiCredits`, `status`, relations to memberships, invites, campaigns, usage logs, model settings. |
| `User` | Local user auth/admin model with email, names, job title, password hash, status, last login, memberships, audit logs, usage logs, login history. |
| `Membership` | Join table for users and organizations with role/status and unique `(userId, organizationId)`. |
| `LoginHistory` | Local login event history. |
| `Invite` | Prisma invite model using `inviteToken`; this does not match D1's `invite_tokens` shape. |
| `AuditLog` | Local audit log with actor, action, target, metadata. |
| `Campaign` | Local campaign shell with organization relation and campaign rows. |
| `CampaignRow` | Local campaign row with contact fields, validation, strategy/draft IDs, QA score, approval status. |
| `UsageLog` | Local usage log with action, model, credits, tokens, cost, success/error, campaign row relation. |
| `ModelSetting` | Local model settings table. Closest D1 equivalent is `brain_settings`, not a same-name table. |
| `SubscriptionPlan` | Local plan catalog with credit limit, base price, features JSON string. |
| `CreditRule` | Local credit-cost catalog by action. |

Prisma migration history is not identical to the current Prisma schema:

- The first Prisma migration created older tables such as `StrategyOutput`, `EmailDraft`, `QAOutput`, `KnowledgeBaseEntry`, and `LearningLogEntry`.
- The second Prisma migration drops those older output/knowledge tables and reshapes the schema toward the current local user/org/campaign/settings model.
- Current Prisma `schema.prisma` has no explicit `Lead`, `Draft`, `ImportBatch`, `Approval`, `ExportBatch`, `AnalyticsEvent`, `KnowledgeItem`, `KnowledgeEmbedding`, `AccountIntelligence`, `Subscription`, or `ResetAudit` models.

## D1 Migration / Seed Summary

D1 binding:

- `wrangler.jsonc` defines a D1 binding named `DB`.
- Default/demo environment points to `emailorc-demo-db`.
- `test-live` points to `emailorc-test-live-db`.
- `production` has a placeholder database ID, so production D1 is not confirmed provisioned from repo evidence.
- `AUTO_SEND_ENABLED=false`, `HUMAN_APPROVAL_REQUIRED=true`, `CRM_INTEGRATIONS_ENABLED=false`, and `EMAIL_INTEGRATIONS_ENABLED=false` are present in Wrangler vars for demo, test-live, and production blocks.

D1 tables from migrations:

| Migration | Tables / Changes |
|---|---|
| `0001_account_growth_schema.sql` | Creates `organizations`, `users`, `memberships`, `subscription_plans`, `credit_rules`, `usage_logs`, `leads`, `drafts`, `brain_settings`, `campaign_playbooks`, `learning_log`, `audit_log`, plus indexes. |
| `0002_api_secrets.sql` | Creates `api_secrets` for provider secret storage metadata. |
| `0003_workflow_persistence.sql` | Adds workflow columns to `leads` and `drafts`; creates `import_batches`, `field_mappings`, `approvals`, `export_batches`, `analytics_events`, `offer_library`, plus indexes. |
| `0004_openrouter_usage_details.sql` | Adds OpenRouter/provider detail columns to `usage_logs`. |
| `0005_knowledge_embeddings.sql` | Creates `knowledge_items`, `knowledge_embeddings`; inserts embedding/search credit rules. |
| `0006_learning_log.sql` | Adds feedback-related columns and status index to `learning_log`. |
| `0007_user_invites.sql` | Adds invite-management columns to `users`; creates `invite_tokens`. |
| `0008_account_intelligence.sql` | Creates `account_intelligence`. |
| `0009_trial_signup_billing_reset.sql` | Adds trial/environment/credit columns to `organizations`; creates `subscriptions` and `reset_audit`; seeds subscription plans and backfills subscriptions from organizations. |

D1 seed:

- `d1/seed/demo.sql` seeds demo org/user/membership data, subscription plans, credit rules, brain settings, campaign playbooks, usage logs, and an audit event.
- The seed contains hashed demo passwords and should remain treated as demo data, not production proof.

## Entity / Table Comparison

| Entity | Prisma | D1 | Runtime Access | Match Status | Notes |
|---|---:|---:|---|---|---|
| Organization | `Organization` | `organizations` | Mixed: D1 first in deployed routes, Prisma fallback in some admin/auth/usage routes. | Partial match | Core names align, but D1 has extra `industry`, `environment`, trial and credits columns. Prisma has camelCase fields. |
| User | `User` | `users` | Mixed: D1 first in auth/admin when binding exists, Prisma fallback in local paths. | Partial match | D1 has invite/user-management additions; Prisma has `firstName`/`lastName`; D1 uses snake_case. |
| Membership | `Membership` | `memberships` | Mixed auth/admin. | Strong conceptual match | Unique user/org membership exists in both. |
| Invite | `Invite` | `invite_tokens` plus user invite columns | Mixed/local divergence. | Divergent | Prisma `Invite` uses `inviteToken`; D1 uses `invite_tokens.token`, invite URL/status/email delivery fields, and user invite columns. |
| Audit log | `AuditLog` | `audit_log` | D1 in deployed routes; Prisma fallback in admin user routes. | Partial match | D1 includes organization_id; Prisma actor relation is user-centered. |
| Login history | `LoginHistory` | none confirmed | Prisma only. | Divergent | D1 login route updates `users.last_login` directly; no D1 login history table was found. |
| Campaign | `Campaign` | no `campaigns` table | Prisma only / UI-local board | Divergent | D1 workflow uses `leads.campaign_id` but no D1 `campaigns` table was found. Campaign Board remains browser-local per prior docs. |
| Campaign row | `CampaignRow` | no `campaign_rows`; closest `leads` | Partial conceptual overlap | Divergent | Prisma campaign rows do not equal D1 leads; D1 has import/environment/custom field JSON columns. |
| Lead / imported record | none explicit | `leads` | D1 for import/records/drafts/export; browser fallback when no DB. | D1-only | Central deployed workflow table; absent from current Prisma schema. |
| Draft | none explicit | `drafts` | D1 for import/drafts/export/approve; browser/localStorage fallback when no DB. | D1-only | Central deployed workflow table; absent from current Prisma schema. |
| Import batch | none | `import_batches` | D1 import route. | D1-only | Tracks CSV import metadata. |
| Field mapping | none | `field_mappings` | Mostly schema/support; UI mapping templates also use localStorage. | D1/localStorage split | No clear route writing `field_mappings` was found during this audit. |
| Approval | none | `approvals` | D1 draft approval. | D1-only | Approval history is D1-only. |
| Export batch | none | `export_batches` | D1 export route. | D1-only | Tracks export metadata and duplicate/export key. |
| Analytics event | none | `analytics_events` | D1 import/export. | D1-only | Used for workflow event logging. |
| Usage log | `UsageLog` | `usage_logs` | Mixed: D1 first; Prisma fallback in usage/openrouter helpers. | Partial match | D1 adds provider/model_requested/endpoint/status/content/environment. |
| Model setting / Brain setting | `ModelSetting` | `brain_settings` | D1 model-settings route; Prisma model exists but current route uses D1 or local UI defaults. | Partial match | Same concept, different table names and field naming. |
| API secret | none | `api_secrets` | D1 helper and brain API-key route. | D1-only | Created by migration and also defensively created by helper. |
| Campaign playbook | none | `campaign_playbooks` | D1 seed and reset; UI also has localStorage/default playbooks. | D1/localStorage split | No Prisma equivalent. |
| Learning log | none current | `learning_log` | D1 route plus localStorage fallback in UI. | D1/localStorage split | Old Prisma migration had `LearningLogEntry`, but current schema does not. |
| Knowledge item | none current | `knowledge_items` | D1 embeddings route. | D1-only | Old Prisma migration had `KnowledgeBaseEntry`, but current schema does not. |
| Knowledge embedding | none | `knowledge_embeddings` | D1 embeddings/search. | D1-only | No Prisma equivalent. |
| Offer library | none | `offer_library` | D1 reset/schema; UI uses localStorage/default offers. | D1/localStorage split | No clear route persisting offer library to D1 was found. |
| Account intelligence | none | `account_intelligence` | D1 route plus browser-only fallback. | D1/localStorage split | No Prisma equivalent. |
| Subscription plan | `SubscriptionPlan` | `subscription_plans` | D1 billing and admin plan; Prisma local catalog model exists. | Partial match | Concept matches; D1 names are snake_case and allow seeded Trial/Starter/Growth/Pro/Enterprise. |
| Subscription | none | `subscriptions` | D1 signup/current-plan/admin plan. | D1-only | No Prisma equivalent. |
| Credit rule | `CreditRule` | `credit_rules` | D1 seed/migrations; Prisma local catalog model exists. | Partial match | Concept matches. |
| Reset audit | none | `reset_audit` | D1 reset route. | D1-only | No Prisma equivalent. |

## Runtime Data Access Map

| Path | Reads From | Writes To | Classification | Notes |
|---|---|---|---|---|
| `src/lib/cloudflare-db.ts` | Cloudflare context `DB` binding | none | D1 binding helper | Returns null during production build or local dev without APP_ENV/Cloudflare context. |
| `src/lib/prisma.ts` | SQLite Prisma client | SQLite via callers | Prisma helper | Used as local fallback by several routes/helpers. |
| `app/api/auth/login/route.ts` | D1 users/memberships/orgs, else Prisma | D1 `users.last_login`; Prisma none | Mixed D1 + Prisma fallback | Deployed path prefers D1. |
| `app/api/auth/me/route.ts` | D1 users/memberships/orgs, else query params | none | D1 + local fallback | Fallback trusts request/query context. |
| `app/api/auth/signup/route.ts` | D1 users | D1 users/orgs/memberships/subscriptions/brain_settings/audit_log | D1-only | Returns 503 without D1. |
| `app/api/auth/accept-invite/route.ts` | D1 invite_tokens/users/orgs | D1 invite_tokens/users | D1-only | Returns 503 without D1. |
| `app/api/admin/organizations/route.ts` | D1 organizations, else Prisma | none | Mixed D1 + Prisma fallback | D1 first. |
| `app/api/admin/organizations/[id]/plan/route.ts` | D1 | D1 organizations/subscriptions/audit_log | D1-only | Returns 503 without D1. |
| `app/api/admin/users/route.ts` | D1 users/memberships/orgs/invite_tokens, else Prisma | D1 users/memberships/audit_log/invites, else Prisma user/membership/invite/audit | Mixed D1 + Prisma fallback | D1 user-management fields exceed Prisma model. |
| `app/api/admin/users/[id]/route.ts` | D1 users/memberships/orgs, else Prisma | D1 users/memberships/audit_log, else Prisma | Mixed D1 + Prisma fallback | DELETE archives user in both paths. |
| `app/api/admin/users/[id]/invite/route.ts` | D1 users/memberships/orgs | D1 invite_tokens/users/audit_log | D1-only | Uses invite helper. |
| `app/api/admin/reset-data/route.ts` | D1 counts | D1 deletes and reset/audit inserts | D1 destructive admin route | Not a safe validation path; requires explicit UI confirmation. |
| `app/api/admin/system-health/route.ts` | D1 counts/timestamps | none | D1 + fallback status | Returns disconnected status without D1. |
| `app/api/workflow/import/route.ts` | request body | D1 import_batches/analytics_events/leads/drafts | D1 + browser fallback | Returns local status when DB unavailable; UI stores drafts locally. |
| `app/api/workflow/records/route.ts` | D1 leads/import_batches | none | D1 + empty local fallback | Returns empty local records if DB unavailable. |
| `app/api/workflow/drafts/route.ts` | D1 drafts/leads | none | D1 + empty local fallback | UI also loads localStorage drafts. |
| `app/api/workflow/export/route.ts` | D1 drafts/leads | D1 export_batches/analytics_events | D1 + local fallback | Excludes archived, unapproved, and DNC records in D1 path. |
| `app/api/drafts/approve/route.ts` | request body validation | D1 drafts/approvals/audit_log if DB exists | Mixed D1 + request/local behavior | Without D1, returns approved response after validation but does not persist. |
| `app/api/billing/current-plan/route.ts` | D1 organizations/subscriptions | none | D1 + static fallback | Fallback returns trial defaults. |
| `app/api/usage/logs/route.ts` | D1 usage/users/orgs, else Prisma | none | Mixed D1 + Prisma fallback | D1 has richer usage columns. |
| `app/api/environment/status/route.ts` | D1 organizations environment, else process env | D1 organizations/audit_log on POST | D1 + app env fallback | Source-of-truth field says DB environment if connected. |
| `app/api/account-intelligence/route.ts` | D1 account_intelligence | D1 account_intelligence | D1 + browser-only fallback | Without D1, POST says stored browser-only; UI also uses localStorage. |
| `app/api/brain/api-key/route.ts` | server/Cloudflare secret or D1 api_secrets | D1 api_secrets | D1 + secret fallback | Does not expose raw secrets; status/masked only. |
| `app/api/brain/model-settings/route.ts` | D1 brain_settings | D1 brain_settings/audit_log | D1 + UI default fallback | Without D1, GET returns local status and empty models; POST errors. |
| `app/api/brain/learning-log/route.ts` | D1 learning_log | D1 learning_log | D1 + local object fallback | UI also keeps localStorage learning log. |
| `app/api/brain/knowledge-search/route.ts` | D1 knowledge_embeddings/knowledge_items plus provider embedding | D1 usage via helper | D1 + provider | Requires D1; failure logs usage where possible. |
| `app/api/brain/embed/route.ts` | provider/local embedding | D1 knowledge_items/knowledge_embeddings + usage | D1 + provider/local embedding | Local embedding option exists for vector creation, but storage requires D1. |
| `app/api/brain/test-chat/route.ts` | OpenRouter key and provider | usage via D1 or Prisma fallback | Provider + mixed usage logging | Not a data-model source for core workflow. |
| `app/api/brain/test-connection/route.ts` | OpenRouter key and provider | usage via D1 or Prisma fallback | Provider + mixed usage logging | Not a persistence source except usage logs. |
| `app/api/brain/models/route.ts` | OpenRouter key/provider | none | Provider-only | No D1 write. |
| `app/api/brain/extract-knowledge/route.ts` | request body text | none | Request-only | Pure extraction response; no persistence. |
| `app/api/brain/regenerate-email/route.ts` | request body/default static brain data | D1 usage_logs/audit_log if DB exists | Mixed static/request + D1 logging | Does not update D1 draft row; returns regenerated draft to client. |
| `src/lib/brain-service.ts` | Prisma organization | Prisma organization/usageLog | Prisma-only helper | No route usage confirmed in this audit, but it is an active source utility. |
| `src/lib/brain-context.ts` | localStorage/default constants | localStorage via callers | Static/demo + browser localStorage | Many Brain Center and draft memories are browser-local. |
| `app/mvp/upload`, `records`, `drafts`, `export`, `brain-center`, `admin` | APIs plus localStorage | localStorage plus APIs | Mixed browser + API | UI keeps several browser-local stores for drafts, context, brain settings, and environment cache. |
| `tests/e2e/non-mutating-smoke.spec.ts` | app pages only | none intended | Safe fixture/browser smoke | Asserts no mutating HTTP methods. |
| `tests/e2e/emailorc.spec.ts` | fixture CSV/users/localStorage/app APIs | app/admin/user/environment state | Mutating E2E | Not a safe Sprint 008 gate. |

## Environment / Binding Observations

- Runtime D1 access is centralized through `getD1Database()`.
- Local dev without APP_ENV or Cloudflare context falls back to null DB.
- Many routes then either use Prisma, return empty/default responses, return 503, or rely on browser localStorage behavior.
- D1 environment is represented both by Wrangler env blocks and by `organizations.environment`.
- The app uses both `live-test` and `test-live` labels. Signup defaults unknown values to `live-test`; Wrangler has `test-live`; environment status normalizes both as separate modes. This should be clarified before production data decisions.
- Production Wrangler D1 database ID is a placeholder, so repo evidence does not prove a production database exists.

## Confirmed Matches

- Organization/user/membership concepts exist in both Prisma and D1.
- Subscription plan and credit rule concepts exist in both.
- Usage logging exists in both, though D1 is richer.
- Brain/model setting concepts exist in both, with Prisma `ModelSetting` closest to D1 `brain_settings`.
- Audit logging exists in both.
- D1 and Prisma seed paths both support the same demo user family and demo organization concept, although implemented separately.

## Confirmed Divergences

- Current Prisma schema does not model D1's deployed workflow tables: `leads`, `drafts`, `import_batches`, `approvals`, `export_batches`, `analytics_events`, `field_mappings`, `offer_library`, `account_intelligence`, `subscriptions`, or `reset_audit`.
- Current Prisma schema does not model D1 knowledge/embedding tables: `knowledge_items`, `knowledge_embeddings`, or current `learning_log`.
- Prisma has `Campaign`/`CampaignRow`; D1 has no `campaigns` or `campaign_rows` table. D1 workflow persistence uses `leads` and `drafts` instead.
- Prisma has `LoginHistory`; D1 login updates `users.last_login` but has no login history table.
- Prisma has `Invite`; D1 has `invite_tokens` plus invite fields on `users`. These are not structurally equivalent.
- D1 has additional environment/trial/billing/user-management fields not represented in Prisma.
- Some runtime helpers still write Prisma when D1 is unavailable, especially auth/admin/usage/brain-service paths, while the main deployed workflow routes are D1-centered.
- UI state remains partly browser-local for drafts, Brain Center context, offer/mapping templates, account context, and environment cache.

## Unknowns / Unresolved Questions

- Whether Prisma should remain a local-only fallback, be retired, or be reconciled with D1 is not decided.
- Whether D1 is the intended long-term deployed source of truth needs owner/architect approval.
- Whether `live-test` and `test-live` should be one environment concept or two distinct modes is unclear.
- Whether D1 `field_mappings`, `offer_library`, and `campaign_playbooks` should replace current localStorage/default UI stores is unclear.
- Whether browser-local draft state should continue to coexist with D1 `drafts` is unclear.
- Whether Prisma migration history should be kept as historical local-dev artifact or actively maintained is unclear.
- Whether production D1 exists is not proven by repo files because `wrangler.jsonc` uses a placeholder production database ID.

## Risks

- Mixed Prisma/D1/browser-local persistence can create different behavior between localhost, demo, test-live, and production.
- D1 appears richer and more aligned with current workflow routes, but production D1 configuration is not complete in repo evidence.
- Prisma fallback paths may hide D1-only schema gaps during local testing.
- Some admin/reset routes are intentionally destructive and must not be included in safe validation.
- Environment naming drift (`live-test` vs `test-live`) can put records in unexpected partitions.
- `prisma/dev.db` was already dirty in git status and remains a commit risk.

## Source-of-Truth Recommendation

Based only on repo evidence, D1 should be treated as the likely deployed workflow source of truth for future planning because:

- Wrangler binds D1 as `DB` across demo/test-live/production config blocks.
- Current workflow import, records, drafts, export, signup, billing, environment, account intelligence, knowledge embedding, invite, and admin reset paths primarily target D1.
- D1 migrations contain the richer current MVP workflow tables absent from Prisma.

This is a recommendation for planning only. It is not an implementation decision and does not establish production readiness.

Prisma should be documented as a local fallback/development layer until a future approved sprint decides whether to preserve, reconcile, or remove it.

## Recommended Sprint 009

Recommended next sprint:

`009-environment-mode-definition-and-data-store-decision`

Reason:

Before changing persistence behavior or planning migrations, the project should define demo, live-test/test-live, and production modes, then decide whether D1 is the approved deployed source of truth and what Prisma's future role should be.

Do not start Sprint 009 from this report.

## Validation Results

Validation commands were run after documentation updates. See final Builder report for exact command outcomes.

Unsafe commands skipped:

- Prisma migrate/db push/db pull/reset/generate commands.
- Seed commands.
- Wrangler deploy.
- Cloudflare D1 write commands.
- Broad mutating Playwright commands.
- Secret-dependent commands.
- Sending/live integration commands.
