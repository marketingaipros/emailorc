import { NextResponse } from "next/server";
import { getD1Database } from "../../../../../src/lib/cloudflare-db";
import { getCurrentUser, unauthenticatedResponse } from "../../../../../src/lib/current-user";
import { disconnectMicrosoftConnection, writeMicrosoftAudit } from "../../../../../src/lib/microsoft/connections";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return unauthenticatedResponse();

  const db = await getD1Database();
  if (!db) return NextResponse.json({ error: "Microsoft connection requires D1 storage." }, { status: 503 });

  await disconnectMicrosoftConnection(db, currentUser);
  await writeMicrosoftAudit({
    db,
    currentUser,
    action: "OUTLOOK_DISCONNECTED",
    targetType: "INTEGRATION",
    metadata: { provider: "microsoft_outlook" },
  }).catch(() => null);

  return NextResponse.json({ status: "disconnected" });
}
