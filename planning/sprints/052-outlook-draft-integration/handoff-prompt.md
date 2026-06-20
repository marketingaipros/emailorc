# Codex Handoff — Sprint 052 Outlook Draft Integration

Read these files before making any changes:

- `AGENTS.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/052-outlook-draft-integration/requirements.md`
- `planning/sprints/052-outlook-draft-integration/blueprint.md`
- `planning/sprints/052-outlook-draft-integration/acceptance.md`

Do not implement yet.

First, run the mandatory preflight:

1. Confirm the current repo root, branch, and `git status --short`.
2. Confirm whether the listed planning/docs files exist in this repo.
3. Inspect existing migration files and report the actual next migration number.
4. Inspect existing server session/current-user helpers, workflow authorization helpers, audit conventions, D1 access helpers, Integrations UI, Drafts UI, and runtime secret-binding patterns.
5. Identify the exact files you expect to change.
6. Identify whether a new D1 migration is actually required.
7. Explain how you will implement:
   - delegated Microsoft OAuth
   - OAuth state and PKCE
   - encrypted token storage
   - safe token refresh/reconnect behavior
   - Graph `POST /me/messages` only
   - approved-draft server gate
   - no-send tests
8. Confirm the requested Microsoft Graph scopes and explicitly confirm `Mail.Send` will not be requested.
9. List the exact local/test runtime setup required, without printing or requesting secret values.
10. List the tests and manual verification you will run.

Then stop.

Do not modify code, migrations, environment files, deployment config, or Microsoft configuration until the owner approves your summary.

Hard limits:

- Create Outlook drafts only.
- Never send email.
- Do not request or use `Mail.Send`.
- Do not call `/send` or `/sendMail`.
- Do not implement Copilot, Salesforce, ColdFusion, CRM, or any other integration.
- Do not change CSV/XLSX import, validation, email generation, financial-data exclusion, approval threshold, or unrelated UI behavior.
- Do not expose tokens, secrets, authorization codes, passwords, or full email bodies.
- Do not run migrations, seed/reset commands, D1 writes, deployment commands, or production commands.
