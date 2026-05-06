import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      jobTitle, 
      organizationId, 
      role, 
      status, 
      password, 
      requirePasswordReset,
      notes 
    } = body;

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
  try {
    const id = params.id;

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
