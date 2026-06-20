# Project State

**Project:** EmailORC
**Last updated:** 2026-06-20
**Current phase:** Sprint 053-A IMPLEMENTED - local bootstrap and admin guard hardening validated

---

## Current Status

Sprint 053 status: IMPLEMENTED - local auth/session and Super Admin role-save fix complete.

Sprint 053-A status: IMPLEMENTED - local bootstrap and admin guard hardening validated; not committed.

Sprint 052 status remains: IMPLEMENTED — awaiting Entra configuration, D1 migration application, and Outlook mailbox UAT.

Goal:

- Connect a test Outlook account through Microsoft Entra OAuth.
- Create Microsoft Outlook drafts only from EmailORC drafts that are already approved.
- Do not send email.
- Do not connect Microsoft Copilot, Salesforce, ColdFusion, or any CRM.

Current status:

- Local Outlook Draft testing is blocked before Microsoft OAuth begins because `/api/integrations/microsoft/connect` returned `Authentication required.` under local Wrangler testing.
- The user also reported Super Admin user-role updates would not save and a locally created user was assigned `client_admin`, creating uncertainty about local role/session setup.
- Sprint 053 diagnosed the root cause: local Wrangler preview serves over HTTP while the production-built session cookie was marked `Secure`, so the browser did not send it back to `/api/auth/me` or Microsoft connect.
- Sprint 053 also found local D1 had `app_sessions` but lacked the documented demo Super Admin seed row; the login path now bootstraps only the documented demo Super Admin in demo mode when absent.
- Super Admin same-org role update was validated and persisted `client_admin`.
- Sprint 053-A amended the local bootstrap guard and admin user update paths so bootstrap requires demo mode plus local request host, same-org user updates are enforced, canonical roles are preserved, and final active Super Admin removal is rejected.
- Architect Pack prepared, approved, and implemented for the code/documentation portion of Sprint 052.
- Mandatory preflight confirmed the current repo root is `/Users/Dmoney/Documents/development/apps/emailorc`.
- Current planning/docs files listed by the pack are present.
- Existing D1 migrations run through `0010_app_sessions.sql`; Sprint 052 adds migration text `0011_microsoft_outlook_drafts.sql`.
- Automated validation passed, but no migration execution, deployment, OAuth secret, Microsoft Entra configuration, or real mailbox connection has been performed.

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

`planning/sprints/053-local-auth-role-admin-fix/`

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

1. Confirm Microsoft Entra app-registration settings for the dedicated test Outlook account.
2. Commit Sprint 053/053-A only after owner approval.
3. Apply required D1 migrations only in a future approved database step.
4. Run manual Outlook Drafts verification after Microsoft configuration and D1 readiness.
5. Do not mark Sprint 052 PASS until mailbox Drafts, Sent Items, and recipient non-delivery checks are complete.

---

## Blockers / Open Items

- Production readiness is not established.
- Sprint 012 D1 `app_sessions` migration is created but not applied.
- Sprint 052 still awaits Entra configuration, D1 migration application, and Outlook mailbox UAT.
- Sprint 053/053-A is implemented and validated locally, but not committed.
- Brain / provider API guard hardening is complete for the current approved Sprint 015 route surface.
- Billing/usage/account APIs remain future work unless already handled elsewhere.
- Page/middleware/localStorage cleanup has not started.
- Production mode remains a future target state only.
- Deployment target and production readiness remain unresolved.
- Dirty working tree existed before Sprint 015, including `prisma/dev.db`; avoid unrelated files.
