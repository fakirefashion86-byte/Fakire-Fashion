import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { notifyAdmins, notifyUser } from "@/lib/notifications";

const verifySchema = z.object({
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment confirmation" }, { status: 400 });
  }
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const order = await prisma.order.findUnique({ where: { razorpayOrderId }, include: { items: true } });
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "paid") {
    return NextResponse.json({ order });
  }

  const valid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "paid", razorpayPaymentId },
    include: { items: true },
  });

  await Promise.all([
    notifyUser(
      session.userId,
      "Payment received",
      `Payment for order ${updated.orderNumber} was successful.`,
      `/orders/${updated.id}`
    ),
    notifyAdmins(
      "Payment received",
      `Payment for order ${updated.orderNumber} was confirmed via Razorpay.`,
      `/admin/orders/${updated.id}`
    ),
  ]).catch((err) => console.error("Payment notification failed", err));

  return NextResponse.json({ order: updated });
}
