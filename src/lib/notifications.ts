import { prisma } from "@/lib/prisma";

// Centralized notification creation so every order/booking/product event writes
// a consistent row instead of ad-hoc inserts scattered across API routes.
// Notifications are in-app only (no email/SMS) — see notifications API + bell UI.

export async function notifyUser(userId: number, title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: { userId, audience: "customer", title, message, link },
  });
}

// Broadcast to all admins (and, where relevant, tailors) — read via
// /api/admin/notifications, which any staff session can poll regardless of
// which audience row they were written under, except tailors only see "tailor".
export async function notifyAdmins(title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: { userId: null, audience: "admin", title, message, link },
  });
}

export async function notifyTailors(title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: { userId: null, audience: "tailor", title, message, link },
  });
}
