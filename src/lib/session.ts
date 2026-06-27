import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Server-side проверка: вернуть сессию или редирект на /login */
export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

/** Server-side проверка без редиректа */
export async function getOptionalSession() {
  return auth();
}
