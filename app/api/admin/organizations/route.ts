import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { getD1Database, mapD1Organization } from "../../../../src/lib/cloudflare-db";
import { requireSuperAdmin } from "../../../../src/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireSuperAdmin(request);
  if (admin.response) return admin.response;

  try {
    const db = await getD1Database();
    if (db) {
      const { results } = await db.prepare("SELECT * FROM organizations ORDER BY name ASC").all();
      return NextResponse.json(results.map(mapD1Organization));
    }

    const organizations = await prisma.organization.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}
