import { NextResponse } from "next/server";
import { getD1Database } from "../../../../src/lib/cloudflare-db";
import { clearSessionCookie, readSessionToken, revokeServerSession } from "../../../../src/lib/server-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const db = await getD1Database();
  const token = readSessionToken(request);

  await revokeServerSession(db, token);

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response, request);
  return response;
}
