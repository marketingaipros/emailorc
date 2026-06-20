# Sprint 010 Handoff Prompt - Auth / Session Readiness Audit

Paste this into Codex from the EmailORC repo root.

```text
You are Codex working in the EmailORC repo.

Sprint 010 is an auth/session readiness audit and documentation sprint only.

Do not implement auth changes.
Do not change runtime behavior.
Do not change API behavior.
Do not change UI behavior.
Do not change schemas, migrations, seed data, env files, deployment config, or database files.
Do not touch prisma/dev.db.
Do not expose secrets.
Do not start Sprint 011.

First read these files:

- AGENTS.md
- CODEX.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/DOMAIN.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/DATA_MODEL.md
- docs/ENVIRONMENT_MODES.md
- docs/VALIDATION.md
- planning/sprints/009-environment-mode-definition-and-data-store-decision/environment-data-store-decision-report.md
- planning/sprints/010-auth-session-readiness-audit/requirements.md
- planning/sprints/010-auth-session-readiness-audit/blueprint.md
- planning/sprints/010-auth-session-readiness-audit/acceptance.md

Then summarize before making changes:

1. What Sprint 010 is supposed to accomplish.
2. Which files you expect to inspect.
3. Which files you expect to create or update.
4. What validation commands you will run.
5. Any blockers or ambiguities.

Do not proceed with the audit documentation changes until I approve your summary.

After approval, complete the audit by inspecting current auth/session/role/access-control references across app, API, source utilities, tests, config, and docs.

Create:

- planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md

Update as needed:

- docs/ARCHITECTURE.md
- docs/API.md
- docs/VALIDATION.md
- optional docs/AUTH_SESSION.md if useful
- planning/STATE.md
- planning/DECISIONS.md only if durable decisions are clarified
- planning/RISKS.md
- planning/QUESTIONS.md
- planning/sprints/010-auth-session-readiness-audit/acceptance.md

The report must include:

1. Files inspected
2. Current auth/session summary
3. Login/signup/session/current-user flow map
4. Current roles and role normalization
5. Page-level guard map
6. API-level guard map
7. Client-side-only guard findings
8. Server-authoritative guard findings
9. Auth/session data-store findings
10. Environment-mode observations
11. Production-readiness blockers
12. Risks
13. Recommendations
14. Proposed Sprint 011

Run only safe documented validation commands:

- git status --short
- npm run test
- npm run build
- npm run lint
- npm run test:e2e:safe

If any command is unavailable or unsafe, skip it and document why.

Do not run:

- prisma migrate
- prisma db push
- prisma db pull
- prisma db reset
- prisma generate unless separately approved
- seed commands
- deploy commands
- wrangler deploy
- Cloudflare D1 write commands
- commands requiring secret values
- sending commands
- live integration commands

When complete, report:

1. Files inspected
2. Files changed
3. Current auth/session model summary
4. Current role/access-control summary
5. Client-side-only guard findings
6. Server-authoritative guard findings
7. Production-readiness blockers
8. Commands run and results
9. Commands skipped and why
10. Acceptance criteria complete / incomplete
11. Risks introduced
12. Recommended Sprint 011

Do not start Sprint 011.
```
