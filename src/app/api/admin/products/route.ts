import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, subCategory: true, images: true },
  });
  return NextResponse.json({ products });
}

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  categoryId: z.number().int(),
  subCategoryId: z.number().int().optional(),
  description: z.string().optional(),
  mrp: z.number().nonnegative(),
  price: z.number().nonnegative(),
  imageUrl: z.string().optional(),
  status: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { imageUrl, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      ...(imageUrl ? { images: { create: [{ url: imageUrl, sortOrder: 0 }] } } : {}),
    },
  });

  return NextResponse.json({ product });
}
