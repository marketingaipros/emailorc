# Architect Pack 008 — Data Model Prisma / D1 Reconciliation Audit

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `008-data-model-prisma-d1-reconciliation-audit`  
**Created:** 2026-05-20  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 008 is a focused audit and documentation sprint for the EmailORC data model.

The known issue: EmailORC has both a local Prisma / SQLite layer and a Cloudflare D1 layer. Prior sprints repeatedly flagged that the relationship between the two is not reconciled or documented well enough to support production-readiness decisions.

The goal is to inspect and document the current Prisma schema, D1 migrations, seed/demo data, data access paths, and API persistence assumptions without changing schema, migrations, database files, app behavior, or deployment configuration.

This sprint must produce a clear reconciliation report and update durable data-model documentation so future implementation sprints know what the current source-of-truth model is, what is duplicated, what diverges, and what decisions remain open.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Inspect current Prisma schema and local database-related files.
- Inspect current Cloudflare D1 migrations, seed/demo data, and Wrangler binding references.
- Inspect data access paths used by API routes and source utilities.
- Identify tables/entities represented in Prisma, D1, both, or only in application types.
- Identify field/name/type/default differences between Prisma and D1 where visible from schema/migration files.
- Identify which runtime paths appear to use Prisma, D1, in-memory fallback, static/demo data, or mixed access.
- Document the current data model relationship in `docs/DATA_MODEL.md`.
- Produce a Sprint 008 reconciliation audit report.
- Update `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/VALIDATION.md` only where the audit clarifies existing behavior.
- Update planning state, risks, questions, and decisions.
- Run safe validation commands only:
  - `git status --short`
  - `npm run test`
  - `npm run build`
  - `npm run lint`, if Sprint 007 made it non-interactive
  - Sprint 006 non-mutating Playwright command, if documented and still safe

### Out of Scope

- No database schema changes.
- No Prisma schema edits.
- No D1 migration edits.
- No new migrations.
- No seed changes.
- No data migration scripts.
- No database reset.
- No Prisma generate/migrate/db push unless explicitly approved later.
- No Wrangler deploy.
- No Cloudflare D1 writes.
- No env file changes.
- No deployment config changes.
- No app feature work.
- No auth/session redesign.
- No import behavior changes.
- No draft behavior changes.
- No Campaign Board behavior changes.
- No lint/tooling redesign.
- No Playwright redesign.
- No production-readiness claim.
- No intentional changes to `prisma/dev.db`.
- No secrets inspection or exposure.

---

## Source Facts From Prior Sprints

Sprint 001 established EmailORC as an MVP/demo-stage app, not production-ready. It identified both local data under `prisma/` and deployed/demo data under `d1/`.

Sprint 001 documented the core flow as:

1. User uploads CSV/account/contact data.
2. Import route parses records.
3. Records are validated.
4. Leads and drafts may persist to D1 when a `DB` binding is available.
5. Drafts are reviewed.
6. Drafts are approved.
7. Export route returns approved, non-archived drafts and excludes do-not-contact records.

Sprint 001 also identified Prisma SQLite and D1 reconciliation as a known architecture gap.

Sprint 002 kept Prisma-vs-D1 reconciliation open as a future data-model sprint.

Sprint 006 and Sprint 007 strengthened the validation posture with safe browser and lint gates. Sprint 008 should use those gates only if they are documented and safe.

Known persistent rules:

- EmailORC remains MVP/demo-stage.
- Production readiness is not established.
- Auto-send remains disabled.
- Live CRM/email integrations remain disabled.
- Human review remains required.
- `prisma/dev.db` has been dirty in prior local worktree reports and must not be intentionally touched.
- The Builder must not expose secrets.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-20  
**Current phase:** Sprint 008 — Data Model Prisma / D1 Reconciliation Audit

---

## Current Status

Sprint 007 is complete or ready for owner review before Sprint 008 implementation begins.

The safe local validation gate should now include:

- `npm run test`
- `npm run build`
- the Sprint 006 non-mutating Playwright command, if documented
- `npm run lint`, if Sprint 007 made it non-interactive and passing

Sprint 008 is active and targets the unresolved data-model risk:

- EmailORC has both Prisma / SQLite local data files and Cloudflare D1 migration/demo data.
- The relationship between Prisma and D1 is not yet fully reconciled.
- Future production-readiness work requires a clear documented data model and persistence source-of-truth.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/008-data-model-prisma-d1-reconciliation-audit/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- Sprint 003 fixed Super Admin-only access to `/mvp/admin` and blocked draft approval below QA score 90.
- Sprint 004 hardened import mapping and validation.
- Sprint 005 fixed Campaign Board browser-state/card movement.
- Sprint 006 created or isolated a non-mutating Playwright validation path.
- Sprint 007 made lint non-interactive or documented the closest safe lint path.
- Prisma / D1 reconciliation remains the next durable architecture risk.

