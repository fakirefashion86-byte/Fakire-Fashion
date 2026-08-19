import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Admins see admin-audience broadcasts, tailors see tailor-audience ones —
// each role only gets the notifications relevant to it.
export async function GET() {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const notifications = await prisma.notification.findMany({
    where: { audience: staff.role as "admin" | "tailor" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { audience: staff.role as "admin" | "tailor", read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}
