import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Лёгкая проверка cookie сессии без импорта auth.ts / Prisma.
 * Edge Function остаётся < 1 MB (лимит Vercel Hobby).
 * Полная валидация сессии — в server components через requireSession().
 */
function hasSessionCookie(request: NextRequest): boolean {
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ] as const;

  return cookieNames.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = hasSessionCookie(request);

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/my-prompts");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-prompts/:path*", "/login"],
};
