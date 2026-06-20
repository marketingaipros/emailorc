# File Inventory

| File / Folder | Source | Purpose | Sensitive? | Status | Notes |
|---|---|---|---|---|---|
| `app/` | Existing repo | Next.js App Router pages and app routes | No | Existing | Inspect before UI/API changes. |
| `app/api/` | Existing repo | Backend route handlers | Possible | Existing | Includes auth, workflow, admin, billing, brain, usage, account intelligence. |
| `app/mvp/` | Existing repo | MVP UI screens | No | Existing | Upload, records, drafts, campaigns, export, admin, integrations, reply, brain center, settings. |
| `src/` | Existing repo | Shared components, services, types, validation, prompts | No | Existing | Includes campaign orchestration, prompts, OpenRouter/embedding logic. |
| `prisma/schema.prisma` | Existing repo | Local Prisma schema | No | Existing | Uses SQLite per audit. |
| `prisma/dev.db` | Existing repo | Local development database | Yes | Modified local file | Do not edit or commit without explicit review. |
| `d1/` | Existing repo | Cloudflare D1 migrations and seed data | Possible | Existing | Needs reconciliation with Prisma schema. |
| `tests/` | Existing repo | Vitest/Playwright/QA docs | No | Existing | Contains bug summary and E2E runbook. |
| `tests/BUG_SUMMARY.md` | Existing repo | Known bug documentation | No | Existing | Should feed Sprint 002 planning. |
| `docs/CLOUDFLARE_DEMO_DEPLOY.md` | Existing repo | Existing deployment notes | No | Existing | Need review before deploy work. |
| `.env.example` | Existing repo | Env variable example | Possible | Existing | Audit reports possible PostgreSQL/SQLite mismatch. |
| `.dev.vars.example` | Existing repo | Cloudflare/local vars example | Possible | Existing | Do not store secrets. |
| `wrangler.jsonc` | Existing repo | Cloudflare config | Possible | Existing | Includes environment mode variables and bindings. |
| `bootstrap-emailorc.sh` | Existing repo | Older/generated scaffold content | No | Existing | Inventory carefully; do not treat as current source of truth. |
