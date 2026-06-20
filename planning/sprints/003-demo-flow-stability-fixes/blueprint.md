# Sprint 003 Blueprint - Demo Flow Stability Fixes

## Objective

Implement two focused P1 fixes:

1. Restrict `/mvp/admin` to Super Admin only.
2. Block draft approval below QA score 90.

## Files to Read First

- `AGENTS.md`
- `CODEX.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATA_MODEL.md`
- `docs/VALIDATION.md`
- `planning/sprints/002-stability-validation-and-bug-prioritization/validation-report.md`
- `planning/sprints/003-demo-flow-stability-fixes/requirements.md`
- `planning/sprints/003-demo-flow-stability-fixes/blueprint.md`
- `planning/sprints/003-demo-flow-stability-fixes/acceptance.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before editing.

Likely areas:

- `app/mvp/admin/`
- `app/mvp/admin/page.tsx`
- admin layout or guard components, if present
- auth/session utilities under `src/`, `app/api/auth/`, or related helpers
- `app/api/drafts/approve/route.ts`
- draft review UI under `app/mvp/drafts/`, `app/mvp/`, or related components
- draft types or validators under `src/`
- existing unit tests under `tests/`

Do not assume exact paths without checking the repo.

## Files to Create

- `planning/sprints/003-demo-flow-stability-fixes/requirements.md`
- `planning/sprints/003-demo-flow-stability-fixes/blueprint.md`
- `planning/sprints/003-demo-flow-stability-fixes/acceptance.md`
- `planning/sprints/003-demo-flow-stability-fixes/handoff-prompt.md`

## Files to Modify

Expected categories:

- Admin access guard file(s)
- Draft approval route/action file(s)
- Draft approval UI file(s), only if needed to align user-facing behavior
- Focused tests for admin access and QA approval guardrail
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DECISIONS.md`, only if durable decisions are made

## Implementation Plan

### Step 1 - Confirm baseline

1. Run:

   ```bash
   git status --short
   ```

2. Confirm `prisma/dev.db` is not intentionally touched.
3. Inspect Sprint 002 validation report.
4. Inspect relevant admin and draft approval files.
5. Summarize planned file edits before making changes.

### Step 2 - Fix `/mvp/admin` access

1. Identify how the app currently represents roles.
2. Identify the existing role names or flags for Super Admin and Client Admin.
3. Follow existing auth/session patterns.
4. Add a guard so `/mvp/admin` allows only Super Admin.
5. Client Admin should be redirected or denied using the existing app pattern.
6. Do not create a new broad permission system.

### Step 3 - Fix draft approval below QA 90

1. Identify the authoritative approval path.
2. Enforce QA score >= 90 in that path.
3. Return a clear error/status when approval is blocked.
4. Keep successful approval behavior unchanged for QA score >= 90.
5. Add UI disabling or warning only if practical and consistent with current UI.
6. Do not rely on UI-only enforcement.

### Step 4 - Add focused tests

Add or update tests where practical for:

- Super Admin can access admin path or admin guard allows Super Admin.
- Client Admin is blocked from admin path or admin guard denies Client Admin.
- Draft with QA score below 90 cannot be approved.
- Draft with QA score 90 or above can be approved.

If route-level tests are hard due to existing test structure, add focused utility tests around extracted guard/approval logic, but keep code changes minimal.

### Step 5 - Validate

Run:

```bash
npm run test
npm run build
```

Do not require:

```bash
npm run lint
npm run test:e2e
```

Reason:

- Lint is currently interactive.
- E2E currently mutates app/admin/user/environment state.

### Step 6 - Update docs/state

Update:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- `planning/DECISIONS.md`, only if durable decisions were made

Recommend Sprint 004 based on remaining P2/P3 items.

## Forbidden Changes

Do not modify:

- `prisma/dev.db`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `d1/`
- `.env`
- `.env.example`
- `.dev.vars`
- `.dev.vars.example`
- `wrangler.jsonc`
- deployment config
- unrelated app features

Do not run:

- deploy commands
- migrations
- seed commands
- commands requiring live credentials
- commands that send email
- commands that enable integrations

## Validation Commands

Required:

```bash
git status --short
npm run test
npm run build
```

Optional:

- Targeted unit tests if the repo supports running a single test file safely.

Skipped unless separately approved:

```bash
npm run lint
npm run test:e2e
npm run test:e2e:report
```

## Report Format

After implementation, Codex should report:

1. Files changed.
2. Admin access behavior before/after.
3. Draft QA approval behavior before/after.
4. Tests added/updated.
5. Commands run and results.
6. Commands skipped and why.
7. Acceptance criteria complete/incomplete.
8. Any risks introduced.
9. Recommended Sprint 004.
