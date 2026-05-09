export type NormalizedRole = "super_admin" | "client_admin" | "editor" | "reviewer" | "viewer";

export function normalizeRole(role: unknown): NormalizedRole {
  const normalized = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (normalized === "super_admin" || normalized === "admin" || normalized === "system_admin") return "super_admin";
  if (normalized === "client_admin") return "client_admin";
  if (normalized === "editor") return "editor";
  if (normalized === "reviewer") return "reviewer";
  return "viewer";
}

export function roleLabel(role: unknown) {
  const normalized = normalizeRole(role);
  const labels: Record<NormalizedRole, string> = {
    super_admin: "Super Admin",
    client_admin: "Client Admin",
    editor: "Editor",
    reviewer: "Reviewer",
    viewer: "Viewer",
  };
  return labels[normalized];
}

export function permissionsForRole(role: unknown) {
  const normalized = normalizeRole(role);
  return {
    canTransitionProduction: normalized === "super_admin",
    canManageUsers: normalized === "super_admin" || normalized === "client_admin",
    canManagePlans: normalized === "super_admin",
    canManageEnvironment: normalized === "super_admin",
  };
}
