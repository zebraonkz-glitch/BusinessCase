"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  promptId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({
  promptId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    // Оптимистичное обновление
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch(`/api/prompts/${promptId}/like`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.status === 401) {
        setLiked(prevLiked);
        setCount(prevCount);
        router.push("/login?callbackUrl=/dashboard/public");
        return;
      }

      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        setError(data.error ?? "Попробуйте позже");
        return;
      }

      setLiked(data.liked);
      setCount(data.likesCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      setError("Попробуйте позже");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={handleClick}
        className={cn(
          "h-8 gap-1.5 px-2",
          liked && "text-sky-600 hover:text-sky-700",
        )}
        aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
      >
        <ThumbsUp
          className={cn("h-4 w-4", liked && "fill-sky-500 text-sky-500")}
        />
        <span className="text-sm font-medium tabular-nums">{count}</span>
      </Button>
      {error && (
        <span className="max-w-[120px] text-center text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
