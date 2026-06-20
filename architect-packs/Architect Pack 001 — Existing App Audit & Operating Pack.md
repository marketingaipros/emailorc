# Architect Pack 001 — Existing App Audit & Operating Pack

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `001-existing-app-audit`  
**Created:** 2026-05-20  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Apply the 120x Architect / Builder operating system to the existing Codex-built EmailORC repo without changing application behavior.

This pack is for documentation, audit, and safe operating-structure setup only.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Create the 120x planning and documentation structure.
- Document what the existing app appears to do.
- Document current folders, important files, workflows, tech stack, risks, and open questions.
- Create Sprint 001 files for existing-app audit.
- Add safe README links to the new planning and docs files, if appropriate.
- Preserve the existing application code and current behavior.

### Out of Scope

- No new application features.
- No refactoring.
- No migrations.
- No database changes.
- No env file changes.
- No test rewriting unless only documentation references are needed.
- No deployment.
- No production-readiness claim.
- No auto-send enablement.
- No CRM/email integration enablement.
- No secrets inspection or exposure.

---

## Source Facts From Builder Audit

Codex inspected the repo in read-only mode and reported that EmailORC appears to be a Next.js email campaign/workflow app with CSV import, record validation, draft generation/review, approval, export, user/org/plan management, Brain Center configuration, and disabled auto-send/live integrations by default.

Reported stack:

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma 5 with local SQLite
- Cloudflare Workers through OpenNext Cloudflare adapter
- Cloudflare D1 for deployed demo/test-live persistence
- Wrangler
- Vitest
- Playwright
- PapaParse / XLSX
- OpenRouter/OpenAI-related AI provider paths
- Resend support for invite emails, if configured

Important audit finding:

EmailORC should not be treated as production-ready yet. Current docs/tests already identify MVP/demo behavior and production blockers.

---

# File: AGENTS.md

```markdown
# AGENTS.md

## Project

**Name:** EmailORC  
**Client:** Internal / AI Hub  
**Description:** Existing email campaign/workflow app for importing account/contact records, validating records, generating/reviewing drafts, approving drafts, and exporting approved drafts.  
**Tech stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Prisma SQLite, Cloudflare D1, Wrangler, Vitest, Playwright.  
**Created:** Existing Codex-built app. 120x operating structure added during Sprint 001.

---

## Operating Model

This project uses the 120x Architect / Builder methodology.

The handoff is a folder, not a conversation.

The Builder must read project files before making changes and must build to the approved sprint blueprint.

---

## First Files to Read

Read these in order at the start of every Builder session:

1. `AGENTS.md`
2. `planning/STATE.md`
3. `planning/DECISIONS.md`
4. `planning/DOMAIN.md`
5. `planning/RISKS.md`
6. `planning/QUESTIONS.md`
7. Active sprint files under `planning/sprints/`
8. Relevant docs under `docs/`
9. Existing tests and source files relevant to the sprint

---

## Current Safety Rules

- Do not treat the app as production-ready.
- Do not enable auto-send unless a future approved sprint explicitly requires it.
- Do not enable live CRM or email integrations unless a future approved sprint explicitly requires it.
- Do not expose or print secret values.
- Do not modify `.env`, `.dev.vars`, database files, migrations, or deployment settings unless the active sprint explicitly allows it.
- Do not redefine business rules.
- Do not invent production auth/session rules.
- Prefer small, auditable changes.
- Keep documentation and implementation aligned.

---

## Existing App Summary

EmailORC appears to support:

- Demo/user login flows
- CSV/account/contact import
- Record validation
- Email draft generation or management
- Draft review and approval
- Approved draft export
- Organization/user/plan management
- Test/live environment modes
- Brain Center model settings, OpenRouter keys, business knowledge, playbooks, and learning logs

Current working assumption:

The app is an MVP/demo-stage review-and-export email workflow, not a production auto-sending platform.

---

## Project Structure Notes

Important existing folders:

```text
app/        Next.js App Router pages and API routes
app/api/    Backend route handlers
app/mvp/    MVP UI screens
src/        Shared components, services, prompts, utilities
prisma/     Prisma SQLite schema, local dev database, migrations/seed
d1/         Cloudflare D1 migrations and demo seed data
tests/      Vitest, Playwright, fixtures, QA docs
docs/       Existing and new durable docs
planning/   120x project state, decisions, risks, questions, and sprints
```

---

## Sprint Workflow

Each sprint lives in:

```text
planning/sprints/###-{sprint-name}/
```

Each sprint must include:

- `requirements.md`
- `blueprint.md`
- `acceptance.md`
- `handoff-prompt.md`

The Builder must read all four before implementation.

---

## Completion Standard

A sprint is complete only when:

- The requested behavior or documentation work is complete.
- Acceptance criteria are checked.
- Relevant validation is run or explicitly documented as not applicable.
- `planning/STATE.md` is updated.
- Durable decisions are added to `planning/DECISIONS.md`.
- New risks or questions are recorded.
```

