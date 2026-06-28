# Project State

**Project:** EmailORC
**Last updated:** 2026-06-28
**Current phase:** Sprint 072 IMPLEMENTED - Import Lifecycle Cleanup, Medical Lead Verification, Sprint 069 UAT Closeout Preparation

---

## Current Status

Sprint 053 status: IMPLEMENTED - local auth/session and Super Admin role-save fix complete.

Sprint 053-A status: IMPLEMENTED - local bootstrap and admin guard hardening validated and pushed.

Sprint 052 status remains: IMPLEMENTED — awaiting Entra configuration, D1 migration application, and Outlook mailbox UAT.

Sprint 054 status: PLANNED - diagnose local Wrangler/Outlook callback failure before code changes.

Sprint 055 status: COMPLETE - Outlook connected mailbox hint now derives only from safe Microsoft ID-token identity claims for new successful OAuth connections.

Sprint 056 status: IMPLEMENTED - Draft approval UI now uses server current-user role data and canonical approval-role normalization instead of raw `localStorage.userRole` casing. D1-loaded drafts are explicitly marked D1-backed, and the Outlook draft action is exposed only for approved D1-backed drafts.

Sprint 057 status: DIAGNOSED - missing Outlook action on the selected Marcus Webb / Greenfield Capital card is caused by demo/localStorage data lacking the D1-backed marker required by the render condition.

Sprint 058 status: COMPLETE - the browser shell and protected action UI now require server-authenticated session evidence before presenting Microsoft Connect or protected draft actions as available.

Sprint 059 status: COMPLETE - local Prisma fallback sessions now persist to a local file-backed server store and `/login` redirects only after `/api/auth/me` confirms a valid server-authenticated session.

Sprint 060 status: PASS - local-only Cloudflare/OpenNext D1 readiness validation confirmed Microsoft integration storage availability for the Outlook / M365 Connect readiness gate.

Sprint 062 status: IMPLEMENTED / PARTIAL UAT - local Microsoft OAuth redirect and connection path reached the app without the prior HTTPS localhost failure. Outlook Drafts PASS remains blocked.

Sprint 063 status: IMPLEMENTED - recipient-readiness gating now makes `Create Outlook Draft` unavailable when an approved D1-backed draft has a missing or malformed recipient email.

Sprint 064 status: BLOCKED - browser UAT was not run because no qualifying safe valid-recipient approved D1-backed draft exists. The only approved non-archived D1-backed draft found, `draft_5cff6a04-4d86-4516-ba24-05ae9af8ad65`, has a malformed recipient missing `@` and the recipient is not confirmed as an internal/safe test recipient.

Sprint 065 status: PASS - recipient-correction source-of-truth/audit policy and safe non-client UAT fixture policy are approved and documented. No data correction, fixture creation, Outlook draft creation, browser UAT, Microsoft/Entra/OAuth setting change, code change, deploy, commit, or push occurred.

Sprint 066 status: PASS - read-only readiness audit completed. A future fixture appears feasible only through the normal D1-backed import and approval workflow with explicit future approval. Outlook browser UAT remains blocked. No fixture creation, data mutation, Outlook draft creation, browser UAT, Microsoft/Entra/OAuth change, code change, deploy, commit, or push occurred.

Sprint 067 status: PASS - documentation-only future fixture-creation plan completed. The plan requires a later separately approved sprint and explicit written approval packet before any implementation, fixture creation, data writes, Outlook actions, browser UAT, Microsoft/Entra/OAuth changes, deploys, commits, or pushes.

Sprint 069 status: IMPLEMENTED - lead list sorting/pagination, lead profile editing, manual lead creation, safe archive behavior, source/import visibility, recipient readiness labels, and staged-import cancellation were added. Completed import cancellation remains blocked because the current import lifecycle persists immediately and has no cancellable batch state.

Sprint 070 status: ARCHITECT PACK CREATED - import lifecycle/status, completed-import archive/cancel/rollback semantics, source-of-truth, audit, demo fallback labeling, migration requirements, validation evidence, and open business decisions are documented. No implementation, database schema change, migration, direct D1 edit, Outlook action, email send, deployment, commit, or push is approved by Sprint 070.

Sprint 071 status: ARCHITECT PACK CREATED - completed-import behavior, lead archive behavior, lifecycle permissions, required reasons, audit storage, lead archive data model, rollback deferral, and Sprint 072 approval gates are captured as approval-ready policy choices. Every recommendation remains Pending Founder Approval. No implementation, database schema change, migration, test change, direct D1 edit, Outlook action, email send, deployment, commit, or push is approved by Sprint 071.

