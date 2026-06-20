# Architect Pack 009 - Environment Mode Definition and Data Store Decision

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `009-environment-mode-definition-and-data-store-decision`  
**Created:** 2026-05-21  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 009 is a planning and decision sprint.

Sprint 008 reconciled the current Prisma / SQLite and Cloudflare D1 data-model layers from repo evidence. It did not make an implementation decision. Sprint 009 should use Sprint 008 findings as source context to define what EmailORC's environment modes mean in business and technical terms, then make a documented data-store direction decision for future implementation.

This sprint must not implement code yet.

The goal is to produce durable project documentation that future implementation sprints can build from:

1. A clear definition of `demo`, `test-live`, and `production`.
2. A resolved direction for the `live-test` versus `test-live` naming conflict.
3. A documented data-store source-of-truth decision.
4. A future implementation path that keeps EmailORC safe, reviewable, and not falsely marked production-ready.

The handoff is the project folder, not this conversation.

---

## Source Context From Sprint 008

Sprint 009 must treat these Sprint 008 findings as required source context:

- EmailORC remains MVP/demo-stage.
- Production readiness is not established.
- D1 is the richer deployed workflow schema by repo evidence.
- Prisma remains active as a local fallback/development layer in some auth/admin/usage paths.
- Browser `localStorage` remains part of visible MVP behavior for drafts, Brain Center context, mapping templates, account context, and environment cache.
- Production D1 is not confirmed because `wrangler.jsonc` contains a placeholder production database ID.
- Runtime persistence is mixed:
  - D1 first for deployed workflow paths when the `DB` binding exists.
  - Prisma fallback in some auth/admin/usage paths.
  - Browser-local or request-only fallbacks in several UI/API flows.
- Environment naming is inconsistent:
  - Wrangler uses `test-live`.
  - Some app/runtime behavior uses or accepts `live-test`.
  - This can partition data unexpectedly if not resolved before implementation.
- Auto-send remains disabled.
- Live CRM/email integrations remain disabled.
- Human review remains required.
- No production-readiness claim should be made until a later readiness sprint validates auth, deployment, data, integrations, and sending behavior.

Primary Sprint 008 files:

