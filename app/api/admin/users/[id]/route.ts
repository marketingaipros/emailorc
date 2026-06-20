import { NextResponse } from "next/server";
import { prisma } from "../../../../../src/lib/prisma";
import { createId, getD1Database } from "../../../../../src/lib/cloudflare-db";
import * as bcrypt from "bcryptjs";
import { requireSuperAdmin } from "../../../../../src/lib/admin-auth";

export const dynamic = "force-dynamic";

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

    const db = await getD1Database();
    if (db) {
      const existingUser = await db.prepare("SELECT id FROM users WHERE id = ?").bind(id).first();
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
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

      const existingMembership = await db.prepare("SELECT id, organization_id, role FROM memberships WHERE user_id = ? LIMIT 1")
        .bind(id)
        .first();

      if (existingMembership) {
        await db.prepare(`
          UPDATE memberships
          SET organization_id = ?, role = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(organizationId || existingMembership.organization_id, role || existingMembership.role, existingMembership.id).run();
      } else if (organizationId && role) {
        await db.prepare(`
          INSERT INTO memberships (id, user_id, organization_id, role, status)
          VALUES (?, ?, ?, ?, 'ACTIVE')
        `).bind(createId("membership"), id, organizationId, role).run();
      }

      await db.prepare(`
        INSERT INTO audit_log (id, action, target_type, target_id, metadata)
        VALUES (?, 'EDIT_USER', 'USER', ?, ?)
      `).bind(createId("audit"), id, JSON.stringify({ role, organizationId, status, notes })).run();

      const updated = await db.prepare(`
        SELECT u.*, m.role, o.id AS org_id, o.name AS org_name
        FROM users u
        LEFT JOIN memberships m ON m.user_id = u.id
        LEFT JOIN organizations o ON o.id = m.organization_id
        WHERE u.id = ?
      `).bind(id).first();

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
        // For simplicity, we update the first membership or create one if none exists
        const existingMembership = await tx.membership.findFirst({
          where: { userId: id }
        });

        if (existingMembership) {
          await tx.membership.update({
            where: { id: existingMembership.id },
            data: {
              organizationId: organizationId || existingMembership.organizationId,
              role: role || existingMembership.role,
            }
          });
        } else if (organizationId && role) {
          await tx.membership.create({
            data: {
              userId: id,
              organizationId,
              role,
            }
          });
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "EDIT_USER",
          targetType: "USER",
          targetId: id,
          metadata: JSON.stringify({ role, organizationId, status }),
        },
      });

      return updatedUser;
    });

    return NextResponse.json(user);
  } catch (error) {
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
    console.error("Error archiving user:", error);
    return NextResponse.json({ error: "Could not archive user" }, { status: 500 });
  }
}
