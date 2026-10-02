import { PrismaClient } from '@prisma/client';
import { getUserSubscription } from './services/subscriptionService';

const prisma = new PrismaClient();

async function checkSub() {
  const user = await prisma.user.findFirst({
    where: { email: 'bharathi07bharathi07@gmail.com' }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User DB state:', {
    id: user.id,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus,
  });

  const sub = await getUserSubscription(user.id);
  console.log('Processed subscription:', sub);
}

checkSub().finally(() => prisma.$disconnect());
