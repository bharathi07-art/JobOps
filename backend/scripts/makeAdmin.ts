import prisma from '../config/prisma'

async function makeUserAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
      select: { id: true, name: true, email: true, isAdmin: true }
    })
    console.log('✅ User promoted to admin:', user)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.code === 'P2025') {
      console.error('User not found with email:', email)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]
if (!email) {
  console.log('Usage: npx ts-node scripts/makeAdmin.ts <email>')
  console.log('Example: npx ts-node scripts/makeAdmin.ts admin@jobops.ai')
  process.exit(1)
}

makeUserAdmin(email)
