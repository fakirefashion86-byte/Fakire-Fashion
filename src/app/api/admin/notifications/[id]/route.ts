import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (id === "all" || body?.all) {
    await prisma.notification.updateMany({
      where: { audience: staff.role as "admin" | "tailor", read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  const notification = await prisma.notification.findUnique({ where: { id: Number(id) } });
  if (!notification || notification.audience !== staff.role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.notification.update({ where: { id: Number(id) }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
