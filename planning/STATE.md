# Project State

**Project:** EmailORC
**Last updated:** 2026-06-19
**Current phase:** Sprint 052 planned — Outlook Draft Integration

---

## Current Status

Sprint 052 is planned: Outlook Draft Integration.

Goal:

- Connect a test Outlook account through Microsoft Entra OAuth.
- Create Microsoft Outlook drafts only from EmailORC drafts that are already approved.
- Do not send email.
- Do not connect Microsoft Copilot, Salesforce, ColdFusion, or any CRM.

Current status:

- Architect Pack prepared.
- Mandatory preflight confirmed the current repo root is `/Users/Dmoney/Documents/development/apps/emailorc`.
- Current planning/docs files listed by the pack are present.
- Existing D1 migrations run through `0010_app_sessions.sql`; the next available migration number is `0011`.
- No code, migration, deployment, OAuth secret, or Microsoft configuration change has been made by this sprint plan.

Sprint 014 is complete and accepted.

Sprint 014 applied the Sprint 012 auth/session foundation to workflow and draft API routes:

- approved workflow/draft routes now require a valid server session
- missing/invalid sessions return `401`
- authenticated wrong-organization access returns `403`
- touched routes derive organization authorization from `currentUser.organizationId`
- touched routes use `currentUser.userId` for actor/user metadata where they write it
- request-supplied org/user/role values are no longer trusted for authorization
- focused workflow/draft guard tests were added
- validation passed: `npm run test`, `npm run lint`, `npm run test:e2e:safe`, and `npm run build`

Sprint 015 applied the server current-user/session foundation to Brain / provider API routes only.

Sprint 015 implementation guarded these Brain/provider routes:

- `app/api/brain/api-key/route.ts`
- `app/api/brain/save-openrouter-key/route.ts`
- `app/api/brain/embed/route.ts`
- `app/api/brain/knowledge-search/route.ts`
- `app/api/brain/learning-log/route.ts`
- `app/api/brain/model-settings/route.ts`
- `app/api/brain/models/route.ts`
- `app/api/brain/regenerate-email/route.ts`
- `app/api/brain/test-chat/route.ts`
- `app/api/brain/test-connection/route.ts`
- `app/api/brain/test-embedding/route.ts`

`app/api/brain/extract-knowledge/route.ts` was inspected and left out because it only performs local text extraction/classification in the current implementation and does not read/write organization-scoped storage, provider keys, Brain settings, usage logs, audit logs, or request identity.

Touched routes now require a server-authenticated current user, use the server current user's organization/user context for authorization and actor metadata, return `401` for missing/invalid sessions, and return `403` when request-supplied organization scope conflicts with the server current user's organization.

Focused Sprint 015 tests were added to cover unauthenticated Brain access, wrong-organization access, authorized local behavior, request-supplied identity not being trusted, secret-safe auth failures, and fail-closed Brain authorization behavior.

Sprint 015 validation passed: `git status --short`, `npm run test`, `npm run lint`, `npm run test:e2e:safe`, and `npm run build`.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/052-outlook-draft-integration/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- Sprint 003 fixed Super Admin-only access to `/mvp/admin` and blocked draft approval below QA score 90.
- Sprint 004 hardened import mapping and validation.
- Sprint 005 fixed Campaign Board browser-state/card movement.
- Sprint 006 created or isolated a non-mutating Playwright validation path.
- Sprint 007 made lint non-interactive.
- Sprint 008 completed Prisma / D1 reconciliation audit.
- Sprint 009 completed environment-mode and data-store decision documentation.
- Sprint 010 completed auth/session readiness audit.
- Sprint 011 completed auth/session guard design and permission matrix.
- Sprint 012 completed auth/session current-user foundation.
- Sprint 013 completed admin API server-side guard hardening.
- Sprint 014 completed workflow/draft organization permission guards.

---

## Next Actions

1. Run the Sprint 052 implementation preflight and summarize findings before code changes.
2. Confirm Microsoft Entra app-registration settings for the dedicated test Outlook account.
3. Implement Outlook draft creation only after the preflight summary is approved.
4. Run the approved validation gates and manual Outlook Drafts verification.
5. Apply the Sprint 012 D1 `app_sessions` migration only in a future approved database/deployment step.

---

## Blockers / Open Items

- Production readiness is not established.
- Sprint 012 D1 `app_sessions` migration is created but not applied.
- Brain / provider API guard hardening is complete for the current approved Sprint 015 route surface.
- Billing/usage/account APIs remain future work unless already handled elsewhere.
- Page/middleware/localStorage cleanup has not started.
- Production mode remains a future target state only.
- Deployment target and production readiness remain unresolved.
- Dirty working tree existed before Sprint 015, including `prisma/dev.db`; avoid unrelated files.
