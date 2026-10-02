import { PrismaClient } from '@prisma/client';

// This file is used by the app as a simple PrismaClient singleton.
// Prisma config helpers like `defineConfig` are not available in @prisma/client.
const prisma = new PrismaClient();

export default prisma;

