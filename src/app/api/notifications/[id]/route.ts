import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mark a single notification read (or, with { all: true } in the body, every
// unread notification for this customer — used by "mark all read").
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (id === "all" || body?.all) {
    await prisma.notification.updateMany({
      where: { userId: session.userId, audience: "customer", read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  const notification = await prisma.notification.findUnique({ where: { id: Number(id) } });
  if (!notification || notification.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.notification.update({ where: { id: Number(id) }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
