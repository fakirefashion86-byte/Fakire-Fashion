import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import PushOptIn from "@/components/PushOptIn";
import DeliverySidebar from "@/components/delivery/DeliverySidebar";

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "delivery") redirect("/delivery/login");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:flex sm:gap-8">
      <DeliverySidebar />
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Delivery Dashboard</h1>
          <div className="flex items-center gap-4 text-sm">
            <NotificationBell endpoint="/api/notifications" />
            <PushOptIn />
            <LogoutButton />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