---

# File: CODEX.md

```markdown
# CODEX.md

This is a Codex-specific adapter file.

Codex must read `AGENTS.md` first and treat it as the canonical project instruction file.

Do not use this file as a project history dump.

Start every session by reading:

1. `AGENTS.md`
2. `planning/STATE.md`
3. `planning/DECISIONS.md`
4. `planning/DOMAIN.md`
5. `planning/RISKS.md`
6. `planning/QUESTIONS.md`
7. Active sprint files under `planning/sprints/`

Rules:

- Build only from approved sprint files.
- Do not invent scope, business rules, permissions, or acceptance criteria.
- Do not expose secrets.
- Do not enable auto-send or live integrations unless explicitly approved by a sprint.
- Summarize the sprint plan before changing files.
```

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-20  
**Current phase:** Sprint 001 — Existing App Audit & Operating Pack

---

## Current Status

Existing Codex-built app has been inspected in read-only mode.

The app appears to be a Next.js email campaign/workflow MVP with import, validation, draft review, approval, export, admin, environment mode, and Brain Center features.

The app should not be treated as production-ready yet.

---

## Active Sprint

`planning/sprints/001-existing-app-audit/`

---

## Recently Completed

- Read-only repo audit completed by Codex.
- Main app folders and important files identified.
- Likely tech stack identified.
- Email workflow routes and UI areas identified.
- Known risks and unclear areas identified.
- 120x operating structure planned.

---

## Next Actions

1. Apply Architect Pack 001 to create/update planning and documentation files.
2. Do not change application code during Sprint 001.
3. Confirm Sprint 001 acceptance criteria.
4. After Sprint 001, define Sprint 002 based on the highest-priority stabilization need.

---

## Blockers / Open Items

- Production readiness is not established.
- Auth/session model needs documentation before production decisions.
- Data model split between Prisma SQLite and Cloudflare D1 needs reconciliation.
- Existing documented bugs need prioritization.
- Environment mode meanings need clear business definitions.
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
| 2026-05-20 | Apply 120x Architect / Builder operating structure to the existing EmailORC repo. | Future Codex work needs durable requirements, blueprints, acceptance criteria, risks, and state. | All future work should be sprint-based and folder-driven. |
| 2026-05-20 | Sprint 001 is documentation and audit only. | Existing app should be understood before code changes. | No application code, migrations, database files, env files, or deployment settings should be changed in Sprint 001. |
| 2026-05-20 | Treat EmailORC as MVP/demo-stage until proven otherwise. | Existing audit reports MVP/demo behavior and production blockers. | Future production work needs explicit readiness sprints and validation. |
| 2026-05-20 | Keep auto-send disabled unless a future sprint explicitly enables it. | Current app appears oriented around human review/export, with auto-send disabled. | Builder must not enable auto-send or live sending by default. |
| 2026-05-20 | Keep live CRM/email integrations disabled unless a future sprint explicitly enables them. | Current environment settings show integrations disabled. | Integration work requires future requirements, blueprint, risk review, and acceptance criteria. |
```

---

# File: planning/DOMAIN.md

```markdown
# Domain Context

## Project

EmailORC.

## Business Goal

Help operators manage email campaign workflows by importing account/contact records, validating records, generating or managing drafts, reviewing and approving drafts, and exporting approved drafts.

## Current Product Position

MVP/demo-stage email workflow app.

Current working model:

- Human review is required before email output is used.
- Approved drafts can be exported.
- Auto-send is disabled.
- Live CRM/email integrations are disabled.
- Production readiness is not established.

## Users / Roles

Known or implied roles:

