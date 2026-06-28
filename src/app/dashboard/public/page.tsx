import { Suspense } from "react";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getPublicPrompts } from "@/lib/prompts";
import { searchSchema } from "@/lib/validations/prompt";
import { PromptsView } from "@/components/dashboard/prompts-view";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
};

export default async function PublicPromptsPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const params = searchSchema.parse(await searchParams);
  const data = await getPublicPrompts(
    {
      page: params.page,
      search: params.q,
      sort: params.sort,
    },
    session.user.id,
  );

  return (
    <Suspense fallback={<p className="text-slate-500">Загрузка…</p>}>
      <div>
        <div className="mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">← Мои кейсы</Link>
          </Button>
        </div>
        <PromptsView
          title="Публичные кейсы"
          subtitle="Публичные кейсы"
          prompts={data.items}
          currentUserId={session.user.id}
          totalPages={data.totalPages}
          page={data.page}
          editable
          showLike
          showSort
          sort={params.sort}
        />
      </div>
    </Suspense>
  );
}
