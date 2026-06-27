import { signIn } from "@/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Вход</h1>
        <p className="mt-2 text-slate-500">Business Case — Case Store</p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
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
      </div>
    </main>
  );
}