---

## Next Actions

1. Apply Architect Pack 008 to create Sprint 008 planning files.
2. Have Codex read Sprint 008 files and summarize the audit plan before making changes.
3. Approve Codex audit work only after the summary is correct.
4. Inspect Prisma schema, D1 migrations, Wrangler binding references, and data access paths.
5. Create the reconciliation audit report.
6. Update `docs/DATA_MODEL.md` and related docs.
7. Run safe validation commands.
8. Report acceptance status and recommended Sprint 009.

---

## Blockers / Open Items

- Production readiness is not established.
- Prisma SQLite and Cloudflare D1 relationship needs documentation.
- Environment mode definitions still need future clarification.
- Full auth/session readiness still needs a future audit.
- Deployment target and production data-store decision remain unresolved.
```

---

# File: planning/DECISIONS.md

```markdown
# Decisions

Record durable decisions future sprints must respect.

---

## Decision Log

| Date | Decision | Reason | Impact |
|---|---|---|---|
| 2026-05-20 | Sprint 008 is a data-model audit and documentation sprint only. | The Prisma / D1 relationship is unresolved and should be understood before schema or persistence changes. | Codex must not change schema, migrations, database files, env files, deployment config, or app behavior during Sprint 008. |
| 2026-05-20 | Prisma / D1 reconciliation must be documented before production-readiness or deployment decisions. | Data persistence assumptions affect reliability, migration planning, testing, and Cloudflare deployment. | Future production or data migration work must build from the Sprint 008 reconciliation report. |
| 2026-05-20 | `prisma/dev.db` must not be intentionally touched during the audit. | Prior sprints reported it as a dirty local database artifact. | Builder must inspect schema and migrations through text files only unless a future approved sprint allows database operations. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Prisma SQLite and Cloudflare D1 schemas diverge or overlap in undocumented ways. | High | High | Sprint 008 audits schema, migrations, seed data, and runtime paths without changing them. | Active |
| Builder accidentally edits schema or migrations during the audit. | Medium | High | Sprint 008 explicitly forbids Prisma schema edits, D1 migration edits, and database operations. | Active |
| `prisma/dev.db` is touched or committed accidentally. | Medium | Medium | Verify git status before and after; do not run mutating Prisma commands. | Active |
| Runtime data access paths use mixed persistence or fallback behavior. | Medium | High | Inspect API routes and utilities to document Prisma, D1, static, fallback, and in-memory paths. | Active |
| Environment mode behavior affects which data layer is used. | Medium | High | Document observed environment-mode data assumptions and carry unresolved items to `QUESTIONS.md`. | Active |
| D1 migrations and seed data are treated as production schema without proof. | Medium | High | Mark source-of-truth status as confirmed, partial, or unknown based only on repo evidence. | Active |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep auto-send and live integrations disabled unless an approved future sprint changes them. | Open |
| Lint/Playwright gates may still be unstable depending on Sprint 007 outcome. | Medium | Medium | Run only documented safe gates and record skipped commands clearly. | Open |
```

---

# File: planning/QUESTIONS.md

```markdown
# Open Questions

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Is EmailORC intended for internal AI Hub use only, client demos, or paid client production use? | Owner | Production readiness sprint | Open | Affects full auth, deployment, compliance, data retention, and sending rules. |
| What is the correct production target: Cloudflare only, local/server deploy, or another host? | Owner | Production readiness sprint | Open | Current audit history found Cloudflare D1 and OpenNext Cloudflare path. |
| Should Prisma SQLite remain only for local development? | Architect/Builder | Sprint 008 | Active | Sprint 008 should inspect evidence and recommend a documented decision, but not implement changes. |
| Should Cloudflare D1 be the deployed source of truth? | Owner/Architect | Sprint 008 or production readiness sprint | Active | Needs evidence from current routes, migrations, and deployment config. |
| Which entities exist in Prisma but not D1, or D1 but not Prisma? | Builder | Sprint 008 | Active | Sprint 008 reconciliation report should answer this from repo files. |
| Which API routes write to D1, Prisma, both, fallback memory, or static/demo data? | Builder | Sprint 008 | Active | Sprint 008 should document route-level persistence assumptions. |
| What should demo, test-live, and production mean in business terms? | Owner/Architect | Environment mode sprint | Open | Must be documented before production behavior changes. |
| Should the product ever send emails directly, or should it remain review/export only? | Owner | Integration roadmap | Open | Current decision: no auto-send unless future sprint approves it. |
```

---

# File: docs/DATA_MODEL.md

```markdown
# Data Model

## Overview

EmailORC currently has evidence of multiple data-model layers:

