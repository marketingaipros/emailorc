# Sprint 008 Requirements - Data Model Prisma / D1 Reconciliation Audit

## Goal

Audit and reconcile the current Prisma / SQLite and Cloudflare D1 data-model layers without changing database schema, migrations, seeds, env files, deployment config, or app behavior.

## Business Objective

Give the project owner and future Builder sessions a clear, durable understanding of EmailORC's current data model before any production-readiness, deployment, migration, or persistence work is approved.

## In Scope

- Inspect `prisma/schema.prisma`.
- Inspect `prisma/` files without touching `prisma/dev.db`.
- Inspect `d1/` migrations and seed/demo files.
- Inspect `wrangler.jsonc` for D1 bindings and environment references.
- Inspect API routes and data utilities that read/write records, drafts, users, orgs, plans, campaigns, Brain Center settings, usage logs, and related entities.
- Compare Prisma models and D1 tables/columns where possible.
- Identify runtime persistence paths: Prisma, D1, in-memory fallback, static/demo data, test fixture data, or unknown.
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
