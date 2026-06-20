# Sprint 008 Blueprint - Data Model Prisma / D1 Reconciliation Audit

## Objective

Reconcile and document current Prisma / SQLite and Cloudflare D1 data-model relationships without changing them.

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

1. Confirm baseline with `git status --short`.
2. Read Sprint 006 and Sprint 007 validation notes to identify safe validation commands.
3. Inspect `prisma/schema.prisma` and text-based Prisma files only.
4. Inspect `d1/` migrations and seed/demo SQL or scripts.
5. Inspect `wrangler.jsonc` and env examples for data-store references without exposing secrets.
6. Map API routes and helpers by persistence path: D1 binding, Prisma client, in-memory fallback, static/demo data, fixture data, request-body-only data, or unknown.
7. Create an entity/table reconciliation table.
8. Create `reconciliation-report.md`.
9. Update durable docs and planning files based only on repo evidence.
10. Run safe validation commands and document skipped unsafe commands.

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

Skipped unless separately approved:

```bash
npm run test:e2e
npm run test:e2e:report
```
