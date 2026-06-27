"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CreatePromptButton,
  PromptCardList,
  type PromptItem,
} from "@/components/dashboard/prompt-card";

type PromptsViewProps = {
  title: string;
  subtitle: string;
  prompts: PromptItem[];
  currentUserId: string;
  totalPages: number;
  page: number;
  editable?: boolean;
  showCreate?: boolean;
  publicLink?: boolean;
};

export function PromptsView({
  subtitle,
  prompts,
  currentUserId,
  totalPages,
  page,
  editable,
  showCreate,
  publicLink,
}: PromptsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  // Debounce поиска — обновляем URL только при изменении
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") ?? "";
      const trimmed = query.trim();
      if (trimmed === currentQ) return;

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.replace(`?${params.toString()}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`?${params.toString()}`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
          <h2 className="mt-1 text-lg text-slate-600">{subtitle}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {publicLink && (
            <Button asChild variant="outline">
              <Link href="/dashboard/public">Публичные кейсы</Link>
            </Button>
          )}
          {showCreate && <CreatePromptButton />}
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по заголовку или тексту…"
          className="pl-9"
        />
      </div>

      {prompts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-slate-600">
            {subtitle === "Избранное"
              ? "В избранном пока пусто — отметьте звёздочкой свой кейс"
              : subtitle === "Публичные кейсы"
                ? "Публичных кейсов пока нет"
                : "У вас пока нет кейсов — создайте первый"}
          </p>
          {showCreate && (
            <div className="mt-4">
              <CreatePromptButton />
            </div>
          )}
        </div>
      ) : (
        <PromptCardList
          prompts={prompts}
          currentUserId={currentUserId}
          editable={editable}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-500">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Назад
          </Button>
          <span>
            Стр. {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Вперёд
          </Button>
        </div>
      )}
    </div>
  );
}
