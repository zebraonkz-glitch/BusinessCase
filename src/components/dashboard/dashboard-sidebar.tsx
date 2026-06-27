"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  History,
  MessageSquare,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";

type DashboardSidebarProps = {
  userName: string;
  userImage?: string | null;
};

const navItems = [
  { href: "/dashboard", label: "Промпты", icon: MessageSquare },
  { href: "/dashboard/favorites", label: "Избранное", icon: Bookmark },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
] as const;

export function DashboardSidebar({ userName, userImage }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col bg-gradient-to-b from-sky-100 via-sky-50 to-blue-100 px-4 py-6 shadow-inner">
      <div className="mb-8 flex items-center gap-3 px-2">
        {userImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userImage}
            alt=""
            className="h-12 w-12 rounded-full border-2 border-white object-cover shadow"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-sky-700 shadow">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm text-slate-500">Аккаунт</p>
          <p className="font-semibold text-slate-800">{userName}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/public"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/80 text-sky-800 shadow-sm"
                  : "text-slate-600 hover:bg-white/50 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-2">
        <SignOutButton />
      </div>
    </aside>
  );
}