1. Prisma / SQLite local development layer under `prisma/`.
2. Cloudflare D1 migration and demo data layer under `d1/`.
3. App/API runtime data access paths that may use D1 when a `DB` binding is available.
4. Possible in-memory, fixture, static, or demo fallback paths used by the MVP/demo flow.

Sprint 008 must reconcile these layers from repo evidence.

No schema, migration, seed, or database file changes are allowed during Sprint 008.

---

## Current Source-of-Truth Status

Current status before Sprint 008 audit:

| Area | Status | Notes |
|---|---|---|
| Local development schema | Partially known | Prisma schema exists, but its relationship to D1 must be verified. |
| Deployed/demo schema | Partially known | D1 migrations and seed data exist, but source-of-truth status must be verified. |
| Runtime persistence | Partially known | Prior audit said leads and drafts may persist to D1 when `DB` binding is available. |
| Production data model | Unknown | Production readiness is not established. |
| Data migration plan | Not defined | Out of scope for Sprint 008. |

---

## Sprint 008 Reconciliation Targets

Codex should inspect and document:

| Target | Files / Areas | Output Needed |
|---|---|---|
| Prisma schema | `prisma/schema.prisma` | Entities, fields, relations, indexes/uniques, defaults, datasource/provider. |
| Prisma artifacts | `prisma/` | Migrations, seed files, generated assumptions, local DB status without touching `dev.db`. |
| D1 migrations | `d1/` | Tables, columns, indexes, constraints, seed/demo records, migration order. |
| Cloudflare binding | `wrangler.jsonc`, Cloudflare docs | Which binding name is used and which environments reference D1. |
| API data access | `app/api/`, `src/` | Routes/helpers that read/write D1, Prisma, fallback memory, static data, or fixtures. |
| Type models | `src/` types/utilities | App-level entities that may not map cleanly to database tables. |
| Validation/testing data | `tests/`, fixtures | Which data assumptions tests depend on. |

---

## Entity Reconciliation Table

Sprint 008 should replace or extend this table with audit findings.

| Entity / Table | Prisma? | D1? | Runtime Access Path | Match Status | Notes |
|---|---:|---:|---|---|---|
| User | TBD | TBD | TBD | Unknown | Confirm fields and auth/session use. |
| Organization | TBD | TBD | TBD | Unknown | Confirm org ownership and admin behavior. |
| Plan | TBD | TBD | TBD | Unknown | Confirm billing/plan persistence. |
| Imported record / lead | TBD | TBD | TBD | Unknown | Confirm import persistence and required fields. |
| Draft | TBD | TBD | TBD | Unknown | Confirm approval/export fields and QA score storage. |
| Campaign | TBD | TBD | TBD | Unknown | Confirm board/status data source. |
| Brain Center setting | TBD | TBD | TBD | Unknown | Confirm model/provider/business knowledge persistence. |
| Learning log | TBD | TBD | TBD | Unknown | Confirm storage layer or static/demo behavior. |

---

## Required Reconciliation Report

Sprint 008 must create:

`planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`

The report should include:

1. Files inspected.
2. Prisma schema summary.
3. D1 migration summary.
4. Entity/table comparison.
5. Runtime route/data-access map.
6. Environment/binding observations.
7. Confirmed matches.
8. Confirmed divergences.
9. Unknowns / unresolved questions.
10. Risks.
11. Recommendation for source-of-truth direction.
12. Recommendation for Sprint 009.

---

## Known Rules That Must Remain True

- Do-not-contact records must not appear in approved export.
- Approved export should only include approved, non-archived drafts.
- Human approval is required before draft output is considered usable.
- Draft approval requires QA score >= 90.
- Auto-send remains disabled.
- Live integrations remain disabled.
- Secrets must not be exposed.
```

---

# File: docs/ARCHITECTURE.md

```markdown
# Architecture

## Overview

EmailORC is an existing Next.js email campaign/workflow MVP.

It supports CSV/contact/account import, validation, draft review, draft approval, export, admin/settings areas, Brain Center configuration, environment-mode handling, local development data files, and Cloudflare D1 deployment/demo data.

Current status:

- MVP/demo-stage.
- Not confirmed production-ready.
- Human approval required.
- Auto-send disabled.
- Live CRM/email integrations disabled.
- Prisma / D1 relationship unresolved until Sprint 008 audit is complete.

## System Components

| Component | Location | Purpose |
|---|---|---|
| Next.js App Router | `app/` | Pages and API routes. |
| API routes | `app/api/` | Auth, workflow import/export, drafts, admin, billing, brain/OpenRouter, usage, account intelligence. |
| MVP UI | `app/mvp/` | Main screens for upload, records, drafts, campaigns, export, admin, integrations, reply, brain center, settings. |
| Shared source | `src/` | Components, domain types, validation utilities, auth/billing helpers, email invite helper, orchestration services. |
| Local data | `prisma/` | Prisma schema, local SQLite dev database, seed/migration assets. |
| Deployed/demo data | `d1/` | Cloudflare D1 migrations and demo seed data. |
| Tests | `tests/` | Vitest, Playwright, fixtures, manual QA, bug docs, E2E runbook. |
| Cloudflare config | `wrangler.jsonc` | Worker/D1/assets/service binding and environment-mode configuration. |

