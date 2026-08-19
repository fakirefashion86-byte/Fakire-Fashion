import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });

  const order = await prisma.stitchOrder.findUnique({ where: { id: Number(id) } });
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (order.status !== "delivered") {
    return NextResponse.json({ error: "Feedback can only be submitted after delivery" }, { status: 400 });
  }

  const feedback = await prisma.stitchFeedback.upsert({
    where: { stitchOrderId: order.id },
    create: {
      stitchOrderId: order.id,
      userId: session.userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
      status: "pending",
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
      status: "pending", // re-review after an edit
    },
  });

  notifyAdmins(
    "New stitching feedback",
    `${order.customerName} rated order #${order.id} ${parsed.data.rating}/5.`,
    `/admin/feedback`
  ).catch((err) => console.error("Feedback notification failed", err));

  return NextResponse.json({ feedback });
}
