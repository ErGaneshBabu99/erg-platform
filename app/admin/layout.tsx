import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"];
  if (!allowedRoles.includes(session.user.role as string)) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <AdminSidebar userRole={session.user.role as string} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
