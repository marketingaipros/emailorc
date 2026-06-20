# EmailORC Playwright QA Runbook

## Safe non-mutating browser gate

Use this command for the current Sprint 006 browser validation gate:

```bash
npm run test:e2e:safe
```

This command runs only `tests/e2e/non-mutating-smoke.spec.ts`.

The safe gate is intentionally limited to:

- Rendering the public login surface.
- Confirming unauthenticated protected routes redirect to `/login`.
- Failing if the browser issues `POST`, `PUT`, `PATCH`, or `DELETE` requests during those checks.

It does not log in, create users, upload CSV files, generate drafts, approve drafts, move Campaign Board cards, export records, change environment settings, save API keys, seed data, send email, or touch live integrations.

## Run the browser QA suite

```bash
npm install
npx prisma db seed --schema prisma/schema.prisma
npm run test:e2e
```

Playwright starts the Next.js dev server from `playwright.config.ts`.

The broad `npm run test:e2e` suite is not the safe gate. It includes mutating coverage and should not be used for unattended sprint validation until those tests are isolated or rewritten.

## Reports and artifacts

- HTML report: `playwright-report/index.html`
- JSON results: `test-results/e2e-results.json`
- Failure screenshots, videos, and traces: `test-results/`
- Open report locally: `npm run test:e2e:report`

## Fixtures

- Super Admin: `admin@demo.com` / `DemoAdmin123!`
- Client Admin: `client@demo.com` / `DemoClient123!`
- CSV fixture: `tests/fixtures/contacts-3-records.csv`

The CSV includes one valid contact, one missing-email contact, and one do-not-contact contact.

## Current Playwright coverage classification

| Coverage | Classification | Reason |
|---|---|---|
| `tests/e2e/non-mutating-smoke.spec.ts` | Safe/read-only | Navigates public and unauthenticated protected routes only; asserts no mutating HTTP methods are issued. |
| `tests/e2e/emailorc.spec.ts` route/login rendering checks | Mixed/unknown inside broad suite | Some checks are read-only, but they live in a spec file that also contains mutating tests and should not be run as the safe gate. |
| `tests/e2e/emailorc.spec.ts` admin provisioning/edit test | Mutating | Creates and edits users through `/api/admin/users`. |
| `tests/e2e/emailorc.spec.ts` environment settings test | Mutating | Changes environment mode/configuration. |
| `tests/e2e/emailorc.spec.ts` OpenRouter/API key and model settings test | Mutating/live-adjacent | Tests provider connection and saves an API key/model state. |
| `tests/e2e/emailorc.spec.ts` CSV upload/generate drafts test | Mutating | Uploads fixture data and generates drafts. |
| `tests/e2e/emailorc.spec.ts` draft QA approval test | Mutating | Regenerates and approves draft state. |
| `tests/e2e/emailorc.spec.ts` reply approval test | Mutating | Analyzes and approves a reply workflow. |
| `tests/e2e/emailorc.spec.ts` Campaign Board movement test | Mutating | Moves a campaign card between columns. |
| `tests/e2e/emailorc.spec.ts` Export Center test | Mutating | Marks exports as downloaded. |
