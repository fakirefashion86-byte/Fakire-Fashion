import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

// Public: approved reviews only, oldest moderation concerns hidden from customers.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reviews = await prisma.productReview.findMany({
    where: { productId, status: "approved" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ reviews });
}

// One review per customer per product; resubmitting an edit sends it back to pending.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const review = await prisma.productReview.upsert({
    where: { productId_userId: { productId, userId: session.userId } },
    create: {
      productId,
      userId: session.userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
      status: "pending",
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
      status: "pending", // re-review after an edit
    },
  });

  notifyAdmins(
    "New product review",
    `A customer rated ${product.name} ${parsed.data.rating}/5.`,
    `/admin/product-reviews`
  ).catch((err) => console.error("Product review notification failed", err));

  return NextResponse.json({ review });
}
