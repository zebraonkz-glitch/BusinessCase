"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  defaultValues?: {
    title?: string;
    content?: string;
    isPublic?: boolean;
  };
  onSubmit: (formData: FormData) => void;
  pending?: boolean;
};

export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  pending,
}: PromptDialogProps) {
  const [isPublic, setIsPublic] = useState(defaultValues?.isPublic ?? false);

  useEffect(() => {
    setIsPublic(defaultValues?.isPublic ?? false);
  }, [defaultValues?.isPublic, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              name="title"
              defaultValue={defaultValues?.title}
              placeholder="Название кейса"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Содержание</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={defaultValues?.content}
              placeholder="Опишите кейс или промт"
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <div>
              <Label htmlFor="isPublic">Публичный кейс</Label>
              <p className="text-xs text-slate-500">Виден всем пользователям</p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <input type="hidden" name="isPublic" value={String(isPublic)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохранение…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