## Core Data Flow

Known flow before Sprint 008 audit:

1. User uploads CSV/account/contact data.
2. Import route parses records.
3. Records are validated.
4. Leads and drafts may persist to D1 when `DB` binding is available.
5. Drafts are reviewed.
6. Drafts are approved.
7. Export route returns approved, non-archived drafts and excludes do-not-contact records.

Sprint 008 should confirm whether any of these steps also use Prisma, static/demo data, in-memory fallback, or test fixtures.

## Data Architecture Gap

The app currently has both:

- Prisma / SQLite artifacts under `prisma/`.
- Cloudflare D1 artifacts under `d1/`.

The current relationship is not fully reconciled.

Sprint 008 should document:

- Which entities exist in Prisma.
- Which tables exist in D1.
- Which routes/helpers use each layer.
- Which fields diverge.
- Which data layer should likely become source-of-truth for future deployed use.
- Which decisions require owner approval before implementation.

## Email Sending Posture

The app should be treated as review/export-oriented for now.

Known behavior:

- Invite email helper supports manual/resend behavior.
- Resend may be implemented for invite emails if configured.
- Campaign auto-send is disabled.
- Human approval is required.
- Live email integrations are disabled.

## Known Architecture Gaps

- Prisma SQLite and D1 model relationship needs reconciliation.
- Auth/session model needs clearer documentation.
- Environment mode meanings need durable definition.
- Production deployment path needs validation.
- Production data-store source-of-truth is not decided.
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes and app-contract behavior from existing audits and follow-up sprints.

Sprint 008 should update this document only where data-access behavior is clarified by the Prisma / D1 reconciliation audit.

Do not treat this as complete until a Builder performs a route-by-route API inventory.

## Known Workflow Routes

| Route | Purpose | Known Data Notes |
|---|---|---|
| `app/api/workflow/import/route.ts` | CSV/contact import | Prior audit said it stores leads/drafts in D1 when `DB` is available. Sprint 008 should verify. |
| `app/api/workflow/records/route.ts` | Record retrieval / validation display | Needs route-level data-source documentation. |
| `app/api/workflow/drafts/route.ts` | Draft retrieval | Needs route-level data-source documentation. |
| `app/api/workflow/export/route.ts` | Approved draft export | Selects approved, non-archived drafts and excludes do-not-contact records. Needs source confirmation. |
| `app/api/drafts/approve/route.ts` | Draft approval | Sprint 003 enforces QA score >= 90 before approval. Needs persistence-source confirmation. |

## Data Access Audit Fields

Sprint 008 should document each inspected route with:

| Field | Notes |
|---|---|
| Route / file | Exact path. |
| Method(s) | GET, POST, etc. |
| Reads from | Prisma, D1, static fixture, fallback memory, request body, other. |
| Writes to | Prisma, D1, fallback memory, none, other. |
| Binding/client | `DB`, Prisma client, helper function, other. |
| Entity/table touched | Exact table/model if known. |
| Environment behavior | Demo/test-live/production assumptions if visible. |
| Gaps | Missing docs, uncertain behavior, conflicting assumptions. |

## Other API Areas To Inspect If Data-Related

- Auth
- Admin
- Environment status
- Billing
- Brain/OpenRouter
- Usage logs
- Account intelligence
- Invite email helper, only for data persistence references and without inspecting secrets

## Existing Business Rules

- Auto-send remains disabled.
- Live integrations remain disabled.
- Do-not-contact records must not appear in approved export.
- Draft approval requires QA score >= 90.
- Human approval remains required.
```

---

# File: docs/VALIDATION.md

```markdown
# Validation Plan

## Overview

Validation proves EmailORC is safe and trustworthy before future feature work, demos, or production decisions.

Current status before Sprint 008:

- MVP/demo behavior exists.
- Production readiness is not established.
- Safe local validation gate should include:
  - `npm run test`
  - `npm run build`
  - the Sprint 006 non-mutating Playwright command, if documented and still safe
  - `npm run lint`, if Sprint 007 made it non-interactive and passing
- Data-model reconciliation is the active Sprint 008 validation/documentation focus.

## Sprint 008 Validation Focus

Sprint 008 validates one focused architecture risk:

1. Reconcile and document Prisma / SQLite and Cloudflare D1 schema/runtime relationships without changing data files or schema.

