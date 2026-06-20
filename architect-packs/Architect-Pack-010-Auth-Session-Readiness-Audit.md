# Architect Pack 010 — Auth / Session Readiness Audit

**Project:** EmailORC  
**Repo path:** `/Users/Dmoney/Documents/development/apps/emailorc`  
**Sprint:** `010-auth-session-readiness-audit`  
**Created:** 2026-05-21  
**Architect Layer:** ChatGPT  
**Builder Layer:** Codex  

---

## Purpose

Sprint 010 is a focused audit and documentation sprint for EmailORC auth, session, role, and access-control readiness.

Sprint 009 completed the environment-mode and data-store decision documentation pass. The project now has clearer environment definitions, but production readiness is still not established.

The next highest-risk production-readiness area is auth/session behavior.

Sprint 010 should inspect and document the current auth/session model without changing runtime behavior.

The goal is to answer:

- How does EmailORC currently identify a user?
- How is session state stored and read?
- What roles exist?
- Which routes/pages enforce role checks?
- Which routes/pages appear weak, demo-only, local-only, or unclear?
- What must be true before EmailORC can be considered production-auth-ready?

This sprint must not implement auth changes yet.

The handoff is the project folder, not this conversation.

---

## Scope Control

### In Scope

- Read current operating files, durable docs, Sprint 009 output, and relevant source files.
- Inspect current auth/session references across:
  - `app/`
  - `app/api/`
  - `src/`
  - middleware/config files if present
  - tests and validation docs
- Identify current login/session flows.
- Identify current user roles and role normalization behavior.
- Identify page-level and API-level guards.
- Identify client-side-only gates versus server-side authoritative gates.
- Identify demo/local-only assumptions.
- Identify environment-mode impact on auth/session behavior.
- Identify whether auth/session data is stored in D1, Prisma, localStorage, cookies, headers, static/demo data, or mixed paths.
- Create an auth/session readiness audit report.
- Update durable docs and planning files.
- Recommend Sprint 011 scope.
- Run safe validation commands only.

### Out of Scope

- No auth/session implementation changes.
- No login redesign.
- No new role model.
- No permission dashboard.
- No middleware rewrite.
- No API behavior changes.
- No UI behavior changes.
- No schema changes.
- No Prisma schema edits.
- No D1 migration edits.
- No new migrations.
- No seed/demo data edits.
- No database writes.
- No env file edits.
- No deployment config changes.
- No Wrangler deploy.
- No Cloudflare D1 write commands.
- No sending enablement.
- No live CRM/email integration enablement.
- No Brain Center/provider behavior changes.
- No production-readiness claim.
- No intentional changes to `prisma/dev.db`.
- No secrets inspection or exposure.

---

## Source Facts From Prior Sprints

Sprint 001 established EmailORC as an MVP/demo-stage review-and-export email workflow app.

Sprint 002 validated current stability and prioritized known bugs.

Sprint 003 fixed two P1 demo blockers:

- `/mvp/admin` is Super Admin-only.
- Draft approval requires QA score >= 90.

Sprint 004 hardened import mapping and validation:

- Email is the only blocking import/draft-generation field.
- Missing identity or renewal context produces warnings instead of blocking the whole import.

Sprint 006 established a non-mutating Playwright validation path.

Sprint 007 made lint non-interactive or documented the closest safe lint path.

Sprint 008 reconciled Prisma / SQLite and Cloudflare D1 data-model direction:

- D1 is the planning direction for deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support unless a future approved sprint changes that.

Sprint 009 defined environment modes:

- `demo` is safe seeded/resettable sample-data mode.
- `test-live` is canonical controlled pre-production live-like validation mode.
- `live-test` is legacy/non-canonical wording.
- `production` is a future target state only.
- Production readiness is not established.

Known persistent rules:

- EmailORC remains MVP/demo-stage.
- Human review remains required.
- Auto-send remains disabled.
- Live CRM/email integrations remain disabled.
- Secrets must never be exposed.
- `prisma/dev.db` must not be intentionally touched.

