# Sprint 010 Requirements - Auth / Session Readiness Audit

## Goal

Audit EmailORC's current auth, session, role, and access-control behavior without changing app behavior.

## Business Objective

Give the project owner and future Builder sessions a clear understanding of auth/session readiness before any production-mode, deployment, or security-sensitive implementation work is approved.

## User Story

As the project owner, I want Codex to document how users, sessions, roles, and route/page guards currently work, so production-readiness decisions are based on repo evidence instead of assumptions.

## In Scope

- Read current operating, planning, and durable docs.
- Read Sprint 009 environment-mode and data-store outputs.
- Inspect current auth/session references in `app/`, `app/api/`, `src/`, tests, and config/middleware files if present.
- Identify login/signup/session/current-user behavior.
- Identify role names and role normalization behavior.
- Map page-level guards.
- Map API-level guards.
- Identify client-side-only access controls.
- Identify server-side authoritative access controls.
- Identify environment-mode-specific auth/session behavior.
- Identify auth/session data-store usage across D1, Prisma, cookies, headers, localStorage, static/demo data, request-only behavior, or unknown paths.
- Create a Sprint 010 auth/session readiness audit report after owner approval of the audit implementation pass.
- Update durable docs and planning files.
- Run safe validation commands during the audit implementation pass.

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

This Architect Pack application pass creates or updates only planning and durable documentation files.

Future approved audit implementation pass should create:

- `planning/sprints/010-auth-session-readiness-audit/auth-session-readiness-report.md`

Update as needed during the future audit pass:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- Optional: `docs/AUTH_SESSION.md`, if useful as a durable standalone auth/session reference.

## Success Definition

Sprint 010 succeeds when:

- Current auth/session behavior is documented from repo evidence.
- Current roles and access-control points are mapped.
- Client-side-only versus server-authoritative gates are identified.
- Auth/session production-readiness gaps are listed.
- No runtime behavior is changed.
- Safe validation commands pass or skips are documented.
- Sprint 011 recommendation is clear.
