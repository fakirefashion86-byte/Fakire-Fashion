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
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-ink-muted">
            <th className="py-2">Order #</th>
            <th className="py-2">Customer</th>
            <th className="py-2">Items</th>
            <th className="py-2">Total</th>
            <th className="py-2">Status</th>
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
                <OrderStatusSelect orderId={o.id} status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="mt-4 text-ink-muted">No orders yet.</p>}
    </div>
  );
}
