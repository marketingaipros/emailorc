import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { createId, getD1Database } from "../../../../src/lib/cloudflare-db";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { createInviteForD1 } from "../../../../src/lib/admin/invite-service";
import { requireSuperAdmin } from "../../../../src/lib/admin-auth";
import { normalizeAssignableUserRole } from "../../../../src/lib/roles";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireSuperAdmin(request);
  if (admin.response) return admin.response;

  try {
    const db = await getD1Database();
    if (db) {
      const { results } = await db.prepare(`
        SELECT
          u.*,
          m.role,
          m.status AS membership_status,
          o.id AS org_id,
          o.name AS org_name,
          it.invite_url
        FROM users u
        LEFT JOIN memberships m ON m.user_id = u.id
        LEFT JOIN organizations o ON o.id = m.organization_id
        LEFT JOIN invite_tokens it ON it.user_id = u.id AND it.created_at = (
          SELECT MAX(created_at) FROM invite_tokens WHERE user_id = u.id
        )
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
        phone: user.phone || "",
        notes: user.notes || "",
        requirePasswordReset: Boolean(user.require_password_reset),
        inviteStatus: user.invite_status || "NOT_SENT",
        lastInviteSent: user.invite_sent_at || null,
        inviteExpires: user.invite_expires_at || null,
        inviteUrl: user.invite_url || "",
        inviteError: user.invite_error || "",
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
  const admin = await requireSuperAdmin(request);
  if (admin.response) return admin.response;

  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      jobTitle, 
      phone,
      notes,
      organizationId, 
      role, 
      status, 
      password, 
      requirePasswordReset,
      sendInvite 
    } = body;

    // Validation
    const normalizedRole = normalizeAssignableUserRole(role);
    if (!email || !organizationId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!normalizedRole) {
      return NextResponse.json({ error: "User role is not recognized." }, { status: 403 });
    }
    if (!admin.currentUser.organizationId || organizationId !== admin.currentUser.organizationId) {
      return NextResponse.json({ error: "Cross-organization user updates are not allowed." }, { status: 403 });
    }

    const db = await getD1Database();
    if (db) {
      const existingUser = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }

      const userId = createId("user");
      const membershipId = createId("membership");
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
        `).bind(membershipId, userId, organizationId, normalizedRole),
        db.prepare(`
          INSERT INTO audit_log (id, action, target_type, target_id, metadata)
          VALUES (?, 'PROVISION_USER', 'USER', ?, ?)
        `).bind(auditId, userId, JSON.stringify({ email, role: normalizedRole, organizationId })),
      ];

      await db.batch(statements);
      await db.prepare(`
        UPDATE users
        SET phone = ?, notes = ?, require_password_reset = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(phone || null, notes || null, requirePasswordReset ? 1 : 0, userId).run();
      const org = await db.prepare("SELECT name FROM organizations WHERE id = ?").bind(organizationId).first();
      const invite = sendInvite
        ? await createInviteForD1({ db, request, userId, organizationId, organizationName: org?.name, email, firstName })
        : null;

      return NextResponse.json({
        success: true,
        id: userId,
        email,
        firstName,
        lastName,
        jobTitle,
        phone,
        notes,
        status: userStatus,
        invite,
        message: invite?.message || "User provisioned successfully.",
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
            role: normalizedRole,
            status: "ACTIVE",
          },
      });

      // Handle Invite if requested
      if (sendInvite) {
        await tx.invite.create({
          data: {
            email,
            organizationId,
            role: normalizedRole,
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
          metadata: JSON.stringify({ email, role: normalizedRole, organizationId }),
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