| Role | Purpose | Notes |
|---|---|---|
| Demo user | Explore or test MVP flows | Exact permissions need documentation. |
| User | Work through upload, record, draft, and export workflows | Auth/session model needs review. |
| Client Admin | Admin-oriented access | Existing bug summary reportedly mentions direct admin access issue. |
| Internal operator | Reviews app behavior, validates outputs, manages project direction | Current owner/operator role. |

## Core Workflows

### Import Workflow

- User uploads CSV/account/contact records.
- Import API parses data.
- Records may be persisted in D1 when available.
- Validation flags records with issues.

### Validation Workflow

Known validation concerns include:

- Missing email
- Do-not-contact records
- Missing company
- Renewal timing
- Other campaign/account readiness checks

### Draft Workflow

- Drafts are generated or managed.
- Drafts require review.
- Drafts can be approved.
- Export should use only approved, non-archived drafts and exclude do-not-contact records.

### Brain Center Workflow

App includes Brain Center configuration for:

- Model settings
- OpenRouter keys
- Business knowledge
- Playbooks
- Learning logs

### Environment Mode Workflow

Known modes include:

- Demo
- Test-live
- Production

The exact business meaning of each mode must be documented before production decisions.

## Business Rules

- Do not send campaign emails automatically unless a future approved sprint changes this rule.
- Do not include do-not-contact records in approved draft export.
- Human approval is required before draft output is treated as usable.
- Secret values must never be exposed in logs, docs, or chat.
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Auth/session model is MVP-style and not production-ready. | High | High | Create future auth/session readiness sprint before production use. | Open |
| Prisma SQLite and Cloudflare D1 schemas may diverge. | Medium | High | Audit schemas and document source-of-truth model in a future sprint. | Open |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep explicit decision that auto-send and live integrations remain disabled unless approved. | Open |
| README is stale or incomplete. | High | Medium | Update README with links to operating docs and current status only. | Open |
| Existing bugs may block stable demo flow. | High | Medium | Convert known bugs into prioritized stabilization sprint. | Open |
| Modified local database file could be accidentally committed. | Medium | Medium | Do not touch database file in Sprint 001; verify gitignore and git status in later validation sprint. | Open |
| Cloudflare deployment assumptions may be stale. | Medium | Medium | Document current Cloudflare deployment path and adapter risk before deploy work. | Open |
| Environment modes are unclear. | High | Medium | Define demo/test-live/production meanings in docs before behavior changes. | Open |
| Generated scaffold/bootstrap content may contain old assumptions. | Medium | Medium | Inventory `bootstrap-emailorc.sh` but do not treat it as source of truth. | Open |
```

---

# File: planning/QUESTIONS.md

```markdown
# Open Questions

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Is EmailORC intended for internal AI Hub use only, client demos, or paid client production use? | Owner | Sprint 002 planning | Open | Affects auth, deployment, compliance, and sending rules. |
| What is the correct production target: Cloudflare only, local/server deploy, or another host? | Owner | Production readiness sprint | Open | Current audit found Cloudflare D1 and OpenNext Cloudflare path. |
| Should Prisma SQLite remain only for local development? | Architect/Builder | Data model sprint | Open | Needs schema reconciliation with D1. |
| What should demo, test-live, and production mean in business terms? | Owner/Architect | Environment mode sprint | Open | Must be documented before behavior changes. |
| Should the product ever send emails directly, or should it remain review/export only? | Owner | Integration roadmap | Open | Current decision: no auto-send unless future sprint approves it. |
| Which existing bugs are highest priority? | Owner | Sprint 002 planning | Open | Known items include admin access, QA approval threshold, CSV mapping, campaign board drag/drop. |
| What is the required QA score threshold for approving drafts? | Owner | Draft QA sprint | Open | Existing bug notes mention below-90 QA approval. |
| What fields are required in uploaded CSV/account files? | Owner/Architect | Import stabilization sprint | Open | Needed for reliable validation and mapping. |
```

---

# File: planning/FILE_INVENTORY.md

```markdown
# File Inventory

