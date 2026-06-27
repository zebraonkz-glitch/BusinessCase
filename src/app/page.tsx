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
    <main>
      <h1>Business Case</h1>
      <p className="subtitle">Case Store — промты и бизнес-кейсы</p>

      <nav className="nav-links" style={{ marginBottom: "1.5rem" }}>
        {session?.user ? (
          <>
            <Link href="/dashboard">Личный кабинет</Link>
            <Link href="/my-prompts">Мои промты</Link>
          </>
        ) : (
          <Link href="/login">Войти</Link>
        )}
      </nav>

      <h2 style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>Последние заметки</h2>

      {notes.length === 0 ? (
        <p className="empty">Заметок пока нет.</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              <time dateTime={note.createdAt.toISOString()}>
                {note.createdAt.toLocaleString("ru-RU")}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
