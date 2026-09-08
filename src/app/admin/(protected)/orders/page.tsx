import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Orders</h1>

      {/* Card layout — used on all screens up to md, avoids cramming a wide table into a phone row */}
      <div className="grid gap-3 md:hidden">
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs text-ink-muted">{o.orderNumber}</span>
              <OrderStatusSelect orderId={o.id} status={o.status} />
            </div>

            <div className="mt-2">
              <p className="font-medium text-foreground">{o.name}</p>
              <p className="text-xs text-ink-muted">{o.email}</p>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-y-1 text-xs">
              <dt className="text-ink-muted">Items</dt>
              <dd className="text-right">{o.items.length}</dd>
              <dt className="text-ink-muted">Total</dt>
              <dd className="text-right font-medium">₹{Number(o.netAmount).toFixed(0)}</dd>
              <dt className="text-ink-muted">Payment</dt>
              <dd className="text-right capitalize">
                {o.paymentMethod} <span className="text-ink-muted">({o.paymentStatus})</span>
              </dd>
            </dl>

            <div className="mt-3 flex gap-4 border-t border-divider pt-3 text-xs">
              <Link href={`/admin/orders/${o.id}`} className="text-accent hover:underline">
                View
              </Link>
              <Link href={`/orders/${o.id}/invoice`} className="text-accent hover:underline">
                Invoice
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Table layout — used from md up, where there's room for columns */}
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-border text-left text-ink-muted">
            <th className="py-2">Order #</th>
            <th className="py-2">Customer</th>
            <th className="py-2">Items</th>
            <th className="py-2">Total</th>
            <th className="py-2">Payment</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-divider">
              <td className="py-2">{o.orderNumber}</td>
              <td className="py-2">
                {o.name} <span className="text-ink-muted">({o.email})</span>
              </td>
              <td className="py-2">{o.items.length}</td>
              <td className="py-2">₹{Number(o.netAmount).toFixed(0)}</td>
              <td className="py-2">
                <span className="text-ink-secondary">{o.paymentMethod}</span>{" "}
                <span className="capitalize text-ink-muted">({o.paymentStatus})</span>
              </td>
              <td className="py-2">
                <OrderStatusSelect orderId={o.id} status={o.status} />
              </td>
              <td className="py-2 whitespace-nowrap">
                <Link href={`/admin/orders/${o.id}`} className="text-accent hover:underline">
                  View
                </Link>{" "}
                <Link href={`/orders/${o.id}/invoice`} className="text-accent hover:underline">
                  Invoice
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="mt-4 text-ink-muted">No orders yet.</p>}
    </div>
  );
}
