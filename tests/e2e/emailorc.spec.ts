import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { users } from "../fixtures/users";

const csvFixture = path.join(__dirname, "../fixtures/contacts-3-records.csv");

async function clearSession(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => localStorage.clear());
}

async function login(page: Page, user: (typeof users)[keyof typeof users]) {
  await clearSession(page);
  await page.goto("/login");
  await page.getByPlaceholder("name@company.com").fill(user.email);
  await page.getByPlaceholder("••••••••").fill(user.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/mvp", { timeout: 15000 });
  await expect(page.getByRole("main")).toContainText("Account Growth Command Center", { timeout: 15000 });
  await expect(page.locator("body")).toContainText(user.role.replace("_", " "));
}

async function loginWithQuickAccess(page: Page, account: RegExp | string) {
  await clearSession(page);
  await page.goto("/login");
  await page.getByRole("button", { name: account, exact: typeof account === "string" }).click();
  await page.waitForURL("**/mvp", { timeout: 15000 });
  await expect(page.getByRole("main")).toContainText("Account Growth Command Center", { timeout: 15000 });
}

test.describe("EmailORC manual QA coverage", () => {
  test("root, old dashboard, and protected MVP routes require login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/login");
    await expect(page.getByRole("heading", { name: /growth center/i })).toBeVisible();

    await page.goto("/dashboard");
    await page.waitForURL("**/login");
    await expect(page.getByRole("heading", { name: /growth center/i })).toBeVisible();

    await page.goto("/mvp/upload");
    await page.waitForURL("**/login");
    await expect(page.getByPlaceholder("name@company.com")).toBeVisible();
  });

  test("login and logout work for Super Admin and Client Admin", async ({ page }) => {
    await loginWithQuickAccess(page, /super admin demo/i);
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page.getByRole("heading", { name: /growth center/i })).toBeVisible();

    await login(page, users.clientAdmin);
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page.getByRole("heading", { name: /growth center/i })).toBeVisible();
  });

  test("all seeded demo role quick logins work", async ({ page }) => {
    for (const account of [
      { button: /super admin demo/i, role: "SUPER ADMIN" },
      { button: /client admin demo/i, role: "CLIENT ADMIN" },
      { button: /editor demo/i, role: "EDITOR" },
      { button: /reviewer demo/i, role: "REVIEWER" },
      { button: "Viewer Demo", role: "VIEWER" },
    ]) {
      await loginWithQuickAccess(page, account.button);
      await expect(page.locator("body")).toContainText(account.role);
      await page.getByRole("button", { name: /sign out/i }).click();
      await expect(page.getByRole("heading", { name: /growth center/i })).toBeVisible();
    }
  });

  test("Viewer is blocked from edit/export/admin routes", async ({ page }) => {
    await login(page, users.viewer);
    await expect(page.getByRole("link", { name: /export center/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /admin console/i })).toHaveCount(0);

    await page.goto("/mvp/export");
    await page.waitForURL("**/mvp");
    await expect(page.getByRole("heading", { name: /account growth command center/i })).toBeVisible();

    await page.goto("/mvp/admin");
    await page.waitForURL("**/mvp");
    await expect(page.getByRole("heading", { name: /enterprise governance/i })).not.toBeVisible();
  });

  test("role-based navigation hides Admin Console from Client Admin", async ({ page }) => {
    await login(page, users.clientAdmin);
    await expect(page.getByRole("link", { name: /admin console/i })).toHaveCount(0);
    await expect(page.locator("body")).toContainText("CLIENT ADMIN");
  });

  test("Client Admin cannot force direct URL access to Super Admin console", async ({ page }) => {
    await login(page, users.clientAdmin);
    await page.goto("/mvp/admin");
    await expect(page.getByRole("heading", { name: /enterprise governance/i })).not.toBeVisible();
  });

  test("Admin Console loads, provisions a user, and edits the user", async ({ page }) => {
    await login(page, users.superAdmin);
    await page.getByRole("link", { name: /admin console/i }).click();
    await expect(page.getByRole("heading", { name: /enterprise governance/i })).toBeVisible();
    await expect(page.getByText("System Live")).toBeVisible();

    const email = `qa-${Date.now()}@example.com`;
    await page.getByRole("button", { name: /provision user/i }).click();
    await expect(page.getByRole("heading", { name: /provision new user/i })).toBeVisible();
    const provisionForm = page.locator("form").filter({ hasText: "Provision User Account" });
    await provisionForm.getByPlaceholder("John", { exact: true }).fill("QA");
    await provisionForm.getByPlaceholder("Doe", { exact: true }).fill("Provisioned");
    await provisionForm.getByPlaceholder("john.doe@company.com").fill(email);
    await provisionForm.getByPlaceholder("Revenue Manager").fill("QA Operator");
    await provisionForm.locator("select").first().selectOption({ label: "Demo Organization" });
    await provisionForm.locator("select").nth(1).selectOption("REVIEWER");
    await provisionForm.getByPlaceholder("••••••••").fill("QaUser123!");
    await provisionForm.getByRole("button", { name: /provision user account/i }).scrollIntoViewIfNeeded();
    const createResponse = page.waitForResponse((response) =>
      response.url().includes("/api/admin/users") &&
      response.request().method() === "POST"
    );
    await provisionForm.getByRole("button", { name: /provision user account/i }).click();
    expect((await createResponse).ok()).toBeTruthy();
    await expect(page.getByText("User provisioned successfully.")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(email)).toBeVisible();

    const userRow = page.getByText(email).locator("xpath=ancestor::tr");
    await userRow.hover();
    await userRow.locator('button[title="Edit"]').click({ force: true });
    await expect(page.getByRole("heading", { name: /edit user account/i })).toBeVisible();
    await page.locator("form").filter({ hasText: "Save User Changes" }).locator("select").nth(1).selectOption("VIEWER");
    await page.getByRole("button", { name: /save user changes/i }).click();
    await expect(page.getByText("User updated successfully.")).toBeVisible();
    await expect(userRow).toContainText("VIEWER");
  });

  test("organization, subscription, credits, usage, and environment settings are visible", async ({ page }) => {
    await login(page, users.superAdmin);
    await page.goto("/mvp/settings");
    await expect(page.getByRole("heading", { name: /settings & governance/i })).toBeVisible();

    await page.goto("/mvp/brain-center");
    await expect(page.getByText("AI Credits Remaining")).toBeVisible();
    await expect(page.getByText("Growth tier")).toBeVisible();
    await page.getByRole("button", { name: /usage logs/i }).click();
    await expect(page.getByText("Brain API Audit Log")).toBeVisible();
    await expect(page.getByText("ORC Validation")).toBeVisible();

    await page.goto("/mvp/admin");
    await page.getByRole("button", { name: "Environment" }).click();
    await expect(page.getByRole("button", { name: /demo mode/i })).toBeVisible();
    await page.getByRole("button", { name: /test live/i }).click();
    await expect(page.getByText("Environment configuration updated.")).toBeVisible();
    await expect(page.locator('input[value="Test Export"]')).toBeVisible();
  });

  test("OpenRouter connection, Model Mode, Brain Center settings, and Campaign Playbooks load", async ({ page }) => {
    await login(page, users.superAdmin);
    await page.goto("/mvp/brain-center");

    await page.getByRole("button", { name: /api connection/i }).click();
    await expect(page.getByText("OpenRouter API Key")).toBeVisible();
    await page.getByRole("button", { name: /test connection/i }).click();
    await expect(page.getByText(/Status: Connected|Status: Error|Status: Provider Unavailable/)).toBeVisible();

    await page.locator('input[type="password"]').first().locator("xpath=following-sibling::button").click();
    await page.locator('input[type="text"]').fill("not-a-real-openrouter-key");
    await page.getByRole("button", { name: /save api key/i }).click();
    await expect(page.getByText("Status: Invalid API Key")).toBeVisible();

    await page.getByRole("button", { name: /model settings/i }).click();
    await page.locator("select").filter({ has: page.locator("option", { hasText: "Quality" }) }).first().selectOption("Quality");
    await expect(page.locator("select").filter({ has: page.locator("option", { hasText: "Quality" }) }).first()).toHaveValue("Quality");
    await expect(page.getByText("ORC Intake and Validation Model")).toBeVisible();
    await expect(page.getByText("SENTINEL Strategy Model")).toBeVisible();
    await expect(page.getByText("SCRIBE Writing Model")).toBeVisible();
    await expect(page.getByText("LEXI QA Model")).toBeVisible();

    await page.getByRole("button", { name: /campaign playbooks/i }).click();
    await expect(page.getByRole("heading", { name: "Campaign Playbooks" })).toBeVisible();
  });

  test("CSV upload, field mapping expectations, validation, generation, and AI role output", async ({ page }) => {
    await login(page, users.clientAdmin);
    await page.goto("/mvp/upload");
    await page.locator("#csv-upload").setInputFiles(csvFixture);
    await expect(page.getByText("contacts-3-records.csv")).toBeVisible();
    await expect(page.getByText("3 customer records loaded and validated")).toBeVisible();
    await expect(page.getByText(/field mapping/i)).toBeVisible();
    await expect(page.locator("select").filter({ has: page.locator("option", { hasText: "Email" }) }).first()).toBeVisible();
    await page.locator("select").filter({ has: page.locator("option", { hasText: "Email" }) }).nth(2).selectOption("Email");
    await page.getByRole("button", { name: /generate email drafts/i }).click();
    await expect(page.getByRole("heading", { name: /generated drafts/i })).toBeVisible({ timeout: 6000 });
    await expect(page.getByText("Avery Valid", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Mina Missing", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Dana DNC", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("ORC", { exact: true })).toBeVisible();
    await expect(page.getByText("SENTINEL", { exact: true })).toBeVisible();
    await expect(page.getByText("SCRIBE", { exact: true })).toBeVisible();
    await expect(page.getByText("LEXI", { exact: true })).toBeVisible();
    await page.goto("/mvp/drafts");
    await expect(page.getByText("Avery Valid", { exact: true }).first()).toBeVisible();
  });

  test("record validation exposes missing-email and do-not-contact records", async ({ page }) => {
    await login(page, users.clientAdmin);
    await page.goto("/mvp/records");
    await expect(page.getByRole("heading", { name: /validate account records/i })).toBeVisible();
    await page.getByRole("button", { name: /missing email/i }).click();
    await expect(page.getByText("No email")).toBeVisible();
    await page.getByRole("button", { name: /do not contact/i }).click();
    await expect(page.getByText("Howard Grant")).toBeVisible();
  });

  test("QA scoring blocks approval below 90 and allows approval at 90+", async ({ page }) => {
    await login(page, users.clientAdmin);
    await page.goto("/mvp/drafts");
    await expect(page.getByText("QA 81")).toBeVisible();

    await page.getByText("Carlos Mena").click();
    await expect(page.getByText("QA 81").locator("xpath=ancestor::div[contains(@class,'bg-white')][1]")).not.toContainText("Approve Draft");
    await page.getByText("QA 81").locator("xpath=ancestor::div[contains(@class,'bg-white')][1]").getByRole("button", { name: /regenerate/i }).click();
    await expect(page.getByText("QA 93").locator("xpath=ancestor::div[contains(@class,'bg-white')][1]")).toContainText("Approve Draft");

    await page.getByText("Sarah Johnson").click();
    await expect(page.getByText("QA 94").locator("xpath=ancestor::div[contains(@class,'bg-white')][1]")).toContainText("Approve Draft");
    await page.getByText("Sarah Johnson").locator("xpath=ancestor::div[contains(@class,'bg-white')][1]").getByRole("button", { name: /approve draft/i }).click();
    await expect(page.getByText("Sarah Johnson").locator("xpath=ancestor::div[contains(@class,'bg-white')][1]")).toContainText("Approved");
  });

  test("Reply Assistant classifies, drafts, and requires approval", async ({ page }) => {
    await login(page, users.clientAdmin);
    await page.goto("/mvp/reply");
    await page.getByPlaceholder("Paste the customer's email reply here...").fill("Yes, I am interested. How much does it cost?");
    await page.getByRole("button", { name: /analyze reply/i }).click();
    await expect(page.getByText("Pricing Question")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("AI Draft Response")).toBeVisible();
    await expect(page.getByText("Pending Human Approval")).toBeVisible();
    await page.getByRole("button", { name: /approve & use response/i }).click();
    await expect(page.getByText(/Approved.*Ready to Send/)).toBeVisible();
  });

  test("Campaign Board cards move between columns", async ({ page }) => {
    await login(page, users.clientAdmin);
    await page.goto("/mvp/campaigns");
    const card = page.getByTestId("campaign-card-Carlos Mena");
    const approvedColumn = page.getByTestId("campaign-column-Approved");
    await card.getByLabel("Move Carlos Mena").selectOption("Approved");
    await expect(approvedColumn).toContainText("Carlos Mena");
  });

  test("Export Center marks exports as downloaded", async ({ page }) => {
    await login(page, users.clientAdmin);
    await page.goto("/mvp/export");
    await expect(page.getByRole("heading", { name: /export center/i })).toBeVisible();
    await page.getByRole("button", { name: /export/i }).first().click();
    await expect(page.getByText("Downloaded").first()).toBeVisible();
  });

  test("security checks: no auto-send in demo, DNC protection visible, secrets masked", async ({ page }) => {
    await login(page, users.superAdmin);
    await expect(page.getByText("Auto-send OFF")).toBeVisible();
    await expect(page.getByText("DNC records protected")).toBeVisible();

    await page.goto("/mvp/brain-center");
    await page.getByRole("button", { name: /api connection/i }).click();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();

    await page.goto("/mvp/admin");
    await page.getByRole("button", { name: "Environment" }).click();
    await expect(page.getByText(/Auto-send is locked globally/i)).toBeVisible();
  });
});
