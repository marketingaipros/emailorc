# Sprint 015 Handoff Prompt — Brain / Provider API Server-Side Guard Hardening

Read the following files before making changes:

- AGENTS.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/VALIDATION.md
- planning/sprints/012-auth-session-server-current-user-foundation/requirements.md
- planning/sprints/012-auth-session-server-current-user-foundation/blueprint.md
- planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md
- planning/sprints/013-admin-api-server-side-guard-hardening/requirements.md
- planning/sprints/013-admin-api-server-side-guard-hardening/blueprint.md
- planning/sprints/013-admin-api-server-side-guard-hardening/acceptance.md
- planning/sprints/014-workflow-draft-organization-permission-guards/requirements.md
- planning/sprints/014-workflow-draft-organization-permission-guards/blueprint.md
- planning/sprints/014-workflow-draft-organization-permission-guards/acceptance.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/requirements.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/blueprint.md
- planning/sprints/015-brain-provider-api-server-side-guard-hardening/acceptance.md

Then summarize before making changes:

1. What Sprint 015 is supposed to accomplish.
2. The exact Brain/provider API routes you expect to inspect.
3. The exact files you expect to modify.
4. The tests or validation steps you expect to run.
5. Any blockers, ambiguities, or scope risks.

Do not start implementation until I approve your summary.

Stay strictly inside Sprint 015.

Approved scope:

- Brain/provider API server-side guard hardening
- server-authenticated current-user context
- organization-scoped authorization
- `401` for missing/invalid session
- `403` for authenticated but unauthorized organization access
- focused tests
- docs/planning updates after implementation

Do not modify:

- admin APIs
- workflow/draft APIs
- billing/usage/account APIs
- global middleware
- page guards
- localStorage cleanup
- schemas
- migrations
- seed data
- env files
- deployment config
- `prisma/dev.db`

Do not run:

- migrations
- seed commands
- Prisma commands
- D1 writes
- Wrangler/deploy commands
- anything requiring secrets
- sending or live integration commands

Also confirm that you will not expose provider keys or secret values.
