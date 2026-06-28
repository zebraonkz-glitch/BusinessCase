import { Suspense } from "react";
import { auth } from "@/auth";
import { getPublicPrompts } from "@/lib/prompts";
import { searchSchema } from "@/lib/validations/prompt";
import { PromptGrid } from "@/components/prompts/public-prompt-card";
import { CatalogSort } from "@/components/catalog/catalog-sort";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = searchSchema.parse(await searchParams);
  const data = await getPublicPrompts(
    { page: params.page, search: params.q, sort: params.sort },
    session?.user?.id,
  );

  const prompts = data.items.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    createdAt: item.createdAt,
    likesCount: item.likesCount,
    likedByMe: item.likedByMe,
    author: item.author,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Каталог</h1>
      <p className="mt-2 text-slate-500">Все публичные кейсы</p>

      <Suspense>
        <CatalogSort sort={params.sort} />
      </Suspense>

      <div className="mt-8">
        <PromptGrid
          prompts={prompts}
          emptyMessage="В каталоге пока нет публичных кейсов"
          loginRedirect="/catalog"
        />
      </div>

      {data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {params.page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/catalog?sort=${params.sort}&page=${params.page - 1}`}>
                Назад
              </Link>
            </Button>
          )}
          <span className="text-sm text-slate-500">
            Стр. {data.page} из {data.totalPages}
          </span>
          {params.page < data.totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/catalog?sort=${params.sort}&page=${params.page + 1}`}>
                Вперёд
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
