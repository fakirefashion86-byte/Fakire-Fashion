import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CancelOrderButton from "@/components/CancelOrderButton";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> };

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"] as const;
const CANCELLABLE_STATUSES = ["pending", "confirmed"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const { placed } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!order || (order.userId !== session.userId && session.role !== "admin")) notFound();

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);
  const justPlaced = placed === "1" && order.userId === session.userId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {justPlaced && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 p-5 text-center">
          <p className="text-lg font-semibold text-success">Order Placed Successfully</p>
          <p className="mt-1 text-sm text-ink-secondary">
            We&apos;ve received your order and will get it ready for delivery.
          </p>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-muted">Placed on {order.createdAt.toDateString()}</p>
        </div>
        <Link
          href={`/orders/${order.id}/invoice`}
          className="whitespace-nowrap rounded border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-section"
        >
          View Invoice
        </Link>
      </div>

      {order.status !== "cancelled" && (
        <div className="mt-6 flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  i <= currentStepIndex ? "bg-btn" : "bg-border"
                }`}
              />
              <p className="mt-1 text-xs capitalize text-ink-secondary">{STATUS_LABELS[step]}</p>
            </div>
          ))}
        </div>
      )}
      {order.status === "cancelled" && (
        <p className="mt-6 font-medium text-error">This order was cancelled.</p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between border-b border-border pb-3 text-sm">
            <div>
              <p className="font-medium">{item.productName}</p>
              {(item.size || item.color) && (
                <p className="text-ink-muted">
                  {item.size} {item.color && `/ ${item.color}`}
                </p>
              )}
              <p className="text-ink-muted">Qty: {item.qty}</p>
            </div>
            <p className="font-medium">₹{(Number(item.price) * item.qty).toFixed(0)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-muted">Subtotal</span>
          <span>₹{Number(order.totalAmount).toFixed(0)}</span>
        </div>
        {Number(order.shippingCharges) > 0 && (
          <div className="flex justify-between">
            <span className="text-ink-muted">Shipping</span>
            <span>₹{Number(order.shippingCharges).toFixed(0)}</span>
          </div>
        )}
        {Number(order.discountAmount) > 0 && (
          <div className="flex justify-between">
            <span className="text-ink-muted">Discount</span>
            <span>−₹{Number(order.discountAmount).toFixed(0)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-border pt-2 text-lg font-semibold">
          <p>Total</p>
          <p>₹{Number(order.netAmount).toFixed(0)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border p-4 text-sm">
        <p className="font-medium">Payment</p>
        <p className="text-ink-secondary">
          Cash on Delivery ·{" "}
          <span className="capitalize">{order.paymentStatus}</span>
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-border p-4 text-sm">
        <p className="font-medium">Shipping to</p>
        <p>{order.name}</p>
        <p>{[order.houseNumber, order.addressLine || order.address].filter(Boolean).join(", ")}</p>
        {order.area && <p>{order.area}</p>}
        {order.landmark && <p>Landmark: {order.landmark}</p>}
        {(order.city || order.state || order.pincode) && (
          <p>
            {[order.city, order.state, order.pincode].filter(Boolean).join(", ")}
          </p>
        )}
        {order.country && <p>{order.country}</p>}
        <p className="mt-1 text-ink-muted">
          {order.email} · {order.mobile}
        </p>
        {order.latitude != null && order.longitude != null && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-accent hover:underline"
          >
            View on Google Maps
          </a>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {order.userId === session.userId && CANCELLABLE_STATUSES.includes(order.status) && (
          <CancelOrderButton orderId={order.id} />
        )}
        <Link href="/orders" className="rounded border border-border px-4 py-2 text-sm hover:bg-section">
          View All Orders
        </Link>
        <Link href="/" className="rounded border border-border px-4 py-2 text-sm hover:bg-section">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
