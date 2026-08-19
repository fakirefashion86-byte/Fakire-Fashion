import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertOwnership(userId: number, cartItemId: number) {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { variant: true },
  });
  return item && item.userId === userId ? item : null;
}

const patchSchema = z.object({ qty: z.number().int().min(1) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const owned = await assertOwnership(session.userId, Number(id));
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (owned.variant && parsed.data.qty > owned.variant.qty) {
    return NextResponse.json(
      { error: `Only ${owned.variant.qty} left in stock` },
      { status: 400 }
    );
  }

  const item = await prisma.cartItem.update({
    where: { id: owned.id },
    data: { qty: parsed.data.qty },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const owned = await assertOwnership(session.userId, Number(id));
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.cartItem.delete({ where: { id: owned.id } });
  return NextResponse.json({ ok: true });
}
