import { expect, test, type Page, type Request } from "@playwright/test";

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function collectMutatingRequests(page: Page) {
  const requests: string[] = [];

  page.on("request", (request: Request) => {
    if (mutatingMethods.has(request.method())) {
      requests.push(`${request.method()} ${request.url()}`);
    }
  });

  return requests;
}

test.describe("EmailORC non-mutating smoke gate", () => {
  test("public login surface renders without mutating requests", async ({ page }) => {
    const mutatingRequests = collectMutatingRequests(page);

    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /growth center/i })).toBeVisible();
    await expect(page.getByPlaceholder("name@company.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.locator("form").getByRole("button", { name: /^sign in$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /super admin demo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /client admin demo/i })).toBeVisible();

    expect(mutatingRequests).toEqual([]);
  });

  test("unauthenticated protected routes redirect to login without mutating requests", async ({ page }) => {
    const mutatingRequests = collectMutatingRequests(page);
    const protectedRoutes = ["/", "/dashboard", "/mvp", "/mvp/upload", "/mvp/drafts", "/mvp/campaigns"];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL("**/login");
      await expect(page.getByRole("heading", { name: /growth center/i })).toBeVisible();
    }

    expect(mutatingRequests).toEqual([]);
  });
});
