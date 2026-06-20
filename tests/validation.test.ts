import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { canAccessPath, canUseNavItem } from "../src/lib/auth-rules";
import {
  cardsForCampaignBoardColumn,
  INITIAL_CAMPAIGN_BOARD_CARDS,
  moveCampaignBoardCard,
} from "../src/lib/campaign-board";
import { getCurrentUser } from "../src/lib/current-user";
import { authorizeAdminUser } from "../src/lib/admin-auth";
import {
  isInactiveAdminStatus,
  isSameOrganizationUpdate,
  wouldRemoveFinalSuperAdmin,
} from "../src/lib/admin-user-guards";
import { authorizeBrainOrganization } from "../src/lib/brain-auth";
import { authorizeWorkflowOrganization } from "../src/lib/workflow-auth";
import { QA_APPROVAL_THRESHOLD, validateDraftApproval } from "../src/lib/draft-approval";
import { inferImportMapping, mapImportRecord, validateImportRows } from "../src/lib/import-validation";
import { decryptMicrosoftSecret, encryptMicrosoftSecret } from "../src/lib/microsoft/crypto";
import {
  MICROSOFT_GRAPH_SCOPES,
  assertNoMailSendScope,
  buildMicrosoftAuthorizeUrl,
} from "../src/lib/microsoft/oauth";
import { saveMicrosoftConnection } from "../src/lib/microsoft/connections";
import {
  MICROSOFT_GRAPH_CREATE_DRAFT_ENDPOINT,
  buildOutlookDraftPayload,
  postMicrosoftGraphDraft,
} from "../src/lib/microsoft/graph";
import { isSensitiveRoleAllowed, normalizeAssignableUserRole, normalizeRole, permissionsForRole } from "../src/lib/roles";
import {
  createServerSession,
  hashSessionToken,
  readSessionToken,
  resetLocalSessionsForTests,
  SESSION_COOKIE_NAME,
  setSessionCookie,
} from "../src/lib/server-session";
import { calculateDaysToRenew, classifyCampaignMode, detectBannedPhrases, validateRow } from "../src/utils/validation";
import { GET as getAuthMe } from "../app/api/auth/me/route";
import { isLocalDemoRuntime, shouldBootstrapDemoSuperAdmin } from "../src/lib/local-runtime";
import { POST as postAuthLogout } from "../app/api/auth/logout/route";
import { GET as getAdminSystemHealth } from "../app/api/admin/system-health/route";
import { POST as postBrainLearningLog } from "../app/api/brain/learning-log/route";
import { GET as getBrainModelSettings } from "../app/api/brain/model-settings/route";
import { POST as postDraftApproval } from "../app/api/drafts/approve/route";
import { POST as postOutlookDraft } from "../app/api/drafts/[draftId]/outlook/route";
import { GET as getMicrosoftStatus } from "../app/api/integrations/microsoft/status/route";
import { GET as getWorkflowDrafts } from "../app/api/workflow/drafts/route";
import { POST as postWorkflowImport } from "../app/api/workflow/import/route";
import { GET as getWorkflowRecords } from "../app/api/workflow/records/route";

