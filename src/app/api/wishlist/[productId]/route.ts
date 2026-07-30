import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { productId } = await params;
  const id = Number(productId);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

  await prisma.wishlistItem.deleteMany({
    where: { userId: session.userId, productId: id },
  });

  return NextResponse.json({ ok: true });
}
