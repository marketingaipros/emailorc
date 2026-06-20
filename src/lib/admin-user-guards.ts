import { normalizeAssignableUserRole } from "./roles";

export function normalizedAssignableRoleOrNull(role: unknown) {
  return role ? normalizeAssignableUserRole(role) : null;
}

export function isInactiveAdminStatus(status: unknown) {
  const value = String(status || "").trim().toUpperCase();
  return Boolean(value && value !== "ACTIVE");
}

export function isSameOrganizationUpdate(params: {
  currentOrganizationId: string | null;
  targetOrganizationId: string | null;
  requestedOrganizationId?: string | null;
}) {
  if (!params.currentOrganizationId || !params.targetOrganizationId) return false;
  if (params.targetOrganizationId !== params.currentOrganizationId) return false;
  if (params.requestedOrganizationId && params.requestedOrganizationId !== params.currentOrganizationId) return false;
  return true;
}

export function wouldRemoveFinalSuperAdmin(params: {
  activeSuperAdminCount: number;
  targetCurrentRole: unknown;
  nextRole?: unknown;
  nextStatus?: unknown;
  archive?: boolean;
}) {
  if (params.activeSuperAdminCount !== 1) return false;
  const targetIsSuperAdmin = normalizeAssignableUserRole(params.targetCurrentRole) === "super_admin";
  if (!targetIsSuperAdmin) return false;
  const nextRole = params.nextRole ? normalizeAssignableUserRole(params.nextRole) : "super_admin";
  return params.archive === true || nextRole !== "super_admin" || isInactiveAdminStatus(params.nextStatus);
}
