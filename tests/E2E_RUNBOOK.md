# EmailORC Playwright QA Runbook

## Run the browser QA suite

```bash
npm install
npx prisma db seed --schema prisma/schema.prisma
npm run test:e2e
```

Playwright starts the Next.js dev server from `playwright.config.ts`.

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

