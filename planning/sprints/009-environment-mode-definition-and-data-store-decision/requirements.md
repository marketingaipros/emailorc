# Sprint 009 Requirements - Environment Mode Definition and Data Store Decision

## Goal

Define what `demo`, `test-live`, and `production` mean in business and technical terms, resolve the `live-test` / `test-live` naming direction, and document the future data-store source-of-truth decision.

Sprint 009 is architecture/documentation only. It must not implement behavior changes.

## Source Context

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

## Requirements

- Define `demo`, `test-live`, and `production` in business terms.
- Define `demo`, `test-live`, and `production` in technical terms.
- Document `test-live` as the canonical pre-production live-like mode.
- Document `live-test` as a legacy/non-canonical alias to normalize later.
- Document that `live-test` must not become a separate data partition.
- Decide and document the future data-store direction.
- Use D1 as future deployed source-of-truth direction unless new evidence contradicts Sprint 008.
- Keep Prisma documented as local/development/transition fallback only.
- Keep production readiness unclaimed.
- Keep auto-send off.
- Keep live CRM/email integrations disabled.
- Keep human review required.
- Do not implement code.
- Do not change UI.
- Do not change API behavior.
- Do not change auth/session behavior.
- Do not change Brain Center/provider behavior.
- Do not change schema, migrations, seed data, env files, deployment config, or databases.

## Required Deliverables

- `planning/sprints/009-environment-mode-definition-and-data-store-decision/requirements.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/blueprint.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/acceptance.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/handoff-prompt.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/environment-mode-decision.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/environment-data-store-decision-report.md`
- Durable docs/planning updates after owner approval for the full documentation pass.

