import { NextResponse } from "next/server";
import { getD1Database } from "../../../../../src/lib/cloudflare-db";
import { getCurrentUser, unauthenticatedResponse } from "../../../../../src/lib/current-user";
import { getMicrosoftConnection } from "../../../../../src/lib/microsoft/connections";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return unauthenticatedResponse();

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({
      connected: false,
      reconnectRequired: false,
      storageAvailable: false,
    });
  }

  const connection = await getMicrosoftConnection(db, currentUser);
  return NextResponse.json({
    connected: Boolean(connection && !connection.reconnectRequiredAt),
    accountHint: connection?.accountHint || "",
    connectedAt: connection?.connectedAt || null,
    lastSuccessAt: connection?.lastSuccessAt || null,
    reconnectRequired: Boolean(connection?.reconnectRequiredAt),
    storageAvailable: true,
  });
}