Sprint 072 status: IMPLEMENTED - approved safe defaults were applied for archive-only completed imports, reversible lead archive, staged cancel by import owner/current uploader, admin/operator import and lead archive/restore, mandatory lifecycle reasons, existing `audit_log` storage, no destructive rollback, no direct D1 cleanup, and no Outlook/sending changes. BluePath Health was verified as demo fallback UI data, demo fallback records are labeled as `Demo fallback`, completed import cancel is rejected, and import/lead archive/restore writes audit events. Browser UAT in authenticated local Cloudflare/OpenNext D1 runtime remains required.

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
- Sprint 054 was opened after Microsoft OAuth redirected back to `http://localhost:8787/mvp/integrations?microsoft=connected` and the browser then reported `ERR_CONNECTION_CLOSED`.
- Sprint 054 must first determine whether Wrangler crashed, exited, restarted, lost port `8787`, or threw a callback/runtime exception.
- Sprint 055 was opened after Microsoft showed the intended Outlook account while EmailORC displayed a different redacted mailbox hint on the Integrations card.
- Sprint 055 identified the root cause: the Microsoft callback stored `currentUser.email` as `account_hint`, and connection storage also fell back to `currentUser.email`.
- Sprint 055 now derives the stored/displayed Outlook hint only from safe Microsoft `id_token` claims in order `email`, `preferred_username`, then `upn`; missing or invalid claims store no invented hint.
- Sprint 055 did not add Microsoft permissions, change Graph draft endpoints, run migrations, backfill existing stored hints, reconnect/disconnect Outlook, create drafts, deploy, commit, or push.
- Live UAT after Sprint 055 confirms Outlook can connect and display the real redacted Microsoft-authorized mailbox hint after reconnect, but Outlook Drafts UAT remains blocked because the Drafts page approval UI falsely blocks a server-authenticated `super_admin` with `User does not have approval permission`.
- Sprint 056 aligned the Drafts-page approval affordance with the server-authoritative canonical role model and marks D1 API drafts before representing them as Outlook-draft-ready.
- Sprint 056 planning does not approve sending, Microsoft permission additions, reconnect/disconnect behavior changes, migrations, seed/reset commands, production data writes, deploys, commits, or pushes.
- Sprint 056 validation status: `npm run test`, `npm run lint`, and `npm run build` passed. `npm run test:e2e:safe` did not pass because a pre-existing `next dev` server on port `3000` served a broken 404/missing-error-components response for `/`, and a retry timed out after Playwright attempted to move the web server to port `3001` while the config still expected `3000`.
- After Sprint 056, manual localhost UAT observed an approved card for `Marcus Webb / Greenfield Capital` with `QA 88` and `QA score below threshold`, but the existing `Create Outlook Draft` action was not visible. `Copy Draft` worked. `Regenerate Email` returned `Authentication required.`, which must be treated as a separate observation rather than an Outlook draft result.
- Sprint 057 diagnosed the missing action as expected for the selected card: Marcus Webb / Greenfield Capital is approved but lacks `isD1Backed: true`, `source: "d1"`, and `storageSource: "d1"`. `QA 88` is not the direct render blocker. Plain unauthenticated read-only GETs returned `401 Authentication required`, so no existing local approved D1-backed draft was confirmed from the shell.
- Sprint 057 does not authorize runtime code changes, test changes, Microsoft reconnect/disconnect, Outlook draft creation, sending, migrations, seed/reset commands, database writes, deploys, commits, pushes, or Sprint 052/056 PASS claims.
- Sprint 058 found the root cause: `src/components/layout/Shell.tsx` treated localStorage user fields as sufficient to render protected MVP pages, while protected server routes correctly required `emailorc_session` through `getCurrentUser(request)`.
- Sprint 058 keeps the Sprint 012+ server-session security model authoritative. Local browser display identity, localStorage role values, and request headers do not authorize protected APIs.
- Sprint 058 changed the shell to verify `/api/auth/me` before rendering protected MVP pages, refresh local display fields only from the server current-user response, and clear/redirect stale localStorage-only sessions to login.
- Sprint 058 changed the Integrations and Drafts UI to disable/explain Microsoft Connect, Outlook draft creation, and protected regeneration when no valid server session is present.
- Sprint 058 did not create Outlook drafts, send email, reconnect/disconnect Microsoft, inspect secrets, alter env files, run migrations, seed/reset data, deploy, commit, or push.
- Sprint 058 exposed the next blocker: under local `npm run dev`, Prisma fallback login can create an `emailorc_session` cookie while `/api/auth/me` still returns `401` because the fallback session record is stored only in module-level memory that is not reliable across Next.js App Router development route behavior.
- Sprint 059 must make local Prisma-fallback sessions durable and server-resolvable during the same local dev lifecycle, and must prevent `/login` from redirecting based on localStorage alone.
- Sprint 059 does not approve Microsoft OAuth completion, reconnect/disconnect, Outlook draft creation, sending, migrations, seed/reset commands, Prisma/D1 write commands, deployment, commit, or push.
- Sprint 059 replaced the local module-level session map with a local-only file-backed store at `.next/cache/emailorc-local-sessions.json`. The store persists token hashes plus session metadata, not plaintext session tokens.
- Sprint 059 aligned `/login` so existing localStorage display values cannot redirect away from login unless `/api/auth/me` returns a valid server-authenticated current user.
- Sprint 059 validation passed: focused auth/session tests, `npm run test`, `npm run lint`, `npm run test:e2e:safe`, `npm run build`, and local browser checks for clean login, stale-localStorage rejection, demo login, `/api/auth/me`, and Integrations access.
- Local browser check after Sprint 059 confirmed `/api/integrations/microsoft/status` returns `200` with `storageAvailable:false` under local Next dev; the Outlook Connect button remained disabled because Microsoft/D1 integration storage was unavailable in that runtime, not because of a missing server session.
- Sprint 059 is complete for local session-store and login redirect alignment. Outlook Connect availability moved out of Sprint 059 into Sprint 060 as “Microsoft integration storage availability / D1-backed connection persistence readiness.”
- Sprint 060 local-only D1 validation passed: `npm run db:migrate` targeted only `emailorc-demo-db --local --env demo` and had no pending migrations; `npm run db:seed` succeeded against local Wrangler D1 state; `npm run preview` started OpenNext/Wrangler at `http://localhost:8787` with local `env.DB` bound to `emailorc-demo-db`.
- Sprint 060 authenticated local validation passed: local demo login succeeded; `/api/auth/me` returned `200` with `session_source: "d1_app_sessions"` and organization `org_demo`; `/api/integrations/microsoft/status` returned `200` with `storageAvailable:true`, `connected:false`, and `reconnectRequired:false`; `/mvp/integrations` loaded and Outlook / M365 Connect readiness was available.
- Sprint 060 stopped before Outlook Connect: Connect was not clicked, no OAuth began, no mailbox changes occurred, no Outlook drafts were created, no email was sent, and no production D1, deploy, commit, or push occurred.
- Sprint 062 documents the exact local Microsoft Entra redirect URI and local-only `MICROSOFT_REDIRECT_URI` value required for Wrangler preview at `http://localhost:8787`.
- Sprint 062 allows only local redirect configuration alignment and planning. It does not approve `npm run preview`, local authentication, Outlook / M365 Connect click, Microsoft OAuth completion, Outlook draft creation, `POST /api/drafts/[draftId]/outlook`, sending, production Entra/environment changes, remote D1, deploy, commit, or push.
- Sprint 062 follow-on UAT reached `Create Outlook Draft`; three Outlook draft attempts returned HTTP `400` validation failures because the selected approved D1-backed draft had a malformed recipient value. No Outlook draft was created, no Outlook message ID was stored, and no email was sent.
- Sprint 063 implemented the next safe fix: the Drafts UI now shows a missing/invalid recipient blocked state before the user can attempt Microsoft Graph draft creation. The API's existing recipient validation remains the final enforcement layer.
- Sprint 063 did not create Outlook drafts, send email, run OAuth UAT, mutate recipient data, change scopes/config/env/D1/dependencies/Prisma/deploy settings, deploy, commit, or push.
- A Prisma OpenSSL warning appeared during local login but did not block the successful request; carry as an open follow-up rather than a Sprint 060 failure.
- `docs/CLOUDFLARE_DEMO_DEPLOY.md` still contains stale localStorage wording and is deferred as a docs-only follow-up.
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

