# Sprint 010 Blueprint - Auth / Session Readiness Audit

## Objective

Complete one focused audit:

1. Document EmailORC's current auth, session, role, and access-control behavior.
2. Identify gaps blocking production-auth readiness.
3. Recommend the next sprint without implementing changes.

## Files to Read First

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/ENVIRONMENT_MODES.md`
- `docs/VALIDATION.md`
- `planning/sprints/009-environment-mode-definition-and-data-store-decision/environment-data-store-decision-report.md`
- `planning/sprints/010-auth-session-readiness-audit/requirements.md`
- `planning/sprints/010-auth-session-readiness-audit/blueprint.md`
- `planning/sprints/010-auth-session-readiness-audit/acceptance.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before documenting findings.

Likely areas:

- `app/api/auth/`
- `app/api/admin/`
- `app/api/workflow/`
- `app/api/drafts/`
- `app/mvp/admin/`
- `app/mvp/settings/`
- `app/mvp/*`
- `src/lib/auth-rules.ts`
- `src/lib/*auth*`
- `src/lib/*session*`
- `src/components/`
- `middleware.ts`, if present
- `next.config.*`
- `wrangler.jsonc`
- tests related to auth, roles, admin access, draft approval, or API routes
- docs/runbooks that mention auth/session behavior

Do not assume exact paths without checking the repo.

## Files to Create During Future Audit Pass

- `planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md`
- Optional: `docs/AUTH_SESSION.md`, if Codex determines a standalone durable auth/session document is useful.

## Files to Modify

Expected documentation/planning only:

- `planning/STATE.md`
- `planning/DECISIONS.md`, only if durable decisions are clarified
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- Optional: `docs/AUTH_SESSION.md`
- `planning/sprints/010-auth-session-readiness-audit/acceptance.md`

Do not modify app/source/runtime files.

## Audit Plan

1. Confirm git status before work.
2. Read the required operating and sprint files.
3. Inspect current auth/session docs.
4. Search repo for auth/session terms: `auth`, `session`, `login`, `logout`, `signup`, `currentUser`, `user`, `role`, `SUPER_ADMIN`, `CLIENT_ADMIN`, `admin`, `localStorage`, `cookie`, `authorization`, and `bearer`.
5. Map login/signup/session/current-user flows.
6. Map role names and role normalization.
7. Map page-level guards.
8. Map API-level guards.
9. Identify client-side-only checks.
10. Identify server-authoritative checks.
11. Identify mode-specific behavior tied to `demo`, `test-live`, `live-test`, or `production`.
12. Identify data-store usage for auth/session: D1, Prisma, cookies, headers, localStorage, static/demo data, and unknown paths.
13. Create `auth-session-readiness-report.md`.
14. Update durable docs and planning files.
15. Run safe validation commands.
16. Confirm git status after work.
17. Report acceptance status and Sprint 011 recommendation.

## Report Requirements

`auth-session-readiness-report.md` should include:

1. Files inspected.
2. Current auth/session summary.
3. Login/signup/session flow map.
4. Current roles and role normalization.
5. Page-level guard map.
6. API-level guard map.
7. Client-side-only guard findings.
8. Server-authoritative guard findings.
9. Auth/session data-store findings.
10. Environment-mode observations.
11. Production-readiness blockers.
12. Risks.
13. Recommendations.
14. Proposed Sprint 011.

## Validation Plan

Run during the future approved audit pass:

```bash
git status --short
npm run test
npm run build
npm run lint
npm run test:e2e:safe
```

If a command is unavailable or unsafe, skip it and document why.

Do not run:

- Prisma migrate/db push/db pull/db reset/generate unless separately approved.
- Seed commands.
- Deploy commands.
- Wrangler deploy.
- Cloudflare D1 write commands.
- Commands requiring secret values.
- Sending commands.
- Live integration commands.

## Implementation Limits

This sprint is documentation/audit only.

Codex must not:

- Change auth behavior.
- Change role behavior.
- Change page guards.
- Change API guards.
- Change middleware.
- Change schemas.
- Change migrations.
- Change seed data.
- Change env files.
- Change deployment config.
- Touch `prisma/dev.db`.
- Start Sprint 011.
