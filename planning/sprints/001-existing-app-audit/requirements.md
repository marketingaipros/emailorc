# Sprint 001 Requirements - Existing App Audit & Operating Pack

## Goal

Apply the 120x Architect / Builder operating structure to the existing EmailORC repo and document the current app state before any new implementation work.

## Business Objective

Make future Codex work safer by ensuring the repo has:

- Current project state
- Durable decisions
- Domain context
- Known risks
- Open questions
- File inventory
- Architecture notes
- API notes
- Data model notes
- Validation plan
- Sprint-specific requirements, blueprint, acceptance criteria, and handoff prompt

## In Scope

- Create 120x planning files.
- Create/update durable docs.
- Create Sprint 001 folder and files.
- Update README only with safe links/status if appropriate.
- Document existing app structure and known behavior based on the audit.

## Out of Scope

- New app features.
- Refactoring.
- Bug fixes.
- Auth changes.
- Sending changes.
- Integration changes.
- Database changes.
- Migration changes.
- Deployment changes.
- Env file changes.
- Secret inspection or exposure.

## Known Existing App Context

EmailORC appears to include:

- CSV/account/contact import
- Record validation
- Draft generation/management
- Draft review and approval
- Approved draft export
- Admin/user/org/plan management
- Brain Center settings and logs
- Demo/test-live/production environment modes

## Business Rules

- Treat EmailORC as MVP/demo-stage until future validation proves otherwise.
- Auto-send remains disabled.
- Human approval remains required.
- Live integrations remain disabled.
- Do-not-contact records must not appear in approved export.
- Secrets must not be exposed.

## Edge Cases

- Existing README may be stale.
- `prisma/dev.db` is modified locally.
- Prisma SQLite and D1 may not match.
- Existing `bootstrap-emailorc.sh` may contain old assumptions.
- Known bugs may affect demo stability.
