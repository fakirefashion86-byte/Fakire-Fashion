import { prisma } from "@/lib/prisma";
import { sendPushToUser, sendPushToRole } from "@/lib/push";

// Centralized notification creation so every order/booking/product event writes
// a consistent row instead of ad-hoc inserts scattered across API routes.
// Notifications are always written in-app; Web Push is fired alongside them
// best-effort (see lib/push.ts) so the DB write never fails because a push
// subscription is stale or push isn't configured.

export async function notifyUser(userId: number, title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: { userId, audience: "customer", title, message, link },
  });
  await sendPushToUser(userId, { title, body: message, link }).catch((err) => {
    console.error("Push to user failed", err);
  });
}

// Broadcast to all admins (and, where relevant, tailors) — read via
// /api/admin/notifications, which any staff session can poll regardless of
// which audience row they were written under, except tailors only see "tailor".
export async function notifyAdmins(title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: { userId: null, audience: "admin", title, message, link },
  });
  await sendPushToRole("admin", { title, body: message, link }).catch((err) => {
    console.error("Push to admins failed", err);
  });
}

export async function notifyTailors(title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: { userId: null, audience: "tailor", title, message, link },
  });
  await sendPushToRole("tailor", { title, body: message, link }).catch((err) => {
    console.error("Push to tailors failed", err);
  });
}