## Sprint 008 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run build
```

Codex should run only documented safe gates from prior sprints:

```bash
npm run lint
```

Only if Sprint 007 made it non-interactive and passing.

Codex may run the Sprint 006 non-mutating Playwright command only if the exact command is documented and known safe.

Do not run:

- `prisma migrate`
- `prisma db push`
- `prisma db pull`
- `prisma generate`, unless Codex can prove it does not touch tracked output and owner approves
- database reset commands
- seed commands
- deploy commands
- `wrangler deploy`
- Cloudflare D1 write commands
- commands requiring secret values
- commands that send email
- commands that enable integrations

## Audit Validation Rules

Sprint 008 is documentation/audit-heavy.

Validation succeeds when:

- The reconciliation report exists.
- `docs/DATA_MODEL.md` is updated with repo-based findings.
- Route/data-source assumptions are documented where visible.
- Unsafe database operations were not run.
- No schema, migration, seed, env, deployment, or database files were intentionally changed.
- Safe validation commands pass or failures are documented.

## Future Validation Areas

- Data migration planning, only after owner approves a source-of-truth direction.
- Environment mode behavior.
- Auth/session readiness.
- Production deployment readiness.
- Production data-store readiness.
```

---

# File: planning/sprints/008-data-model-prisma-d1-reconciliation-audit/requirements.md

```markdown
# Sprint 008 Requirements — Data Model Prisma / D1 Reconciliation Audit

## Goal

Audit and reconcile the current Prisma / SQLite and Cloudflare D1 data-model layers without changing database schema, migrations, seeds, env files, deployment config, or app behavior.

## Business Objective

Give the project owner and future Builder sessions a clear, durable understanding of EmailORC’s current data model before any production-readiness, deployment, migration, or persistence work is approved.

## User Story

As the project owner, I want Codex to audit how Prisma and D1 relate in EmailORC, so future database and deployment decisions are based on repo evidence instead of assumptions.

## In Scope

- Inspect `prisma/schema.prisma`.
- Inspect `prisma/` files without touching `prisma/dev.db`.
- Inspect `d1/` migrations and seed/demo files.
- Inspect `wrangler.jsonc` for D1 bindings and environment references.
- Inspect API routes and data utilities that read/write records, drafts, users, orgs, plans, campaigns, Brain Center settings, usage logs, and related entities.
- Compare Prisma models and D1 tables/columns where possible.
- Identify runtime persistence paths:
  - Prisma
  - D1
  - in-memory fallback
  - static/demo data
  - test fixture data
  - unknown
- Create a reconciliation report.
- Update `docs/DATA_MODEL.md`.
- Update `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/VALIDATION.md` only where existing behavior is clarified.
- Update planning files.

## Out of Scope

- Database schema changes.
- Prisma schema edits.
- D1 migration edits.
- New migrations.
- Seed edits.
- Database resets.
- Data migration scripts.
- Data writes.
- Prisma migrate/db push/db pull commands.
- Cloudflare D1 write commands.
- Env changes.
- Deployment changes.
- App feature work.
- Auth/session redesign.
- Import behavior changes.
- Draft behavior changes.
- Campaign Board behavior changes.
- Sending or integrations.
- Production-readiness claim.

## Business Rules

- Document only what repo evidence supports.
- Mark uncertain findings as uncertain.
- Do not infer production source-of-truth without evidence.
- Do not touch `prisma/dev.db`.
- Do not expose secrets.
- Auto-send remains disabled.
- Live integrations remain disabled.
- Human review remains required.
- EmailORC remains MVP/demo-stage.

## Required Output

Create:

- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/requirements.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/blueprint.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/acceptance.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/handoff-prompt.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`

Update as needed:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`

## Success Definition

Sprint 008 succeeds when:

- Prisma models are summarized.
- D1 tables/migrations are summarized.
- Prisma vs D1 overlap/divergence is documented.
- Runtime data access paths are mapped where visible.
- Unknowns are marked clearly.
- Source-of-truth recommendation is documented without implementing changes.
- Safe validation commands are run.
- No schema, migration, seed, env, deployment, database, or app behavior changes are introduced.
```

---

# File: planning/sprints/008-data-model-prisma-d1-reconciliation-audit/blueprint.md

```markdown
# Sprint 008 Blueprint — Data Model Prisma / D1 Reconciliation Audit

## Objective

Perform one focused audit:

1. Reconcile and document current Prisma / SQLite and Cloudflare D1 data-model relationships without changing them.

## Files to Read First

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/requirements.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/blueprint.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/acceptance.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before documenting.

Likely areas:

- `package.json`
- `prisma/schema.prisma`
- `prisma/`
- `d1/`
- `wrangler.jsonc`
- `.env.example`
- `.dev.vars.example`
- `app/api/workflow/import/route.ts`
- `app/api/workflow/records/route.ts`
- `app/api/workflow/drafts/route.ts`
- `app/api/workflow/export/route.ts`
- `app/api/drafts/approve/route.ts`
- `app/api/admin/`
- `app/api/auth/`
- `app/api/billing/`
- `app/api/brain/`
- `app/api/usage/`
- `src/`
- `tests/`
- `tests/E2E_RUNBOOK.md`
- any data fixtures or seed helpers

Do not assume exact paths without checking the repo.

## Files to Create

- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/requirements.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/blueprint.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/acceptance.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/handoff-prompt.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`

