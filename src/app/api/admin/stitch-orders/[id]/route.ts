import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { measurementsSchema } from "@/lib/stitchMeasurements";

const updateSchema = z
  .object({
    status: z.enum(["not_started", "pending", "stitched", "out_for_delivery", "delivered"]).optional(),
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
  return NextResponse.json({ order });
}
