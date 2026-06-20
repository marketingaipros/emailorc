# Sprint 009 Environment and Data Store Decision Report

Date: 2026-05-21

## Status

Sprint 009 full documentation pass completed locally.

## Purpose

Sprint 009 defines EmailORC's environment modes and records a durable data-store direction decision for future implementation.

This is architecture/documentation only. No app behavior, UI, API behavior, auth/session behavior, schema, migration, seed data, env file, deployment config, database file, or integration behavior should be changed.

## Sprint 008 Source Context

Sprint 009 uses Sprint 008 findings:

- D1 is the richer deployed workflow schema by repo evidence.
- Prisma remains active as a local fallback/development layer in some auth/admin/usage paths.
- Browser localStorage remains part of visible MVP behavior.
- Production D1 is not confirmed because repo evidence shows a placeholder production database ID.
- `live-test` and `test-live` both appear and can partition data unexpectedly if not resolved.
- EmailORC remains MVP/demo-stage and not production-ready.

## Decisions Documented

| Decision | Draft Direction |
|---|---|
| Canonical demo mode | `demo` |
| Canonical pre-production live-like mode | `test-live` |
| Legacy/non-canonical alias | `live-test` |
| Production mode | Future target state, not current readiness claim |
| Future deployed source of truth | Cloudflare D1 |
| Prisma role | Local/development/transition fallback unless future sprint changes it |
| Production D1 | Unconfirmed/provisioning-required |
| Auto-send | Off |
| Live CRM/email integrations | Disabled |
| Human review | Required |

## Files Read Before Setup

- `AGENTS.md`
- `CODEX.md`
- `Architect-Pack-009-Environment-Mode-Definition-and-Data-Store-Decision.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/008-data-model-prisma-d1-reconciliation-audit/reconciliation-report.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/requirements.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/blueprint.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/acceptance.md`

## Environment-Mode References Found

- `package.json` has `demo` and `test-live` scripts.
- `wrangler.jsonc` has `demo`, `test-live`, and `production` env blocks.
- `docs/CLOUDFLARE_DEMO_DEPLOY.md` references demo/test-live deployment and known pre-production limitations.
- `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATA_MODEL.md`, and `docs/VALIDATION.md` reference MVP/demo status and production-readiness limits.
- Runtime source references include both `TEST_LIVE`/`test-live` and `LIVE_TEST`/`live-test`; Sprint 009 documents this as legacy naming drift for future implementation, not a behavior change in this sprint.
- `app/api/admin/reset-data/route.ts` currently contains `live-test` reset wording/behavior. Sprint 009 does not change it.
- `app/api/auth/signup/route.ts` currently defaults some unknown environment values to `live-test`. Sprint 009 does not change it.

## Files Created In Initial Setup

- `planning/sprints/009-environment-mode-definition-and-data-store-decision/requirements.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/blueprint.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/acceptance.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/handoff-prompt.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/environment-mode-decision.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/environment-data-store-decision-report.md`

## Files Changed In Full Documentation Pass

- `docs/ENVIRONMENT_MODES.md`
- `docs/DATA_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/QUESTIONS.md`
- `planning/RISKS.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/environment-data-store-decision-report.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/acceptance.md`

## Final Mode Definitions

| Mode | Definition |
|---|---|
| `demo` | Safe seeded/resettable sample-data mode for demos, training, and internal review. It is not production and keeps auto-send/live integrations disabled. |
| `test-live` | Canonical controlled pre-production live-like validation mode. It may use realistic or owner-approved limited real data, but it is not production. |
| `production` | Future target state only. It requires production D1 provisioning, auth/session readiness, deployment readiness, data retention decisions, integration posture, and validation before any production-readiness claim. |

`live-test` is legacy/non-canonical wording. It should be normalized to `test-live` in a future approved implementation sprint and must not become a separate data partition.

## Final Data-Store Direction

Cloudflare D1 is the planning direction for EmailORC's deployed workflow source of truth.

Prisma / SQLite remains local development, fallback, and transition support only unless a future approved sprint changes that decision.

Production D1 remains unconfirmed/provisioning-required because repo evidence shows a placeholder production D1 database ID.

## Validation Plan

Commands run:

| Command | Result | Notes |
|---|---|---|
| `git status --short` | Completed | Repo already had many existing modified/untracked files, including `prisma/dev.db`; Sprint 009 intentionally changed docs/planning files only. |
| `npm run test` | Passed | 15 Vitest tests passed in `tests/validation.test.ts`. |
| `npm run build` | Passed | Next.js production build completed successfully; existing React hook dependency warnings were reported. |
| `npm run lint` | Passed | Non-interactive lint completed with existing React hook dependency warnings. |
| `npm run test:e2e:safe` | Passed | 2 non-mutating Playwright smoke tests passed. |

Known lint/build warnings:

- `app/mvp/admin/page.tsx`: missing `fetchData` dependency.
- `app/mvp/brain-center/page.tsx`: missing `refreshApiKeyStatus` dependency.
- `app/mvp/drafts/page.tsx`: missing `demoDataAllowed` dependency.
- `app/mvp/export/page.tsx`: missing `selectedDraft` dependency.
- `app/mvp/records/page.tsx`: missing `demoDataAllowed` and `notice` dependencies.

Commands skipped by hard boundary:

- Prisma generate/migrate/db push/db pull/reset.
- Seed commands.
- Wrangler deploy.
- Cloudflare D1 write commands.
- Secret-dependent commands.
- Sending or live integration commands.

## Guardrail Confirmation

Sprint 009 changed documentation and planning files only.

No implementation code, tests, schema, migrations, seed data, env files, deployment config, database files, or runtime behavior were intentionally changed.

## Acceptance Status

Sprint 009 acceptance criteria are complete locally.

Runtime behavior was not changed. Current runtime references to `live-test` remain as-is and are documented as future normalization work.

## Recommended Sprint 010

Recommended Sprint 010: environment mode normalization implementation plan only, or auth/session readiness audit before implementation. The normalization plan should specifically address current `live-test` references without accidentally partitioning or deleting data.

Do not start Sprint 010 from Sprint 009.
