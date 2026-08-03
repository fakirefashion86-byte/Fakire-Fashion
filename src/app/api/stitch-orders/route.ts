import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { measurementsSchema } from "@/lib/stitchMeasurements";

const createSchema = z.object({
  stitchCategoryId: z.number().int(),
  measurements: measurementsSchema,
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerMobile: z.string().min(1),
  customerAddress: z.string().min(1),
  preferredDate: z.string().min(1),
  preferredTimeSlot: z.string().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const orders = await prisma.stitchOrder.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { stitchCategory: true },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const category = await prisma.stitchCategory.findUnique({
    where: { id: parsed.data.stitchCategoryId },
  });
  if (!category) return NextResponse.json({ error: "Invalid stitching category" }, { status: 400 });

  const order = await prisma.stitchOrder.create({
    data: {
      userId: session.userId,
      stitchCategoryId: parsed.data.stitchCategoryId,
      measurements: parsed.data.measurements,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerMobile: parsed.data.customerMobile,
      customerAddress: parsed.data.customerAddress,
      preferredDate: new Date(parsed.data.preferredDate),
      preferredTimeSlot: parsed.data.preferredTimeSlot,
      status: "not_started",
    },
  });

  return NextResponse.json({ order });
}
