import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Business Case</h1>
      <p className="mt-2 text-slate-500">Case Store — промты и бизнес-кейсы</p>

      <nav className="mt-6 flex gap-4">
        {session?.user ? (
          <>
            <Link href="/dashboard" className="text-sky-600 hover:underline">
              Личный кабинет
            </Link>
            <Link href="/dashboard/public" className="text-sky-600 hover:underline">
              Публичные кейсы
            </Link>
          </>
        ) : (
          <Link href="/login" className="text-sky-600 hover:underline">
            Войти
          </Link>
        )}
      </nav>

      <h2 className="mt-8 text-lg font-semibold">Последние заметки</h2>
      {notes.length === 0 ? (
        <p className="mt-4 text-slate-500">Заметок пока нет.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <strong>{note.title}</strong>
              <time
                className="mt-1 block text-sm text-slate-500"
                dateTime={note.createdAt.toISOString()}
              >
                {note.createdAt.toLocaleString("ru-RU")}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
