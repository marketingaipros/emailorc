# Sprint 012 Handoff Prompt — Auth Session Server Current-User Foundation

Use this prompt with Codex after Architect Pack 012 has been applied to the EmailORC repo.

```text
You are the Builder Layer for EmailORC.

Read these files before making changes:

- AGENTS.md
- CODEX.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/DOMAIN.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/AUTH_SESSION.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/VALIDATION.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/auth-session-design.md
- planning/sprints/012-auth-session-server-current-user-foundation/requirements.md
- planning/sprints/012-auth-session-server-current-user-foundation/blueprint.md
- planning/sprints/012-auth-session-server-current-user-foundation/acceptance.md

Then inspect the relevant auth/session files, but do not make changes yet.

Summarize:

1. What Sprint 012 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to modify.
4. Whether existing server-side session storage exists.
5. Whether you expect to need a minimal D1 session migration file.
6. How you will implement role normalization.
7. How you will implement the current-user/session helper.
8. How login, logout, and `/api/auth/me` will change.
9. What focused tests you will add or update.
10. What validation commands you will run.
11. Any blockers, conflicts, or ambiguities.

Stop after the summary and wait for approval before implementing.

Hard limits:

- Do not implement admin API guard hardening.
- Do not implement workflow API guard hardening.
- Do not implement draft approval auth/org hardening beyond preserving existing QA >= 90 behavior.
- Do not implement global middleware.
- Do not rewrite page guards.
- Do not broadly clean up localStorage.
- Do not change production environment behavior.
- Do not edit env files.
- Do not edit deployment config.
- Do not run migrations.
- Do not run seed commands.
- Do not run deploy commands.
- Do not run Wrangler deploy.
- Do not run Cloudflare D1 write commands.
- Do not inspect or print secret values.
- Do not enable sending.
- Do not enable live integrations.
- Do not touch prisma/dev.db.
- Do not start Sprint 013.

Only after I approve your summary may you implement Sprint 012.
```
