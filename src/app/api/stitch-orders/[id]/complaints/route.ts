import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

const complaintSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(150),
  description: z.string().trim().min(1, "Please describe the issue").max(2000),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = complaintSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid complaint";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const order = await prisma.stitchOrder.findUnique({ where: { id: Number(id) } });
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (order.status !== "delivered") {
    return NextResponse.json(
      { error: "Alteration/complaint requests can only be raised after delivery" },
      { status: 400 }
    );
  }

  const complaint = await prisma.complaint.create({
    data: {
      stitchOrderId: order.id,
      userId: session.userId,
      subject: parsed.data.subject,
      description: parsed.data.description,
      status: "open",
    },
  });

  notifyAdmins(
    "New alteration/complaint request",
    `${order.customerName} raised: "${parsed.data.subject}" on order #${order.id}.`,
    `/admin/complaints`
  ).catch((err) => console.error("Complaint notification failed", err));

  return NextResponse.json({ complaint });
}
