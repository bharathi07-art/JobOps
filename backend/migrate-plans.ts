import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  console.log('Migrating ProMonthly and ProYearly to Monthly and Yearly...');
  
  // Fix ProMonthly
  const resultMonthly = await prisma.user.updateMany({
    where: { subscriptionPlan: { in: ['ProMonthly', 'Monthly'] } },
    data: { subscriptionPlan: 'Monthly', subscriptionStatus: 'active' }
  });
  console.log(`Updated ${resultMonthly.count} users to Monthly and active`);

  // Fix ProYearly
  const resultYearly = await prisma.user.updateMany({
    where: { subscriptionPlan: { in: ['ProYearly', 'Yearly'] } },
    data: { subscriptionPlan: 'Yearly', subscriptionStatus: 'active' }
  });
  console.log(`Updated ${resultYearly.count} users to Yearly and active`);

  // Also fix the specific user who wanted Yearly
  const user = await prisma.user.updateMany({
    where: { email: 'bharathi07bharathi07@gmail.com' },
    data: { 
      plan: 'Yearly', 
      subscriptionPlan: 'Yearly', 
      subscriptionStatus: 'active',
      billingCycle: 'Yearly' 
    }
  });
  console.log(`Updated bharathi07bharathi07@gmail.com to Yearly`);
}

runMigration()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
