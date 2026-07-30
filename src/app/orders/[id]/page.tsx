import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CancelOrderButton from "@/components/CancelOrderButton";

type Props = { params: Promise<{ id: string }> };

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"] as const;
const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export default async function OrderDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!order || (order.userId !== session.userId && session.role !== "admin")) notFound();

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Order {order.orderNumber}</h1>
      <p className="mt-1 text-sm text-ink-muted">Placed on {order.createdAt.toDateString()}</p>

      {order.status !== "cancelled" && (
        <div className="mt-6 flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  i <= currentStepIndex ? "bg-btn" : "bg-border"
                }`}
              />
              <p className="mt-1 text-xs capitalize text-ink-secondary">{step}</p>
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

      <div className="mt-4 flex justify-between text-lg font-semibold">
        <p>Total</p>
        <p>₹{Number(order.netAmount).toFixed(0)}</p>
      </div>

      <div className="mt-8 rounded-lg border border-border p-4 text-sm">
        <p className="font-medium">Shipping to</p>
        <p>{order.name}</p>
        <p>{order.address}</p>
        <p>
          {order.email} · {order.mobile}
        </p>
      </div>

      {order.userId === session.userId && CANCELLABLE_STATUSES.includes(order.status) && (
        <div className="mt-8">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  );
}
