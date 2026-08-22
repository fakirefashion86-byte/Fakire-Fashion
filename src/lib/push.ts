import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Web Push (VAPID) delivery — additive to the in-app Notification rows written
// by lib/notifications.ts. A user can have multiple subscriptions (one per
// browser/device); we fan out to all of them and prune any the push service
// reports as gone (404/410) instead of retrying them forever.

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

const configured = Boolean(publicKey && privateKey && subject);
if (configured) {
  webpush.setVapidDetails(subject!, publicKey!, privateKey!);
} else if (process.env.NODE_ENV === "production") {
  console.warn("Web Push is not configured (missing VAPID_* env vars) — push notifications will be skipped.");
}

export type PushPayload = {
  title: string;
  body: string;
  link?: string | null;
};

async function deliver(subscriptions: { id: number; endpoint: string; p256dh: string; auth: string }[], payload: PushPayload) {
  if (!configured || subscriptions.length === 0) return;

  const body = JSON.stringify(payload);
  const staleIds: number[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription expired or was revoked by the browser — stop targeting it.
          staleIds.push(sub.id);
        } else {
          console.error("Push delivery failed", statusCode, err);
        }
      }
    })
  );

  if (staleIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: staleIds } } }).catch(() => {});
  }
}

/** Push to every subscription belonging to one customer. */
export async function sendPushToUser(userId: number, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  await deliver(subscriptions, payload);
}

/** Push to every subscription belonging to users with the given staff role. */
export async function sendPushToRole(role: "admin" | "tailor", payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { user: { role } } });
  await deliver(subscriptions, payload);
}
