import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { measurementsSchema } from "@/lib/stitchMeasurements";
import { notifyUser, notifyAdmins } from "@/lib/notifications";
import { checkDeliveryOtp, clearedOtpFields, freshOtpFields } from "@/lib/deliveryOtp";

const updateSchema = z
  .object({
    status: z.enum(["not_started", "pending", "stitched", "out_for_delivery", "delivered"]).optional(),
    bookingStatus: z.enum(["requested", "accepted", "rejected"]).optional(),
    visitCompleted: z.boolean().optional(),
    measurements: measurementsSchema.optional(),
    /// Delivery person to (re)assign when dispatching (admin only). Pass null for the
    /// tailor/admin to hand-deliver it themselves without assigning anyone.
    deliveryPersonId: z.number().int().positive().nullable().optional(),
    /// The OTP collected from the customer at handoff, required to confirm delivery
    /// unless adminOverride is set.
    otp: z.string().min(1).max(20).optional(),
    /// Admin-only escape hatch to mark delivered without OTP verification.
    adminOverride: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const { status, deliveryPersonId, otp, adminOverride, ...rest } = parsed.data;
  const isAdmin = staff.role === "admin";

  const current = await prisma.stitchOrder.findUnique({ where: { id: Number(id) } });
  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (status === "out_for_delivery") {
    // Only an admin may (re)assign a dedicated delivery person; a tailor dispatching
    // stitching keeps whatever assignment already exists (usually none — self-delivery).
    const targetDeliveryPersonId =
      isAdmin && deliveryPersonId !== undefined ? deliveryPersonId : current.deliveryPersonId;
    if (targetDeliveryPersonId != null) {
      const deliveryPerson = await prisma.user.findUnique({ where: { id: targetDeliveryPersonId } });
      if (!deliveryPerson || deliveryPerson.role !== "delivery" || !deliveryPerson.approved) {
        return NextResponse.json({ error: "Invalid delivery person" }, { status: 400 });
      }
    }

    const order = await prisma.stitchOrder.update({
      where: { id: current.id },
      data: { status: "out_for_delivery", deliveryPersonId: targetDeliveryPersonId, ...freshOtpFields() },
    });

    notifyUser(
      order.userId,
      "Stitching order out for delivery",
      `Your stitched garment is out for delivery. Your delivery OTP is ${order.deliveryOtp} — share it with the delivery person only once you receive it.`,
      "/stitching/my-orders"
    ).catch((err) => console.error("Stitch dispatch notification failed", err));

    if (targetDeliveryPersonId != null) {
      notifyUser(
        targetDeliveryPersonId,
        "New delivery assigned",
        `A stitching order (${order.customerName}) has been assigned to you for delivery.`,
        `/delivery/stitch-orders/${order.id}`
      ).catch((err) => console.error("Delivery assignment notification failed", err));
    }

    return NextResponse.json({ order });
  }

  if (status === "delivered") {
    if (current.deliveryOtp) {
      if (adminOverride && isAdmin) {
        notifyAdmins(
          "Delivery marked without OTP",
          `${staff.name ?? "A staff member"} marked a stitching order (#${current.id}) as delivered without OTP verification.`,
          `/admin/stitch-orders/${current.id}`
        ).catch((err) => console.error("Override audit notification failed", err));
      } else if (otp) {
        const result = checkDeliveryOtp(current, otp);
        if (!result.ok) {
          if (result.reason === "mismatch") {
            await prisma.stitchOrder.update({
              where: { id: current.id },
              data: { deliveryOtpAttempts: { increment: 1 } },
            });
          }
          return NextResponse.json({ error: "Incorrect OTP", reason: result.reason }, { status: 400 });
        }
      } else {
        return NextResponse.json(
          { error: "This order has an active delivery OTP. Verify it to confirm delivery." },
          { status: 400 }
        );
      }
    }

    const order = await prisma.stitchOrder.update({
      where: { id: current.id },
      data: {
        status: "delivered",
        deliveryOtpVerifiedAt: current.deliveryOtp && !adminOverride ? new Date() : current.deliveryOtpVerifiedAt,
        ...clearedOtpFields(),
      },
    });

    notifyUser(
      order.userId,
      "Stitching order delivered",
      "Your stitched garment has been delivered.",
      "/stitching/my-orders"
    ).catch((err) => console.error("Stitch status notification failed", err));

    return NextResponse.json({ order });
  }

  // Any other status (not_started / pending / stitched) plus the other plain fields.
  const genericData = { ...rest, ...(status ? { status } : {}) };
  if (Object.keys(genericData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const order = await prisma.stitchOrder.update({
    where: { id: current.id },
    data: genericData,
  });

  if (rest.bookingStatus === "accepted") {
    notifyUser(
      order.userId,
      "Booking accepted",
      "Your tailor visit request has been accepted. We'll see you at the scheduled time.",
      "/stitching/my-orders"
    ).catch((err) => console.error("Booking notification failed", err));
  } else if (rest.bookingStatus === "rejected") {
    notifyUser(
      order.userId,
      "Booking not accepted",
      "Sorry, we couldn't accept your tailor visit request. Please try a different date/time.",
      "/stitching/my-orders"
    ).catch((err) => console.error("Booking notification failed", err));
  } else if (status) {
    notifyUser(
      order.userId,
      "Stitching order updated",
      `Your stitching order status is now "${status.replace(/_/g, " ")}".`,
      "/stitching/my-orders"
    ).catch((err) => console.error("Stitch status notification failed", err));
  }

  return NextResponse.json({ order });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.stitchOrder.delete({ where: { id: Number(id) } });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