- `Architect-Pack-008-Data-Model-Prisma-D1-Reconciliation-Audit.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`
- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/QUESTIONS.md`
- `planning/RISKS.md`

---

## Scope Control

### In Scope

- Read Sprint 008 reconciliation docs and project planning docs.
- Define the business meaning of:
  - `demo`
  - `test-live`
  - `production`
- Define the technical meaning of each mode:
  - data persistence expectations
  - seed/demo data expectations
  - allowed user flows
  - integrations/sending posture
  - reset behavior
  - validation expectations
  - deployment/database binding expectations
- Decide whether the canonical pre-production live mode name is `test-live` or `live-test`.
- Document aliases or migration expectations for the non-canonical label.
- Make a documented data-store direction decision for future implementation.
- Decide the future role of Prisma:
  - local development only
  - fallback only during transition
  - retired later
  - or retained through a documented adapter boundary
- Decide the future role of D1:
  - deployed source of truth
  - demo/test-live only
  - production source of truth after provisioning
  - or deferred if evidence does not support a decision
- Update planning and documentation only.
- Create Sprint 009 planning files under:
  - `planning/sprints/009-environment-mode-definition-and-data-store-decision/`
- Update durable docs as needed:
  - `docs/ARCHITECTURE.md`
  - `docs/DATA_MODEL.md`
  - `docs/API.md`
  - `docs/VALIDATION.md`
  - optionally a new `docs/ENVIRONMENT_MODES.md`
- Update durable planning files:
  - `planning/STATE.md`
  - `planning/DECISIONS.md`
  - `planning/QUESTIONS.md`
  - `planning/RISKS.md`
- Run safe validation commands only if docs-only changes need validation:
  - `git status --short`
  - no database commands
  - no deploy commands

### Out of Scope

- No app code changes.
- No API route changes.
- No UI changes.
- No auth/session changes.
- No schema changes.
- No Prisma schema edits.
- No D1 migration edits.
- No new migrations.
- No seed/demo data changes.
- No data migration scripts.
- No database reset.
- No Prisma generate/migrate/db push.
- No Wrangler deploy.
- No Cloudflare D1 writes.
- No env file changes.
- No `.dev.vars` or `.env` edits.
- No deployment config changes.
- No production database provisioning.
- No production-readiness claim.
- No enabling auto-send.
- No enabling live CRM integrations.
- No enabling live email integrations.
- No intentional changes to `prisma/dev.db`.
- No secrets inspection or exposure.

---

## Recommended Sprint 009 Decisions

These are the recommended architect decisions for Codex to document unless repo evidence or owner direction contradicts them.

### Decision 1 - Canonical Mode Names

Use these canonical mode names:

| Mode | Canonical Label | Status |
|---|---|---|
| Demo | `demo` | Canonical |
| Test live | `test-live` | Canonical |
| Production | `production` | Canonical |

Treat `live-test` as a legacy/non-canonical alias that must not become a separate data partition.

Future implementation should normalize `live-test` to `test-live` at mode boundaries, but Sprint 009 must only document that direction.

### Decision 2 - Business Meaning

| Mode | Business Meaning |
|---|---|
| `demo` | Safe sales/internal demonstration mode. Uses demo-safe data and no real customer obligation. It may be reset, reseeded, or replaced. It must not send real email, trigger live CRM actions, or be represented as production. |
| `test-live` | Controlled pre-production validation mode using realistic workflows and optionally real owner-approved test accounts/data. It is for proving the live-like flow before production. It must still keep auto-send off unless a future explicit integration sprint changes that. |
| `production` | Real customer/business operation mode. Uses real organizations, users, workflow records, billing posture, audit expectations, and production-grade auth/session/deployment controls. Production is not established yet. |

### Decision 3 - Technical Meaning

| Area | `demo` | `test-live` | `production` |
|---|---|---|---|
| Primary purpose | Demo and training | Live-like validation | Real operation |
| Data | Seeded/demo-safe data | Realistic test data or owner-approved limited real data | Real customer/business data |
| Reset | Allowed and expected | Allowed only through explicit owner/admin test reset rules | Restricted, audited, and never casual |
| Persistence | D1 demo DB when deployed; local/browser fallbacks may exist until implementation cleanup | D1 test-live DB when deployed; no separate `live-test` partition | Production D1 only after provisioned and validated |
| Prisma | Local development/fallback only during transition | Not source of truth | Not source of truth unless a future decision reverses this |
| Browser localStorage | Acceptable for MVP/demo-visible state until replaced | Should be minimized and documented where still present | Should not be source of truth for critical records |
| Auto-send | Off | Off | Off until a future approved production integration sprint explicitly enables it |
| CRM/email integrations | Disabled | Disabled unless a future approved test integration sprint enables controlled sandbox behavior | Disabled until production integration readiness is approved |
| Human review | Required | Required | Required unless a future owner-approved policy changes it |
| Production readiness | Not claimed | Not claimed | Must be separately validated |

### Decision 4 - Data-Store Direction

Use Cloudflare D1 as the future deployed source of truth for EmailORC workflow and account data.

Use Prisma / SQLite as local development and transition fallback only until a future implementation sprint either:

- removes Prisma fallback paths,
- keeps Prisma behind a documented local adapter,
- or replaces Prisma with D1-backed local development tooling.

This decision is based on Sprint 008 evidence:

- D1 contains the broader deployed workflow schema.
- Workflow routes primarily target D1 when `DB` is available.
- Prisma lacks several deployed workflow entities, including leads, drafts, import batches, approvals, export batches, analytics events, knowledge items, embeddings, account intelligence, subscriptions, and reset audit.
- Wrangler already models demo and test-live D1 bindings, while production still has a placeholder D1 ID.

Sprint 009 should document this as a future implementation direction only. It should not change code, schema, migrations, config, databases, or deployment state.

---

## Required Deliverables

### 1. Sprint Planning Folder

Create:

`planning/sprints/009-environment-mode-definition-and-data-store-decision/`

With:

- `requirements.md`
- `blueprint.md`
- `acceptance.md`
- `handoff-prompt.md`
- `environment-mode-decision.md`

### 2. Environment Mode Documentation

Create or update:

- `docs/ENVIRONMENT_MODES.md`

This doc should define:

- canonical mode names
- legacy alias handling recommendation
- business meaning per mode
- technical behavior per mode
- data isolation expectations
- sending/integration posture
- reset posture
- production-readiness warning
- future implementation checklist

### 3. Data Model Documentation

Update:

- `docs/DATA_MODEL.md`

Add a Sprint 009 decision section stating:

- D1 is the future deployed source of truth direction.
- Prisma is local/development/transition fallback only until a future implementation sprint changes or removes it.
- Production D1 remains unprovisioned/unconfirmed from repo evidence.
- No schema or migration changes were made in Sprint 009.

### 4. Architecture/API/Validation Docs

Update only as needed:

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`

