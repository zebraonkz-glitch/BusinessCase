import Link from "next/link";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Личный кабинет</h1>
          <p className="muted">userId: {session.user.id}</p>
        </div>
        <SignOutButton />
      </header>

      <section className="card">
        <p>
          Здравствуйте, <strong>{session.user.name ?? session.user.email}</strong>
        </p>
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="avatar" width={48} height={48} />
        )}
        <nav className="nav-links">
          <Link href="/my-prompts">Мои промты</Link>
          <Link href="/">На главную</Link>
        </nav>
      </section>
    </main>
  );
}
