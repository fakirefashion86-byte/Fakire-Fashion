import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  return (
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-end gap-4">
          <NotificationBell endpoint="/api/admin/notifications" />
          <LogoutButton />
        </div>
        <div className="min-w-0 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
