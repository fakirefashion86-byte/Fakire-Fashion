import FullNotificationsList from "@/components/FullNotificationsList";

export default function TailorNotificationsPage() {
  return <FullNotificationsList endpoint="/api/admin/notifications" />;
}