| File / Folder | Source | Purpose | Sensitive? | Status | Notes |
|---|---|---|---|---|---|
| `app/` | Existing repo | Next.js App Router pages and app routes | No | Existing | Inspect before UI/API changes. |
| `app/api/` | Existing repo | Backend route handlers | Possible | Existing | Includes auth, workflow, admin, billing, brain, usage, account intelligence. |
| `app/mvp/` | Existing repo | MVP UI screens | No | Existing | Upload, records, drafts, campaigns, export, admin, integrations, reply, brain center, settings. |
| `src/` | Existing repo | Shared components, services, types, validation, prompts | No | Existing | Includes campaign orchestration, prompts, OpenRouter/embedding logic. |
| `prisma/schema.prisma` | Existing repo | Local Prisma schema | No | Existing | Uses SQLite per audit. |
| `prisma/dev.db` | Existing repo | Local development database | Yes | Modified local file | Do not edit or commit without explicit review. |
| `d1/` | Existing repo | Cloudflare D1 migrations and seed data | Possible | Existing | Needs reconciliation with Prisma schema. |
| `tests/` | Existing repo | Vitest/Playwright/QA docs | No | Existing | Contains bug summary and E2E runbook. |
| `tests/BUG_SUMMARY.md` | Existing repo | Known bug documentation | No | Existing | Should feed Sprint 002 planning. |
| `docs/CLOUDFLARE_DEMO_DEPLOY.md` | Existing repo | Existing deployment notes | No | Existing | Need review before deploy work. |
| `.env.example` | Existing repo | Env variable example | Possible | Existing | Audit reports possible PostgreSQL/SQLite mismatch. |
| `.dev.vars.example` | Existing repo | Cloudflare/local vars example | Possible | Existing | Do not store secrets. |
| `wrangler.jsonc` | Existing repo | Cloudflare config | Possible | Existing | Includes environment mode variables and bindings. |
| `bootstrap-emailorc.sh` | Existing repo | Older/generated scaffold content | No | Existing | Inventory carefully; do not treat as current source of truth. |
```

---

# File: docs/ARCHITECTURE.md

```markdown
# Architecture

## Overview

EmailORC is an existing Next.js email campaign/workflow MVP.

It supports CSV/contact/account import, validation, draft review, draft approval, export, admin/settings areas, Brain Center configuration, and environment-mode handling.

Current status:

- MVP/demo-stage.
- Not confirmed production-ready.
- Human approval required.
- Auto-send disabled.
- Live CRM/email integrations disabled.

## System Components

| Component | Location | Purpose |
|---|---|---|
| Next.js App Router | `app/` | Pages and API routes. |
| API routes | `app/api/` | Auth, workflow import/export, drafts, admin, billing, brain/OpenRouter, usage, account intelligence. |
| MVP UI | `app/mvp/` | Main screens for upload, records, drafts, campaigns, export, admin, integrations, reply, brain center, settings. |
| Shared source | `src/` | Components, domain types, validation utilities, auth/billing helpers, email invite helper, orchestration services. |
| Local data | `prisma/` | Prisma schema, local SQLite dev database, seed/migration assets. |
| Deployed data | `d1/` | Cloudflare D1 migrations and demo seed data. |
| Tests | `tests/` | Vitest, Playwright, fixtures, manual QA, bug docs, E2E runbook. |
| Cloudflare config | `wrangler.jsonc` | Worker/D1/assets/service binding and env-mode configuration. |

## Core Data Flow

1. User uploads CSV/account/contact data.
2. Import route parses records.
3. Records are validated.
4. Leads and drafts may persist to D1 when `DB` binding is available.
5. Drafts are reviewed.
6. Drafts are approved.
7. Export route returns approved, non-archived drafts and excludes do-not-contact records.

## Email Sending Posture

The app should be treated as review/export-oriented for now.

Known behavior:

- Invite email helper supports manual/resend behavior.
- Resend is implemented for invite emails if configured.
- Campaign auto-send is disabled.
- Human approval is required.
- Live email integrations are disabled.

## Known Architecture Gaps

- Auth/session model needs clearer documentation.
- Prisma SQLite and D1 model relationship needs reconciliation.
- Environment mode meanings need durable definition.
- Production deployment path needs validation.
- Existing bug summary needs conversion into stabilization sprint.
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes from the existing audit.

Do not treat this as complete until a Builder performs a route-by-route API inventory.

## Known Workflow Routes

| Route | Purpose | Notes |
|---|---|---|
| `app/api/workflow/import/route.ts` | CSV/contact import | Stores leads/drafts in D1 when `DB` is available. |
| `app/api/workflow/records/route.ts` | Record retrieval / validation display | Needs route-level documentation. |
| `app/api/workflow/drafts/route.ts` | Draft retrieval | Needs route-level documentation. |
| `app/api/workflow/export/route.ts` | Approved draft export | Selects approved, non-archived drafts and excludes do-not-contact records. |
| `app/api/drafts/approve/route.ts` | Draft approval | QA threshold behavior needs review. |

