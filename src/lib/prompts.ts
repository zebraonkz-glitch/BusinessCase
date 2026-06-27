import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export type PromptListParams = {
  page?: number;
  search?: string;
};

export type PromptListResult = {
  items: Awaited<ReturnType<typeof prisma.prompt.findMany>>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function buildSearchFilter(search?: string): Prisma.PromptWhereInput | undefined {
  if (!search?.trim()) return undefined;

  return {
    OR: [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { content: { contains: search.trim(), mode: "insensitive" } },
    ],
  };
}

/** Кейсы текущего пользователя с поиском и пагинацией */
export async function getUserPrompts(
  userId: string,
  params: PromptListParams = {},
): Promise<PromptListResult> {
  const page = Math.max(1, params.page ?? 1);
  const searchFilter = buildSearchFilter(params.search);

  const where: Prisma.PromptWhereInput = {
    userId,
    ...searchFilter,
  };

  const [total, items] = await Promise.all([
    prisma.prompt.count({ where }),
    prisma.prompt.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Избранные кейсы пользователя */
export async function getFavoritePrompts(
  userId: string,
  params: PromptListParams = {},
): Promise<PromptListResult> {
  const page = Math.max(1, params.page ?? 1);
  const searchFilter = buildSearchFilter(params.search);

  const where: Prisma.PromptWhereInput = {
    userId,
    isFavorite: true,
    ...searchFilter,
  };

  const [total, items] = await Promise.all([
    prisma.prompt.count({ where }),
    prisma.prompt.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Все публичные кейсы */
export async function getPublicPrompts(
  params: PromptListParams = {},
): Promise<PromptListResult> {
  const page = Math.max(1, params.page ?? 1);
  const searchFilter = buildSearchFilter(params.search);

  const where: Prisma.PromptWhereInput = {
    isPublic: true,
    ...searchFilter,
  };

  const [total, items] = await Promise.all([
    prisma.prompt.count({ where }),
    prisma.prompt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Проверка владельца перед изменением */
export async function getOwnedPrompt(promptId: string, userId: string) {
  return prisma.prompt.findFirst({
    where: { id: promptId, userId },
  });
}

export { PAGE_SIZE };
