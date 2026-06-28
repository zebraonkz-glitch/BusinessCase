import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/dashboard/like-button";
import type { HomepagePromptItem } from "@/lib/prompts";

type PublicPromptCardProps = {
  prompt: HomepagePromptItem;
  loginRedirect?: string;
};

function preview(text: string) {
  const line = text.replace(/\s+/g, " ").trim();
  return line.length > 160 ? `${line.slice(0, 160)}…` : line;
}

export function PublicPromptCard({
  prompt,
  loginRedirect = "/",
}: PublicPromptCardProps) {
  const date = prompt.createdAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug">{prompt.title}</CardTitle>
          <Badge variant="secondary">Публичный</Badge>
        </div>
        <CardDescription>
          {prompt.author.name ?? "Аноним"} · {date}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="line-clamp-2 flex-1 text-sm text-slate-600">
          {preview(prompt.content)}
        </p>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <LikeButton
            promptId={prompt.id}
            initialLiked={prompt.likedByMe}
            initialCount={prompt.likesCount}
            loginRedirect={loginRedirect}
          />
          <Button asChild variant="outline" size="sm">
            <Link href={`/prompts/${prompt.id}`}>Открыть</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type PromptGridProps = {
  prompts: HomepagePromptItem[];
  emptyMessage: string;
  loginRedirect?: string;
};

export function PromptGrid({
  prompts,
  emptyMessage,
  loginRedirect,
}: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PublicPromptCard
          key={prompt.id}
          prompt={prompt}
          loginRedirect={loginRedirect}
        />
      ))}
    </div>
  );
}
