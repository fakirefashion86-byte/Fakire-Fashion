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

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product || !product.status) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }

  let variant = null;
  if (product.variants.length > 0) {
    if (variantId == null) {
      return NextResponse.json({ error: "Please select a size and color" }, { status: 400 });
    }
    variant = product.variants.find((v) => v.id === variantId) ?? null;
    if (!variant) {
      return NextResponse.json({ error: "Selected option is not available" }, { status: 400 });
    }
  }

  const existing = await prisma.cartItem.findFirst({
    where: { userId: session.userId, productId, variantId: variantId ?? null },
  });

  const desiredQty = (existing?.qty ?? 0) + qty;
  if (variant && desiredQty > variant.qty) {
    return NextResponse.json(
      { error: variant.qty === 0 ? "This option is out of stock" : `Only ${variant.qty} left in stock` },
      { status: 400 }
    );
  }

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: desiredQty },
      })
    : await prisma.cartItem.create({
        data: { userId: session.userId, productId, variantId, qty },
      });

  return NextResponse.json({ item });
}
