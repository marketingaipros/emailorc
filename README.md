# VRF Campaign Orchestrator

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
