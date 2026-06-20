export type NormalizedRole = "super_admin" | "client_admin" | "editor" | "reviewer" | "viewer" | "user" | "demo_user";

export const CANONICAL_AUTH_ROLES = ["super_admin", "client_admin", "user", "demo_user"] as const;
export const APP_COMPAT_ROLES = ["editor", "reviewer", "viewer"] as const;

export function normalizeRole(role: unknown): NormalizedRole | null {
  const normalized = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (normalized === "super_admin" || normalized === "admin" || normalized === "system_admin") return "super_admin";
  if (normalized === "client_admin" || normalized === "org_admin" || normalized === "organization_admin") return "client_admin";
  if (normalized === "user" || normalized === "member") return "user";
  if (normalized === "demo_user" || normalized === "demo") return "demo_user";
  if (normalized === "editor") return "editor";
  if (normalized === "reviewer") return "reviewer";
  if (normalized === "viewer" || normalized === "read_only" || normalized === "readonly") return "viewer";
  return null;
}

export function normalizeRoleForDisplay(role: unknown): NormalizedRole {
  return normalizeRole(role) || "viewer";
}

export function roleLabel(role: unknown) {
  const normalized = normalizeRole(role);
  if (!normalized) return "Unknown";
  const labels: Record<NormalizedRole, string> = {
    super_admin: "Super Admin",
    client_admin: "Client Admin",
    user: "User",
    demo_user: "Demo User",
    editor: "Editor",
    reviewer: "Reviewer",
    viewer: "Viewer",
  };
  return labels[normalized];
}

export function isRecognizedRole(role: unknown) {
  return normalizeRole(role) !== null;
}

export function normalizeAssignableUserRole(role: unknown) {
  const normalized = normalizeRole(role);
  if (!normalized || normalized === "user" || normalized === "demo_user") return null;
  return normalized;
}

export function isSensitiveRoleAllowed(role: unknown, allowedRoles: NormalizedRole[]) {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return allowedRoles.includes(normalized);
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
