# Sprint 008 Builder Handoff Prompt

You are the Builder Layer for EmailORC.

Execute Sprint 008 - Data Model Prisma / D1 Reconciliation Audit.

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
