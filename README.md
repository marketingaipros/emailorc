# VRF Campaign Orchestrator

Production-ready Next.js + Prisma SaaS starter for orchestrating renewal email campaigns with multi-agent workflow (ORC, SENTINEL, SCRIBE, LEXI).

## Prerequisites
- Node.js 20 LTS (recommended)
- npm 10+
- PostgreSQL 15+ (or managed Postgres)

> If `npm` is not installed, install Node.js first (npm ships with Node.js).

## Setup
1. Confirm tool versions:
   - `node -v`
   - `npm -v`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Apply schema: `npx prisma db push`
5. Seed demo data: `npx prisma db seed --schema prisma/schema.prisma`
6. Run locally: `npm run dev`

## Build & Versioning
- Build command: `npm run build`
- App semantic version is stored in `package.json` under `version`.
- Recommended release flow:
  1. bump version (`npm version patch|minor|major`)
  2. build (`npm run build`)
  3. deploy

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