Expected updates:

- Link to `docs/ENVIRONMENT_MODES.md`.
- Clarify that `test-live` is the canonical pre-production live-like mode.
- Clarify that `live-test` is legacy/non-canonical naming to normalize later.
- Clarify that mode definitions are now documented but not implemented.
- Clarify that production readiness is still not established.

### 5. Planning State

Update:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/QUESTIONS.md`
- `planning/RISKS.md`

Expected updates:

- Mark Sprint 009 as active or complete locally depending on execution state.
- Add decisions for:
  - canonical mode labels
  - `test-live` over `live-test`
  - D1 as future deployed source of truth
  - Prisma as local/development/transition fallback
- Close answered questions about mode meaning and data-store direction.
- Keep production-readiness, auth/session, deployment target, production D1 provisioning, and integration enablement questions open.

---

## Acceptance Criteria

Sprint 009 is complete when:

- [ ] Builder read Sprint 008 reconciliation report and related docs before editing Sprint 009 docs.
- [ ] Builder did not implement app code changes.
- [ ] Builder did not edit schema, migrations, seed data, env files, deployment config, or database files.
- [ ] `demo`, `test-live`, and `production` are defined in business terms.
- [ ] `demo`, `test-live`, and `production` are defined in technical terms.
- [ ] `test-live` is documented as the canonical pre-production live-like mode.
- [ ] `live-test` is documented as a legacy/non-canonical alias to normalize in a future implementation sprint.
- [ ] D1 is documented as the future deployed source-of-truth direction.
- [ ] Prisma is documented as local/development/transition fallback only unless a future sprint changes that decision.
- [ ] Production D1 remains documented as unconfirmed/provisioning-required.
- [ ] Auto-send remains off in all current modes.
- [ ] Live CRM/email integrations remain disabled unless a future explicit sprint changes that.
- [ ] Human review remains required.
- [ ] No production-readiness claim is made.
- [ ] Sprint 009 planning files exist.
- [ ] Durable docs and planning files are updated.
- [ ] Final report lists files changed and confirms no implementation code was changed.

---

## Suggested Sprint Files

### `requirements.md`

```markdown
# Sprint 009 Requirements - Environment Mode Definition and Data Store Decision

## Goal

Define what `demo`, `test-live`, and `production` mean in business and technical terms, resolve the `live-test` / `test-live` naming direction, and document the future data-store source-of-truth decision.

## Source Context

Use Sprint 008 as required source context:

- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`
- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/QUESTIONS.md`
- `planning/RISKS.md`