---

# File: planning/STATE.md

```markdown
# Project State

**Project:** EmailORC  
**Last updated:** 2026-05-21  
**Current phase:** Sprint 010 — Auth / Session Readiness Audit

---

## Current Status

Sprint 009 is complete and accepted.

Environment modes and data-store direction are now documented:

- `demo` is safe seeded/resettable sample-data mode.
- `test-live` is the canonical controlled pre-production live-like validation mode.
- `live-test` is legacy/non-canonical wording.
- `production` is a future target state only.
- D1 is the planning direction for deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support only.

Sprint 010 is active and targets auth/session readiness.

EmailORC remains MVP/demo-stage and should not be treated as production-ready.

---

## Active Sprint

`planning/sprints/010-auth-session-readiness-audit/`

---

## Recently Completed

- Sprint 001 added the 120x operating structure.
- Sprint 002 completed validation and bug prioritization.
- Sprint 003 fixed Super Admin-only access to `/mvp/admin` and blocked draft approval below QA score 90.
- Sprint 004 hardened import mapping and validation.
- Sprint 005 fixed Campaign Board browser-state/card movement.
- Sprint 006 created or isolated a non-mutating Playwright validation path.
- Sprint 007 made lint non-interactive or documented the closest safe lint path.
- Sprint 008 completed Prisma / D1 reconciliation audit.
- Sprint 009 completed environment-mode and data-store decision documentation.

---

## Next Actions

1. Apply Architect Pack 010 to create Sprint 010 planning files.
2. Have Codex read Sprint 010 files and summarize the audit plan before making changes.
3. Approve Codex audit work only after the summary is correct.
4. Inspect current auth/session/role/access-control references across docs, routes, UI, source utilities, and tests.
5. Create the Sprint 010 auth/session readiness audit report.
6. Update durable docs and planning files.
7. Run safe validation commands.
8. Report acceptance status and recommended Sprint 011.

---

## Blockers / Open Items

- Production readiness is not established.
- Auth/session readiness is not established.
- Production mode remains a future target state only.
- Environment normalization implementation has not started.
- Production data-store implementation has not started.
- Deployment target and production readiness remain unresolved.
```

---

# File: planning/DECISIONS.md

```markdown
# Decisions

Record durable decisions future sprints must respect.

---

## Decision Log

| Date | Decision | Reason | Impact |
|---|---|---|---|
| 2026-05-21 | Sprint 010 is an auth/session readiness audit and documentation sprint only. | Auth/session behavior is a production-readiness blocker and must be understood before implementation changes. | Codex must not change auth logic, roles, session behavior, middleware, API behavior, schema, env files, deployment config, or data files during Sprint 010. |
| 2026-05-21 | Auth/session production readiness must be documented before production-mode implementation. | Production mode cannot be trusted without clear identity, session, role, and access-control behavior. | Future production-readiness work must build from the Sprint 010 audit report. |
| 2026-05-21 | Client-side-only access checks are not sufficient for production readiness. | Production protection requires authoritative server-side enforcement for sensitive actions and data. | Sprint 010 must identify where guards are client-side-only, server-side, or unclear. |
```

---

# File: planning/RISKS.md

