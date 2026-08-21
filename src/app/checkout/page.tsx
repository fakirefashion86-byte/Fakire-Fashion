import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout");

  const [user, cartItems] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, mobile: true, address: true },
    }),
    prisma.cartItem.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
        variant: true,
      },
    }),
  ]);

  if (cartItems.length === 0) redirect("/cart");

  // A variant might have gone out of stock or been reduced below the cart's
  // requested qty since it was added — surface that before letting them place the order.
  const unavailable = cartItems.filter((item) => item.variant && item.qty > item.variant.qty);

  const summaryItems = cartItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name: item.product.name,
    image: item.product.images[0]?.url ?? null,
    size: item.variant?.size ?? null,
    color: item.variant?.color ?? null,
    price: Number(item.variant?.price ?? item.product.price),
    mrp: Number(item.variant?.mrp ?? item.product.mrp),
    qty: item.qty,
    availableQty: item.variant?.qty ?? null,
  }));

  const subtotal = summaryItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const mrpTotal = summaryItems.reduce((sum, i) => sum + i.mrp * i.qty, 0);
  const shippingCharge: number = 0;
  const discount = Math.max(0, mrpTotal - subtotal);
  const total = subtotal + shippingCharge;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-black">Checkout</h1>
      <p className="mb-6 text-sm text-black/60">
        Payment gateways aren&apos;t enabled yet — every order is placed as Cash on Delivery for now.
      </p>

      <CheckoutForm
        defaultValues={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          mobile: user?.mobile ?? "",
        }}
        canSubmit={unavailable.length === 0}
        summaryItems={summaryItems}
        mrpTotal={mrpTotal}
        shippingCharge={shippingCharge}
        discount={discount}
        total={total}
      />
    </div>
  );
}