## Files to Modify

Expected documentation/planning files only:

- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`, only if the data architecture summary is clarified
- `docs/API.md`, only if route-level data-source assumptions are clarified
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DECISIONS.md`, only if durable decisions were made

Do not modify app/source/database/config files during this audit.

## Implementation Plan

### Step 1 — Confirm baseline

1. Run:

   ```bash
   git status --short
   ```

2. Confirm dirty files before making documentation changes.
3. Note whether `prisma/dev.db` is dirty but do not inspect binary contents, edit it, or run commands that may modify it.
4. Read Sprint 006 and Sprint 007 validation notes to identify safe validation commands.

### Step 2 — Inspect Prisma layer

1. Read `prisma/schema.prisma`.
2. Document:
   - datasource provider
   - generator settings
   - models
   - fields
   - relationships
   - IDs/uniques/indexes
   - defaults
   - enums, if any
3. Inspect text-based Prisma files only.
4. Do not run Prisma migration or generation commands.

### Step 3 — Inspect D1 layer

1. List files under `d1/`.
2. Read migrations and seed/demo SQL or scripts.
3. Document:
   - table names
   - columns
   - indexes
   - constraints
   - seed/demo data assumptions
   - migration order
4. Do not apply migrations or run D1 write commands.

### Step 4 — Inspect Cloudflare binding/config references

1. Read `wrangler.jsonc`.
2. Identify D1 binding names and environment-specific config.
3. Inspect `.env.example` and `.dev.vars.example` for data-store references without exposing secrets.
4. Document any mismatch between local/dev examples and Cloudflare/D1 runtime.

### Step 5 — Map runtime data access paths

Inspect API routes and helpers to determine which code paths use:

- D1 binding
- Prisma client
- in-memory fallback
- static demo data
- JSON fixtures
- request-body-only data
- unknown or mixed behavior

Focus on:

- import
- records
- drafts
- export
- draft approval
- campaigns
- admin/users/orgs/plans
- Brain Center settings/logs
- usage/billing/account intelligence

### Step 6 — Create entity/table reconciliation

Create a table comparing each entity/table across:

- Prisma model name
- D1 table name
- fields present in both
- fields only in Prisma
- fields only in D1
- route/helpers that touch it
- known workflow dependency
- match/divergence/unknown status

### Step 7 — Create reconciliation report

Create:

`planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`

Use this structure:

1. Date
2. Scope
3. Files inspected
4. Files intentionally not touched
5. Prisma schema summary
6. D1 migration/seed summary
7. Entity/table comparison
8. Runtime data access map
9. Environment/binding observations
10. Confirmed matches
11. Confirmed divergences
12. Unknowns and unresolved questions
13. Risks
14. Recommended source-of-truth direction
15. Recommended Sprint 009

### Step 8 — Update durable docs

Update:

- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`, only if architecture summary is clarified
- `docs/API.md`, only if route/data-source mapping is clarified
- `docs/VALIDATION.md`
- planning files

### Step 9 — Validate

Run required safe commands:

```bash
git status --short
npm run test
npm run build
```

Run if documented and safe:

```bash
npm run lint
```

Run the Sprint 006 non-mutating Playwright command only if exact command is documented and still safe.

Do not run any database mutation, migration, seed, deploy, or Cloudflare write command.

## Forbidden Changes

Do not modify:

- `prisma/dev.db`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `d1/`
- `.env`
- `.env.example`
- `.dev.vars`
- `.dev.vars.example`
- `wrangler.jsonc`
- deployment config
- application source files
- tests

Do not run:

- `prisma migrate`
- `prisma db push`
- `prisma db pull`
- `prisma generate`, unless separately approved
- database reset commands
- seed commands
- deploy commands
- `wrangler deploy`
- Cloudflare D1 write commands
- commands requiring live credentials
- commands that send email
- commands that enable integrations

## Validation Commands

Required:

```bash
git status --short
npm run test
npm run build
```

Required only if Sprint 007 made lint safe:

```bash
npm run lint
```

Optional only if documented by Sprint 006:

```bash
npm run test:e2e:safe
```

The exact safe Playwright script name may differ.

Skipped unless separately approved:

```bash
npm run test:e2e
npm run test:e2e:report
```

## Report Format

After implementation, Codex should report:

1. Files changed.
2. Files inspected.
3. Prisma models found.
4. D1 tables/migrations found.
5. Confirmed Prisma/D1 matches.
6. Confirmed Prisma/D1 divergences.
7. Runtime persistence map summary.
8. Source-of-truth recommendation.
9. Commands run and results.
10. Commands skipped and why.
11. Acceptance criteria complete/incomplete.
12. Any risks introduced.
13. Recommended Sprint 009.
```

