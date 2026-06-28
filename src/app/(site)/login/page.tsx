import { signIn } from "@/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl ?? "/dashboard");
  }

  const redirectTo = callbackUrl ?? "/dashboard";

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Вход</h1>
        <p className="mt-2 text-slate-500">Business Case — Case Store</p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-sky-600 px-4 py-3 text-white hover:bg-sky-700"
          >
            Войти через Google
          </button>
        </form>

        <p className="mt-6">
          <Link href="/" className="text-sm text-sky-600 hover:underline">
            ← На главную
          </Link>
        </p>
      </div>
    </div>
  );
}
