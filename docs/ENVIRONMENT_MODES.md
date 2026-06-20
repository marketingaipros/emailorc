# Environment Modes

## Overview

Sprint 009 defines EmailORC environment modes for future implementation planning.

These definitions are documentation decisions only. Sprint 009 does not change app behavior, API behavior, UI behavior, schema, migrations, seed data, env files, deployment config, database files, or runtime mode normalization.

EmailORC remains MVP/demo-stage. Production readiness is not established.

## Canonical Modes

| Mode | Canonical Label | Current Decision |
|---|---|---|
| Demo | `demo` | Safe seeded/resettable sample-data mode. |
| Test live | `test-live` | Canonical pre-production live-like validation mode. |
| Production | `production` | Future target state only; not currently established. |

`live-test` is legacy/non-canonical wording. If found in current runtime or documentation references, it should be treated as deprecated wording and normalized to `test-live` in a future approved implementation sprint.

`live-test` must not become a separate data partition from `test-live`.

## Business Definitions

| Mode | Business Meaning |
|---|---|
| `demo` | Safe sales, internal demo, training, and sample-data mode. It uses demo-safe data and may be reset or reseeded. It must not be represented as production and must not carry real customer obligations. |
| `test-live` | Controlled pre-production validation mode. It may use live-like behavior and realistic or owner-approved limited real data to prove workflows before production. It is not production. |
| `production` | Future real customer/business operation mode. It would use real organizations, real users, real workflow records, production-grade auth/session controls, production database provisioning, audit expectations, and production deployment validation. It is not currently established. |

## Technical Definitions

| Area | `demo` | `test-live` | `production` |
|---|---|---|---|
| Purpose | Demo, training, and sample workflows. | Controlled live-like validation before production. | Real customer/business operation after future readiness approval. |
| Data | Seeded or demo-safe sample data. | Realistic test data or owner-approved limited real data. | Real customer/business data. |
| Reset posture | Resettable and reseedable. | Reset only by explicit owner/admin test reset rules. | Restricted, audited, and never casual. |
| D1 posture | Uses demo D1 binding when deployed. | Uses test-live D1 binding when deployed. | Requires provisioned and validated production D1. |
| Prisma posture | Local development/fallback/transition only. | Not the deployed source of truth. | Not the source of truth unless a future approved sprint changes the decision. |
| Browser localStorage | Acceptable as current MVP-visible behavior while documented. | Should be minimized and documented where still present. | Should not be source of truth for critical records. |
| Sending | Auto-send off. | Auto-send off. | Auto-send off unless a future approved production integration sprint changes it. |
| CRM/email integrations | Disabled. | Disabled unless a future approved sandbox/test integration sprint changes it. | Disabled until production integration readiness is approved. |
| Human approval | Required. | Required. | Required unless future owner-approved policy changes it. |
| Readiness claim | Not production-ready. | Not production-ready. | Future target; must be separately validated. |

## Data Isolation Rules

- `demo` data can be reset or reseeded.
- `test-live` data should be isolated from `demo` and should not share a separate `live-test` partition.
- `production` data must remain a future target until production database provisioning, auth/session readiness, deployment readiness, data retention, integration posture, and validation are approved.
- Current references to `live-test` should be documented as legacy wording until a future implementation sprint normalizes them.

## Data-Store Direction

Cloudflare D1 is the planning direction for the deployed workflow source of truth.

Prisma / SQLite remains local development, fallback, and transition support only unless a future approved sprint changes that decision.

This decision comes from Sprint 008 findings:

- D1 is the richer deployed workflow schema by repo evidence.
- Workflow routes primarily use D1 when the `DB` binding exists.
- Prisma lacks several deployed workflow entities, including leads, drafts, import batches, approvals, export batches, analytics events, knowledge items, embeddings, account intelligence, subscriptions, and reset audit.
- Production D1 remains unconfirmed because repo evidence shows a placeholder production D1 database ID.

## Future Implementation Checklist

Before behavior changes:

- Normalize `live-test` references to canonical `test-live`.
- Ensure normalization does not partition data between `live-test` and `test-live`.
- Decide whether Prisma fallback paths remain, move behind an adapter, or are retired.
- Provision and validate production D1 before any production claim.
- Review auth/session readiness.
- Review data retention and reset rules.
- Keep auto-send and live CRM/email integrations disabled unless a future approved sprint changes those rules.

