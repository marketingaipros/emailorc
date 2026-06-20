# Sprint 009 Environment Mode Decision

## Decision Status

Drafted for Sprint 009 documentation pass. Final durable docs should be updated after owner approval.

## Canonical Mode Names

| Mode | Canonical Label | Status |
|---|---|---|
| Demo | `demo` | Canonical |
| Test live | `test-live` | Canonical |
| Production | `production` | Canonical future target |

`live-test` is a legacy/non-canonical alias. It should be normalized to `test-live` in a future implementation sprint and must not become a separate environment or data partition.

## Business Definitions

| Mode | Business Meaning |
|---|---|
| `demo` | Safe sales/internal demonstration and training mode. Uses demo-safe data, can be reset or reseeded, and must not be represented as production. |
| `test-live` | Controlled pre-production live-like validation mode. Uses realistic workflows and owner-approved test or limited real data to prove behavior before production. |
| `production` | Real customer/business operation mode. Uses real organizations, users, workflow records, billing posture, audit expectations, and production-grade controls. Production is not established yet. |

## Technical Definitions

| Area | `demo` | `test-live` | `production` |
|---|---|---|---|
| Purpose | Demo/training | Live-like validation | Real operation |
| Data | Seeded or demo-safe data | Realistic test or owner-approved limited real data | Real customer/business data |
| Reset | Allowed and expected | Explicit owner/admin test reset only | Restricted and audited |
| Persistence direction | D1 demo DB when deployed; current local/browser fallbacks documented until cleanup | D1 test-live DB when deployed; no separate `live-test` DB partition | Production D1 only after provisioned and validated |
| Prisma role | Local/development/transition fallback | Not source of truth | Not source of truth unless future decision changes it |
| Browser localStorage | Acceptable for MVP/demo-visible state while documented | Should be minimized and documented where still present | Should not be source of truth for critical records |
| Auto-send | Off | Off | Off until future approved integration sprint |
| CRM/email integrations | Disabled | Disabled unless future approved sandbox/test integration sprint changes this | Disabled until production integration readiness is approved |
| Human review | Required | Required | Required unless future owner-approved policy changes it |
| Production readiness | Not claimed | Not claimed | Future target; must be separately validated |

## Data-Store Direction

Cloudflare D1 is the future deployed source-of-truth direction for EmailORC workflow and account data.

Prisma / SQLite remains local/development/transition fallback only unless a future approved sprint changes that decision.

Production D1 remains unconfirmed/provisioning-required because Sprint 008 found the production D1 database ID is still a placeholder in repo evidence.

## Non-Implementation Boundary

Sprint 009 documents direction only. It does not change code, schema, migrations, seed data, env files, deployment config, database files, API behavior, UI behavior, auth/session behavior, or integration behavior.

