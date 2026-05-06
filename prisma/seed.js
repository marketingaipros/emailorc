const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo accounts...');

  // 1. Subscription Plans
  const plans = [
    { name: 'Trial', monthlyCreditLimit: 100, basePrice: 0, features: '{"core": true}' },
    { name: 'Starter', monthlyCreditLimit: 500, basePrice: 99, features: '{"core": true, "qa": true}' },
    { name: 'Growth', monthlyCreditLimit: 2500, basePrice: 299, features: '{"core": true, "qa": true, "reply": true}' },
    { name: 'Pro', monthlyCreditLimit: 10000, basePrice: 799, features: '{"core": true, "qa": true, "reply": true, "admin": true}' },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  // 2. Organizations
  const growthPlan = await prisma.subscriptionPlan.findUnique({ where: { name: 'Growth' } });
  
  const orgs = [
    { 
      id: 'org_super_admin', 
      name: 'Account Growth Ops', 
      slug: 'growth-ops', 
      subscriptionStatus: 'ACTIVE',
      subscriptionPlanId: growthPlan.id,
      creditBalance: 50000,
      isActive: true
    },
    { 
      id: 'org_client', 
      name: 'Acme Revenue', 
      slug: 'acme-revenue', 
      subscriptionStatus: 'ACTIVE',
      subscriptionPlanId: growthPlan.id,
      creditBalance: 1832,
      isActive: true
    }
  ];

  for (const org of orgs) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: org,
      create: org,
    });
  }

  // 3. Users
  const users = [
    {
      email: 'admin@demo.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      organizationId: 'org_super_admin',
      status: 'ACTIVE',
      jobTitle: 'System Architect'
    },
    {
      email: 'client@demo.com',
      name: 'Client Admin',
      role: 'CLIENT_ADMIN',
      organizationId: 'org_client',
      status: 'ACTIVE',
      jobTitle: 'RevOps Lead'
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
