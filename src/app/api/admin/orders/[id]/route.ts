import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser, notifyAdmins } from "@/lib/notifications";
import { checkDeliveryOtp, clearedOtpFields, freshOtpFields } from "@/lib/deliveryOtp";

const statusSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"]).optional(),
    /// Delivery person to (re)assign when dispatching. Pass null for the admin to hand-deliver
    /// it themselves without assigning anyone.
    deliveryPersonId: z.number().int().positive().nullable().optional(),
    /// The OTP the delivery person collected from the customer, required to confirm
    /// delivery unless adminOverride is set.
    otp: z.string().min(1).max(20).optional(),
    /// Admin-only escape hatch to mark an order delivered without OTP verification
    /// (e.g. customer unreachable, lost the code). Always logged for audit.
    adminOverride: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const { status, deliveryPersonId, otp, adminOverride } = parsed.data;

  const current = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Dispatching for delivery: generate a fresh OTP and (optionally) assign a delivery person.
  if (status === "out_for_delivery") {
    const targetDeliveryPersonId = deliveryPersonId !== undefined ? deliveryPersonId : current.deliveryPersonId;
    if (targetDeliveryPersonId != null) {
      const deliveryPerson = await prisma.user.findUnique({ where: { id: targetDeliveryPersonId } });
      if (!deliveryPerson || deliveryPerson.role !== "delivery" || !deliveryPerson.approved) {
        return NextResponse.json({ error: "Invalid delivery person" }, { status: 400 });
      }
    }

    const order = await prisma.order.update({
      where: { id: current.id },
      data: {
        status: "out_for_delivery",
        deliveryPersonId: targetDeliveryPersonId,
        ...freshOtpFields(),
      },
    });

    notifyUser(
      order.userId,
      "Order out for delivery",
      `Order ${order.orderNumber} is out for delivery. Your delivery OTP is ${order.deliveryOtp} — share it with the delivery person only once you receive the order.`,
      `/orders/${order.id}`
    ).catch((err) => console.error("Order dispatch notification failed", err));

    if (targetDeliveryPersonId != null) {
      notifyUser(
        targetDeliveryPersonId,
        "New delivery assigned",
        `Order ${order.orderNumber} has been assigned to you for delivery.`,
        `/delivery/orders/${order.id}`
      ).catch((err) => console.error("Delivery assignment notification failed", err));
    }

    return NextResponse.json({ order });
  }

  // Marking delivered: require OTP verification unless there's no active OTP to check
  // (order never went through the out-for-delivery step) or the admin explicitly overrides.
  if (status === "delivered") {
    if (current.deliveryOtp) {
      if (adminOverride) {
        notifyAdmins(
          "Delivery marked without OTP",
          `${admin.name ?? "An admin"} marked order ${current.orderNumber} as delivered without OTP verification.`,
          `/admin/orders/${current.id}`
        ).catch((err) => console.error("Override audit notification failed", err));
      } else if (otp) {
        const result = checkDeliveryOtp(current, otp);
        if (!result.ok) {
          if (result.reason === "mismatch") {
            await prisma.order.update({ where: { id: current.id }, data: { deliveryOtpAttempts: { increment: 1 } } });
          }
          return NextResponse.json({ error: "Incorrect OTP", reason: result.reason }, { status: 400 });
        }
      } else {
        return NextResponse.json(
          { error: "This order has an active delivery OTP. Verify it or use adminOverride." },
          { status: 400 }
        );
      }
    }

    const order = await prisma.order.update({
      where: { id: current.id },
      data: {
        status: "delivered",
        deliveryOtpVerifiedAt: current.deliveryOtp && !adminOverride ? new Date() : current.deliveryOtpVerifiedAt,
        ...clearedOtpFields(),
      },
    });

    notifyUser(order.userId, "Order delivered", `Order ${order.orderNumber} has been delivered.`, `/orders/${order.id}`).catch(
      (err) => console.error("Order status notification failed", err)
    );

    return NextResponse.json({ order });
  }

  if (!status) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

  const order = await prisma.order.update({
    where: { id: current.id },
    data: { status },
  });

  notifyUser(order.userId, "Order status updated", `Order ${order.orderNumber} is now ${status}.`, `/orders/${order.id}`).catch(
    (err) => console.error("Order status notification failed", err)
  );

  return NextResponse.json({ order });
}
