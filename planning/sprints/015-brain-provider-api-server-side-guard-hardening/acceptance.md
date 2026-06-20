# Sprint 015 Acceptance — Brain / Provider API Server-Side Guard Hardening

Sprint 015 is complete only when all applicable criteria below are satisfied.

## Scope Acceptance

- [x] Exact Brain/provider route list was inspected and documented.
- [x] Exact approved Sprint 015 route list was documented before implementation.
- [x] Implementation stayed limited to approved Brain/provider API routes, optional small helper, focused tests, and closeout docs/planning.
- [x] No billing/usage/account APIs were modified.
- [x] No workflow/draft APIs were modified except documentation references.
- [x] No admin APIs were modified except documentation references.
- [x] No middleware, page guard, or localStorage cleanup was implemented.
- [x] No schema, migration, seed, env, deployment, Prisma, D1, Wrangler, sending, or live integration work occurred.
- [x] `prisma/dev.db` was not intentionally touched.

## Behavior Acceptance

- [x] Approved Brain/provider routes use the Sprint 012 server current-user/session helper.
- [x] Missing/invalid server session returns `401`.
- [x] Authenticated wrong-organization access returns `403` where an organization scope is requested or required.
- [x] Authorized current-user requests reach existing successful route behavior where practical.
- [x] Request-supplied organization/user/role/provider/actor values are not trusted for authorization.
- [x] Request-supplied organization values, if accepted, are treated only as requested scope compared to `currentUser.organizationId`.
- [x] `currentUser.userId` is used for touched actor/user metadata where routes write it.
- [x] Provider/model values remain resource/configuration inputs, not authorization truth.
- [x] Unknown sensitive roles fail closed where relevant.
- [x] Provider keys and secret values are not exposed in logs, docs, tests, or responses.

## Test Acceptance

- [x] Focused tests cover unauthenticated `401` behavior.
- [x] Focused tests cover wrong-organization or forbidden `403` behavior.
- [x] Focused tests cover authorized successful behavior where practical.
- [x] Focused tests cover request-supplied identity not being trusted for authorization.
- [x] Focused tests cover fail-closed behavior where relevant.
- [x] Tests do not require live credentials or expose secret values.

## Documentation Acceptance

- [x] `planning/STATE.md` reflects Sprint 015 completion status after implementation.
- [x] `planning/RISKS.md` reflects any new or reduced Brain/provider guard risks.
- [x] `planning/QUESTIONS.md` captures remaining open questions.
- [x] `docs/AUTH_SESSION.md` reflects Brain/provider guard status.
- [x] `docs/API.md` documents approved Brain/provider route guard behavior.
- [x] `docs/ARCHITECTURE.md` reflects updated auth/API guard architecture.
- [x] `docs/VALIDATION.md` reflects Sprint 015 validation coverage and commands.
- [x] `planning/DECISIONS.md` is updated only if a new durable decision was made.

## Validation Acceptance

- [x] `git status --short` was run before and after.
- [x] `npm run test` passed.
- [x] `npm run lint` passed or existing known warnings were documented.
- [x] `npm run test:e2e:safe` passed.
- [x] `npm run build` passed or any failure was clearly documented with cause and follow-up.
- [x] No migration, seed, Prisma, D1 write, Wrangler/deploy, env, secret-requiring, sending, or live integration command was run.

## Sprint 015 Route Classification

Guarded:

- `app/api/brain/api-key/route.ts`
- `app/api/brain/save-openrouter-key/route.ts`
- `app/api/brain/embed/route.ts`
- `app/api/brain/knowledge-search/route.ts`
- `app/api/brain/learning-log/route.ts`
- `app/api/brain/model-settings/route.ts`
- `app/api/brain/models/route.ts`
- `app/api/brain/regenerate-email/route.ts`
- `app/api/brain/test-chat/route.ts`
- `app/api/brain/test-connection/route.ts`
- `app/api/brain/test-embedding/route.ts`

Left out:

- `app/api/brain/extract-knowledge/route.ts` because the current route only performs local text extraction/classification and does not read/write organization-scoped storage, provider keys, Brain settings, usage logs, audit logs, or request identity.

## Completion Report Acceptance

Completion report must include:

1. Exact routes inspected.
2. Exact routes modified.
3. How each modified route derives authorization from server current-user context.
4. Which request-supplied identity/config fields are no longer trusted for authorization.
5. Tests added or updated.
6. Validation results.
7. Files changed.
8. Any incomplete acceptance criteria or follow-up work.
9. Confirmation that protected files/areas were not touched.
