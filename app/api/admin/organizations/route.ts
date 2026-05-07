import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getD1Database, mapD1Organization } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

export async function GET() {
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
