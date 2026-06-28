"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type CatalogSortProps = {
  sort: "popular" | "recent";
};

export function CatalogSort({ sort }: CatalogSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setSort = (nextSort: "popular" | "recent") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextSort);
    params.delete("page");
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="mt-6 flex rounded-lg border border-slate-200 bg-white p-1 w-fit">
      <Button
        type="button"
        variant={sort === "recent" ? "default" : "ghost"}
        size="sm"
        onClick={() => setSort("recent")}
      >
        По дате
      </Button>
      <Button
        type="button"
        variant={sort === "popular" ? "default" : "ghost"}
        size="sm"
        onClick={() => setSort("popular")}
      >
        По популярности
      </Button>
    </div>
  );
}
