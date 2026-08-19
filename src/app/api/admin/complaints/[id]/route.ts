import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

const updateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const complaint = await prisma.complaint.update({
    where: { id: Number(id) },
    data: { status: parsed.data.status },
  });

  notifyUser(
    complaint.userId,
    "Complaint status updated",
    `Your complaint "${complaint.subject}" is now ${parsed.data.status.replace("_", " ")}.`,
    "/stitching/my-orders"
  ).catch((err) => console.error("Complaint notification failed", err));

  return NextResponse.json({ complaint });
}
