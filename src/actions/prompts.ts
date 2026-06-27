"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOwnedPrompt } from "@/lib/prompts";
import { promptFormSchema } from "@/lib/validations/prompt";
import { requireSession } from "@/lib/session";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/public",
  "/dashboard/favorites",
] as const;

function revalidateDashboard() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

/** Создание кейса — только для авторизованного пользователя */
export async function createPrompt(formData: FormData) {
  const session = await requireSession();

  const parsed = promptFormSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    isPublic: formData.get("isPublic") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Неверные данные" };
  }

  await prisma.prompt.create({
    data: {
      userId: session.user.id,
      ...parsed.data,
    },
  });

  revalidateDashboard();
  return { success: true };
}

/** Обновление — только владелец */
export async function updatePrompt(promptId: string, formData: FormData) {
  const session = await requireSession();
  const owned = await getOwnedPrompt(promptId, session.user.id);

  if (!owned) {
    return { error: "Кейс не найден или нет доступа" };
  }

  const parsed = promptFormSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    isPublic: formData.get("isPublic") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Неверные данные" };
  }

  await prisma.prompt.update({
    where: { id: promptId },
    data: parsed.data,
  });

  revalidateDashboard();
  return { success: true };
}

/** Удаление — только владелец */
export async function deletePrompt(promptId: string) {
  const session = await requireSession();
  const owned = await getOwnedPrompt(promptId, session.user.id);

  if (!owned) {
    return { error: "Кейс не найден или нет доступа" };
  }

  await prisma.prompt.delete({ where: { id: promptId } });

  revalidateDashboard();
  return { success: true };
}

/** Переключение public/private — только владелец */
export async function togglePublic(promptId: string) {
  const session = await requireSession();
  const owned = await getOwnedPrompt(promptId, session.user.id);

  if (!owned) {
    return { error: "Кейс не найден или нет доступа" };
  }

  await prisma.prompt.update({
    where: { id: promptId },
    data: { isPublic: !owned.isPublic },
  });

  revalidateDashboard();
  return { success: true, isPublic: !owned.isPublic };
}

/** Избранное — только для своих кейсов */
export async function toggleFavorite(promptId: string) {
  const session = await requireSession();
  const owned = await getOwnedPrompt(promptId, session.user.id);

  if (!owned) {
    return { error: "Кейс не найден или нет доступа" };
  }

  await prisma.prompt.update({
    where: { id: promptId },
    data: { isFavorite: !owned.isFavorite },
  });

  revalidateDashboard();
  return { success: true, isFavorite: !owned.isFavorite };
}
