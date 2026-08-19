import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId, audience: "customer" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: session.userId, audience: "customer", read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}
