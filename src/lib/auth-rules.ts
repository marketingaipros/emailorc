export type UserRole = "SUPER_ADMIN" | "CLIENT_ADMIN" | "EDITOR" | "REVIEWER" | "VIEWER";

const ROLE_ROUTES: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["/mvp"],
  CLIENT_ADMIN: [
    "/mvp",
    "/mvp/upload",
    "/mvp/records",
    "/mvp/drafts",
    "/mvp/campaigns",
    "/mvp/reply",
    "/mvp/export",
    "/mvp/integrations",
    "/mvp/howto",
    "/mvp/brain-center",
    "/mvp/settings",
    "/mvp/profile",
  ],
  EDITOR: [
    "/mvp",
    "/mvp/upload",
    "/mvp/records",
    "/mvp/drafts",
    "/mvp/campaigns",
    "/mvp/reply",
    "/mvp/export",
    "/mvp/howto",
    "/mvp/profile",
  ],
  REVIEWER: [
    "/mvp",
    "/mvp/records",
    "/mvp/drafts",
    "/mvp/campaigns",
    "/mvp/reply",
    "/mvp/export",
    "/mvp/howto",
    "/mvp/profile",
  ],
  VIEWER: [
    "/mvp",
    "/mvp/records",
    "/mvp/campaigns",
    "/mvp/howto",
    "/mvp/profile",
  ],
};

export function canAccessPath(role: string | null, pathname: string) {
  const normalizedRole = String(role || "").trim().toUpperCase().replace(/[\s-]+/g, "_") as UserRole;
  if (!(normalizedRole in ROLE_ROUTES)) return false;
  if (normalizedRole === "SUPER_ADMIN") return pathname.startsWith("/mvp");

  const routes = ROLE_ROUTES[normalizedRole];
  return routes.some((route) => {
    if (route === "/mvp") return pathname === "/mvp";
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export function canUseNavItem(role: string | null, href: string, adminOnly?: boolean) {
  const normalizedRole = String(role || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (adminOnly) return normalizedRole === "SUPER_ADMIN";
  return canAccessPath(role, href);
}