```markdown
# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| App is mistaken for production-ready. | High | High | Keep production-readiness claims out of docs until validated. | Open |
| Auth/session model is demo-style, mixed, or not production-ready. | High | High | Sprint 010 audits current identity/session/role behavior without changing it. | Active |
| Sensitive pages rely on client-side-only guards. | Medium | High | Sprint 010 identifies client-only versus server-authoritative access checks. | Active |
| API routes may not enforce the same access rules as UI pages. | Medium | High | Sprint 010 maps page and API guards separately. | Active |
| Role naming or normalization may be inconsistent. | Medium | Medium | Sprint 010 inventories role names, normalization, and enforcement points. | Active |
| Environment modes may affect auth/session behavior in undocumented ways. | Medium | Medium | Sprint 010 documents observed mode-specific auth/session behavior. | Active |
| Builder accidentally implements auth changes during audit. | Medium | High | Sprint 010 explicitly forbids runtime, API, schema, config, and UI behavior changes. | Active |
| Secrets or credentials are exposed during audit. | Low | High | Inspect names and code paths only; never print secret values. | Open |
| `prisma/dev.db` is touched or committed accidentally. | Medium | Medium | Verify git status before and after; do not run mutating Prisma commands. | Open |
| Auto-send or live integrations could be enabled accidentally. | Medium | High | Keep auto-send and live integrations disabled unless an approved future sprint changes them. | Open |
```

---

# File: planning/QUESTIONS.md

```markdown
# Open Questions

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Is EmailORC intended for internal AI Hub use only, client demos, or paid client production use? | Owner | Production readiness sprint | Open | Affects auth, deployment, compliance, data retention, and sending rules. |
| What is the correct production target: Cloudflare only, local/server deploy, or another host? | Owner | Production readiness sprint | Open | Current audit history found Cloudflare D1 and OpenNext Cloudflare path. |
| Should direct email sending ever be enabled, or should the product remain review/export only? | Owner | Integration roadmap | Open | Current decision: no auto-send unless future sprint approves it. |
| What identities should exist in production? | Owner/Architect | Auth readiness sprint | Active | Sprint 010 should document current users/roles and recommend production-ready identity requirements. |
| What roles should exist in production? | Owner/Architect | Auth readiness sprint | Active | Sprint 010 should document current role behavior and gaps. |
| Which pages require server-authoritative access controls? | Builder/Architect | Auth readiness sprint | Active | Sprint 010 should map page guards and gaps. |
| Which API routes require server-authoritative access controls? | Builder/Architect | Auth readiness sprint | Active | Sprint 010 should map API guards and gaps. |
| Where is session state currently stored and trusted? | Builder | Auth readiness sprint | Active | Sprint 010 should identify localStorage, cookies, headers, D1, Prisma, static/demo, or mixed storage. |
| What auth/session validation gate is required before production mode can be considered? | Architect/Builder | Production readiness sprint | Open | Sprint 010 should recommend future validation requirements. |
```

---

# File: docs/ARCHITECTURE.md

```markdown
# Architecture

## Overview

EmailORC is an existing Next.js email campaign/workflow MVP.

It supports CSV/contact/account import, validation, draft review, draft approval, export, admin/settings areas, Brain Center configuration, environment-mode handling, local development data files, Cloudflare D1 deployment/demo data, and auth/session behavior that still requires readiness audit.

Current status:

- MVP/demo-stage.
- Not confirmed production-ready.
- Human approval required.
- Auto-send disabled.
- Live CRM/email integrations disabled.
- D1 is the planning direction for deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support only.
- Auth/session readiness is not established until Sprint 010 is complete.

## System Components

| Component | Location | Purpose |
|---|---|---|
| Next.js App Router | `app/` | Pages and API routes. |
| API routes | `app/api/` | Auth, workflow import/export, drafts, admin, billing, brain/OpenRouter, usage, account intelligence. |
| MVP UI | `app/mvp/` | Main screens for upload, records, drafts, campaigns, export, admin, integrations, reply, brain center, settings. |
| Shared source | `src/` | Components, domain types, validation utilities, auth/billing helpers, email invite helper, orchestration services. |
| Local data | `prisma/` | Prisma schema, local SQLite dev database, seed/migration assets. |
| Deployed/demo data | `d1/` | Cloudflare D1 migrations and demo seed data. |
| Tests | `tests/` | Vitest, Playwright, fixtures, manual QA, bug docs, E2E runbook. |
| Cloudflare config | `wrangler.jsonc` | Worker/D1/assets/service binding and environment-mode configuration. |

## Auth / Session Readiness

Sprint 010 should inspect and document:

| Area | Status | Notes |
|---|---|---|
| Login/session flow | TBD | Identify current source of user identity and session state. |
| Role model | TBD | Identify current roles and normalization behavior. |
| Page guards | TBD | Map UI/page access restrictions. |
| API guards | TBD | Map route-level access restrictions. |
| Admin protection | Partially known | Sprint 003 made `/mvp/admin` Super Admin-only, but full auth readiness remains unaudited. |
| Environment-specific behavior | TBD | Identify any demo/test-live/production auth/session differences. |
| Production readiness | Not established | Requires future implementation sprint after audit. |

## Known Architecture Gaps

- Auth/session readiness needs durable documentation.
- Environment normalization implementation has not started.
- Production data-store implementation is not approved yet.
- Production deployment path needs validation.
- Production readiness is not established.
```

