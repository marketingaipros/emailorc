# Sprint 053 Handoff Prompt - Local Auth, Role Clarity, and Admin Save Fix

Read and apply the Architect Pack:

```text
architect-packs/EmailORC-Architect-Pack-053-Local-Auth-Role-Admin-Fix.md
```

Then read:

- `AGENTS.md`
- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `docs/AUTH_SESSION.md`
- `docs/API.md`
- `docs/VALIDATION.md`
- Sprint 052 files
- Sprint 053 `requirements.md`
- Sprint 053 `blueprint.md`
- Sprint 053 `acceptance.md`
- current login/session/current-user/admin/role files
- `architect-packs/EmailORC-Architect-Pack-053A-Local-Bootstrap-and-Admin-Guard-Hardening.md`

Do not implement until the owner approves the summary.

Before implementation, summarize:

1. The root-cause hypotheses for the local `Authentication required.` response.
2. Whether the cause is likely login/session/cookie/Wrangler/D1/user bootstrap/role authorization.
3. The exact files expected to change.
4. The exact current role values and role-save path.
5. The smallest safe fix plan.
6. Tests and manual validation steps.
7. The 053-A local-only bootstrap rule and Super Admin protection rules.

Hard limits:

- Do not modify `.dev.vars`.
- Do not print or inspect secret values.
- Do not touch `prisma/dev.db`.
- Do not run migrations, deploy, connect Microsoft, or test Outlook.
- Do not change Sprint 052 OAuth scopes, Graph endpoint, token encryption, or migration unless root cause proves a direct compatibility defect.
- Do not mark Sprint 052 PASS.

053-A amendment:

- Make demo Super Admin bootstrap local-only, not merely `APP_ENV=demo`.
- Block bootstrap in remote D1, preview deployments, production, test-live, and uncertain runtime.
- Prevent final Super Admin self-demotion, self-deactivation, and self-archive.
- Explicitly enforce same-org/cross-org update policy.
- Keep assignable roles canonical: `super_admin`, `client_admin`, `editor`, `reviewer`, `viewer`.
