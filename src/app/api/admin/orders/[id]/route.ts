import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: { status: parsed.data.status },
  });

  notifyUser(
    order.userId,
    "Order status updated",
    `Order ${order.orderNumber} is now ${parsed.data.status}.`,
    `/orders/${order.id}`
  ).catch((err) => console.error("Order status notification failed", err));

  return NextResponse.json({ order });
}
