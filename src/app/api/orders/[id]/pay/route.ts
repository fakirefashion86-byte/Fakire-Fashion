import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureRazorpayOrder } from "@/lib/razorpay";

/** (Re)starts Razorpay checkout for an existing pending, unpaid, online-payment order. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id: Number(id) } });

  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (order.paymentMethod !== "RAZORPAY" || order.paymentStatus === "paid") {
    return NextResponse.json({ error: "This order does not need online payment" }, { status: 400 });
  }
  if (order.status === "cancelled") {
    return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });
  }
  if (!process.env.RAZORPAY_KEY_ID) {
    return NextResponse.json({ error: "Online payment is not configured" }, { status: 500 });
  }

  try {
    const { razorpayOrderId, amountPaise } = await ensureRazorpayOrder(order);
    return NextResponse.json({
      razorpay: { keyId: process.env.RAZORPAY_KEY_ID, orderId: razorpayOrderId, amount: amountPaise, currency: "INR" },
    });
  } catch (err) {
    console.error("Razorpay order creation failed", err);
    return NextResponse.json({ error: "Could not start online payment. Please try again." }, { status: 500 });
  }
}
