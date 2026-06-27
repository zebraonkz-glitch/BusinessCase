import { requireSession } from "@/lib/session";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const userName = session.user.name ?? session.user.email ?? "Пользователь";

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar
        userName={userName}
        userImage={session.user.image}
      />
      <main className="flex-1 overflow-auto bg-white p-8">{children}</main>
    </div>
  );
}
