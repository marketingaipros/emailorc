# Sprint 014 Handoff Prompt — Workflow / Draft Organization Permission Guards

Use this prompt with Codex after the Architect Pack has been applied to the project folder.

```text
You are working in:

/Users/Dmoney/Documents/development/apps/emailorc

Sprint 014 planning/docs have already been applied.

Before making any code or test changes, read these files:

- AGENTS.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/DOMAIN.md
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

Then inspect, but do not modify yet:

- app/api/workflow/*
- app/api/drafts/*
- Sprint 012 current-user/session helpers
- Sprint 013 admin-auth helper for pattern reference only
- existing tests related to auth, sessions, roles, workflow routes, draft routes, and API route handlers

After reading and inspection, stop and summarize:

1. What Sprint 014 is supposed to accomplish.
2. Which workflow/draft API routes exist and which ones you believe are in scope.
3. Which routes currently trust request-supplied organization, user, role, or actor identity values.
4. Which files you expect to modify.
5. Whether you expect to add a small shared workflow/org auth helper.
6. Which tests you expect to add or update.
7. Which validation commands you expect to run.
8. Any blockers, ambiguities, or risks before implementation.
9. How you will avoid touching out-of-scope files, including prisma/dev.db, migrations, env files, deployment config, admin APIs, Brain/provider APIs, billing/usage/account APIs, middleware, page guards, package files, and localStorage cleanup.

Do not implement anything yet.
Do not edit code, tests, docs, package files, database files, migrations, env files, or deployment files until I approve your summary.
```