## Requirements

- Define `demo`, `test-live`, and `production` in business terms.
- Define `demo`, `test-live`, and `production` in technical terms.
- Document `test-live` as canonical.
- Document `live-test` as a legacy/non-canonical alias to normalize later.
- Decide and document the future data-store direction.
- Use D1 as future deployed source-of-truth direction unless new evidence contradicts Sprint 008.
- Keep Prisma documented as local/development/transition fallback only.
- Keep production readiness unclaimed.
- Do not implement code.
- Do not change schema, migrations, seed data, env files, deployment config, or databases.
```

### `blueprint.md`

```markdown
# Sprint 009 Blueprint - Environment Mode Definition and Data Store Decision

## Work Plan

1. Read Sprint 008 reconciliation report and current docs.
2. Create Sprint 009 planning folder.
3. Create `docs/ENVIRONMENT_MODES.md`.
4. Update data model, architecture, API, and validation docs only where the decision clarifies future direction.
5. Update planning state, decisions, questions, and risks.
6. Verify with `git status --short`.
7. Report changed files and confirm no implementation code was changed.

## Documentation Direction

- `demo`: safe seeded demo mode, resettable, no live sending/integrations.
- `test-live`: canonical pre-production live-like validation mode.
- `production`: real customer/business mode, not currently established.
- `live-test`: legacy alias, not a separate environment.
- D1: future deployed source-of-truth direction.
- Prisma: local/development/transition fallback only.

## Guardrails

This is a docs/planning sprint. No code, schema, seed, database, env, deploy, or config implementation changes.
```

### `acceptance.md`

```markdown
# Sprint 009 Acceptance Criteria

- [ ] Sprint 008 source docs were read.
- [ ] Sprint 009 planning files were created.
- [ ] `docs/ENVIRONMENT_MODES.md` exists.
- [ ] Environment modes are defined in business terms.
- [ ] Environment modes are defined in technical terms.
- [ ] `test-live` is canonical.
- [ ] `live-test` is legacy/non-canonical.
- [ ] D1 data-store direction is documented.
- [ ] Prisma future role is documented.
- [ ] Production D1 remains unconfirmed/provisioning-required.
- [ ] Auto-send remains off.
- [ ] Live CRM/email integrations remain disabled.
- [ ] Human review remains required.
- [ ] No code/schema/migration/seed/env/deploy/database files were intentionally changed.
- [ ] No production-readiness claim was made.
- [ ] Final report includes changed files and validation status.
```

### `handoff-prompt.md`

```markdown
# Sprint 009 Handoff Prompt

You are Codex working in `/Users/Dmoney/Documents/development/apps/emailorc`.

Implement Sprint 009 as a documentation/planning sprint only.

Use Sprint 008 as required source context:

- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`
- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/QUESTIONS.md`
- `planning/RISKS.md`

Goal:

Define what `demo`, `test-live`, and `production` mean in business and technical terms, resolve `test-live` as the canonical pre-production live-like mode, document `live-test` as a legacy alias to normalize later, and document the future data-store direction.

Required direction:

- D1 is the future deployed source-of-truth direction.
- Prisma is local/development/transition fallback only unless a future sprint changes that.
- Production D1 remains unconfirmed because repo evidence shows a placeholder production database ID.
- Auto-send stays off.
- Live CRM/email integrations stay disabled.
- Human review remains required.
- EmailORC remains MVP/demo-stage and not production-ready.

Deliverables:

- Create `planning/sprints/009-environment-mode-definition-and-data-store-decision/`.
- Add `requirements.md`, `blueprint.md`, `acceptance.md`, `handoff-prompt.md`, and `environment-mode-decision.md`.
- Create `docs/ENVIRONMENT_MODES.md`.
- Update `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/VALIDATION.md` only as needed.
- Update `planning/STATE.md`, `planning/DECISIONS.md`, `planning/QUESTIONS.md`, and `planning/RISKS.md`.

