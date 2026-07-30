import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const measurementsSchema = z.object({
  length: z.number().optional(),
  shoulder: z.number().optional(),
  sleeves: z.number().optional(),
  upperChest: z.number().optional(),
  belly: z.number().optional(),
  hip: z.number().optional(),
  collar: z.number().optional(),
  cuff: z.number().optional(),
  front: z.number().optional(),
  waist: z.number().optional(),
  thigh: z.number().optional(),
  knee: z.number().optional(),
  bottom: z.number().optional(),
  crossPocket: z.boolean().optional(),
  platePant: z.boolean().optional(),
  frontBack: z.boolean().optional(),
  sleevesBottom: z.number().optional(),
  frontNeck: z.number().optional(),
  backNeck: z.number().optional(),
});

const createSchema = z.object({
  stitchCategoryId: z.number().int(),
  measurements: measurementsSchema,
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerMobile: z.string().min(1),
  customerAddress: z.string().min(1),
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
      status: "not_started",
    },
  });

  return NextResponse.json({ order });
}
