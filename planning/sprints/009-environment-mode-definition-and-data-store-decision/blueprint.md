# Sprint 009 Blueprint - Environment Mode Definition and Data Store Decision

## Work Plan

1. Read project operating instructions and Sprint 008 source context.
2. Create Sprint 009 planning files and decision report scaffold.
3. Summarize the Sprint 009 plan, expected files, validation commands, skips, blockers, and ambiguities.
4. Wait for owner approval before the full documentation pass.
5. After approval, create or update environment mode documentation.
6. After approval, update durable data model, architecture, API, validation, state, decisions, questions, and risks.
7. Verify with `git status --short`.
8. Report changed files and confirm no implementation files were changed.

## Documentation Direction

- `demo`: safe seeded demo/training mode, resettable, no real sending, no live CRM/email actions, not production.
- `test-live`: canonical pre-production live-like validation mode.
- `production`: real customer/business mode, not currently established.
- `live-test`: legacy/non-canonical alias, not a separate environment or data partition.
- D1: future deployed source-of-truth direction for workflow and account data.
- Prisma: local/development/transition fallback only.
- Browser localStorage: visible MVP behavior remains documented; it should not become a production source of truth for critical records.

## Guardrails

This is a docs/planning sprint.

Do not change:

- app code
- UI behavior
- API behavior
- auth/session behavior
- Brain Center/provider behavior
- Prisma schema
- D1 migrations
- seed/demo data
- database files
- env files
- deployment config
- tests

Do not run:

- Prisma generate/migrate/db push/db pull/reset
- seed commands
- Wrangler deploy
- Cloudflare D1 write commands
- commands requiring secret values
- commands that send email
- commands that enable integrations

## Safe Validation Plan

Run:

```bash
git status --short
```

Skip runtime test/build commands for the initial setup stop unless owner approves the full documentation pass or asks for validation. This setup pass creates planning docs only and intentionally avoids code/runtime changes.