Hard boundaries:

- Do not implement app code.
- Do not edit schema, migrations, seed data, env files, deployment config, database files, or tests.
- Do not run Prisma migrate/generate/db push.
- Do not run Wrangler deploy or D1 write commands.
- Do not inspect or expose secrets.
- Do not claim production readiness.

Before editing, summarize the Sprint 009 doc-only plan and confirm the files you intend to touch. Then make only the documentation/planning edits.
```

---

## Codex Apply Prompt

Copy/paste this into Codex to apply Sprint 009:

```text
We are in `/Users/Dmoney/Documents/development/apps/emailorc`.

Apply Architect Pack 009: Environment Mode Definition and Data Store Decision.

Use this file as the architect source:

`Architect-Pack-009-Environment-Mode-Definition-and-Data-Store-Decision.md`

Use Sprint 008 findings as required source context:

- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`
- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/QUESTIONS.md`
- `planning/RISKS.md`

This is a documentation/planning sprint only.

Do not implement code yet.

Goal:

Define what `demo`, `test-live`, and `production` mean in business and technical terms, resolve `test-live` as the canonical pre-production live-like mode, document `live-test` as a legacy/non-canonical alias to normalize later, and make a documented future data-store direction decision.

Required decisions to document:

- `demo` means safe seeded demo/training mode, resettable, no real sending, no live CRM/email actions, not production.
- `test-live` means canonical pre-production live-like validation mode, using realistic or owner-approved test data, no separate `live-test` data partition, no production-readiness claim.
- `production` means real customer/business operation mode, but production is not established yet.
- `live-test` is legacy/non-canonical and should be normalized to `test-live` in a future implementation sprint.
- D1 is the future deployed source-of-truth direction.
- Prisma is local/development/transition fallback only unless a future sprint changes that.
- Production D1 remains unconfirmed/provisioning-required because Sprint 008 found a placeholder production database ID.
- Auto-send remains off.
- Live CRM/email integrations remain disabled.
- Human review remains required.

Deliverables:

- Create `planning/sprints/009-environment-mode-definition-and-data-store-decision/`.
- Add `requirements.md`, `blueprint.md`, `acceptance.md`, `handoff-prompt.md`, and `environment-mode-decision.md`.
- Create `docs/ENVIRONMENT_MODES.md`.
- Update `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/VALIDATION.md` only as needed.
- Update `planning/STATE.md`, `planning/DECISIONS.md`, `planning/QUESTIONS.md`, and `planning/RISKS.md`.

Hard boundaries:

- Do not edit app code.
- Do not edit tests.
- Do not edit Prisma schema.
- Do not edit D1 migrations.
- Do not edit seed/demo data.
- Do not edit `.env`, `.dev.vars`, examples, Wrangler config, deployment config, or database files.
- Do not run Prisma generate/migrate/db push.
- Do not run Wrangler deploy or Cloudflare D1 write commands.
- Do not inspect or expose secrets.
- Do not claim production readiness.

Before editing, summarize the doc-only plan and list the files you intend to touch. After editing, report changed files, whether `git status --short` was checked, and confirm no implementation files were changed.
```

---

## Final Builder Report Template

```markdown
## Sprint 009 Result

Completed documentation/planning only.

### Files changed

- ...

### Decisions documented

- `test-live` is canonical.
- `live-test` is legacy/non-canonical and should normalize to `test-live` later.
- D1 is the future deployed source-of-truth direction.
- Prisma is local/development/transition fallback only.
- Production D1 remains unconfirmed/provisioning-required.

### Guardrails confirmed

- No app code changed.
- No tests changed.
- No schema/migration/seed/env/deploy/database files changed.
- No production-readiness claim made.
- Auto-send remains off.
- Live CRM/email integrations remain disabled.
- Human review remains required.

### Validation

- `git status --short`: ...
```

