import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
  });

  return NextResponse.json({ items });
}

const schema = z.object({ productId: z.number().int().positive() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.userId, productId: parsed.data.productId } },
    update: {},
    create: { userId: session.userId, productId: parsed.data.productId },
  });

  return NextResponse.json({ ok: true });
}
