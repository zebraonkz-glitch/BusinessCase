import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPromptForView } from "@/lib/prompts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/dashboard/like-button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PromptPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const prompt = await getPromptForView(id, session?.user?.id);

  if (!prompt) {
    notFound();
  }

  const date = prompt.createdAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isOwner = session?.user?.id === prompt.userId;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/catalog">← Каталог</Link>
        </Button>
      </div>

      <header className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">{prompt.title}</h1>
          {prompt.isPublic && <Badge>Публичный</Badge>}
        </div>
        <p className="mt-3 text-slate-500">
          {prompt.author.name ?? "Аноним"} · {date}
        </p>
      </header>

      <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap text-slate-700">
        {prompt.content}
      </div>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        {prompt.isPublic ? (
          <LikeButton
            promptId={prompt.id}
            initialLiked={prompt.likedByMe}
            initialCount={prompt.likesCount}
            loginRedirect={`/prompts/${prompt.id}`}
          />
        ) : (
          <span className="text-sm text-slate-500">Приватный кейс</span>
        )}

        {isOwner && (
          <Button asChild variant="outline">
            <Link href="/dashboard">Управлять в кабинете</Link>
          </Button>
        )}
      </footer>
    </article>
  );
}
