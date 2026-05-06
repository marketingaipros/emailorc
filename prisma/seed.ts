import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create Demo Organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: "demo-org" },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo-org",
      plan: "GROWTH",
      subscriptionStatus: "ACTIVE",
      aiCredits: 10000,
      status: "ACTIVE",
    },
  });

  const users = [
    {
      email: "admin@demo.com",
      firstName: "Super",
      lastName: "Admin",
      password: "DemoAdmin123!",
      role: "SUPER_ADMIN",
      orgSlug: "demo-org",
    },
    {
      email: "client@demo.com",
      firstName: "Client",
      lastName: "Admin",
      password: "DemoClient123!",
      role: "CLIENT_ADMIN",
      orgSlug: "demo-org",
    },
    {
      email: "editor@demo.com",
      firstName: "Demo",
      lastName: "Editor",
      password: "DemoEditor123!",
      role: "EDITOR",
      orgSlug: "demo-org",
    },
    {
      email: "reviewer@demo.com",
      firstName: "Demo",
      lastName: "Reviewer",
      password: "DemoReviewer123!",
      role: "REVIEWER",
      orgSlug: "demo-org",
    },
    {
      email: "viewer@demo.com",
      firstName: "Demo",
      lastName: "Viewer",
      password: "DemoViewer123!",
      role: "VIEWER",
      orgSlug: "demo-org",
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash,
        status: "ACTIVE",
      },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash,
        status: "ACTIVE",
      },
    });

    // Assign to Org
    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: demoOrg.id,
        },
      },
      update: {
        role: u.role,
      },
      create: {
        userId: user.id,
        organizationId: demoOrg.id,
        role: u.role,
      },
    });
  }

  console.log("Seed data created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
