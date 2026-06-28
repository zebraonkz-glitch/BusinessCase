import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/prompts/[id]/like
 * Toggle лайка: только авторизованные, только public prompts.
 */
export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Войдите, чтобы ставить лайки" },
        { status: 401 },
      );
    }

    const { id: promptId } = await context.params;

    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { id: true, isPublic: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Кейс не найден" }, { status: 404 });
    }

    if (!prompt.isPublic) {
      return NextResponse.json(
        { error: "Лайкать можно только публичные кейсы" },
        { status: 403 },
      );
    }

    const userId = session.user.id;

    const existing = await prisma.like.findUnique({
      where: { userId_promptId: { userId, promptId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { userId, promptId } });
    }

    const likesCount = await prisma.like.count({ where: { promptId } });

    return NextResponse.json({
      liked: !existing,
      likesCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Попробуйте позже" },
      { status: 503 },
    );
  }
}