Sprint 072 implementation is complete for code/docs/test scope and is awaiting authenticated local Cloudflare/OpenNext D1 browser UAT. No deployment, commit, push, direct D1 cleanup, Outlook action, or email send occurred.

Sprint 071 safe-default decisions were answered by Sprint 072 approval for this implementation scope.

Sprint 067 is complete as PASS for the documentation-only future fixture-creation plan.

Sprint 060 local-only Cloudflare/OpenNext D1 readiness validation is complete and PASS. Sprint 062 source-fixed the local HTTP callback/return redirect alignment for `http://localhost:8787/api/integrations/microsoft/callback` and reached the Outlook draft action, but Drafts UAT was blocked by recipient readiness. Sprint 063 blocks missing/malformed recipient drafts before the Outlook action. Sprint 064 pre-UAT read-only inspection found no qualifying safe valid-recipient approved D1-backed draft, so browser UAT remains not run and Outlook draft creation/email sending remain untested. Sprint 065 approved the correction policy and safe fixture path, but any data correction, fixture creation, implementation, or UAT retry still requires a future approved non-code UAT-fixture preparation or implementation pack.

Sprint 066 read-only audit found the future fixture path is feasible only through the normal D1-backed import and approval workflow with explicit future approval. Direct D1 edits are not approved as the default fixture path. Duplicate prevention is not yet proven sufficient because current Outlook delivery persistence can upsert after Graph creation rather than proving a pre-creation duplicate block.

