import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import PushOptIn from "@/components/PushOptIn";
import TailorSidebar from "@/components/tailor/TailorSidebar";

export default async function TailorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "tailor") redirect("/tailor/login");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:flex sm:gap-8">
      <TailorSidebar />
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Tailor Dashboard</h1>
          <div className="flex items-center gap-4 text-sm">
            <NotificationBell endpoint="/api/admin/notifications" />
            <PushOptIn />
            <LogoutButton />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
