import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ approved: z.boolean() });

async function assertDeliveryBoy(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user && user.role === "delivery" ? user : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const deliveryBoy = await assertDeliveryBoy(Number(id));
  if (!deliveryBoy) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: deliveryBoy.id },
    data: { approved: parsed.data.approved },
  });

  return NextResponse.json({ deliveryBoy: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const deliveryBoy = await assertDeliveryBoy(Number(id));
  if (!deliveryBoy) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: deliveryBoy.id } });
  return NextResponse.json({ ok: true });
}