## Other API Areas Identified

- Auth
- Admin
- Environment status
- Billing
- Brain/OpenRouter
- Usage logs
- Account intelligence

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
```

---

# File: docs/DATA_MODEL.md

```markdown
# Data Model

## Overview

EmailORC currently appears to have two structured data layers:

1. Prisma with local SQLite for local development.
2. Cloudflare D1 migrations and seed data for deployed demo/test-live persistence.

These may overlap but are not confirmed identical.

## Known Data Areas

| Data Area | Purpose | Source |
|---|---|---|
| Users | Login/user/admin behavior | Existing app/API/auth files. |
| Organizations | Multi-org or account ownership behavior | Existing app/API/admin/billing areas. |
| Plans | Plan/billing configuration | Existing app/API/billing areas. |
| Imported records/leads | Uploaded account/contact records | Workflow import route and D1 persistence. |
| Drafts | Generated or managed email drafts | Workflow draft routes and approval/export flow. |
| Brain Center settings | Model/provider/business knowledge/playbook configuration | Brain/OpenRouter routes and UI. |
| Learning logs | Brain Center or feedback records | Existing Brain Center references. |

## Known Rules

- Do-not-contact records must be excluded from approved export.
- Approved export should only include approved, non-archived drafts.
- Human approval is required before draft output is considered usable.

## Data Model Gaps

- Confirm whether Prisma SQLite is only local development.
- Compare Prisma schema and D1 migrations.
- Define source-of-truth data model for deployed use.
- Document CSV required fields and optional fields.
- Document validation rules for import records.
```

---

# File: docs/VALIDATION.md

```markdown
# Validation Plan

## Overview

Validation proves EmailORC is safe and trustworthy before future feature work, demos, or production decisions.

Current status:

- MVP/demo behavior exists.
- Production readiness is not established.
- Existing tests and QA docs exist.
- Known bugs are documented and need prioritization.

## Existing Validation Assets

| Asset | Purpose | Notes |
|---|---|---|
| `tests/` | Automated and manual validation | Includes Vitest, Playwright, fixtures, manual QA assets. |
| `tests/BUG_SUMMARY.md` | Known unresolved bugs | Should feed Sprint 002. |
| `playwright.config.ts` | E2E configuration | Review before E2E sprint. |
| Existing manual QA checklist | Manual flow validation | Location to be confirmed in test inventory. |

## Sprint 001 Validation

Sprint 001 is documentation-only.

Validation should confirm:

- 120x operating files exist.
- Sprint files exist.
- Docs reflect audit findings.
- No application code changed.
- No database files changed.
- No env files changed.
- No migrations changed.
- No deployment settings changed except docs if explicitly approved.
- README changes, if any, are limited to safe documentation links/status.

## Future Validation Areas

- Import CSV parsing and field mapping.
- Record validation rules.
- Draft QA scoring and approval threshold.
- Export filtering rules.
- Admin access controls.
- Campaign board drag/drop behavior.
- Environment mode behavior.
- D1 persistence behavior.
- Auth/session readiness.
- Production deployment readiness.
```

---

# File: planning/sprints/001-existing-app-audit/requirements.md

```markdown
# Sprint 001 Requirements — Existing App Audit & Operating Pack

## Goal

Apply the 120x Architect / Builder operating structure to the existing EmailORC repo and document the current app state before any new implementation work.

## Business Objective

Make future Codex work safer by ensuring the repo has:

- Current project state
- Durable decisions
- Domain context
- Known risks
- Open questions
- File inventory
- Architecture notes
- API notes
- Data model notes
- Validation plan
- Sprint-specific requirements, blueprint, acceptance criteria, and handoff prompt

## In Scope

- Create 120x planning files.
- Create/update durable docs.
- Create Sprint 001 folder and files.
- Update README only with safe links/status if appropriate.
- Document existing app structure and known behavior based on the audit.

## Out of Scope

- New app features.
- Refactoring.
- Bug fixes.
- Auth changes.
- Sending changes.
- Integration changes.
- Database changes.
- Migration changes.
- Deployment changes.
- Env file changes.
- Secret inspection or exposure.

## Known Existing App Context

EmailORC appears to include:

- CSV/account/contact import
- Record validation
- Draft generation/management
- Draft review and approval
- Approved draft export
- Admin/user/org/plan management
- Brain Center settings and logs
- Demo/test-live/production environment modes

