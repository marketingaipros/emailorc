import { NextResponse } from "next/server";
import { prisma } from "../../../../../src/lib/prisma";
import { createId, getD1Database } from "../../../../../src/lib/cloudflare-db";
import * as bcrypt from "bcryptjs";
import { requireSuperAdmin } from "../../../../../src/lib/admin-auth";
import {
  isSameOrganizationUpdate,
  normalizedAssignableRoleOrNull,
  wouldRemoveFinalSuperAdmin,
} from "../../../../../src/lib/admin-user-guards";

export const dynamic = "force-dynamic";

async function countActiveSuperAdmins(db: D1Database) {
  const row: any = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM users u
    JOIN memberships m ON m.user_id = u.id
    WHERE u.status = 'ACTIVE'
      AND m.status = 'ACTIVE'
      AND LOWER(REPLACE(REPLACE(m.role, '-', '_'), ' ', '_')) = 'super_admin'
  `).first();
  return Number(row?.count || 0);
}

async function getTargetMembershipForCurrentOrg(db: D1Database, userId: string, currentOrganizationId: string | null) {
  if (!currentOrganizationId) return null;
  const row: any = await db.prepare(`
    SELECT
      u.id,
      u.status,
      m.id AS membership_id,
      m.organization_id,
      m.role,
      m.status AS membership_status
    FROM users u
    LEFT JOIN memberships m ON m.user_id = u.id
      AND m.status = 'ACTIVE'
      AND m.organization_id = ?
    WHERE u.id = ?
    LIMIT 1
  `).bind(currentOrganizationId, userId).first();
  if (!row?.id || !row.membership_id) return null;
  return row;
}

async function countPrismaActiveSuperAdmins(tx: any) {
  const memberships = await tx.membership.findMany({
    where: {
      status: "ACTIVE",
      user: {
        status: "ACTIVE",
      },
    },
    select: {
      role: true,
    },
  });
  return memberships.filter((membership: { role: string }) => normalizedAssignableRoleOrNull(membership.role) === "super_admin").length;
}

async function getPrismaTargetMembershipForCurrentOrg(tx: any, userId: string, currentOrganizationId: string | null) {
  if (!currentOrganizationId) return null;
  return tx.membership.findFirst({
    where: {
      userId,
      organizationId: currentOrganizationId,
      status: "ACTIVE",
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await requireSuperAdmin(request);
  if (admin.response) return admin.response;

  try {
    const id = params.id;
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email,
      jobTitle, 
      phone,
      organizationId, 
      role, 
      status, 
      password, 
      requirePasswordReset,
      notes 
    } = body;
    const normalizedRole = normalizedAssignableRoleOrNull(role);
    if (role && !normalizedRole) {
      return NextResponse.json({ error: "User role is not recognized." }, { status: 403 });
    }

    const db = await getD1Database();
    if (db) {
      const existingMembership = await getTargetMembershipForCurrentOrg(db, id, admin.currentUser.organizationId);
      if (!existingMembership) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (!isSameOrganizationUpdate({
        currentOrganizationId: admin.currentUser.organizationId,
        targetOrganizationId: existingMembership.organization_id,
        requestedOrganizationId: organizationId || existingMembership.organization_id,
      })) {
        return NextResponse.json({ error: "Cross-organization user updates are not allowed." }, { status: 403 });
      }
      const activeSuperAdminCount = await countActiveSuperAdmins(db);
      if (wouldRemoveFinalSuperAdmin({
        activeSuperAdminCount,
        targetCurrentRole: existingMembership.role,
        nextRole: normalizedRole || existingMembership.role,
        nextStatus: status,
      })) {
        return NextResponse.json({ error: "At least one active Super Admin is required." }, { status: 403 });
      }

      const passwordHash = password ? await bcrypt.hash(password, 10) : null;
      if (passwordHash) {
        await db.prepare(`
          UPDATE users
          SET first_name = ?, last_name = ?, email = COALESCE(?, email), job_title = ?, phone = ?, status = ?, notes = ?, require_password_reset = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(firstName || null, lastName || null, email || null, jobTitle || null, phone || null, status || "ACTIVE", notes || null, requirePasswordReset ? 1 : 0, passwordHash, id).run();
      } else {
        await db.prepare(`
          UPDATE users
          SET first_name = ?, last_name = ?, email = COALESCE(?, email), job_title = ?, phone = ?, status = ?, notes = ?, require_password_reset = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(firstName || null, lastName || null, email || null, jobTitle || null, phone || null, status || "ACTIVE", notes || null, requirePasswordReset ? 1 : 0, id).run();
      }

      if (existingMembership) {
        await db.prepare(`
          UPDATE memberships
          SET organization_id = ?, role = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(organizationId || existingMembership.organization_id, normalizedRole || existingMembership.role, existingMembership.membership_id).run();
      } else if (organizationId && role) {
        await db.prepare(`
          INSERT INTO memberships (id, user_id, organization_id, role, status)
          VALUES (?, ?, ?, ?, 'ACTIVE')
        `).bind(createId("membership"), id, organizationId, normalizedRole).run();
      }

      await db.prepare(`
        INSERT INTO audit_log (id, action, target_type, target_id, metadata)
        VALUES (?, 'EDIT_USER', 'USER', ?, ?)
      `).bind(createId("audit"), id, JSON.stringify({ role: normalizedRole || undefined, organizationId, status, notes })).run();

      const updated = await db.prepare(`
        SELECT u.*, m.role, o.id AS org_id, o.name AS org_name
        FROM users u
        LEFT JOIN memberships m ON m.user_id = u.id
          AND m.status = 'ACTIVE'
          AND m.organization_id = ?
        LEFT JOIN organizations o ON o.id = m.organization_id
        WHERE u.id = ?
      `).bind(admin.currentUser.organizationId, id).first();

      return NextResponse.json({
        success: true,
        id,
        user: {
          id,
          firstName: updated?.first_name || firstName,
          lastName: updated?.last_name || lastName,
          email: updated?.email || email,
          jobTitle: updated?.job_title || jobTitle,
          phone: updated?.phone || phone,
          notes: updated?.notes || notes,
          requirePasswordReset: Boolean(updated?.require_password_reset),
          status: updated?.status || status,
          role: updated?.role || role,
          org: updated?.org_name,
          memberships: updated?.org_id ? [{ orgId: updated.org_id, orgName: updated.org_name, role: updated.role }] : [],
        },
        message: "User updated successfully.",
      });
    }

    const user = await prisma.$transaction(async (tx) => {
      const existingMembership = await getPrismaTargetMembershipForCurrentOrg(tx, id, admin.currentUser.organizationId);
      if (!existingMembership) {
        throw new Error("USER_NOT_FOUND_IN_ORG");
      }
      if (!isSameOrganizationUpdate({
        currentOrganizationId: admin.currentUser.organizationId,
        targetOrganizationId: existingMembership.organizationId,
        requestedOrganizationId: organizationId || existingMembership.organizationId,
      })) {
        throw new Error("CROSS_ORG_UPDATE");
      }
      const activeSuperAdminCount = await countPrismaActiveSuperAdmins(tx);
      if (wouldRemoveFinalSuperAdmin({
        activeSuperAdminCount,
        targetCurrentRole: existingMembership.role,
        nextRole: normalizedRole || existingMembership.role,
        nextStatus: status,
      })) {
        throw new Error("FINAL_SUPER_ADMIN");
      }

      // Update User fields
      const updateData: any = {
        firstName,
        lastName,
        jobTitle,
        status,
      };

      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      const updatedUser = await tx.user.update({
        where: { id },
        data: updateData,
      });

      // Update Membership if organization or role changed
      if (organizationId || role) {
        await tx.membership.update({
          where: { id: existingMembership.id },
          data: {
            organizationId: organizationId || existingMembership.organizationId,
            role: normalizedRole || existingMembership.role,
          }
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "EDIT_USER",
          targetType: "USER",
          targetId: id,
          metadata: JSON.stringify({ role: normalizedRole || undefined, organizationId, status }),
        },
      });

      return updatedUser;
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND_IN_ORG") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "CROSS_ORG_UPDATE") {
      return NextResponse.json({ error: "Cross-organization user updates are not allowed." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "FINAL_SUPER_ADMIN") {
      return NextResponse.json({ error: "At least one active Super Admin is required." }, { status: 403 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Could not update user. Please try again." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await requireSuperAdmin(request);
  if (admin.response) return admin.response;

  try {
    const id = params.id;

    const db = await getD1Database();
    if (db) {
      const existingMembership = await getTargetMembershipForCurrentOrg(db, id, admin.currentUser.organizationId);
      if (!existingMembership) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const activeSuperAdminCount = await countActiveSuperAdmins(db);
      if (wouldRemoveFinalSuperAdmin({
        activeSuperAdminCount,
        targetCurrentRole: existingMembership.role,
        archive: true,
      })) {
        return NextResponse.json({ error: "At least one active Super Admin is required." }, { status: 403 });
      }
      await db.batch([
        db.prepare("UPDATE users SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id),
        db.prepare(`
          INSERT INTO audit_log (id, action, target_type, target_id)
          VALUES (?, 'ARCHIVE_USER', 'USER', ?)
        `).bind(createId("audit"), id),
      ]);

      return NextResponse.json({ success: true });
    }

    await prisma.$transaction(async (tx) => {
      const existingMembership = await getPrismaTargetMembershipForCurrentOrg(tx, id, admin.currentUser.organizationId);
      if (!existingMembership) {
        throw new Error("USER_NOT_FOUND_IN_ORG");
      }
      const activeSuperAdminCount = await countPrismaActiveSuperAdmins(tx);
      if (wouldRemoveFinalSuperAdmin({
        activeSuperAdminCount,
        targetCurrentRole: existingMembership.role,
        archive: true,
      })) {
        throw new Error("FINAL_SUPER_ADMIN");
      }
      // Archive or delete? User requested Archive action.
      // For now, let's just set status to ARCHIVED.
      await tx.user.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "ARCHIVE_USER",
          targetType: "USER",
          targetId: id,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND_IN_ORG") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "FINAL_SUPER_ADMIN") {
      return NextResponse.json({ error: "At least one active Super Admin is required." }, { status: 403 });
    }
    console.error("Error archiving user:", error);
    return NextResponse.json({ error: "Could not archive user" }, { status: 500 });
  }
}
