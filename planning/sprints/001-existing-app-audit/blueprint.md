# Sprint 001 Blueprint - Existing App Audit & Operating Pack

## Objective

Create the 120x operating layer around the existing EmailORC app without changing application behavior.

## Files to Review First

- `package.json`
- `README.md`
- `wrangler.jsonc`
- `.env.example`
- `.dev.vars.example`
- `prisma/schema.prisma`
- `d1/`
- `app/api/`
- `app/mvp/`
- `src/`
- `tests/BUG_SUMMARY.md`
- `docs/CLOUDFLARE_DEMO_DEPLOY.md`

## Files to Create

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/FILE_INVENTORY.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/001-existing-app-audit/requirements.md`
- `planning/sprints/001-existing-app-audit/blueprint.md`
- `planning/sprints/001-existing-app-audit/acceptance.md`
- `planning/sprints/001-existing-app-audit/handoff-prompt.md`

## Existing File to Update Carefully

- `README.md`

Only update README if the change is limited to safe project status and links to the new operating docs.

## Implementation Plan

1. Confirm current git status.
2. Create missing planning and sprint directories.
3. Create the 120x operating files using the Architect Pack.
4. Preserve existing application code and behavior.
5. Add durable current-state docs.
6. Add known risks and questions.
7. Add file inventory.
8. Add architecture/API/data/validation docs.
9. If safe, update README with a short note pointing to:
   - `AGENTS.md`
   - `planning/STATE.md`
   - `docs/ARCHITECTURE.md`
10. Re-check git diff to confirm only approved docs/planning files changed.
11. Report acceptance status.

## Forbidden Changes

Do not modify:

- `app/`
- `src/`
- `prisma/dev.db`
- `prisma/schema.prisma`
- `d1/`
- `.env`
- `.env.example`
- `.dev.vars`
- `.dev.vars.example`
- `wrangler.jsonc`
- tests
- package files
- migrations
- deployment config

Unless the user explicitly approves a separate change.

## Validation Steps

Run documentation-safe checks:

```bash
git status --short
find planning -maxdepth 4 -type f | sort
find docs -maxdepth 2 -type f | sort
```

Do not run application-changing commands.

Optional if available and safe:

```bash
git diff --stat
git diff -- AGENTS.md CODEX.md README.md planning docs
```
