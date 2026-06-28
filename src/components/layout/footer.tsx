import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
        <p>© Business Case {year}</p>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-sky-700">
            Главная
          </Link>
          <Link href="/policy" className="hover:text-sky-700">
            Политика
          </Link>
          <Link href="/contacts" className="hover:text-sky-700">
            Контакты
          </Link>
        </div>
      </div>
    </footer>
  );
}
