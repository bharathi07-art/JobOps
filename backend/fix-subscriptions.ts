import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSubscriptions() {
  console.log('Fetching users...');
  const users = await prisma.user.findMany();
  let updatedCount = 0;
  
  for (const user of users) {
    // If the legacy plan field says Yearly/Monthly but subscriptionPlan is Free or inactive, fix it.
    if ((user.plan === 'Yearly' || user.plan === 'Monthly') && 
        (user.subscriptionStatus !== 'active' || user.subscriptionPlan === 'Free')) {
      
      const newPlan = user.plan === 'Yearly' ? 'Yearly' : 'Monthly';
      const billingCycle = user.plan === 'Yearly' ? 'Yearly' : 'Monthly';
      
      const startDate = new Date();
      const endDate = new Date();
      if (billingCycle === 'Yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionPlan: newPlan,
          subscriptionStatus: 'active',
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          billingCycle: billingCycle,
          autoRenew: true
        }
      });
      
      console.log(`Updated user ${user.email} to active ${newPlan} subscription.`);
      updatedCount++;
    }
  }
  
  console.log(`Finished. Updated ${updatedCount} users.`);
}

fixSubscriptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
