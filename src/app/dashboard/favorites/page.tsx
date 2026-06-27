import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { getFavoritePrompts } from "@/lib/prompts";
import { searchSchema } from "@/lib/validations/prompt";
import { PromptsView } from "@/components/dashboard/prompts-view";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function FavoritesPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const params = searchSchema.parse(await searchParams);
  const data = await getFavoritePrompts(session.user.id, {
    page: params.page,
    search: params.q,
  });

  return (
    <Suspense fallback={<p className="text-slate-500">Загрузка…</p>}>
      <PromptsView
        title="Избранное"
        subtitle="Избранное"
        prompts={data.items}
        currentUserId={session.user.id}
        totalPages={data.totalPages}
        page={data.page}
        editable
      />
    </Suspense>
  );
}
