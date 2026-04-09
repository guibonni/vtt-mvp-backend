import { prisma } from "../config/prisma";

export async function getUserPreferences(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  if (!user) {
    throw new Error("Usuario nao encontrado");
  }

  return { preferences: user.preferences };
}

export async function updateUserPreferences(userId: string, preferences: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { preferences },
    select: { preferences: true },
  });

  return { preferences: user.preferences };
}
