import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
      variant: true,
    },
  });

  return NextResponse.json({ items });
}

const addSchema = z.object({
  productId: z.number().int(),
  variantId: z.number().int().optional(),
  qty: z.number().int().min(1).default(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { productId, variantId, qty } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.status) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { userId: session.userId, productId, variantId: variantId ?? null },
  });

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + qty },
      })
    : await prisma.cartItem.create({
        data: { userId: session.userId, productId, variantId, qty },
      });

  return NextResponse.json({ item });
}
