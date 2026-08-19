import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { measurementsSchema } from "@/lib/stitchMeasurements";
import { notifyUser } from "@/lib/notifications";

const updateSchema = z
  .object({
    status: z.enum(["not_started", "pending", "stitched", "out_for_delivery", "delivered"]).optional(),
    bookingStatus: z.enum(["requested", "accepted", "rejected"]).optional(),
    visitCompleted: z.boolean().optional(),
    measurements: measurementsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });

  const order = await prisma.stitchOrder.update({
    where: { id: Number(id) },
    data: parsed.data,
  });

  if (parsed.data.bookingStatus === "accepted") {
    notifyUser(
      order.userId,
      "Booking accepted",
      "Your tailor visit request has been accepted. We'll see you at the scheduled time.",
      "/stitching/my-orders"
    ).catch((err) => console.error("Booking notification failed", err));
  } else if (parsed.data.bookingStatus === "rejected") {
    notifyUser(
      order.userId,
      "Booking not accepted",
      "Sorry, we couldn't accept your tailor visit request. Please try a different date/time.",
      "/stitching/my-orders"
    ).catch((err) => console.error("Booking notification failed", err));
  } else if (parsed.data.status) {
    notifyUser(
      order.userId,
      "Stitching order updated",
      `Your stitching order status is now "${parsed.data.status.replace(/_/g, " ")}".`,
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
