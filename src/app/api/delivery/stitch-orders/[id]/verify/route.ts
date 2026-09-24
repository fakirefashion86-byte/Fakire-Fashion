import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireDelivery } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkDeliveryOtp, clearedOtpFields, OTP_ERROR_MESSAGES } from "@/lib/deliveryOtp";
import { notifyUser } from "@/lib/notifications";

const bodySchema = z.object({ otp: z.string().min(1).max(20) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireDelivery();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter the 6-digit OTP" }, { status: 400 });

  const order = await prisma.stitchOrder.findUnique({ where: { id: Number(id) } });
  if (!order || order.deliveryPersonId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (order.status !== "out_for_delivery") {
    return NextResponse.json({ error: "This order is not out for delivery." }, { status: 400 });
  }

  const result = checkDeliveryOtp(order, parsed.data.otp);
  if (!result.ok) {
    if (result.reason === "mismatch") {
      await prisma.stitchOrder.update({
        where: { id: order.id },
        data: { deliveryOtpAttempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: `${OTP_ERROR_MESSAGES.mismatch} ${result.remainingAttempts} attempt(s) left.` },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: OTP_ERROR_MESSAGES[result.reason] }, { status: 400 });
  }

  const updated = await prisma.stitchOrder.update({
    where: { id: order.id },
    data: {
      status: "delivered",
      deliveryOtpVerifiedAt: new Date(),
      ...clearedOtpFields(),
    },
  });

  notifyUser(
    updated.userId,
    "Stitching order delivered",
    "Your stitched garment has been delivered. Thanks for choosing us!",
    "/stitching/my-orders"
  ).catch((err) => console.error("Delivery notification failed", err));

  return NextResponse.json({ order: updated });
}
