import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressInputSchema } from "@/lib/address";

async function assertOwnership(userId: number, addressId: number) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  return address && address.userId === userId ? address : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const owned = await assertOwnership(session.userId, Number(id));
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = addressInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid address";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const data = parsed.data;

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId: session.userId, id: { not: owned.id } },
        data: { isDefault: false },
      });
    }
    return tx.address.update({ where: { id: owned.id }, data });
  });

  return NextResponse.json({ address });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const owned = await assertOwnership(session.userId, Number(id));
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.address.delete({ where: { id: owned.id } });
  return NextResponse.json({ ok: true });
}
