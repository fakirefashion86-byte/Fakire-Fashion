import crypto from "crypto";
import Razorpay from "razorpay";
import type { Order as PrismaOrder } from "@prisma/client";
import { prisma } from "@/lib/prisma";

let client: Razorpay | null = null;

/** Lazy singleton — throws only when a route actually needs Razorpay and the keys aren't configured. */
function getClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)");
  }
  if (!client) {
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return client;
}

/**
 * Creates the Razorpay order for a given (already-persisted) order, or reuses the
 * existing one if it was already created — so a payment retry after an abandoned
 * checkout doesn't create a second Razorpay order for the same amount.
 */
export async function ensureRazorpayOrder(order: PrismaOrder) {
  if (order.razorpayOrderId) {
    return { razorpayOrderId: order.razorpayOrderId, amountPaise: Math.round(Number(order.netAmount) * 100) };
  }

  const amountPaise = Math.round(Number(order.netAmount) * 100);
  const rzpOrder = await getClient().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: order.orderNumber,
    notes: { orderId: String(order.id), orderNumber: order.orderNumber },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzpOrder.id },
  });

  return { razorpayOrderId: rzpOrder.id, amountPaise };
}

export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("Razorpay is not configured (RAZORPAY_KEY_SECRET missing)");

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  const provided = params.razorpaySignature ?? "";
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
