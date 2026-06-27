import { signIn } from "@/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Вход</h1>
        <p className="muted">Business Case — Case Store</p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="btn-google">
            Войти через Google
          </button>
        </form>
      </div>
    </main>
  );
}
