import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      plan: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      subscriptionEndDate: true
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

listUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
