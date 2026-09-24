import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canResendOtp, freshOtpFields, msUntilResend } from "@/lib/deliveryOtp";
import { notifyUser } from "@/lib/notifications";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.stitchOrder.findUnique({ where: { id: Number(id) } });

  const isOwner = order?.userId === session.userId;
  const isStaff = session.role === "admin" || session.role === "tailor";
  if (!order || (!isOwner && !isStaff)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (order.status !== "out_for_delivery") {
    return NextResponse.json({ error: "This order is not out for delivery." }, { status: 400 });
  }
  if (!canResendOtp(order.deliveryOtpGeneratedAt)) {
    const waitSeconds = Math.ceil(msUntilResend(order.deliveryOtpGeneratedAt) / 1000);
    return NextResponse.json({ error: `Please wait ${waitSeconds}s before requesting a new OTP.` }, { status: 429 });
  }

  const updated = await prisma.stitchOrder.update({
    where: { id: order.id },
    data: freshOtpFields(),
  });

  notifyUser(
    updated.userId,
    "New delivery OTP",
    `Your new delivery OTP for your stitching order is ${updated.deliveryOtp}.`,
    "/stitching/my-orders"
  ).catch((err) => console.error("OTP resend notification failed", err));

  return NextResponse.json({ ok: true });
}
