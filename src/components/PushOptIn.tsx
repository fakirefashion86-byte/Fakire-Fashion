"use client";

import { useEffect, useState } from "react";

// Bell icon toggle for browser push. Sits next to NotificationBell — that
// component is the in-app history/polling view, this is the opt-in for
// receiving alerts even when the tab isn't open. Permission requests need a
// user gesture in most browsers, so this never auto-prompts on mount.

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type Status = "unsupported" | "unconfigured" | "loading" | "off" | "on" | "denied";

// Capability check. Must return the same thing on the server and on the
// client's first render (React hydration compares them), so it can't read
// browser-only state like `Notification.permission` here — that's resolved
// in the effect below instead, after mount.
function initialStatus(): Status {
  if (!VAPID_PUBLIC_KEY) return "unconfigured";
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  return "loading";
}

export default function PushOptIn({ dark = false }: { dark?: boolean }) {
  const [status, setStatus] = useState<Status>(initialStatus);

  useEffect(() => {
    if (status !== "loading") return;

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "on" : "off"))
      .catch(() => setStatus("off"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enable() {
    if (!VAPID_PUBLIC_KEY) return;
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setStatus("on");
    } catch (err) {
      console.error("Failed to enable push notifications", err);
      setStatus("off");
    }
  }

  async function disable() {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch (err) {
      console.error("Failed to disable push notifications", err);
      setStatus("on");
    }
  }

  if (status === "unsupported" || status === "unconfigured" || status === "loading") return null;

  const textClass = dark ? "text-white/70 hover:text-white" : "text-foreground/60 hover:text-accent-hover";

  if (status === "denied") {
    return (
      <span className={`text-xs ${textClass}`} title="Notifications are blocked in your browser settings">
        Push blocked
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={status === "on" ? disable : enable}
      className={`text-xs underline-offset-2 hover:underline ${textClass}`}
    >
      {status === "on" ? "Push on" : "Enable push"}
    </button>
  );
}
