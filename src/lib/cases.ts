import { Visibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Публичные промты — видны всем; приватные — только владельцу */
export async function getCaseForUser(caseId: string, userId: string | null) {
  const item = await prisma.case.findUnique({
    where: { id: caseId },
    include: { category: true, owner: { select: { id: true, name: true, email: true } } },
  });

  if (!item) return null;
  if (item.visibility === Visibility.PUBLIC) return item;
  if (userId && item.ownerId === userId) return item;

  return null;
}

/** Промты текущего пользователя (включая приватные) */
export async function getMyCases(userId: string) {
  return prisma.case.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });
}

/** Публичные промты для каталога */
export async function getPublicCases() {
  return prisma.case.findMany({
    where: { visibility: Visibility.PUBLIC },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      owner: { select: { id: true, name: true, image: true } },
    },
  });
}
