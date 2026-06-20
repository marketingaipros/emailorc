import { getCurrentUser, forbiddenResponse, unauthenticatedResponse, type CurrentUser } from "./current-user";
import { isSensitiveRoleAllowed } from "./roles";

export type AdminAuthorization =
  | { currentUser: CurrentUser; response: null }
  | { currentUser: null; response: Response };

export function authorizeAdminUser(currentUser: CurrentUser | null): AdminAuthorization {
  if (!currentUser) return { currentUser: null, response: unauthenticatedResponse() };
  if (!isSensitiveRoleAllowed(currentUser.role, ["super_admin"])) {
    return { currentUser: null, response: forbiddenResponse() };
  }
  return { currentUser, response: null };
}

export async function requireSuperAdmin(request: Request) {
  return authorizeAdminUser(await getCurrentUser(request));
}
