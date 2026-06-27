import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <h1>Заметки</h1>
      <p className="subtitle">Данные из PostgreSQL (Neon) через Prisma</p>

      {notes.length === 0 ? (
        <p className="empty">Заметок пока нет. Запустите seed или добавьте данные в Neon.</p>
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