Sprint 067 requires explicit written approval before any later fixture-creation sprint can perform writes. Required gates include an approved redacted internal Microsoft 365 test mailbox label/class, internal-only draft-only confirmation, one exact test-case identity, one exact test-run identity, source lead/import identity rules, approved recipient correction approach if needed, normal D1-backed import/approval proof, pre-Graph duplicate prevention, no-send proof, required audit evidence, and stop conditions if any gate is missing. Sprint 067 does not authorize the future fixture sprint itself.

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
- Sprint 055 completed Outlook connected mailbox identity accuracy for new successful OAuth connections.
- Sprint 056 planning/docs pack applied for Draft Approval UI and Outlook UAT readiness.
- Sprint 057 planning/docs pack applied for missing Outlook draft action UAT diagnosis.
- Sprint 058 planning/docs pack applied for server-session bootstrap and Microsoft Connect auth mismatch.
- Sprint 058 implemented and validated server-session gating for protected shell, Microsoft Connect UI, and protected draft actions.
- Sprint 059 planning/docs pack applied for durable local dev session storage and login redirect alignment.
- Sprint 059 implemented and validated local file-backed session persistence plus server-authenticated login redirect alignment.
- Sprint 059 completed for local session-store and login redirect alignment.
- Sprint 060 completed local-only Microsoft integration storage availability / D1-backed connection persistence readiness validation.
- Sprint 062 planning/docs pack created for local Microsoft OAuth redirect alignment and connection-only UAT preparation.
- Sprint 062 source-only local OAuth redirect fix implemented to prefer configured `MICROSOFT_REDIRECT_URI`, fall back to Cloudflare/OpenNext runtime binding, and return from callback using the configured local HTTP origin when present.
- Sprint 063 recipient-readiness gate implemented for Outlook draft action availability.
- Sprint 064 pre-UAT closed as BLOCKED because no approved valid-recipient safe test D1-backed draft is available.
- Sprint 065 planning pack created for recipient-correction policy and safe Outlook Draft UAT fixture decision.
- Sprint 065 decision capture completed: human-approved correction record is authoritative for corrected recipients, sales users may propose corrections, admins must approve them, corrections belong on the EmailORC client record, approved drafts remain immutable, future fixtures must use a dedicated internal Microsoft 365 test mailbox, and duplicate Outlook draft attempts must be blocked or clearly flagged before creation.
- Sprint 066 Architect Pack created for safe Outlook Draft UAT fixture readiness audit.
- Sprint 066 read-only readiness audit completed and closed as PASS. Outlook browser UAT remains blocked pending approved internal test mailbox label/class, exact test case and test-run identity, recipient-correction/replacement-draft decision, duplicate-prevention design/proof, and explicit approval for later D1 import, approval, and Outlook draft creation.
- Sprint 067 documentation-only plan completed for safe Outlook Draft UAT fixture creation planning. No fixture creation, data mutation, Outlook draft creation, browser UAT, Microsoft/Entra/OAuth change, code change, deploy, commit, or push occurred.
- Sprint 070 Architect Pack created for import lifecycle cancel/archive/audit design. No application code, schema, migration, tests, deployment files, secrets, environment files, Outlook action, email send, direct D1 edit, commit, or push occurred.
- Sprint 071 Architect Pack created for import lifecycle policy decision capture. No application code, schema, migration, tests, deployment files, secrets, environment files, Outlook action, email send, direct D1 edit, commit, or push occurred.
- Sprint 072 implemented import/lead lifecycle cleanup, demo fallback labeling, audit-backed archive/restore, staged cancel audit, migration text, focused tests, and docs alignment. No direct D1 cleanup, Outlook action, email send, deploy, commit, or push occurred.

