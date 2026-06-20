# Sprint 007 Blueprint — Non-Interactive Lint Validation Gate

## Objective

Implement one focused validation improvement:

1. Make lint run non-interactively as an unattended validation gate.

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
- `planning/sprints/006-playwright-non-mutating-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/requirements.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/blueprint.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/handoff-prompt.md`

## Existing Files to Inspect

Codex should inspect and confirm actual file names before editing.

Likely areas:

- `package.json`
- `next.config.*`
- `.eslintrc*`
- `eslint.config.*`
- `tsconfig.json`
- `.eslintignore`, if present
- `.gitignore`
- existing docs or runbooks under `docs/` and `tests/`
- source files only if lint failures require narrow fixes

Do not assume exact paths without checking the repo.

## Files to Create

- `planning/sprints/007-non-interactive-lint-validation-gate/requirements.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/blueprint.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/acceptance.md`
- `planning/sprints/007-non-interactive-lint-validation-gate/handoff-prompt.md`

## Files to Modify

Expected categories:

- `package.json`, only if a script change is needed
- ESLint/Next lint config files, only if needed
- Minimal source files, only if lint errors are narrow and safe to fix
- `docs/VALIDATION.md`
- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/DECISIONS.md`, only if durable decisions were made

## Implementation Plan

### Step 1 — Confirm baseline

1. Run:

   ```bash
   git status --short
   ```

2. Confirm `prisma/dev.db` is already dirty but not intentionally touched.
3. Inspect `package.json` scripts.
4. Inspect current lint-related files.
5. Inspect Sprint 006 validation docs to identify the safe Playwright command.

### Step 2 — Diagnose lint interactivity

Determine why lint prompts interactively:

- Missing ESLint config.
- Next.js lint command wants to scaffold config.
- Script uses `next lint` with no existing setup.
- Installed packages/config are mismatched.
- Existing lint files are missing or incomplete.

Document the actual cause in the final report.

### Step 3 — Design the smallest safe lint gate

Prefer one of these approaches, based on the existing repo:

1. Add a minimal ESLint config compatible with the current Next.js version.
2. Update the lint script to use a non-interactive command that respects existing config.
3. Add a clearly named script if preserving `npm run lint` is risky, such as:
   - `lint:safe`
   - `lint:check`
   - `validate:lint`

Default preference:

- Keep or make `npm run lint` the standard unattended command if practical.
- Avoid broad rule customizations.
- Avoid style opinions beyond what the app already uses.

### Step 4 — Implement minimal lint changes

1. Add or update only the minimum lint config/script files needed.
2. Run the lint command.
3. If lint surfaces small, obvious issues, fix them narrowly.
4. If lint surfaces broad existing issues, stop and document them instead of creating a large cleanup diff.
5. Do not change app behavior to satisfy lint unless the change is safe, obvious, and covered by validation.

### Step 5 — Validate

Run:

```bash
npm run test
npm run build
```

Run the Sprint 006 non-mutating Playwright command if available and documented.

Run the new non-interactive lint command after confirming it will not prompt.

Do not require or run:

```bash
npm run test:e2e
npm run test:e2e:report
```

unless those commands are already documented by Sprint 006 as non-mutating and safe.

### Step 6 — Update docs/state

Update:

- `planning/STATE.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/VALIDATION.md`
- `planning/DECISIONS.md`, only if durable decisions were made

Recommend Sprint 008 based on remaining risks.

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

Required after made non-interactive:

```bash
npm run lint
```

If Codex creates a different safe lint command, document it and run it.

Optional if documented by Sprint 006:

```bash
npm run test:e2e:safe
```

The exact Sprint 006 safe script name may differ.

Skipped unless separately approved:

```bash
npm run test:e2e
npm run test:e2e:report
```

## Report Format

After implementation, Codex should report:

1. Files changed.
2. Why lint was interactive.
3. What lint config/script change was made.
4. The final non-interactive lint command.
5. Any lint issues fixed.
6. Any lint issues deferred and why.
7. Commands run and results.
8. Commands skipped and why.
9. Acceptance criteria complete/incomplete.
10. Any risks introduced.
11. Recommended Sprint 008.