## Business Rules

- Treat EmailORC as MVP/demo-stage until future validation proves otherwise.
- Auto-send remains disabled.
- Human approval remains required.
- Live integrations remain disabled.
- Do-not-contact records must not appear in approved export.
- Secrets must not be exposed.

## Edge Cases

- Existing README may be stale.
- `prisma/dev.db` is modified locally.
- Prisma SQLite and D1 may not match.
- Existing `bootstrap-emailorc.sh` may contain old assumptions.
- Known bugs may affect demo stability.
```

---

# File: planning/sprints/001-existing-app-audit/blueprint.md

```markdown
# Sprint 001 Blueprint — Existing App Audit & Operating Pack

## Objective

Create the 120x operating layer around the existing EmailORC app without changing application behavior.

## Files to Review First

- `package.json`
- `README.md`
- `wrangler.jsonc`
- `.env.example`
- `.dev.vars.example`
- `prisma/schema.prisma`
- `d1/`
- `app/api/`
- `app/mvp/`
- `src/`
- `tests/BUG_SUMMARY.md`
- `docs/CLOUDFLARE_DEMO_DEPLOY.md`

## Files to Create

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/FILE_INVENTORY.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/001-existing-app-audit/requirements.md`
- `planning/sprints/001-existing-app-audit/blueprint.md`
- `planning/sprints/001-existing-app-audit/acceptance.md`
- `planning/sprints/001-existing-app-audit/handoff-prompt.md`

## Existing File to Update Carefully

- `README.md`

Only update README if the change is limited to safe project status and links to the new operating docs.

## Implementation Plan

1. Confirm current git status.
2. Create missing planning and sprint directories.
3. Create the 120x operating files using the Architect Pack.
4. Preserve existing application code and behavior.
5. Add durable current-state docs.
6. Add known risks and questions.
7. Add file inventory.
8. Add architecture/API/data/validation docs.
9. If safe, update README with a short note pointing to:
   - `AGENTS.md`
   - `planning/STATE.md`
   - `docs/ARCHITECTURE.md`
10. Re-check git diff to confirm only approved docs/planning files changed.
11. Report acceptance status.

## Forbidden Changes

Do not modify:

- `app/`
- `src/`
- `prisma/dev.db`
- `prisma/schema.prisma`
- `d1/`
- `.env`
- `.env.example`
- `.dev.vars`
- `.dev.vars.example`
- `wrangler.jsonc`
- tests
- package files
- migrations
- deployment config

Unless the user explicitly approves a separate change.

## Validation Steps

Run documentation-safe checks:

```bash
git status --short
find planning -maxdepth 4 -type f | sort
find docs -maxdepth 2 -type f | sort
```

Do not run application-changing commands.

Optional if available and safe:

```bash
git diff --stat
git diff -- AGENTS.md CODEX.md README.md planning docs
```
```

---

# File: planning/sprints/001-existing-app-audit/acceptance.md

```markdown
# Sprint 001 Acceptance Criteria

Sprint 001 is complete when:

## Operating Files

- [ ] `AGENTS.md` exists and describes the 120x operating model for EmailORC.
- [ ] `CODEX.md` exists and points Codex to `AGENTS.md`.
- [ ] `planning/STATE.md` exists and reflects current project status.
- [ ] `planning/DECISIONS.md` exists and records durable decisions.
- [ ] `planning/DOMAIN.md` exists and captures EmailORC business/workflow context.
- [ ] `planning/RISKS.md` exists and captures known risks.
- [ ] `planning/QUESTIONS.md` exists and captures open questions.
- [ ] `planning/FILE_INVENTORY.md` exists and lists important repo files/folders.

## Durable Docs

- [ ] `docs/ARCHITECTURE.md` exists and summarizes current architecture.
- [ ] `docs/API.md` exists and lists known workflow/API areas.
- [ ] `docs/DATA_MODEL.md` exists and documents the Prisma SQLite / Cloudflare D1 split.
- [ ] `docs/VALIDATION.md` exists and defines validation posture.

## Sprint Files

- [ ] `planning/sprints/001-existing-app-audit/requirements.md` exists.
- [ ] `planning/sprints/001-existing-app-audit/blueprint.md` exists.
- [ ] `planning/sprints/001-existing-app-audit/acceptance.md` exists.
- [ ] `planning/sprints/001-existing-app-audit/handoff-prompt.md` exists.

## Safety

- [ ] No application code changed.
- [ ] No database files changed.
- [ ] No migrations changed.
- [ ] No env files changed.
- [ ] No deployment config changed.
- [ ] No secrets exposed.
- [ ] README was either untouched or updated only with safe documentation links/status.

## Reporting

- [ ] Builder reports files created/updated.
- [ ] Builder reports validation commands run.
- [ ] Builder reports any acceptance item that is incomplete or uncertain.
- [ ] Builder recommends the next sprint based on documented risks and questions.
```

