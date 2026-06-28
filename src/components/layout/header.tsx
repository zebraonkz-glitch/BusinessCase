import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/actions/auth";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/dashboard", label: "Мои кейсы" },
] as const;

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-sky-700">
          Business Case
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-700"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                      {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 md:inline">
                    {user.name ?? user.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/">Главная</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Личный кабинет</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action={signOutAction}>
                    <button type="submit" className="w-full text-left">
                      Выйти
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Войти</Link>
            </Button>
          )}
        </div>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="whitespace-nowrap text-sm font-medium text-slate-600"
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