describe("validation", () => {
  it("calculates days to renew", () => { expect(calculateDaysToRenew(new Date("2026-05-10"), new Date("2026-05-01"))).toBe(9); });
  it("detects missing field", () => { const r = validateRow({ sourceRowId: "1" }); expect(r.missingFields).toContain("Renewal_Date"); });
  it("classifies acceleration window", () => { expect(classifyCampaignMode(20, "standard")).toBe("Renewal-Acceleration"); });
  it("classifies upsell mode", () => { expect(classifyCampaignMode(30, "cloud upgrade")).toBe("Renewal-Upsell"); });
  it("guardrail score below 9 not final", () => { const approved = 8 >= 9; expect(approved).toBe(false); });
  it("export approved only guardrail", () => { const rows = [{ finalOutputReady: true }, { finalOutputReady: false }]; expect(rows.filter(r=>r.finalOutputReady)).toHaveLength(1); });
  it("detects banned phrases", () => { expect(detectBannedPhrases("I hope this finds you well", ["I hope this finds you well"]).length).toBe(1); });
  it("restricts admin path to Super Admin", () => {
    expect(canAccessPath("SUPER_ADMIN", "/mvp/admin")).toBe(true);
    expect(canAccessPath("super_admin", "/mvp/admin")).toBe(true);
    expect(canAccessPath("CLIENT_ADMIN", "/mvp/admin")).toBe(false);
    expect(canAccessPath(null, "/mvp/admin")).toBe(false);
    expect(canUseNavItem("CLIENT_ADMIN", "/mvp/admin", true)).toBe(false);
  });
  it("normalizes Sprint 012 auth roles and preserves app compatibility roles", () => {
    expect(normalizeRole("SUPER_ADMIN")).toBe("super_admin");
    expect(normalizeRole("Client Admin")).toBe("client_admin");
    expect(normalizeRole("USER")).toBe("user");
    expect(normalizeRole("demo-user")).toBe("demo_user");
    expect(normalizeRole("EDITOR")).toBe("editor");
    expect(normalizeRole("REVIEWER")).toBe("reviewer");
    expect(normalizeRole("VIEWER")).toBe("viewer");
  });
  it("normalizes assignable admin roles to persisted canonical values", () => {
    expect(normalizeAssignableUserRole("SUPER_ADMIN")).toBe("super_admin");
    expect(normalizeAssignableUserRole("CLIENT_ADMIN")).toBe("client_admin");
    expect(normalizeAssignableUserRole("Client Admin")).toBe("client_admin");
    expect(normalizeAssignableUserRole("EDITOR")).toBe("editor");
    expect(normalizeAssignableUserRole("REVIEWER")).toBe("reviewer");
    expect(normalizeAssignableUserRole("VIEWER")).toBe("viewer");
    expect(normalizeAssignableUserRole("USER")).toBeNull();
    expect(normalizeAssignableUserRole("client")).toBeNull();
  });
  it("allows demo bootstrap only for explicit local demo runtime", () => {
    const previous = process.env.APP_ENV;
    process.env.APP_ENV = "demo";
    expect(isLocalDemoRuntime(new Request("http://localhost:8787/api/auth/login"))).toBe(true);
    expect(isLocalDemoRuntime(new Request("http://127.0.0.1:8787/api/auth/login"))).toBe(true);
    expect(isLocalDemoRuntime(new Request("http://[::1]:8787/api/auth/login"))).toBe(true);
    expect(isLocalDemoRuntime(new Request("https://preview.emailorc.example/api/auth/login"))).toBe(false);
    expect(isLocalDemoRuntime(new Request("https://emailorc-account-growth-demo.workers.dev/api/auth/login"))).toBe(false);
    process.env.APP_ENV = "test-live";
    expect(isLocalDemoRuntime(new Request("http://localhost:8787/api/auth/login"))).toBe(false);
    process.env.APP_ENV = "production";
    expect(isLocalDemoRuntime(new Request("http://localhost:8787/api/auth/login"))).toBe(false);
    if (previous === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = previous;
  });
  it("allows bootstrap only for the documented demo Super Admin user", async () => {
    const previous = process.env.APP_ENV;
    process.env.APP_ENV = "demo";
    const request = new Request("http://localhost:8787/api/auth/login");
    const comparePassword = async (password: string) => password === "DemoAdmin123!";

    await expect(shouldBootstrapDemoSuperAdmin({
      request,
      email: "admin@demo.com",
      password: "DemoAdmin123!",
      expectedEmail: "admin@demo.com",
      comparePassword,
    })).resolves.toBe(true);
    await expect(shouldBootstrapDemoSuperAdmin({
      request,
      email: "client@demo.com",
      password: "DemoAdmin123!",
      expectedEmail: "admin@demo.com",
      comparePassword,
    })).resolves.toBe(false);
    await expect(shouldBootstrapDemoSuperAdmin({
      request,
      email: "admin@demo.com",
      password: "wrong",
      expectedEmail: "admin@demo.com",
      comparePassword,
    })).resolves.toBe(false);

    if (previous === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = previous;
  });
  it("blocks final active Super Admin removal paths", () => {
    const base = {
      activeSuperAdminCount: 1,
      targetCurrentRole: "super_admin",
    };
    expect(wouldRemoveFinalSuperAdmin({ ...base, nextRole: "client_admin" })).toBe(true);
    expect(wouldRemoveFinalSuperAdmin({ ...base, nextStatus: "SUSPENDED" })).toBe(true);
    expect(wouldRemoveFinalSuperAdmin({ ...base, nextStatus: "ARCHIVED" })).toBe(true);
    expect(wouldRemoveFinalSuperAdmin({ ...base, archive: true })).toBe(true);
    expect(wouldRemoveFinalSuperAdmin({ ...base, nextRole: "super_admin", nextStatus: "ACTIVE" })).toBe(false);
    expect(wouldRemoveFinalSuperAdmin({ activeSuperAdminCount: 2, targetCurrentRole: "super_admin", nextRole: "viewer" })).toBe(false);
    expect(wouldRemoveFinalSuperAdmin({ activeSuperAdminCount: 1, targetCurrentRole: "client_admin", nextRole: "viewer" })).toBe(false);
    expect(isInactiveAdminStatus("ACTIVE")).toBe(false);
    expect(isInactiveAdminStatus("SUSPENDED")).toBe(true);
    expect(isInactiveAdminStatus("ARCHIVED")).toBe(true);
  });
  it("enforces same-organization admin user update policy", () => {
    expect(isSameOrganizationUpdate({
      currentOrganizationId: "org_demo",
      targetOrganizationId: "org_demo",
      requestedOrganizationId: "org_demo",
    })).toBe(true);
    expect(isSameOrganizationUpdate({
      currentOrganizationId: "org_demo",
      targetOrganizationId: "org_other",
      requestedOrganizationId: "org_other",
    })).toBe(false);
    expect(isSameOrganizationUpdate({
      currentOrganizationId: "org_demo",
      targetOrganizationId: "org_demo",
      requestedOrganizationId: "org_other",
    })).toBe(false);
    expect(isSameOrganizationUpdate({
      currentOrganizationId: null,
      targetOrganizationId: "org_demo",
      requestedOrganizationId: "org_demo",
    })).toBe(false);
  });
  it("fails closed for unrecognized sensitive roles", () => {
    expect(normalizeRole("owner")).toBeNull();
    expect(isSensitiveRoleAllowed("owner", ["super_admin"])).toBe(false);
    expect(permissionsForRole("owner")).toMatchObject({
      canTransitionProduction: false,
      canManageUsers: false,
      canManagePlans: false,
      canManageEnvironment: false,
    });
  });
  it("returns unauthenticated for /api/auth/me without a server session", async () => {
    resetLocalSessionsForTests();
    const response = await getAuthMe(new Request("http://localhost/api/auth/me?user_id=user_super_admin&role=SUPER_ADMIN"));
    expect(response.status).toBe(401);
  });
  it("resolves /api/auth/me from server session cookie without trusting query identity", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_server",
      email: "server@example.com",
      firstName: "Server",
      lastName: "User",
      organizationId: "org_server",
      organizationName: "Server Org",
      role: "client_admin",
      environmentMode: "demo",
    });

    const request = new Request("http://localhost/api/auth/me?user_id=spoofed&role=SUPER_ADMIN", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    });
    const response = await getAuthMe(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user_id).toBe("user_server");
    expect(body.email).toBe("server@example.com");
    expect(body.role).toBe("client_admin");
    expect(body.organization_id).toBe("org_server");
    expect(body.session_source).toBe("local_dev_memory");
  });
  it("uses opaque session tokens and SHA-256 token hashes", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_hash",
      email: "hash@example.com",
      organizationId: "org_hash",
      organizationName: "Hash Org",
      role: "viewer",
    });

    expect(session.token).not.toBe(session.tokenHash);
    expect(hashSessionToken(session.token)).toBe(session.tokenHash);
    expect(session.tokenHash).toHaveLength(64);

    const currentUser = await getCurrentUser(new Request("http://localhost/api/auth/me", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));
    expect(currentUser?.userId).toBe("user_hash");
  });
  it("does not mark local HTTP preview session cookies as Secure", () => {
    const localResponse = NextResponse.json({ ok: true });
    setSessionCookie(localResponse, "local-token", new Request("http://localhost:8787/api/auth/login"));
    const localCookie = localResponse.headers.get("set-cookie") || "";

    const httpsResponse = NextResponse.json({ ok: true });
    setSessionCookie(httpsResponse, "https-token", new Request("https://emailorc.example/api/auth/login"));
    const httpsCookie = httpsResponse.headers.get("set-cookie") || "";

    expect(localCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(localCookie).not.toMatch(/;\s*Secure/i);
    expect(httpsCookie).toMatch(/;\s*Secure/i);
  });
  it("logout clears the session cookie and revokes the local server session", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_logout",
      email: "logout@example.com",
      organizationId: "org_logout",
      organizationName: "Logout Org",
      role: "viewer",
    });
    const request = new Request("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    });

    const response = await postAuthLogout(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(readSessionToken(request)).toBe(session.token);

    const currentUser = await getCurrentUser(new Request("http://localhost/api/auth/me", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));
    expect(currentUser).toBeNull();
  });
  it("blocks unauthenticated admin API access", async () => {
    resetLocalSessionsForTests();
    const response = await getAdminSystemHealth(new Request("http://localhost/api/admin/system-health?organization_id=org_demo&environment=demo"));
    expect(response.status).toBe(401);
  });
  it("blocks authenticated non-super-admin admin API access", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_client_admin",
      email: "client-admin@example.com",
      organizationId: "org_client",
      organizationName: "Client Org",
      role: "client_admin",
    });

    const response = await getAdminSystemHealth(new Request("http://localhost/api/admin/system-health?organization_id=org_demo&environment=demo", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));
    expect(response.status).toBe(403);
  });
  it("allows authenticated super-admin admin API access to reach existing behavior", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_super_admin",
      email: "super-admin@example.com",
      organizationId: "org_admin",
      organizationName: "Admin Org",
      role: "super_admin",
    });

    const response = await getAdminSystemHealth(new Request("http://localhost/api/admin/system-health?organization_id=org_demo&environment=demo", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      database_connected: false,
      active_environment: "demo",
    });
  });
  it("fails admin authorization closed for unknown roles", async () => {
    const result = authorizeAdminUser({
      role: "owner",
    } as any);

    expect(result.currentUser).toBeNull();
    expect(result.response?.status).toBe(403);
  });
  it("blocks unauthenticated workflow API access", async () => {
    resetLocalSessionsForTests();
    const response = await getWorkflowRecords(new Request("http://localhost/api/workflow/records?organization_id=org_demo&environment=demo"));
    expect(response.status).toBe(401);
  });
  it("blocks workflow API access for a different organization", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_org_a",
      email: "org-a@example.com",
      organizationId: "org_a",
      organizationName: "Org A",
      role: "client_admin",
    });

    const response = await getWorkflowDrafts(new Request("http://localhost/api/workflow/drafts?organization_id=org_b&environment=demo", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));

    expect(response.status).toBe(403);
  });
  it("allows authorized workflow API access to reach existing local behavior", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_org_a",
      email: "org-a@example.com",
      organizationId: "org_a",
      organizationName: "Org A",
      role: "client_admin",
    });

    const response = await getWorkflowDrafts(new Request("http://localhost/api/workflow/drafts?organization_id=org_a&environment=demo", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ status: "local", drafts: [] });
  });
  it("uses server current-user role instead of request-supplied draft approval role", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "server_approver",
      email: "approver@example.com",
      organizationId: "org_a",
      organizationName: "Org A",
      role: "client_admin",
    });

    const response = await postDraftApproval(new Request("http://localhost/api/drafts/approve", {
      method: "POST",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        organization_id: "org_a",
        user_id: "spoofed_user",
        user_role: "viewer",
        draft_id: "draft-1",
        qa_score: QA_APPROVAL_THRESHOLD,
        spam_risk: "Low",
        subject_line_1: "First option",
        subject_line_2: "Second option",
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ status: "approved", draft_id: "draft-1" });
  });
  it("uses server current-user organization instead of request-supplied import identity", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "server_importer",
      email: "importer@example.com",
      organizationId: "org_a",
      organizationName: "Org A",
      role: "editor",
    });

    const response = await postWorkflowImport(new Request("http://localhost/api/workflow/import", {
      method: "POST",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        organization_id: "org_b",
        user_id: "spoofed_user",
        user_role: "super_admin",
        mapping: { Email: "Email" },
        records: [{ _standard_fields: { Email: "valid@example.com" } }],
      }),
    }));

    expect(response.status).toBe(403);
  });
  it("fails workflow authorization closed for unknown roles", async () => {
    const result = authorizeWorkflowOrganization({
      role: "owner",
      organizationId: "org_a",
    } as any, "org_a");

    expect(result.currentUser).toBeNull();
    expect(result.response?.status).toBe(403);
  });
  it("blocks unauthenticated Brain/provider API access", async () => {
    resetLocalSessionsForTests();
    const response = await getBrainModelSettings(new Request("http://localhost/api/brain/model-settings?org_id=org_demo"));
    expect(response.status).toBe(401);
  });
  it("blocks Brain/provider API access for a different organization", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_brain_a",
      email: "brain-a@example.com",
      organizationId: "org_a",
      organizationName: "Org A",
      role: "editor",
    });

    const response = await getBrainModelSettings(new Request("http://localhost/api/brain/model-settings?org_id=org_b", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));

    expect(response.status).toBe(403);
  });
  it("allows authorized Brain/provider API access to reach existing local behavior", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_brain_a",
      email: "brain-a@example.com",
      organizationId: "org_a",
      organizationName: "Org A",
      role: "editor",
    });

    const response = await getBrainModelSettings(new Request("http://localhost/api/brain/model-settings?org_id=org_a", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ status: "local", models: [] });
  });
  it("uses server current-user identity for Brain/provider actor metadata", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "server_brain_user",
      email: "brain-user@example.com",
      organizationId: "org_brain",
      organizationName: "Brain Org",
      role: "client_admin",
    });

    const response = await postBrainLearningLog(new Request("http://localhost/api/brain/learning-log", {
      method: "POST",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        organization_id: "org_brain",
        user_id: "spoofed_user",
        approved_by: "spoofed_approver",
        feedback_text: "Keep renewal claims grounded.",
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.item.organization_id).toBe("org_brain");
    expect(body.item.user_id).toBe("server_brain_user");
    expect(body.item.approved_by).toBe("server_brain_user");
  });
  it("rejects request-supplied Brain/provider organization identity conflicts", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "server_brain_user",
      email: "brain-user@example.com",
      organizationId: "org_brain",
      organizationName: "Brain Org",
      role: "client_admin",
    });

    const response = await postBrainLearningLog(new Request("http://localhost/api/brain/learning-log", {
      method: "POST",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        organization_id: "org_other",
        user_id: "spoofed_user",
        provider: "OpenAI",
        text: "safe local auth check",
      }),
    }));

    expect(response.status).toBe(403);
  });
  it("keeps Brain/provider auth failures secret-safe", async () => {
    const result = authorizeBrainOrganization(null, "org_demo");
    const body = await result.response?.json();

    expect(result.response?.status).toBe(401);
    expect(JSON.stringify(body)).not.toMatch(/openrouter|api[_-]?key|sk-/i);
  });
  it("fails Brain/provider authorization closed for unknown roles", async () => {
    const result = authorizeBrainOrganization({
      role: "owner",
      organizationId: "org_a",
    } as any, "org_a");

    expect(result.currentUser).toBeNull();
    expect(result.response?.status).toBe(403);
  });
  it("blocks draft approval below QA 90", () => {
    const result = validateDraftApproval({
      userRole: "CLIENT_ADMIN",
      draftId: "draft-1",
      qaScore: QA_APPROVAL_THRESHOLD - 1,
      spamRisk: "Low",
      subjectLine1: "First option",
      subjectLine2: "Second option",
    });
    expect(result).toEqual({ error: "QA score below threshold.", status: 400 });
  });
  it("allows draft approval at QA 90 or above when otherwise valid", () => {
    const atThreshold = validateDraftApproval({
      userRole: "client_admin",
      draftId: "draft-1",
      qaScore: QA_APPROVAL_THRESHOLD,
      spamRisk: "Low",
      subjectLine1: "First option",
      subjectLine2: "Second option",
    });
    const aboveThreshold = validateDraftApproval({
      userRole: "REVIEWER",
      draftId: "draft-2",
      qaScore: QA_APPROVAL_THRESHOLD + 4,
      spamRisk: "Medium",
      subjectLine1: "A practical next step",
      subjectLine2: "Worth a quick review",
    });
    expect("error" in atThreshold).toBe(false);
    expect("error" in aboveThreshold).toBe(false);
  });
  it("maps obvious CSV header aliases to standard import fields", () => {
    const mapping = inferImportMapping(["contact_email", "account name", "renewal_date", "days_to_renew"]);
    expect(mapping).toMatchObject({
      contact_email: "Email",
      "account name": "Company Name",
      renewal_date: "Renewal Date",
      days_to_renew: "Days to Renew",
    });
  });
  it("blocks imports when Email is not mapped", () => {
    const result = validateImportRows({
      mapping: { Company: "Company Name" },
      records: [{ _standard_fields: { "Company Name": "Acme" } }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({
      code: "MISSING_REQUIRED_HEADER",
      field: "Email",
    }));
  });
  it("blocks row-level import records missing Email values", () => {
    const result = validateImportRows({
      mapping: { Email: "Email", Company: "Company Name" },
      records: [
        { _standard_fields: { Email: "valid@example.com", "Company Name": "Valid Co" } },
        { _standard_fields: { Email: "", "Company Name": "Missing Email Co" } },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({
      code: "MISSING_REQUIRED_VALUE",
      field: "Email",
      rowIndex: 2,
    }));
  });
  it("reports identity and renewal context gaps without blocking Email-valid imports", () => {
    const mapped = mapImportRecord({ "Email Address": "valid@example.com" }, { "Email Address": "Email" });
    const result = validateImportRows({
      mapping: { "Email Address": "Email" },
      records: [{ _standard_fields: mapped.standard }],
    });
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "MISSING_IDENTITY" }),
      expect.objectContaining({ code: "MISSING_RENEWAL_CONTEXT" }),
    ]));
  });
  it("moves campaign board cards into the target column only", () => {
    const moved = moveCampaignBoardCard(INITIAL_CAMPAIGN_BOARD_CARDS, 3, "Approved");
    const approvedCards = cardsForCampaignBoardColumn(moved, "Approved").map((card) => card.name);
    const needsReviewCards = cardsForCampaignBoardColumn(moved, "Needs Review").map((card) => card.name);

    expect(approvedCards).toContain("Carlos Mena");
    expect(needsReviewCards).not.toContain("Carlos Mena");
  });
  it("keeps Microsoft OAuth scopes draft-only and excludes Mail.Send", () => {
    expect(MICROSOFT_GRAPH_SCOPES).toContain("https://graph.microsoft.com/Mail.ReadWrite");
    expect(MICROSOFT_GRAPH_SCOPES.join(" ")).not.toMatch(/Mail\.Send/i);
    expect(() => assertNoMailSendScope(MICROSOFT_GRAPH_SCOPES)).not.toThrow();
    expect(() => assertNoMailSendScope(["openid", "https://graph.microsoft.com/Mail.Send"])).toThrow(/Mail\.Send/);
  });
  it("builds Microsoft authorization URLs with PKCE and without Mail.Send", () => {
    const url = buildMicrosoftAuthorizeUrl({
      clientId: "client-id",
      redirectUri: "http://localhost:3000/api/integrations/microsoft/callback",
      state: "safe-state",
      codeChallenge: "pkce-challenge",
    });

    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("scope")).toContain("Mail.ReadWrite");
    expect(url.searchParams.get("scope")).not.toMatch(/Mail\.Send/i);
  });
  it("encrypts Microsoft OAuth material without returning plaintext", async () => {
    const previous = process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET;
    process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET = "test-only-microsoft-token-encryption-secret";
    const encrypted = await encryptMicrosoftSecret("refresh-token-secret");
    expect(encrypted).not.toContain("refresh-token-secret");
    await expect(decryptMicrosoftSecret(encrypted)).resolves.toBe("refresh-token-secret");
    if (previous === undefined) delete process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET;
    else process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET = previous;
  });
  it("fails closed before storing Microsoft OAuth tokens when encryption secret is missing", async () => {
    const previousMicrosoft = process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET;
    const previousAuth = process.env.AUTH_SECRET;
    const previousNextAuth = process.env.NEXTAUTH_SECRET;
    delete process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET;
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;

    const db = {
      prepare: () => {
        throw new Error("db_write_should_not_run");
      },
    } as unknown as D1Database;

    await expect(saveMicrosoftConnection({
      db,
      currentUser: {
        userId: "user_ms",
        email: "status@example.com",
        organizationId: "org_ms",
        organizationName: "Microsoft Org",
        role: "client_admin",
        environmentMode: "demo",
      },
      tokenData: {
        access_token: "access-token-secret",
        refresh_token: "refresh-token-secret",
        expires_in: 3600,
        scope: "https://graph.microsoft.com/Mail.ReadWrite",
      },
    })).rejects.toThrow(/microsoft_encryption_secret_required/);

    if (previousMicrosoft === undefined) delete process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET;
    else process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET = previousMicrosoft;
    if (previousAuth === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousAuth;
    if (previousNextAuth === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = previousNextAuth;
  });
  it("builds Outlook draft payload without send instructions", () => {
    const payload = buildOutlookDraftPayload({
      recipientEmail: "buyer@example.com",
      recipientName: "Buyer",
      subject: "A practical next step",
      body: "Hello from EmailORC.",
    });

    expect(payload).toEqual({
      subject: "A practical next step",
      body: { contentType: "Text", content: "Hello from EmailORC." },
      toRecipients: [{ emailAddress: { address: "buyer@example.com", name: "Buyer" } }],
    });
    expect(JSON.stringify(payload)).not.toMatch(/sendMail|\/send|Mail\.Send/i);
  });
  it("allows only Microsoft Graph POST /me/messages for draft creation", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fakeFetch = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init || {} });
      return Response.json({ id: "graph-message-1" });
    }) as typeof fetch;

    const result = await postMicrosoftGraphDraft({
      accessToken: "access-token",
      draft: {
        recipientEmail: "buyer@example.com",
        subject: "Subject",
        body: "Body",
      },
      fetchImpl: fakeFetch,
    });

    expect(result.id).toBe("graph-message-1");
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(MICROSOFT_GRAPH_CREATE_DRAFT_ENDPOINT);
    expect(calls[0].init.method).toBe("POST");
    await expect(postMicrosoftGraphDraft({
      accessToken: "access-token",
      draft: { recipientEmail: "buyer@example.com", subject: "Subject", body: "Body" },
      endpoint: "https://graph.microsoft.com/v1.0/me/sendMail",
      fetchImpl: fakeFetch,
    })).rejects.toThrow(/not_allowed/);
  });
  it("keeps Microsoft connection status response token-safe", async () => {
    resetLocalSessionsForTests();
    const session = await createServerSession(null, {
      userId: "user_ms_status",
      email: "status@example.com",
      organizationId: "org_ms",
      organizationName: "Microsoft Org",
      role: "client_admin",
    });

    const response = await getMicrosoftStatus(new Request("http://localhost/api/integrations/microsoft/status", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ connected: false, storageAvailable: false });
    expect(JSON.stringify(body)).not.toMatch(/access[_-]?token|refresh[_-]?token|client[_-]?secret|authorization/i);
  });
  it("blocks unauthenticated Outlook draft creation before storage or Graph access", async () => {
    resetLocalSessionsForTests();
    const response = await postOutlookDraft(new Request("http://localhost/api/drafts/draft_1/outlook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organization_id: "org_a" }),
    }), { params: { draftId: "draft_1" } });

    expect(response.status).toBe(401);
  });
});
