import FullNotificationsList from "@/components/FullNotificationsList";

export default function DeliveryNotificationsPage() {
  return <FullNotificationsList endpoint="/api/notifications" />;
}