---

# File: planning/sprints/008-data-model-prisma-d1-reconciliation-audit/acceptance.md

```markdown
# Sprint 008 Acceptance Criteria

Sprint 008 is complete when:

## Scope Control

- [ ] Builder read the Sprint 008 requirements, blueprint, and acceptance criteria.
- [ ] Builder confirmed the sprint is audit/documentation only.
- [ ] Builder did not change database schema.
- [ ] Builder did not edit Prisma schema.
- [ ] Builder did not edit D1 migrations.
- [ ] Builder did not edit seed/demo data.
- [ ] Builder did not run migration, db push, db pull, db reset, seed, deploy, or Cloudflare write commands.
- [ ] Builder did not change env files or deployment config.
- [ ] Builder did not change app behavior.
- [ ] Builder did not claim production readiness.

## Prisma Audit

- [ ] `prisma/schema.prisma` was inspected.
- [ ] Prisma datasource/provider was documented.
- [ ] Prisma models were summarized.
- [ ] Prisma relationships/indexes/uniques/defaults were documented where relevant.
- [ ] Prisma local database artifacts were not touched.

## D1 Audit

- [ ] `d1/` files were inspected.
- [ ] D1 migrations were summarized.
- [ ] D1 tables/columns/indexes/constraints were documented where visible.
- [ ] D1 seed/demo data assumptions were documented where visible.
- [ ] No D1 migration or write command was run.

## Runtime Data Access Map

- [ ] API/data helper paths were inspected.
- [ ] Routes/helpers using D1 were documented.
- [ ] Routes/helpers using Prisma were documented.
- [ ] Routes/helpers using fallback/in-memory/static/demo data were documented where visible.
- [ ] Unknown data access paths were marked unknown, not guessed.

## Reconciliation Report

- [ ] `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md` exists.
- [ ] Report lists files inspected.
- [ ] Report lists files intentionally not touched.
- [ ] Report includes Prisma summary.
- [ ] Report includes D1 summary.
- [ ] Report includes entity/table comparison.
- [ ] Report includes runtime persistence map.
- [ ] Report identifies confirmed matches.
- [ ] Report identifies confirmed divergences.
- [ ] Report identifies unresolved questions.
- [ ] Report recommends source-of-truth direction without implementing it.
- [ ] Report recommends Sprint 009.

## Documentation Updates

- [ ] `docs/DATA_MODEL.md` is updated with reconciliation findings.
- [ ] `docs/ARCHITECTURE.md` is updated if architecture assumptions were clarified.
- [ ] `docs/API.md` is updated if route data-source assumptions were clarified.
- [ ] `docs/VALIDATION.md` is updated with Sprint 008 validation posture.
- [ ] `planning/STATE.md` is updated.
- [ ] `planning/RISKS.md` is updated.
- [ ] `planning/QUESTIONS.md` is updated.
- [ ] `planning/DECISIONS.md` is updated only if durable decisions were made.

## Validation

- [ ] `git status --short` was run before and after.
- [ ] `npm run test` was run.
- [ ] `npm run build` was run.
- [ ] `npm run lint` was run only if Sprint 007 made it safe and non-interactive.
- [ ] Sprint 006 non-mutating Playwright command was run only if exact command was documented and safe.
- [ ] Unsafe commands were skipped and documented.
- [ ] No secrets were exposed.

## Next Sprint

- [ ] Builder recommends a specific Sprint 009.
- [ ] Builder does not start Sprint 009.
```

---

# File: planning/sprints/008-data-model-prisma-d1-reconciliation-audit/handoff-prompt.md

```markdown
# Sprint 008 Builder Handoff Prompt

You are the Builder Layer for EmailORC.

Execute Sprint 008 — Data Model Prisma / D1 Reconciliation Audit.

Important:
- This is Sprint 008.
- This sprint is audit/documentation only.
- Do not implement app changes.
- Do not change database schema.
- Do not edit Prisma schema.
- Do not edit D1 migrations.
- Do not edit seed/demo data.
- Do not modify database files.
- Do not modify env files.
- Do not modify deployment config.
- Do not expose secrets.
- Do not claim production readiness.
- Do not intentionally touch `prisma/dev.db`.

Read these files first:

1. `AGENTS.md`
2. `CODEX.md`
3. `planning/STATE.md`
4. `planning/DECISIONS.md`
5. `planning/DOMAIN.md`
6. `planning/RISKS.md`
7. `planning/QUESTIONS.md`
8. `docs/ARCHITECTURE.md`
9. `docs/API.md`
10. `docs/DATA_MODEL.md`
11. `docs/VALIDATION.md`
12. `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`
13. `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
14. `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/requirements.md`
15. `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/blueprint.md`
16. `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/acceptance.md`

