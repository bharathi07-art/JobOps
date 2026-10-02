import prisma from './config/prisma';

async function test() {
  const userId = 1; // adjust as needed
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeletionScheduled: true,
        deletionRequestedDate: new Date(),
        deletionScheduledDate: new Date(Date.now() + 7*24*60*60*1000),
        recoveryDeadlineDate: new Date(Date.now() + 7*24*60*60*1000),
      },
    });
    console.log('Update success:', user);
  } catch (e) {
    console.error('Update failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
