import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { garmentLabel, formatSerialNumber } from "@/lib/garment";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      stitchOrders: { orderBy: { createdAt: "desc" }, include: { stitchCategory: true } },
    },
  });

  if (!customer || customer.role !== "customer") notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">{customer.name}</h1>
      <p className="mb-6 text-sm text-ink-muted">
        {customer.email} · {customer.mobile || "no mobile on file"} · joined{" "}
        {customer.createdAt.toDateString()}
      </p>
      {customer.address && (
        <p className="mb-6 text-sm text-ink-muted">Address: {customer.address}</p>
      )}

      <h2 className="mb-3 font-serif text-lg text-foreground">Orders ({customer.orders.length})</h2>
      {customer.orders.length === 0 ? (
        <p className="mb-8 text-sm text-ink-muted">No orders yet.</p>
      ) : (
        <table className="mb-8 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-muted">
              <th className="py-2">Order #</th>
              <th className="py-2">Items</th>
              <th className="py-2">Total</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((o) => (
              <tr key={o.id} className="border-b border-divider">
                <td className="py-2">{o.orderNumber}</td>
                <td className="py-2">{o.items.length}</td>
                <td className="py-2">₹{Number(o.netAmount).toFixed(0)}</td>
                <td className="py-2 capitalize">{o.status}</td>
                <td className="py-2 text-ink-muted">{o.createdAt.toDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-3 font-serif text-lg text-foreground">
        Stitching Orders ({customer.stitchOrders.length})
      </h2>
      {customer.stitchOrders.length === 0 ? (
        <p className="text-sm text-ink-muted">No stitching orders yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-muted">
              <th className="py-2">Serial #</th>
              <th className="py-2">Garment</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {customer.stitchOrders.map((o) => (
              <tr key={o.id} className="border-b border-divider">
                <td className="py-2 font-mono text-xs text-ink-muted">{formatSerialNumber(o.serialNumber)}</td>
                <td className="py-2">{garmentLabel(o)}</td>
                <td className="py-2 capitalize">{o.status.replace(/_/g, " ")}</td>
                <td className="py-2 text-ink-muted">{o.createdAt.toDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
