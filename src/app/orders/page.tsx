import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-ink-muted">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/" className="underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-section"
            >
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-ink-muted">
                  {order.items.length} item(s) · {order.createdAt.toDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{Number(order.netAmount).toFixed(0)}</p>
                <p className="text-sm capitalize text-ink-secondary">{order.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
