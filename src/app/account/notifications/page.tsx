import FullNotificationsList from "@/components/FullNotificationsList";

export default function AccountNotificationsPage() {
  return <FullNotificationsList endpoint="/api/notifications" />;
}
