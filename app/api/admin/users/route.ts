import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createId, getD1Database } from "@/lib/cloudflare-db";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getD1Database();
    if (db) {
      const { results } = await db.prepare(`
        SELECT
          u.*,
          m.role,
          m.status AS membership_status,
          o.id AS org_id,
          o.name AS org_name
        FROM users u
        LEFT JOIN memberships m ON m.user_id = u.id
        LEFT JOIN organizations o ON o.id = m.organization_id
        ORDER BY u.created_at DESC
      `).all();

      return NextResponse.json(results.map((user: any) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email,
        jobTitle: user.job_title,
        status: user.status,
        lastLogin: user.last_login || "Never",
        created: String(user.created_at || "").split(" ")[0],
        memberships: user.org_id ? [{
          orgId: user.org_id,
          orgName: user.org_name,
          role: user.role,
          status: user.membership_status,
        }] : [],
        org: user.org_name || "No Organization",
        role: user.role || "VIEWER",
      })));
    }

    const users = await prisma.user.findMany({
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format for the UI
    const formattedUsers = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.email,
      jobTitle: user.jobTitle,
      status: user.status,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : "Never",
      created: user.createdAt.toISOString().split("T")[0],
      memberships: user.memberships.map((m) => ({
        orgId: m.organization.id,
        orgName: m.organization.name,
        role: m.role,
        status: m.status,
      })),
      // For simplicity in the table, just show the first org
      org: user.memberships[0]?.organization.name || "No Organization",
      role: user.memberships[0]?.role || "VIEWER",
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      jobTitle, 
      organizationId, 
      role, 
      status, 
      password, 
      requirePasswordReset,
      sendInvite 
    } = body;

    // Validation
    if (!email || !organizationId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getD1Database();
    if (db) {
      const existingUser = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }

      const userId = createId("user");
      const membershipId = createId("membership");
      const inviteId = createId("invite");
      const auditId = createId("audit");
      const passwordHash = password ? await bcrypt.hash(password, 10) : null;
      const userStatus = sendInvite ? "INVITED" : (status || "ACTIVE");

      const statements = [
        db.prepare(`
          INSERT INTO users (id, email, first_name, last_name, job_title, password_hash, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, email, firstName || null, lastName || null, jobTitle || null, passwordHash, userStatus),
        db.prepare(`
          INSERT INTO memberships (id, user_id, organization_id, role, status)
          VALUES (?, ?, ?, ?, 'ACTIVE')
        `).bind(membershipId, userId, organizationId, role),
        db.prepare(`
          INSERT INTO audit_log (id, action, target_type, target_id, metadata)
          VALUES (?, 'PROVISION_USER', 'USER', ?, ?)
        `).bind(auditId, userId, JSON.stringify({ email, role, organizationId })),
      ];

      if (sendInvite) {
        statements.push(db.prepare(`
          INSERT INTO audit_log (id, action, target_type, target_id, metadata)
          VALUES (?, 'CREATE_INVITE', 'USER', ?, ?)
        `).bind(inviteId, userId, JSON.stringify({ email, role, organizationId, inviteToken: randomUUID() })));
      }

      await db.batch(statements);

      return NextResponse.json({
        id: userId,
        email,
        firstName,
        lastName,
        jobTitle,
        status: userStatus,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Create user
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          jobTitle,
          passwordHash,
          status: sendInvite ? "INVITED" : (status || "ACTIVE"),
        },
      });

      // Create Membership
      await tx.membership.create({
        data: {
          userId: newUser.id,
          organizationId,
          role,
          status: "ACTIVE",
        },
      });

      // Handle Invite if requested
      if (sendInvite) {
        await tx.invite.create({
          data: {
            email,
            organizationId,
            role,
            inviteToken: randomUUID(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            status: "PENDING",
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "PROVISION_USER",
          targetType: "USER",
          targetId: newUser.id,
          metadata: JSON.stringify({ email, role, organizationId }),
        },
      });

      return newUser;
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error provisioning user:", error);
    return NextResponse.json({ error: "Could not create user. Please try again." }, { status: 500 });
  }
}
