# AGENTS.md

## Project

**Name:** EmailORC  
**Client:** Internal / AI Hub  
**Description:** Existing email campaign/workflow app for importing account/contact records, validating records, generating/reviewing drafts, approving drafts, and exporting approved drafts.  
**Tech stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Prisma SQLite, Cloudflare D1, Wrangler, Vitest, Playwright.  
**Created:** Existing Codex-built app. 120x operating structure added during Sprint 001.

## Operating Model

This project uses the 120x Architect / Builder methodology.

The handoff is a folder, not a conversation.

The Builder must read project files before making changes and must build to the approved sprint blueprint.

## First Files to Read

Read these in order at the start of every Builder session:

1. `AGENTS.md`
2. `planning/STATE.md`
3. `planning/DECISIONS.md`
4. `planning/DOMAIN.md`
5. `planning/RISKS.md`
6. `planning/QUESTIONS.md`
7. Active sprint files under `planning/sprints/`
8. Relevant docs under `docs/`
9. Existing tests and source files relevant to the sprint

## Current Safety Rules

- Do not treat the app as production-ready.
- Do not enable auto-send unless a future approved sprint explicitly requires it.
- Do not enable live CRM or email integrations unless a future approved sprint explicitly requires it.
- Do not expose or print secret values.
- Do not modify `.env`, `.dev.vars`, database files, migrations, or deployment settings unless the active sprint explicitly allows it.
- Do not redefine business rules.
- Do not invent production auth/session rules.
- Prefer small, auditable changes.
- Keep documentation and implementation aligned.

## Existing App Summary

EmailORC appears to support:

- Demo/user login flows
- CSV/account/contact import
- Record validation
- Email draft generation or management
- Draft review and approval
- Approved draft export
- Organization/user/plan management
- Test/live environment modes
- Brain Center model settings, OpenRouter keys, business knowledge, playbooks, and learning logs

Current working assumption:

The app is an MVP/demo-stage review-and-export email workflow, not a production auto-sending platform.

## Project Structure Notes

Important existing folders:

```text
app/        Next.js App Router pages and API routes
app/api/    Backend route handlers
app/mvp/    MVP UI screens
src/        Shared components, services, prompts, utilities
prisma/     Prisma SQLite schema, local dev database, migrations/seed
d1/         Cloudflare D1 migrations and demo seed data
tests/      Vitest, Playwright, fixtures, QA docs
docs/       Existing and new durable docs
planning/   120x project state, decisions, risks, questions, and sprints
```

## Sprint Workflow

Each sprint lives in:

```text
planning/sprints/###-{sprint-name}/
```

Each sprint must include:

- `requirements.md`
- `blueprint.md`
- `acceptance.md`
- `handoff-prompt.md`

The Builder must read all four before implementation.

## Completion Standard

A sprint is complete only when:

- The requested behavior or documentation work is complete.
- Acceptance criteria are checked.
- Relevant validation is run or explicitly documented as not applicable.
- `planning/STATE.md` is updated.
- Durable decisions are added to `planning/DECISIONS.md`.
- New risks or questions are recorded.
