import { prisma } from "@/lib/prisma";
import StitchStatusSelect from "@/components/admin/StitchStatusSelect";

export default async function AdminStitchOrdersPage() {
  const orders = await prisma.stitchOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { stitchCategory: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Stitching Orders</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-ink-muted">
            <th className="py-2">Customer</th>
            <th className="py-2">Garment</th>
            <th className="py-2">Contact</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-divider">
              <td className="py-2">{o.customerName}</td>
              <td className="py-2">{o.stitchCategory.name}</td>
              <td className="py-2 text-ink-muted">
                {o.customerEmail} · {o.customerMobile}
              </td>
              <td className="py-2">
                <StitchStatusSelect orderId={o.id} status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="mt-4 text-ink-muted">No stitching orders yet.</p>}
    </div>
  );
}
