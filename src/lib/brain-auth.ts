import { forbiddenResponse, getCurrentUser, unauthenticatedResponse, type CurrentUser } from "./current-user";
import { normalizeRole } from "./roles";

export type BrainAuthorization =
  | { currentUser: CurrentUser; organizationId: string; response: null }
  | { currentUser: null; organizationId: null; response: Response };

function requestedOrganizationId(input: unknown) {
  const value = String(input || "").trim();
  return value || null;
}

export function authorizeBrainOrganization(
  currentUser: CurrentUser | null,
  requestedOrgId?: unknown,
): BrainAuthorization {
  if (!currentUser) return { currentUser: null, organizationId: null, response: unauthenticatedResponse() };
  if (!normalizeRole(currentUser.role)) return { currentUser: null, organizationId: null, response: forbiddenResponse() };
  if (!currentUser.organizationId) return { currentUser: null, organizationId: null, response: forbiddenResponse() };

  const requestOrgId = requestedOrganizationId(requestedOrgId);
  if (requestOrgId && requestOrgId !== currentUser.organizationId) {
    return { currentUser: null, organizationId: null, response: forbiddenResponse() };
  }

  return { currentUser, organizationId: currentUser.organizationId, response: null };
}

export async function requireBrainOrganization(request: Request, requestedOrgId?: unknown) {
  return authorizeBrainOrganization(await getCurrentUser(request), requestedOrgId);
}
