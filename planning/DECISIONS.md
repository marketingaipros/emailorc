# Decisions

Record durable decisions future sprints must respect.

---

## Decision Log

| Date | Decision | Reason | Impact |
|---|---|---|---|
| 2026-06-19 | Sprint 052 creates Outlook drafts only, never sends email. | The product remains human-in-the-loop and test-first. | No `Mail.Send` scope, no Microsoft Graph send endpoint, and no automatic sending behavior may be added. |
| 2026-06-19 | Sprint 052 uses delegated per-user Microsoft Graph access. | The initial use case is a user creating drafts in their own connected mailbox. | Do not use application permissions, shared mailbox access, or tenant-wide mailbox access in this sprint. |
| 2026-06-19 | Sprint 052 starts with one dedicated test Outlook mailbox. | Limits risk and simplifies validation. | Production or multi-user mailbox rollout needs a later approved sprint. |
| 2026-06-19 | Microsoft Copilot is excluded from Sprint 052. | Outlook draft creation must work and be validated before adding a second Microsoft integration. | Copilot requires a separate Architect Pack after Outlook acceptance. |
| 2026-06-19 | OAuth and Microsoft connection material must remain server-side and encrypted at rest. | Refresh tokens and client secrets are sensitive credentials. | Tokens must never be returned to the browser, committed, logged, or placed in audit metadata. |
| 2026-06-19 | Migration numbering must be derived from the actual repository. | The earlier Codex proposal incorrectly suggested `0010_microsoft_outlook_drafts.sql`, while prior work already used `0010_app_sessions.sql`. | Inspect migrations before creating any new migration file. |
| 2026-06-20 | Sprint 052 persists Microsoft OAuth state, encrypted connection material, and Outlook draft delivery tracking in a dedicated next-numbered D1 migration text file. | Outlook OAuth needs user-bound state, token refresh metadata, and idempotent draft delivery records without reusing provider-key storage. | `0011_microsoft_outlook_drafts.sql` must not be treated as applied until a separate approved D1 step runs it. |
| 2026-05-21 | Sprint 015 will harden only Brain / provider API organization permission guards. | Sprint 014 completed workflow/draft guard hardening; Brain/provider routes are the next focused organization-scoped route group. | Codex must not expand into billing, usage, account, middleware, page guards, localStorage cleanup, or production-readiness work. |
| 2026-05-21 | Brain / provider API authorization must derive organization and user context from the server-authenticated current-user helper. | Sprint 010 found request-controlled identity values were production blockers. | Brain/provider routes must not trust client-provided organization/user/role/provider/actor values for authorization. |
| 2026-05-21 | Brain / provider guards should return `401` for unauthenticated requests and `403` for authenticated users who are not authorized for the requested organization-scoped resource. | Clear auth failure semantics make future route hardening and tests consistent. | Tests should assert missing session, wrong-organization/forbidden, authorized behavior, and fail-closed behavior. |
| 2026-05-21 | Sprint 015 must not apply or modify the Sprint 012 D1 session migration. | Migration execution is a separate database operation and was intentionally deferred. | Codex must not run migrations, seed commands, D1 writes, Prisma commands, or deployment commands. |
