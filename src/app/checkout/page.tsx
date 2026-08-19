import Image from "next/image";
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
    qty: item.qty,
    availableQty: item.variant?.qty ?? null,
  }));

  const subtotal = summaryItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingCharge: number = 0;
  const discount: number = 0;
  const total = subtotal + shippingCharge - discount;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Checkout</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Payment gateways aren&apos;t enabled yet — every order is placed as Cash on Delivery for now.
      </p>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <CheckoutForm
          defaultValues={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            mobile: user?.mobile ?? "",
          }}
          canSubmit={unavailable.length === 0}
        />

        <div className="rounded-lg border border-border p-5">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

          {unavailable.length > 0 && (
            <p className="mb-4 rounded bg-error/10 p-3 text-sm text-error">
              Some items in your cart exceed available stock. Please{" "}
              <a href="/cart" className="underline">
                update your cart
              </a>{" "}
              before placing the order.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {summaryItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-border pb-3 text-sm">
                <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden rounded bg-section">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-ink-muted">
                      {item.size} {item.color && `/ ${item.color}`}
                    </p>
                  )}
                  <p className="text-xs text-ink-muted">Qty: {item.qty}</p>
                </div>
                <p className="font-medium">₹{(item.price * item.qty).toFixed(0)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Shipping</span>
              <span>{shippingCharge === 0 ? "Free" : `₹${shippingCharge.toFixed(0)}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-muted">Discount</span>
                <span>−₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
          </div>

          <div className="mt-5 rounded border border-border bg-section p-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked readOnly className="accent-btn" />
              <span className="font-medium">Cash on Delivery</span>
            </label>
            <p className="mt-1 text-xs text-ink-muted">Pay in cash when your order is delivered.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
