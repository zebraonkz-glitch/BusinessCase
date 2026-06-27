import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getMyCases } from "@/lib/cases";
import { SignOutButton } from "@/components/sign-out-button";

export default async function MyPromptsPage() {
  const session = await requireSession();
  const prompts = await getMyCases(session.user.id);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Мои кейсы</h1>
          <p className="muted">Приватные видны только вам</p>
        </div>
        <SignOutButton />
      </header>

      {prompts.length === 0 ? (
        <p className="muted">Кейсов пока нет.</p>
      ) : (
        <ul className="list">
          {prompts.map((prompt) => (
            <li key={prompt.id} className="card">
              <div className="row">
                <strong>{prompt.title}</strong>
                <span className="badge">{prompt.visibility}</span>
              </div>
              <p className="muted">{prompt.category.category}</p>
              <p className="snippet">{prompt.content.slice(0, 120)}…</p>
            </li>
          ))}
        </ul>
      )}

      <p>
        <Link href="/dashboard">← Личный кабинет</Link>
      </p>
    </main>
  );
}
