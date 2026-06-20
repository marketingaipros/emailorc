import { getCurrentUser, unauthenticatedResponse } from "../../../../src/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return unauthenticatedResponse();

  return Response.json({
    user_id: currentUser.userId,
    email: currentUser.email,
    first_name: currentUser.firstName,
    last_name: currentUser.lastName,
    name: currentUser.name,
    role: currentUser.role,
    role_label: currentUser.roleLabel,
    organization_id: currentUser.organizationId,
    organization_name: currentUser.organizationName,
    environment_mode: currentUser.environmentMode,
    permissions: currentUser.permissions,
    session_source: currentUser.sessionSource,
    session_expires_at: currentUser.expiresAt,
  });
}
