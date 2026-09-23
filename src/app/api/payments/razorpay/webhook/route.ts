import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { notifyAdmins, notifyUser } from "@/lib/notifications";

/**
 * Backstop for the client-side verify flow: Razorpay calls this directly, so a
 * payment still gets marked paid/failed even if the customer's browser closes
 * before the checkout `handler` callback (or the verify call) runs.
 *
 * Configure this URL in the Razorpay dashboard → Settings → Webhooks, with
 * "Active Events" limited to (at minimum):
 *   - payment.captured   (funds actually captured — the authoritative "paid" signal)
 *   - payment.failed     (attempt failed — insufficient funds, bank decline, timeout, etc.)
 *   - order.paid         (backstop for orders that skip a standalone payment.captured event)
 *   - refund.processed   (admin/API-initiated refund settled — mirror it locally)
 * Put the webhook's "Secret" into RAZORPAY_WEBHOOK_SECRET (must match exactly;
 * it's a separate value from RAZORPAY_KEY_SECRET).
 *
 * payment.authorized is deliberately NOT required: this integration doesn't use
 * manual capture, so authorized-but-not-captured payments aren't treated as paid.
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

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const event = payload.event as string;

  try {
    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrderId: string | undefined = payment?.order_id;
      const razorpayPaymentId: string | undefined = payment?.id;
      if (razorpayOrderId && razorpayPaymentId) {
        const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
        // Idempotent: retries of the same event (Razorpay retries on any non-2xx,
        // and up to a few times even on 2xx in rare cases) must not re-notify.
        if (order && order.paymentStatus !== "paid") {
          const updated = await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "paid", razorpayPaymentId },
          });
          await Promise.all([
            notifyUser(
              updated.userId,
              "Payment received",
              `Payment for order ${updated.orderNumber} was successful.`,
              `/orders/${updated.id}`
            ),
            notifyAdmins(
              "Payment received",
              `Payment for order ${updated.orderNumber} was confirmed via Razorpay webhook.`,
              `/admin/orders/${updated.id}`
            ),
          ]).catch((err) => console.error("Payment notification failed", err));
        }
      }
    } else if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrderId: string | undefined = payment?.order_id;
      const reason: string = payment?.error_description || payment?.error_reason || "Payment failed";
      if (razorpayOrderId) {
        const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
        // Never downgrade an order that's already paid (a stale/duplicate failure
        // event for an earlier attempt must not clobber a later successful retry),
        // and don't re-notify if we already recorded this as failed.
        if (order && order.paymentStatus === "pending") {
          const updated = await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "failed" },
          });
          await Promise.all([
            notifyUser(
              updated.userId,
              "Payment failed",
              `Payment for order ${updated.orderNumber} failed: ${reason}. You can retry payment from your order page.`,
              `/orders/${updated.id}`
            ),
            notifyAdmins(
              "Payment failed",
              `Payment for order ${updated.orderNumber} failed via Razorpay: ${reason}.`,
              `/admin/orders/${updated.id}`
            ),
          ]).catch((err) => console.error("Payment-failed notification failed", err));
        }
      }
    } else if (event === "refund.processed" || event === "refund.created") {
      const refund = payload.payload?.refund?.entity;
      const razorpayPaymentId: string | undefined = refund?.payment_id;
      if (razorpayPaymentId) {
        const order = await prisma.order.findFirst({ where: { razorpayPaymentId } });
        if (order && order.paymentStatus !== "refunded") {
          const updated = await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "refunded" },
          });
          await Promise.all([
            notifyUser(
              updated.userId,
              "Payment refunded",
              `Your payment for order ${updated.orderNumber} has been refunded.`,
              `/orders/${updated.id}`
            ),
            notifyAdmins(
              "Payment refunded",
              `Order ${updated.orderNumber} was refunded via Razorpay.`,
              `/admin/orders/${updated.id}`
            ),
          ]).catch((err) => console.error("Refund notification failed", err));
        }
      }
    }
    // Any other subscribed event is acknowledged but intentionally ignored.
  } catch (err) {
    // Signature is already verified, so a failure here is our bug, not a spoofed
    // request. Log it and return 500 so Razorpay retries the delivery instead of
    // us silently losing the event.
    console.error("Razorpay webhook handling failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
