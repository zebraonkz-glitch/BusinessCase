import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export type PromptSort = "popular" | "recent";

export type PromptListParams = {
  page?: number;
  search?: string;
  sort?: PromptSort;
};

export type PublicPromptItem = {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPublic: boolean;
  isFavorite: boolean;
  likesCount: number;
  likedByMe: boolean;
  createdAt: Date;
};

export type PromptListResult = {
  items: Awaited<ReturnType<typeof prisma.prompt.findMany>>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PublicPromptListResult = {
  items: PublicPromptItem[];
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

/** Публичные кейсы с лайками, likedByMe и сортировкой */
export async function getPublicPrompts(
  params: PromptListParams = {},
  currentUserId?: string,
): Promise<PublicPromptListResult> {
  const page = Math.max(1, params.page ?? 1);
  const sort = params.sort ?? "recent";
  const searchFilter = buildSearchFilter(params.search);

  const where: Prisma.PromptWhereInput = {
    isPublic: true,
    ...searchFilter,
  };

  const orderBy: Prisma.PromptOrderByWithRelationInput[] =
    sort === "popular"
      ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

  const [total, items] = await Promise.all([
    prisma.prompt.count({ where }),
    prisma.prompt.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true } },
        ...(currentUserId
          ? {
              likes: {
                where: { userId: currentUserId },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      userId: item.userId,
      title: item.title,
      content: item.content,
      isPublic: item.isPublic,
      isFavorite: item.isFavorite,
      likesCount: item._count.likes,
      likedByMe: currentUserId
        ? "likes" in item && Array.isArray(item.likes) && item.likes.length > 0
        : false,
      createdAt: item.createdAt,
    })),
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
