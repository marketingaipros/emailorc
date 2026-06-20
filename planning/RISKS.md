# Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Codex may be operating in the wrong repo or incomplete checkout. | Medium | High | Mandatory preflight verifies root files, branch, repo path, and current planning docs before implementation. | Active |
| OAuth tokens or client secrets could be exposed. | Medium | High | Server-side storage only; encryption at rest; redacted logs/audits; no browser token access. | Active |
| Outlook action could accidentally send email. | Low | High | No `Mail.Send` scope; allowlist only `POST /me/messages`; tests must prove no send endpoint is invoked. | Active |
| Unapproved EmailORC drafts could be pushed to Outlook. | Medium | High | Recheck approval and authorization server-side in the Outlook draft route. | Active |
| Personal Microsoft account consent or tenant policy may block testing. | Medium | Medium | Confirm supported account type, redirect URI, delegated permissions, and test-mailbox access before coding. | Open |
| Token refresh or storage may require schema support. | Medium | Medium | Inspect existing D1 tables/migrations first; add a minimal next-numbered migration only if required. | Open |
| Sprint 052 migration text is mistaken for an applied D1 migration. | Medium | High | Keep `0011_microsoft_outlook_drafts.sql` documented as migration text only until an approved D1 step applies it. | Active |
| Existing session migration remains unapplied in D1. | High | Medium | Do not apply migrations in Sprint 052; document whether the connection flow can be tested locally without it. | Open |
| Local session cookies may behave differently under Wrangler preview than under another local runtime. | Medium | Medium | Sprint 053 changed Secure cookie behavior to follow request protocol and validated login/connect under local Wrangler. | Closed |
| The initial local user may be in the wrong organization or lack a usable membership/role. | Medium | High | Sprint 053 added demo-only Super Admin bootstrap when the documented local Super Admin is absent. | Closed |
| Super Admin role-save failure could be a guard, UI payload mismatch, or missing D1 state. | Medium | Medium | Sprint 053 validated same-org role update and canonical `client_admin` persistence. | Closed |
| Role fixes could weaken cross-organization protection. | Low | High | Sprint 053-A rejects cross-org admin user updates and keeps same-org authorization tests. | Closed |
| A Microsoft OAuth redirect/configuration error is mistaken for an EmailORC session error. | Medium | Medium | Sprint 053 acceptance distinguishes valid-session reachability from actual Microsoft OAuth UAT. | Active |
| Demo Super Admin bootstrap runs against remote/deployed demo D1. | Medium | High | Sprint 053-A requires `APP_ENV=demo` and a local request host; non-local hosts default blocked. Remote D1 was not touched. | Monitoring |
| Final Super Admin access is removed by self-demotion, deactivation, or archive. | Medium | High | Sprint 053-A blocks final active Super Admin demotion, deactivation, and archive/delete paths. | Closed |
| Admin user update crosses organization boundaries unintentionally. | Medium | High | Sprint 053-A enforces current-organization membership lookup and rejects cross-org create/update attempts. | Closed |
| Outlook work could expand into Copilot or CRM work. | Medium | Medium | Keep Copilot, Salesforce, ColdFusion, and CRM scope explicitly excluded. | Active |
| App is mistaken for production-ready after Brain/provider guard work. | Medium | High | Continue documenting EmailORC as MVP/demo-stage until full production readiness is validated. | Open |
| Sprint 015 expands into broad auth hardening. | Medium | High | Scope stayed limited to approved Brain/provider API routes, a small Brain auth helper, focused tests, and closeout docs/planning. | Closed |
| Brain/provider API routes continue trusting request-supplied identity. | Medium | High | Touched routes now use Sprint 012 current-user helper and organization-scoped checks. | Closed |
| Provider/model settings expose or mutate organization-sensitive configuration without server authorization. | Medium | High | Approved provider/model/Brain Center endpoints now require server-authenticated organization-scoped access. | Closed |
| Secrets or provider keys are exposed during implementation or tests. | Medium | High | Auth failures use generic responses; tests avoid live credentials and assert secret-safe failure payloads. | Monitoring |
| Organization scoping is inconsistent across Brain/provider routes. | Medium | High | Approved routes use the shared Brain organization authorization helper. | Closed |
| Some Brain-like routes live outside obvious Brain/provider paths. | Medium | Medium | Candidate route discovery found only `app/api/brain/*`; broader API inventory remains future work. | Monitoring |
| New guards break existing demo Brain Center flows. | Medium | Medium | Focused tests cover authorized local behavior; full Brain Center browser coverage remains future work. | Monitoring |
| Session migration remains unapplied in D1 environments. | High | Medium | Keep visible as a blocker for D1-backed login sessions; do not apply migration in Sprint 015. | Open |
| Billing/usage/account APIs remain unprotected after Sprint 015. | Medium | High | Carry as known risk for future focused guard sprint. | Open |
| Middleware/page guards remain client-heavy after Sprint 015. | High | Medium | Carry as known risk for a later page/middleware/localStorage cleanup sprint. | Open |
| Dirty worktree causes accidental unrelated changes. | Medium | Medium | `git status --short` was checked before and after; unrelated pre-existing files were preserved. | Monitoring |
| `prisma/dev.db` is touched or committed accidentally. | Medium | Medium | Do not run mutating database/Prisma commands; do not touch `prisma/dev.db`. | Active |
| Auto-send or live integrations are enabled accidentally. | Low | High | Keep auto-send and live integrations disabled. | Open |
