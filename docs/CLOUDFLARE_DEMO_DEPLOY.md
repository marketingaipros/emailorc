# Cloudflare Demo/Test Deployment

This repo is a Next.js 14 App Router app. The demo/test Cloudflare target is Cloudflare Workers through the OpenNext Cloudflare adapter, with D1 for demo/test persistence.

## Current App Shape

- Framework: Next.js 14, React 18, TypeScript, Tailwind.
- Local database: Prisma with SQLite at `prisma/dev.db`.
- Cloudflare database: D1 binding named `DB`, with SQL migrations in `d1/migrations`.
- Auth: custom `/api/auth/login`; demo session data is stored in browser `localStorage`.
- API routes: Next App Router route handlers under `app/api`.
- Build command: local Next build is `npm run build`; Cloudflare build is `npm run build:cloudflare`.
- Cloudflare output: `.open-next/worker.js` plus `.open-next/assets`.

## Required Secrets

Do not commit real secrets. Use `.dev.vars` locally and Wrangler secrets remotely.

Local:

```bash
cp .dev.vars.example .dev.vars
```

Remote demo/test-live:

```bash
npx wrangler secret put OPENROUTER_API_KEY --env demo
npx wrangler secret put AUTH_SECRET --env demo
npx wrangler secret put OPENROUTER_API_KEY --env test-live
npx wrangler secret put AUTH_SECRET --env test-live
```

## D1 Setup

Create the demo/test-live databases, then paste the returned database IDs into `wrangler.jsonc`.

```bash
npx wrangler d1 create emailorc-demo-db
npx wrangler d1 create emailorc-test-live-db
```

Apply migrations and seed data:

```bash
npm run db:migrate:demo
npm run db:seed:demo
npm run db:migrate:test-live
npm run db:seed:test-live
```

Local D1 preview:

```bash
npm run db:migrate
npm run db:seed
npm run preview
```

## Deploy

Demo:

```bash
npm run deploy:demo
```

Test Live:

```bash
npm run deploy:test-live
```

## Demo Logins

- Super Admin: `admin@demo.com` / `DemoAdmin123!`
- Client Admin: `client@demo.com` / `DemoClient123!`
- Editor: `editor@demo.com` / `DemoEditor123!`
- Reviewer: `reviewer@demo.com` / `DemoReviewer123!`
- Viewer: `viewer@demo.com` / `DemoViewer123!`

## Test Live Safety

Test Live must keep:

- Auto-send OFF
- Human approval ON
- CRM integrations OFF
- Email integrations OFF
- OpenRouter key server-side only

## Known Issues Before Production

- The Cloudflare adapter version compatible with this repo's `next@14.2.5` is deprecated. Upgrade Next and OpenNext before production.
- Current auth remains MVP-style localStorage session data. Add signed cookies/JWT before production.
- Upload/draft persistence is partially client-side MVP flow. D1 schema is ready, but full upload-to-D1 persistence needs the next backend pass.
- R2 is not configured yet because CSV/XLSX storage is optional for demo.
