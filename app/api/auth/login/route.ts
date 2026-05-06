import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
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
