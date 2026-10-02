import prisma from '../config/prisma';

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({ where: { id } });
};
