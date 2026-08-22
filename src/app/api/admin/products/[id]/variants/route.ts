import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1).default("Default"),
  qty: z.number().int().nonnegative().default(0),
  mrp: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const productId = Number(id);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { size, color, qty, mrp, price } = parsed.data;

  try {
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        size,
        color,
        qty,
        mrp: mrp ?? product.mrp,
        price: price ?? product.price,
      },
    });
    return NextResponse.json({ variant });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "That size/color combination already exists for this product." },
        { status: 409 }
      );
    }
    throw err;
  }
}
