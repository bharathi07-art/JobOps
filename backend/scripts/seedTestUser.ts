import prisma from "../config/prisma";
import bcrypt from "bcrypt";

async function main() {
  const email = "cs235114107@bhc.edu.in";
  const password = "TESTpassword";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email,
        password: hashedPassword,
        avatar: "",
        isAdmin: false,
        subscriptionPlan: "Free",
      }
    });
    console.log("✅ Seeded test user:", user.email);
  } else {
    console.log("ℹ️ Test user already exists");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding test user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
