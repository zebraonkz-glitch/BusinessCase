"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Lock,
  MessageSquare,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createPrompt,
  deletePrompt,
  toggleFavorite,
  togglePublic,
  updatePrompt,
} from "@/actions/prompts";
import { PromptDialog } from "@/components/dashboard/prompt-dialog";
import { LikeButton } from "@/components/dashboard/like-button";
import { cn } from "@/lib/utils";

export type PromptItem = {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPublic: boolean;
  isFavorite: boolean;
  likesCount?: number;
  likedByMe?: boolean;
};

type PromptCardProps = {
  prompt: PromptItem;
  currentUserId: string;
  onEdit?: (prompt: PromptItem) => void;
  showLike?: boolean;
};

function preview(text: string) {
  const line = text.replace(/\s+/g, " ").trim();
  return line.length > 140 ? `${line.slice(0, 140)}…` : line;
}

export function PromptCard({ prompt, currentUserId, onEdit, showLike }: PromptCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorite, setFavorite] = useState(prompt.isFavorite);
  const [isPublic, setIsPublic] = useState(prompt.isPublic);
  const isOwner = prompt.userId === currentUserId;

  useEffect(() => {
    setFavorite(prompt.isFavorite);
    setIsPublic(prompt.isPublic);
  }, [prompt.isFavorite, prompt.isPublic]);

  const runAction = (fn: () => Promise<unknown>) => {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm("Удалить этот кейс?")) return;
    runAction(() => deletePrompt(prompt.id));
  };

  return (
    <article
      className={cn(
        "flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        isPending && "opacity-70",
      )}
    >
      <div className="mt-1 rounded-lg bg-sky-50 p-2 text-sky-600">
        <MessageSquare className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">{prompt.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {preview(prompt.content)}
        </p>
        {isPublic && (
          <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
            Публичный
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {showLike && prompt.isPublic && (
          <LikeButton
            promptId={prompt.id}
            initialLiked={prompt.likedByMe ?? false}
            initialCount={prompt.likesCount ?? 0}
          />
        )}

        {isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Избранное"
            onClick={() => {
              setFavorite((v) => !v);
              runAction(() => toggleFavorite(prompt.id));
            }}
          >
            <Star
              className={cn(
                "h-4 w-4",
                favorite ? "fill-amber-400 text-amber-400" : "text-slate-400",
              )}
            />
          </Button>
        )}

        {isOwner && onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Редактировать"
            onClick={() => onEdit(prompt)}
          >
            <Pencil className="h-4 w-4 text-slate-500" />
          </Button>
        )}

        {isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isPublic ? "Сделать приватным" : "Сделать публичным"}
            onClick={() => {
              setIsPublic((v) => !v);
              runAction(() => togglePublic(prompt.id));
            }}
          >
            {isPublic ? (
              <Globe className="h-4 w-4 text-emerald-600" />
            ) : (
              <Lock className="h-4 w-4 text-slate-500" />
            )}
          </Button>
        )}

        {isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Удалить"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    </article>
  );
}

export function PromptCardList({
  prompts,
  currentUserId,
  editable,
  showLike,
}: {
  prompts: PromptItem[];
  currentUserId: string;
  editable?: boolean;
  showLike?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<PromptItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (formData: FormData) => {
    if (!editing) return;
    startTransition(async () => {
      await updatePrompt(editing.id, formData);
      setEditing(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="space-y-3">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            currentUserId={currentUserId}
            onEdit={editable ? setEditing : undefined}
            showLike={showLike}
          />
        ))}
      </div>

      {editing && (
        <PromptDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          title="Редактировать кейс"
          defaultValues={{
            title: editing.title,
            content: editing.content,
            isPublic: editing.isPublic,
          }}
          onSubmit={handleUpdate}
          pending={isPending}
        />
      )}
    </>
  );
}

export function CreatePromptButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      const result = await createPrompt(formData);
      if (!result.error) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Новый кейс</Button>
      <PromptDialog
        open={open}
        onOpenChange={setOpen}
        title="Новый кейс"
        onSubmit={handleCreate}
        pending={isPending}
      />
    </>
  );
}
