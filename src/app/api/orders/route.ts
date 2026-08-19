import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyUser } from "@/lib/notifications";

const SHIPPING_CHARGE = 0;

const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine: z.string().trim().min(1, "Address is required"),
  houseNumber: z.string().trim().optional().default(""),
  area: z.string().trim().optional().default(""),
  landmark: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: z.string().trim().min(1, "Pincode is required"),
  country: z.string().trim().min(1, "Country is required"),
  // Present whenever the customer used the map picker; null for the manual
  // text-entry fallback (no Maps key configured, or the picker failed to load).
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  // Optional so older/other clients still work; when present it de-dupes retried submits.
  clientToken: z.string().trim().min(1).max(100).optional(),
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
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid shipping details";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }
  const { clientToken, ...shipping } = parsed.data;

  // A retried submit with the same token returns the order already created for it,
  // instead of erroring on an (already-emptied) cart or creating a duplicate order.
  if (clientToken) {
    const existingOrder = await prisma.order.findUnique({
      where: { userId_clientToken: { userId: session.userId, clientToken } },
      include: { items: true },
    });
    if (existingOrder) return NextResponse.json({ order: existingOrder });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId: session.userId },
        include: { product: true, variant: true },
      });

      if (cartItems.length === 0) {
        throw new CheckoutError("Your cart is empty");
      }

      for (const item of cartItems) {
        if (!item.product.status) {
          throw new CheckoutError(`${item.product.name} is no longer available`);
        }
        if (item.variant && item.qty > item.variant.qty) {
          throw new CheckoutError(
            item.variant.qty === 0
              ? `${item.product.name} (${item.variant.size}/${item.variant.color}) is out of stock`
              : `Only ${item.variant.qty} left for ${item.product.name} (${item.variant.size}/${item.variant.color})`
          );
        }
      }

      const totalAmount = cartItems.reduce((sum, item) => {
        const price = Number(item.variant?.price ?? item.product.price);
        return sum + price * item.qty;
      }, 0);

      const orderNumber = `FF${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const addressParts = [
        shipping.houseNumber,
        shipping.addressLine,
        shipping.area,
        shipping.landmark,
        shipping.city,
        shipping.state,
        shipping.pincode,
        shipping.country,
      ].filter(Boolean);

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          totalAmount,
          discountAmount: 0,
          netAmount: totalAmount + SHIPPING_CHARGE,
          shippingCharges: SHIPPING_CHARGE,
          status: "pending",
          paymentMethod: "COD",
          paymentStatus: "pending",
          name: shipping.name,
          email: shipping.email,
          mobile: shipping.mobile,
          address: addressParts.join(", "),
          addressLine: shipping.addressLine,
          houseNumber: shipping.houseNumber || null,
          area: shipping.area || null,
          landmark: shipping.landmark || null,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
          country: shipping.country,
          latitude: shipping.latitude,
          longitude: shipping.longitude,
          clientToken: clientToken ?? null,
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

      for (const item of cartItems) {
        if (item.variantId) {
          // Conditional decrement guards against a concurrent order racing past the
          // earlier stock check — if stock dropped in the meantime, this matches zero
          // rows and we abort instead of selling something that isn't there.
          const result = await tx.productVariant.updateMany({
            where: { id: item.variantId, qty: { gte: item.qty } },
            data: { qty: { decrement: item.qty } },
          });
          if (result.count === 0) {
            throw new CheckoutError(`${item.product.name} just went out of stock. Please update your cart.`);
          }
        }
      }

      await tx.cartItem.deleteMany({ where: { userId: session.userId } });

      return created;
    });

    await Promise.all([
      notifyUser(
        session.userId,
        "Order placed",
        `Your order ${order.orderNumber} has been placed successfully.`,
        `/orders/${order.id}`
      ),
      notifyAdmins(
        "New order received",
        `Order ${order.orderNumber} was just placed.`,
        `/admin/orders/${order.id}`
      ),
    ]).catch((err) => console.error("Order notification failed", err));

    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    // Two concurrent submits with the same token both raced past the initial
    // lookup — the unique constraint caught it; fetch and return that order.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002" && clientToken) {
      const existingOrder = await prisma.order.findUnique({
        where: { userId_clientToken: { userId: session.userId, clientToken } },
        include: { items: true },
      });
      if (existingOrder) return NextResponse.json({ order: existingOrder });
    }
    console.error("Order creation failed", err);
    return NextResponse.json({ error: "Could not place order. Please try again." }, { status: 500 });
  }
}

class CheckoutError extends Error {}
