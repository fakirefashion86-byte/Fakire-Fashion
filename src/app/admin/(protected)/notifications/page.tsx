import FullNotificationsList from "@/components/FullNotificationsList";

export default function AdminNotificationsPage() {
  return <FullNotificationsList endpoint="/api/admin/notifications" />;
}