---

# File: planning/sprints/001-existing-app-audit/handoff-prompt.md

```markdown
# Sprint 001 Builder Handoff Prompt

You are the Builder Layer for the existing EmailORC repo.

This sprint applies the 120x operating structure to the existing app.

## Read First

Read these files first if they exist:

1. `AGENTS.md`
2. `CODEX.md`
3. `README.md`
4. `package.json`
5. `wrangler.jsonc`
6. `.env.example`
7. `.dev.vars.example`
8. `prisma/schema.prisma`
9. `tests/BUG_SUMMARY.md`
10. `docs/CLOUDFLARE_DEMO_DEPLOY.md`

Then inspect the existing folders:

- `app/`
- `app/api/`
- `app/mvp/`
- `src/`
- `prisma/`
- `d1/`
- `tests/`
- `docs/`

## Task

Create or update the Sprint 001 operating files exactly as described in the Architect Pack.

Create:

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/FILE_INVENTORY.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/001-existing-app-audit/requirements.md`
- `planning/sprints/001-existing-app-audit/blueprint.md`
- `planning/sprints/001-existing-app-audit/acceptance.md`
- `planning/sprints/001-existing-app-audit/handoff-prompt.md`

You may update `README.md` only if the update is limited to safe status text and links to the new operating docs.

## Hard Rules

- Do not write app code.
- Do not refactor.
- Do not fix bugs.
- Do not modify database files.
- Do not modify migrations.
- Do not modify env files.
- Do not modify deployment config.
- Do not expose secrets.
- Do not enable auto-send.
- Do not enable live integrations.
- Do not mark the app production-ready.

## Before Making Changes

Summarize:

1. What Sprint 001 is supposed to accomplish.
2. The files you expect to create or update.
3. The validation steps you will run.
4. Any blockers or ambiguities.

Stop and wait for approval before applying changes.

## After Changes

Report:

1. Files created.
2. Files updated.
3. Files intentionally untouched.
4. Validation commands run.
5. Acceptance criteria complete/incomplete.
6. Risks or questions added.
7. Recommended Sprint 002.
```

---

# Optional README Addition

If README is safe to update, add a short section like this:

```markdown
## 120x Project Operating Docs

This repo uses the 120x Architect / Builder workflow.

Start here:

- `AGENTS.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`

Current status: MVP/demo-stage. Do not treat as production-ready until a production readiness sprint validates auth, data, deployment, integrations, and sending behavior.
```

---

# Codex Apply Prompt

Use this prompt in Codex after saving this Architect Pack at the repo root.

```text
You are the Builder Layer for the existing EmailORC repo.

Apply Architect Pack 001 — Existing App Audit & Operating Pack.

Important:
- This is Sprint 001.
- This sprint is documentation and operating-structure setup only.
- Do not write app code.
- Do not refactor.
- Do not fix bugs.
- Do not modify database files.
- Do not modify migrations.
- Do not modify env files.
- Do not modify deployment config.
- Do not expose secrets.
- Do not enable auto-send.
- Do not enable live integrations.
- Do not mark the app production-ready.

First, read the Architect Pack and summarize:

1. What Sprint 001 is supposed to accomplish.
2. Which files you expect to create or update.
3. What validation steps you will run.
4. Any blockers or ambiguities.

Stop after the summary and wait for my approval before applying changes.
```

---

# Recommended Sprint 002 Direction

Do not start Sprint 002 yet.

Recommended next sprint:

`002-stability-validation-and-bug-prioritization`

Likely purpose:

- Read existing `tests/BUG_SUMMARY.md`.
- Validate current demo flows.
- Prioritize known bugs.
- Confirm which bugs block demos.
- Define safe fixes.
- Keep auto-send and live integrations disabled.
- Produce acceptance criteria before code changes.
