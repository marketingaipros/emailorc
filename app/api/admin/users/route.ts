import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { crypto } from "node:crypto";

export async function GET() {
  try {
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
            inviteToken: crypto.randomUUID(),
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
