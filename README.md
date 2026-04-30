# VRF Campaign Orchestrator

Production-ready Next.js + Prisma SaaS starter for orchestrating renewal email campaigns with multi-agent workflow (ORC, SENTINEL, SCRIBE, LEXI).

## Setup
1. `npm install`
2. Copy `.env.example` to `.env`
3. `npx prisma db push`
4. `npx prisma db seed --schema prisma/schema.prisma`
5. `npm run dev`

## Architecture
- Next.js App Router frontend and API routes
- Prisma + PostgreSQL data model
- Provider abstraction for AI vendors
- Deterministic row validation before generation
- Export guardrail enforces QA >= 9

## Key folders
- `app/` pages and API endpoints
- `src/services/campaign-orchestrator.ts` ORC→SENTINEL→SCRIBE→LEXI workflow
- `src/prompts/templates.ts` server-side prompts
- `src/utils/validation.ts` deterministic validation/classification
- `prisma/schema.prisma` data model
- `tests/validation.test.ts` core logic tests