---

## Next Actions

1. Apply normal local/test D1 migration path for `0012_import_lead_lifecycle.sql` only when explicitly approved for that runtime.
2. Browser-validate Sprint 069 and Sprint 072 in an authenticated local Cloudflare/OpenNext D1 runtime before using records/imports for Outlook-draft UAT preparation.
3. Confirm audit-visible evidence for staged cancel, import archive/restore, and lead archive/restore.
4. Review and explicitly approve or reject the Sprint 067 fixture approval packet before any fixture creation or UAT.
5. Before any future fixture-creation sprint approval, provide the internal test mailbox label/class, exact test case/test-run identity, recipient-correction or replacement-draft decision, and duplicate-prevention design/proof.
6. Continue withholding Sprint 052 and Sprint 056 PASS until the approved D1-backed Outlook-ready path is proven and mailbox no-send UAT is completed.

---

## Blockers / Open Items

- Production readiness is not established.
- Sprint 012 D1 `app_sessions` migration is created; local Sprint 060 D1 validation had no pending local migrations, but remote/test-live application still requires explicit approval and evidence.
- Sprint 052 still awaits Entra configuration, D1 migration application, and Outlook mailbox UAT.
- Sprint 052 Outlook Drafts UAT remains blocked until Sprint 056 safe e2e and owner UAT prove a real D1-backed draft can be approved and made Outlook-draft-ready.
- Sprint 053/053-A is implemented, validated locally, committed, and pushed.
- Sprint 054 cannot be implemented until the callback/worker failure is evidenced and the fix plan is approved.
- Previously stored incorrect Microsoft `account_hint` values are not backfilled by Sprint 055; a fresh successful OAuth connection is needed to replace the stored hint.
- Drafts-page approval UI role-casing fix is implemented, but full Sprint 056 PASS is withheld pending clean safe e2e and owner UAT.
- Sprint 057 must not close Sprint 056; Sprint 056 remains open until the missing Outlook action is diagnosed and the owner UAT exit condition is satisfied.
- Sprint 058 has repaired/gated the localStorage-only display mismatch, but Outlook UAT still needs a live authenticated browser session and a qualifying approved D1-backed draft.
- Sprint 060 resolved local-only Microsoft integration storage availability / D1-backed connection persistence readiness under Cloudflare/OpenNext; local Next dev remains unsuitable for this gate because it lacks the D1 binding.
- Sprint 063 implementation is complete for recipient-readiness gating.
- `Create Outlook Draft` still requires a qualifying approved D1-backed draft with a valid recipient email, server session, D1 backing, and connected Microsoft account.
- Recipient correction policy is approved, but the workflow is not implemented.
- Sprint 064 pre-UAT is blocked: browser UAT was not run, no approved valid-recipient D1-backed draft is available, and missing/malformed recipient protection was confirmed only through read-only data inspection rather than browser UAT.
- Sprint 065 policy decisions are approved and documented: authoritative recipient source, correction actor, audit trail, approved-draft editing policy, safe internal fixture path, and duplicate-prevention policy are no longer open. Implementation and fixture creation remain future-gated.
- Sprint 066 PASS does not unblock Outlook browser UAT. Remaining blockers: approved internal test mailbox label/class, exact test case and test-run identity, recipient-correction/replacement-draft decision, duplicate-prevention design and proof, and explicit approval for later D1 import, approval, and Outlook draft creation.
- No direct D1 edits are approved as the default fixture path; later fixture creation must default to the normal D1-backed import and approval workflow unless a future sprint explicitly approves an exception.
- Duplicate prevention is not yet proven sufficient because current delivery persistence can upsert after Graph creation.
- Dashboard mock-data reset/clear-before-live remains a separate future requirement and is not part of Sprint 056.
- Brain / provider API guard hardening is complete for the current approved Sprint 015 route surface.
- Billing/usage/account APIs remain future work unless already handled elsewhere.
- Page/middleware/localStorage cleanup has not started.
- Production mode remains a future target state only.
- Deployment target and production readiness remain unresolved.
- Dirty working tree existed before Sprint 015, including `prisma/dev.db`; avoid unrelated files.
- Completed imports remain not cancellable by design. Sprint 072 supports archive/restore only and explicitly rejects completed-import cancellation.
- Sprint 072 migration text exists but was not applied in this session. Browser UAT requiring dedicated lifecycle fields depends on an approved normal migration step in the target local/test runtime.
- Sprint 072 code is compatible with older D1 schemas for active records but persisted import archive/restore requires lifecycle columns to be present.
