import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Backstop for the client-side verify flow: Razorpay calls this directly, so a
 * payment still gets marked paid even if the customer's browser closes before
 * the checkout `handler` callback (or the verify call) runs.
 * Configure this URL + a secret in the Razorpay dashboard → Settings → Webhooks,
 * and put that same secret in RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  const rawBody = await req.text();
  if (!signature || !verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;

  if (event === "payment.captured" || event === "order.paid") {
    const payment = payload.payload?.payment?.entity;
    const razorpayOrderId: string | undefined = payment?.order_id;
    const razorpayPaymentId: string | undefined = payment?.id;
    if (razorpayOrderId && razorpayPaymentId) {
      const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
      if (order && order.paymentStatus !== "paid") {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "paid", razorpayPaymentId },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
