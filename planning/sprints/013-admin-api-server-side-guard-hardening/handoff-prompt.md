# Sprint 013 Handoff Prompt — Admin API Server-Side Guard Hardening

Use this prompt with Codex from the EmailORC repo root.

```text
Read the following files before making changes:

- AGENTS.md
- CODEX.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/VALIDATION.md
- planning/sprints/013-admin-api-server-side-guard-hardening/requirements.md
- planning/sprints/013-admin-api-server-side-guard-hardening/blueprint.md
- planning/sprints/013-admin-api-server-side-guard-hardening/acceptance.md

Then inspect the relevant admin API source files, but do not change any files yet.

Summarize:

1. What Sprint 013 is supposed to accomplish.
2. Which routes exist under app/api/admin/*.
3. The exact files you expect to modify or create.
4. How you will apply the Sprint 012 current-user/session helper.
5. How unauthenticated requests will return 401.
6. How authenticated non-super-admin requests will return 403.
7. How super-admin requests will preserve existing behavior.
8. What tests you expect to add or update.
9. What validation commands you will run.
10. Any blockers, risks, or ambiguities.

Important scope rules:

- Do not start implementation until I approve your summary.
- Do not implement workflow/draft API guard hardening.
- Do not implement Brain/provider route hardening unless physically under app/api/admin/* and clearly admin-only.
- Do not implement billing/usage/account route hardening unless physically under app/api/admin/* and clearly admin-only.
- Do not add middleware.
- Do not rewrite /mvp/* page guards.
- Do not clean up localStorage.
- Do not edit Prisma schema.
- Do not run migrations.
- Do not run seed commands.
- Do not write to D1.
- Do not run Prisma commands.
- Do not edit env files.
- Do not change deployment config.
- Do not touch prisma/dev.db.
- Do not enable sending or live integrations.
- Do not claim production readiness.

Sprint 013 is admin API guard hardening only:

- use Sprint 012 current-user/session helper
- require canonical super_admin for app/api/admin/*
- return 401 for unauthenticated
- return 403 for authenticated but unauthorized
- preserve successful super-admin behavior
- add focused tests
- update durable docs/planning

Stop after the summary and wait for approval.
```
