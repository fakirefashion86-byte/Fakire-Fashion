"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Notification = {
  id: number;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

// Full-page counterpart to NotificationBell's dropdown — same endpoints, same
// mark-read/mark-all-read actions, just rendered as a standalone list for the
// sidebar "Notifications" screen instead of a header popover.
export default function FullNotificationsList({
  endpoint,
}: {
  endpoint: "/api/notifications" | "/api/admin/notifications";
}) {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setNotifications((n) => n ?? []);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function markRead(id: number) {
    setNotifications((list) => list?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? null);
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`${endpoint}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
  }

  async function markAllRead() {
    setNotifications((list) => list?.map((n) => ({ ...n, read: true })) ?? null);
    setUnreadCount(0);
    await fetch(`${endpoint}/all`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  }

  if (notifications === null) {
    return <p className="text-sm text-ink-muted">Loading notifications…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="text-sm text-accent hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-ink-muted">No notifications yet.</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {notifications.map((n) => {
            const body = (
              <div className={`px-4 py-3 text-sm ${n.read ? "" : "bg-accent/5"}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{n.title}</p>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        markRead(n.id);
                      }}
                      className="shrink-0 text-xs text-accent hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-ink-muted">{n.message}</p>
                <p className="mt-1 text-xs text-ink-muted">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            );
            return (
              <li key={n.id}>
                {n.link ? (
                  <Link href={n.link} onClick={() => !n.read && markRead(n.id)} className="block hover:bg-section">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
