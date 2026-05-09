import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getD1Database, mapD1Organization, mapD1User } from "@/lib/cloudflare-db";
import * as bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const db = await getD1Database();
    if (db) {
      const row = await db.prepare(`
        SELECT
          u.*,
          m.role AS membership_role,
          o.id AS org_id,
          o.name AS org_name,
          o.slug AS org_slug,
          o.plan AS org_plan,
          o.subscription_status,
          o.ai_credits,
          o.status AS org_status,
          o.created_at AS org_created_at,
          o.updated_at AS org_updated_at
        FROM users u
        LEFT JOIN memberships m ON m.user_id = u.id AND m.status = 'ACTIVE'
        LEFT JOIN organizations o ON o.id = m.organization_id
        WHERE u.email = ?
        LIMIT 1
      `).bind(email).first();

      if (!row || !row.password_hash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const isPasswordValid = await bcrypt.compare(password, row.password_hash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      if (row.status !== "ACTIVE") {
        return NextResponse.json({ error: `Account is ${String(row.status).toLowerCase()}. Please contact support.` }, { status: 403 });
      }

      await db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(row.id)
        .run();

      const user = mapD1User(row);
      const org = mapD1Organization({
        id: row.org_id,
        name: row.org_name,
        slug: row.org_slug,
        plan: row.org_plan,
        subscription_status: row.subscription_status,
        ai_credits: row.ai_credits,
        status: row.org_status,
        created_at: row.org_created_at,
        updated_at: row.org_updated_at,
      });

      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        role: row.membership_role || "VIEWER",
        orgName: org.name || "No Organization",
        orgId: org.id || null,
        plan: org.plan || "Trial",
        subscriptionStatus: org.subscriptionStatus || "TRIAL_ACTIVE",
        aiCredits: org.aiCredits || 0,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: `Account is ${user.status.toLowerCase()}. Please contact support.` }, { status: 403 });
    }

    // Prepare session data (In a real app, you'd use a JWT or session cookie)
    // For this MVP, we'll return the user info to be stored in localStorage as before
    const primaryMembership = user.memberships[0];
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      role: primaryMembership?.role || "VIEWER",
      orgName: primaryMembership?.organization.name || "No Organization",
      orgId: primaryMembership?.organization.id || null,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