Then inspect these repo areas in read-only/audit mode:

- `package.json`
- `prisma/schema.prisma`
- `prisma/`
- `d1/`
- `wrangler.jsonc`
- `.env.example`
- `.dev.vars.example`
- `app/api/`
- `src/`
- `tests/`
- relevant docs/runbooks

Do not run:

- `prisma migrate`
- `prisma db push`
- `prisma db pull`
- `prisma generate`, unless separately approved
- database reset commands
- seed commands
- deploy commands
- `wrangler deploy`
- Cloudflare D1 write commands
- commands requiring live credentials
- commands that send email
- commands that enable integrations

Before making documentation changes, summarize:

1. What Sprint 008 is supposed to accomplish.
2. Which files and folders you expect to inspect.
3. Which files you expect to create or update.
4. How you will compare Prisma models to D1 tables.
5. How you will map runtime data access paths.
6. Which validation commands you plan to run.
7. Which commands you will skip and why.
8. Any blockers or ambiguities.

Stop after the summary and wait for approval before editing files.

After approval, create/update the files required by the sprint.

Required new report:

`planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`

After the audit, report:

1. Files changed.
2. Files inspected.
3. Prisma models found.
4. D1 tables/migrations found.
5. Confirmed Prisma/D1 matches.
6. Confirmed Prisma/D1 divergences.
7. Runtime persistence map summary.
8. Source-of-truth recommendation.
9. Commands run and results.
10. Commands skipped and why.
11. Acceptance criteria complete/incomplete.
12. Any risks introduced.
13. Recommended Sprint 009.

Do not start Sprint 009.
```

---

# Codex Apply Architect Pack 008 Prompt

Use this prompt in Codex after saving this Architect Pack at the EmailORC repo root.

```text
You are the Builder Layer for EmailORC.

Apply Architect Pack 008 — Data Model Prisma / D1 Reconciliation Audit.

Important:
- This is Sprint 008.
- The sprint is audit/documentation only.
- Do not implement code changes.
- Do not change database schema.
- Do not edit Prisma schema.
- Do not edit D1 migrations.
- Do not edit seed/demo data.
- Do not modify database files.
- Do not modify env files.
- Do not modify deployment config.
- Do not expose secrets.
- Do not claim production readiness.
- Do not intentionally touch prisma/dev.db.
- First apply/create the Sprint 008 planning files from the Architect Pack.
- Then read the Sprint 008 files and summarize the audit plan.
- Stop after the summary and wait for approval.

Architect Pack file:
Architect-Pack-008-Data-Model-Prisma-D1-Reconciliation-Audit.md

Create/update the planning and docs files described in the Architect Pack.

Create this new report file:
planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md

Hard limits:
- Do not implement app feature work.
- Do not change auth/session behavior.
- Do not change import behavior.
- Do not change draft behavior.
- Do not change Campaign Board behavior.
- Do not change Playwright behavior.
- Do not redesign lint/tooling.
- Do not run migrations.
- Do not run seed commands.
- Do not run Prisma db push/db pull/migrate/reset commands.
- Do not run Wrangler deploy.
- Do not run Cloudflare D1 write commands.
- Do not enable auto-send.
- Do not enable live integrations.
- Do not mark the app production-ready.

After applying the pack, summarize:

1. What Sprint 008 is supposed to accomplish.
2. Which files and folders you expect to inspect.
3. Which files you expect to create or update.
4. How you will compare Prisma models to D1 tables.
5. How you will map runtime data access paths.
6. Which validation commands you plan to run.
7. Which commands you will skip and why.
8. Any blockers or ambiguities.

Stop after the summary and wait for my approval before performing the audit/documentation edits.
```

---

# Recommended Sprint 009 Direction

Do not start Sprint 009 yet.

Sprint 009 should be selected only after Sprint 008 is complete and the reconciliation report is reviewed.

Likely Sprint 009 candidates:

1. `009-environment-mode-definition-and-data-store-decision`
2. `009-production-data-source-decision-pack`
3. `009-auth-session-readiness-audit`
4. `009-d1-source-of-truth-migration-plan`
5. `009-deployment-readiness-audit`

Default recommendation if Sprint 008 confirms D1 should be the deployed data source:

`009-environment-mode-definition-and-data-store-decision`

Reason:

The project should decide what demo, test-live, and production mean before changing persistence behavior or planning migrations.
