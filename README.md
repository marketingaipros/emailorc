# VRF Campaign Orchestrator

## 120x Project Operating Docs

This repo uses the 120x Architect / Builder workflow.

Start here:

- `AGENTS.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`

Current status: MVP/demo-stage. Do not treat as production-ready until a production readiness sprint validates auth, data, deployment, integrations, and sending behavior.

Known documentation issue: the setup notes below may be stale and need a future documentation cleanup sprint.

## Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL

## Setup
1. npm install
2. cp .env.example .env
3. npx prisma db push
4. npx prisma db seed --schema prisma/schema.prisma
5. npm run dev
