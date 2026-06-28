import Link from "next/link";
import { auth } from "@/auth";
import { getHomepagePrompts } from "@/lib/prompts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PromptGrid } from "@/components/prompts/public-prompt-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const { recent, popular } = await getHomepagePrompts(session?.user?.id);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-sky-50 to-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Business Case
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Платформа для обмена бизнес-кейсами и промтами. Изучайте лучшие
            практики и делитесь своим опытом.
          </p>

          <div className="mt-8 flex flex-col items-center gap-2">
            {session?.user ? (
              <Button asChild className="h-12 px-8 text-base">
                <Link href="/dashboard">Добавить кейс</Link>
              </Button>
            ) : (
              <>
                <Button asChild className="h-12 px-8 text-base">
                  <Link href="/login?callbackUrl=/dashboard">Добавить кейс</Link>
                </Button>
                <p className="text-sm text-slate-500">
                  Войдите, чтобы добавлять свои кейсы
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {/* Новые */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Новые</h2>
              <p className="mt-1 text-slate-500">Последние публичные кейсы</p>
            </div>
            <Link
              href="/catalog?sort=recent"
              className="text-sm font-medium text-sky-600 hover:underline"
            >
              Все →
            </Link>
          </div>
          <PromptGrid
            prompts={recent}
            emptyMessage="Публичных кейсов пока нет"
            loginRedirect="/"
          />
        </section>

        <Separator className="my-10" />

        {/* Популярные */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Популярные</h2>
              <p className="mt-1 text-slate-500">Топ по количеству лайков</p>
            </div>
            <Link
              href="/catalog?sort=popular"
              className="text-sm font-medium text-sky-600 hover:underline"
            >
              Все →
            </Link>
          </div>
          <PromptGrid
            prompts={popular}
            emptyMessage="Пока нет популярных кейсов"
            loginRedirect="/"
          />
        </section>
      </div>
    </div>
  );
}
