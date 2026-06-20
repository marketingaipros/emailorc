# Sprint 011 Handoff Prompt — Auth / Session Guard Design and Permission Matrix

Use this prompt with Codex after Architect Pack 011 has been applied and the owner approves starting Sprint 011 design work.

```text
Read Sprint 011 planning files and summarize the design/documentation plan before making changes.

Repo path:

/Users/Dmoney/Documents/development/apps/emailorc

Read these files first:

- AGENTS.md
- CODEX.md
- planning/STATE.md
- planning/DECISIONS.md
- planning/DOMAIN.md
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/VALIDATION.md
- docs/AUTH_SESSION.md
- planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/requirements.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/blueprint.md
- planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md

Then summarize:

1. What Sprint 011 is supposed to accomplish.
2. Which files and folders you expect to inspect.
3. Which files you expect to create or update.
4. The proposed auth/session design sections you will produce.
5. What validation commands you expect to run.
6. What files and commands are strictly off-limits.
7. Any blockers, ambiguities, or risks before starting.

Important rules:

- Do not start design edits yet.
- Do not implement auth changes.
- Do not change app behavior.
- Do not change API behavior.
- Do not change UI behavior.
- Do not change middleware behavior.
- Do not change schema, migrations, seed files, database files, env files, deployment config, or Wrangler/Cloudflare config.
- Do not run database commands.
- Do not touch `prisma/dev.db`.
- Do not expose secrets.
- Do not start Sprint 012.

Stop after the summary and wait for my approval.
```

After owner approval, proceed with the design/documentation sprint only.

Create if useful:

- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/auth-session-design.md`

Update only as needed:

- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/sprints/011-auth-session-guard-design-and-permission-matrix/acceptance.md`

Run safe validation commands and document results:

```bash
git status --short
npm run test
npm run lint
npm run test:e2e:safe
npm run build
```

If `npm run build` fails with the known Sprint 010 `/_document` issue, document it and carry it forward. Do not fix it during Sprint 011 unless the owner explicitly changes scope.

When complete, report:

1. Files inspected.
2. Files created.
3. Files updated.
4. Auth/session design summary.
5. Permission matrix summary.
6. Page guard design.
7. API guard design.
8. Environment-mode auth rules.
9. Prisma/D1 fallback policy.
10. Validation commands run and results.
11. Acceptance criteria status.
12. Recommended Sprint 012.

Do not start Sprint 012.
