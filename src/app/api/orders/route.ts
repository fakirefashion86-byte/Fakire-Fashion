import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SHIPPING_CHARGE = 0;

const checkoutSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().min(1),
  address: z.string().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid shipping details" }, { status: 400 });

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true, variant: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = Number(item.variant?.price ?? item.product.price);
    return sum + price * item.qty;
  }, 0);

  const orderNumber = `FF${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: session.userId,
        totalAmount,
        discountAmount: 0,
        netAmount: totalAmount + SHIPPING_CHARGE,
        shippingCharges: SHIPPING_CHARGE,
        status: "pending",
        ...parsed.data,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            price: item.variant?.price ?? item.product.price,
            qty: item.qty,
            color: item.variant?.color,
            size: item.variant?.size,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { userId: session.userId } });

    return created;
  });

  return NextResponse.json({ order });
}