---

# File: docs/API.md

```markdown
# API

## Overview

This document captures known API routes and app-contract behavior from existing audits and follow-up sprints.

Sprint 010 should update this document only where auth/session/access-control expectations are clarified.

Do not treat this as a complete route-by-route production contract until a future API inventory or production-readiness sprint.

## Auth / Session Contract

Sprint 010 should document observed behavior for:

| Area | Expected Sprint 010 Output |
|---|---|
| Login routes | Identify routes/files and current behavior. |
| Signup routes | Identify routes/files and current behavior. |
| Logout/session clearing | Identify routes/files and current behavior. |
| Current-user/session lookup | Identify source of truth and trust boundary. |
| Role checks | Identify role names and enforcement points. |
| Admin checks | Identify page and API protection. |
| API route guards | Identify protected, unprotected, demo-only, and unclear routes. |
| Environment mode impact | Identify demo/test-live/production differences if present. |

## Known Workflow Routes

| Route | Purpose | Auth / Access Notes |
|---|---|---|
| `app/api/workflow/import/route.ts` | CSV/contact import | Sprint 010 should identify current auth/session requirements. |
| `app/api/workflow/records/route.ts` | Record retrieval / validation display | Sprint 010 should identify current auth/session requirements. |
| `app/api/workflow/drafts/route.ts` | Draft retrieval | Sprint 010 should identify current auth/session requirements. |
| `app/api/workflow/export/route.ts` | Approved draft export | Sprint 010 should identify current auth/session requirements. |
| `app/api/drafts/approve/route.ts` | Draft approval | Sprint 003 enforces QA score >= 90. Sprint 010 should identify auth/session requirements. |
| `app/api/admin/*` | Admin operations | Sprint 010 should map current access-control behavior. |
| `app/api/auth/*` | Auth/session behavior | Sprint 010 should inspect and document current behavior. |

## Existing Business Rules

- Auto-send remains disabled.
- Live integrations remain disabled.
- Do-not-contact records must not appear in approved export.
- Draft approval requires QA score >= 90.
- Human approval remains required.
- Production readiness is not established.
- Client-side-only protection is not sufficient for production-sensitive operations.
```

---

# File: docs/VALIDATION.md

```markdown
# Validation Plan

## Overview

Validation proves EmailORC is safe and trustworthy before future feature work, demos, or production decisions.

Current safe local validation gate should include:

```bash
git status --short
npm run test
npm run build
npm run lint
npm run test:e2e:safe
```

Only run commands that are documented and known safe in the repo.

## Sprint 010 Validation Focus

Sprint 010 validates one focused architecture/documentation outcome:

1. Auth/session/role/access-control behavior is audited and documented.
2. Production auth/session gaps are identified.
3. Future implementation constraints are clear.
4. No app behavior, API behavior, schema, migrations, env files, deployment config, data files, or database state are changed.

## Sprint 010 Required Validation

Codex should run:

```bash
git status --short
npm run test
npm run build
npm run lint
npm run test:e2e:safe
```

If any command is unavailable or unsafe, skip it and document why.

Do not run:

- `prisma migrate`
- `prisma db push`
- `prisma db pull`
- `prisma db reset`
- `prisma generate`, unless separately approved
- database reset commands
- seed commands
- deploy commands
- `wrangler deploy`
- Cloudflare D1 write commands
- commands requiring secret values
- commands that send email
- commands that enable integrations

## Auth / Session Readiness Validation Requirements

Future implementation sprints should validate:

- Sensitive pages have server-authoritative protection where needed.
- Sensitive API routes enforce access control independent of UI state.
- Role checks are normalized and consistent.
- Session source of truth is explicit.
- Demo/test-live/production auth behavior is clearly separated.
- Admin-only operations cannot be reached by unauthorized roles.
- Production mode cannot rely on localStorage-only identity or demo-only trust assumptions.
- Secrets are not logged, exposed, or stored in repo files.

## Future Validation Areas

- Auth/session implementation after audit findings are accepted.
- Environment-mode normalization implementation.
- Production data-store readiness.
- Production deployment readiness.
- Integration/sending readiness, only if future owner-approved roadmap includes direct sending.
```

---

# File: planning/sprints/010-auth-session-readiness-audit/requirements.md

```markdown
# Sprint 010 Requirements — Auth / Session Readiness Audit

## Goal

Audit EmailORC’s current auth, session, role, and access-control behavior without changing app behavior.

## Business Objective

Give the project owner and future Builder sessions a clear understanding of auth/session readiness before any production-mode, deployment, or security-sensitive implementation work is approved.

## User Story

As the project owner, I want Codex to document how users, sessions, roles, and route/page guards currently work, so production-readiness decisions are based on repo evidence instead of assumptions.

## In Scope

- Read current operating, planning, and durable docs.
- Read Sprint 009 environment-mode and data-store outputs.
- Inspect current auth/session references in:
  - `app/`
  - `app/api/`
  - `src/`
  - tests
  - config/middleware files if present
- Identify login/signup/session/current-user behavior.
- Identify role names and role normalization behavior.
- Map page-level guards.
- Map API-level guards.
- Identify client-side-only access controls.
- Identify server-side authoritative access controls.
- Identify environment-mode-specific auth/session behavior.
- Identify auth/session data-store usage:
  - D1
  - Prisma
  - cookies
  - headers
  - localStorage
  - static/demo data
  - request-only behavior
  - unknown
- Create a Sprint 010 auth/session readiness audit report.
- Update durable docs and planning files.
- Run safe validation commands.

## Out of Scope

- Auth/session implementation changes.
- Login redesign.
- Signup redesign.
- Middleware rewrite.
- New permissions system.
- New role model.
- Role behavior changes.
- API behavior changes.
- UI behavior changes.
- Schema changes.
- Migrations.
- Seed changes.
- Env changes.
- Deployment config changes.
- Database writes.
- Email sending.
- Live CRM/email integrations.
- Production-readiness claim.

## Business Rules

- EmailORC remains MVP/demo-stage.
- Production readiness is not established.
- Human review remains required.
- Auto-send remains disabled.
- Live CRM/email integrations remain disabled.
- `test-live` remains canonical.
- `live-test` remains legacy/non-canonical wording.
- D1 is the planning direction for deployed workflow source of truth.
- Prisma / SQLite remains local development, fallback, and transition support only.
- Client-side-only access checks are not sufficient for production-sensitive behavior.
- Do not expose secrets.
- Do not touch `prisma/dev.db`.

## Expected Output

Create:

- `planning/sprints/010-auth-session-readiness-audit/requirements.md`
- `planning/sprints/010-auth-session-readiness-audit/blueprint.md`
- `planning/sprints/010-auth-session-readiness-audit/acceptance.md`
- `planning/sprints/010-auth-session-readiness-audit/handoff-prompt.md`
- `planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md`

Update as needed:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- Optional: `docs/AUTH_SESSION.md`, if useful as a durable standalone auth/session reference

## Success Definition

Sprint 010 succeeds when:

- Current auth/session behavior is documented from repo evidence.
- Current roles and access-control points are mapped.
- Client-side-only versus server-authoritative gates are identified.
- Auth/session production-readiness gaps are listed.
- No runtime behavior is changed.
- Safe validation commands pass or skips are documented.
- Sprint 011 recommendation is clear.
```

---

# File: planning/sprints/010-auth-session-readiness-audit/blueprint.md

```markdown
# Sprint 010 Blueprint — Auth / Session Readiness Audit

## Objective

Complete one focused audit:

1. Document EmailORC’s current auth, session, role, and access-control behavior.
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

## Files to Create

- `planning/sprints/010-auth-session-readiness-audit/requirements.md`
- `planning/sprints/010-auth-session-readiness-audit/blueprint.md`
- `planning/sprints/010-auth-session-readiness-audit/acceptance.md`
- `planning/sprints/010-auth-session-readiness-audit/handoff-prompt.md`
- `planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md`
- Optional: `docs/AUTH_SESSION.md`, if Codex determines a standalone durable auth/session document is useful

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

Do not modify app/source/runtime files.

## Audit Plan

1. Confirm git status before work.
2. Read the required operating and sprint files.
3. Inspect current auth/session docs.
4. Search repo for auth/session terms:
   - `auth`
   - `session`
   - `login`
   - `logout`
   - `signup`
   - `currentUser`
   - `user`
   - `role`
   - `SUPER_ADMIN`
   - `CLIENT_ADMIN`
   - `admin`
   - `localStorage`
   - `cookie`
   - `authorization`
   - `bearer`
5. Map login/signup/session/current-user flows.
6. Map role names and role normalization.
7. Map page-level guards.
8. Map API-level guards.
9. Identify client-side-only checks.
10. Identify server-authoritative checks.
11. Identify mode-specific behavior tied to `demo`, `test-live`, `live-test`, or `production`.
12. Identify data-store usage for auth/session:
    - D1
    - Prisma
    - cookies
    - headers
    - localStorage
    - static/demo data
    - unknown
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

Run:

```bash
git status --short
npm run test
npm run build
npm run lint
npm run test:e2e:safe
```

If a command is unavailable or unsafe, skip it and document why.

Do not run:

- Prisma migrate/db push/db pull/db reset/generate unless separately approved
- seed commands
- deploy commands
- Wrangler deploy
- Cloudflare D1 write commands
- commands requiring secret values
- sending commands
- live integration commands

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
```

---

# File: planning/sprints/010-auth-session-readiness-audit/acceptance.md

```markdown
# Sprint 010 Acceptance — Auth / Session Readiness Audit

## Acceptance Checklist

### Scope Control

- [ ] Sprint stayed documentation/audit only.
- [ ] No app/source/runtime behavior was changed.
- [ ] No API behavior was changed.
- [ ] No UI behavior was changed.
- [ ] No schema, migration, seed, env, deployment, or database files were intentionally changed.
- [ ] `prisma/dev.db` was not intentionally touched.
- [ ] No secrets were exposed.
- [ ] Sprint 011 was not started.

### Required Sprint Files

- [ ] `planning/sprints/010-auth-session-readiness-audit/requirements.md` exists.
- [ ] `planning/sprints/010-auth-session-readiness-audit/blueprint.md` exists.
- [ ] `planning/sprints/010-auth-session-readiness-audit/acceptance.md` exists.
- [ ] `planning/sprints/010-auth-session-readiness-audit/handoff-prompt.md` exists.
- [ ] `planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md` exists.

### Audit Coverage

- [ ] Current auth/session behavior is summarized.
- [ ] Login/signup/session/current-user flows are documented.
- [ ] Current role names are documented.
- [ ] Role normalization behavior is documented.
- [ ] Page-level guards are mapped.
- [ ] API-level guards are mapped.
- [ ] Client-side-only guards are identified.
- [ ] Server-authoritative guards are identified.
- [ ] Auth/session data-store behavior is documented.
- [ ] Environment-mode-specific auth/session observations are documented.
- [ ] Production-readiness blockers are listed.

### Durable Documentation

- [ ] `docs/ARCHITECTURE.md` is updated where auth/session architecture is clarified.
- [ ] `docs/API.md` is updated where route access-control behavior is clarified.
- [ ] `docs/VALIDATION.md` is updated with future auth/session validation requirements.
- [ ] Optional `docs/AUTH_SESSION.md` is created if useful and linked/mentioned in architecture/API docs.
- [ ] `planning/STATE.md` is updated.
- [ ] `planning/RISKS.md` is updated.
- [ ] `planning/QUESTIONS.md` is updated.
- [ ] `planning/DECISIONS.md` is updated only for durable decisions.

### Validation

- [ ] `git status --short` was run before or after the audit.
- [ ] `npm run test` passed or skip/failure reason is documented.
- [ ] `npm run build` passed or skip/failure reason is documented.
- [ ] `npm run lint` passed or skip/failure reason is documented.
- [ ] `npm run test:e2e:safe` passed or skip/failure reason is documented.
- [ ] All skipped unsafe commands are documented.

### Final Report

- [ ] Files inspected are listed.
- [ ] Files changed are listed.
- [ ] Commands run and results are listed.
- [ ] Commands skipped and reasons are listed.
- [ ] Acceptance complete/incomplete status is reported.
- [ ] Risks introduced are reported.
- [ ] Recommended Sprint 011 is reported.

## Done Standard

Sprint 010 is complete only when the project folder clearly explains the current auth/session model and the remaining production-auth readiness gaps without relying on chat memory.
```

---

# File: planning/sprints/010-auth-session-readiness-audit/handoff-prompt.md

```markdown
# Sprint 010 Handoff Prompt — Auth / Session Readiness Audit

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
```

---

# Codex Apply Architect Pack 010 Prompt

Use this first, before the Sprint 010 handoff prompt.

```text
You are Codex working in the EmailORC repo.

Apply Architect Pack 010 — Auth / Session Readiness Audit.

Source pack:

[PASTE THIS ARCHITECT PACK 010 CONTENT OR POINT TO THE FILE IF IT HAS BEEN ADDED TO THE REPO]

Create or update only the planning and documentation files described in the pack:

- planning/STATE.md
- planning/DECISIONS.md, only if decisions change
- planning/RISKS.md
- planning/QUESTIONS.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/VALIDATION.md
- planning/sprints/010-auth-session-readiness-audit/requirements.md
- planning/sprints/010-auth-session-readiness-audit/blueprint.md
- planning/sprints/010-auth-session-readiness-audit/acceptance.md
- planning/sprints/010-auth-session-readiness-audit/handoff-prompt.md

Do not create the audit report yet.
Do not perform the audit yet.
Do not inspect broad source files yet beyond what is needed to apply the planning pack.
Do not change app behavior.
Do not change source logic.
Do not change API behavior.
Do not change UI behavior.
Do not change schemas, migrations, seed data, env files, deployment config, or database files.
Do not touch prisma/dev.db.
Do not run Prisma commands, seed commands, deploy commands, Wrangler commands, Cloudflare D1 write commands, sending commands, or live integration commands.
Do not expose secrets.
Do not start Sprint 011.

After applying the pack, report:

1. Files created
2. Files updated
3. Files intentionally untouched
4. Any assumptions made
5. Any blockers
```

---

## Recommended Next Step After Pack Is Applied

After Codex applies this Architect Pack, use the `handoff-prompt.md` content to make Codex read the Sprint 010 files and summarize the audit plan before it performs the full audit.

Do not let Codex implement auth changes during Sprint 010.
