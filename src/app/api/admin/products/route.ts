import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, subCategory: true, images: true, variants: true },
  });
  return NextResponse.json({ products });
}

const variantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1).default("Default"),
  qty: z.number().int().nonnegative().default(0),
  mrp: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
});

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  categoryId: z.number().int(),
  subCategoryId: z.number().int().optional(),
  description: z.string().optional(),
  mrp: z.number().nonnegative(),
  price: z.number().nonnegative(),
  imageUrls: z.array(z.string().min(1)).default([]),
  variants: z.array(variantSchema).default([]),
  status: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { imageUrls, variants, ...data } = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        ...(imageUrls.length
          ? { images: { create: imageUrls.map((url, i) => ({ url, sortOrder: i })) } }
          : {}),
        ...(variants.length
          ? {
              variants: {
                create: variants.map((v) => ({
                  size: v.size,
                  color: v.color,
                  qty: v.qty,
                  mrp: v.mrp ?? data.mrp,
                  price: v.price ?? data.price,
                })),
              },
            }
          : {}),
      },
    });
    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined) ?? [];
      if (target.includes("code")) {
        return NextResponse.json({ error: "That product code is already in use." }, { status: 409 });
      }
      return NextResponse.json(
        { error: "Two sizes/colors are the same — each size/color combination must be unique." },
        { status: 409 }
      );
    }
    throw err;
  }
}
