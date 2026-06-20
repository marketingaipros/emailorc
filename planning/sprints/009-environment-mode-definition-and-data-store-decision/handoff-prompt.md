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
- Add `requirements.md`, `blueprint.md`, `acceptance.md`, `handoff-prompt.md`, `environment-mode-decision.md`, and `environment-data-store-decision-report.md`.
- Create `docs/ENVIRONMENT_MODES.md`.
- Update `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/VALIDATION.md` only as needed.
- Update `planning/STATE.md`, `planning/DECISIONS.md`, `planning/QUESTIONS.md`, and `planning/RISKS.md`.

Hard boundaries:

- Do not implement app code.
- Do not edit tests.
- Do not edit schema, migrations, seed data, env files, deployment config, database files, or runtime behavior.
- Do not run Prisma migrate/generate/db push/db pull/reset.
- Do not run Wrangler deploy or D1 write commands.
- Do not inspect or expose secrets.
- Do not claim production readiness.

Before the full documentation pass, summarize the Sprint 009 plan and confirm the files intended for inspection and editing. Then wait for owner approval.

