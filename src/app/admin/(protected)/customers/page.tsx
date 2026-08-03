import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, stitchOrders: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Customers</h1>

      {customers.length === 0 && <p className="text-ink-muted">No customers yet.</p>}

      {/* Mobile: card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {customers.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-4">
            <Link href={`/admin/customers/${c.id}`} className="font-medium text-accent hover:underline">
              {c.name}
            </Link>
            <p className="mt-1 truncate text-sm text-ink-muted">{c.email}</p>
            <p className="text-sm text-ink-muted">{c.mobile || "—"}</p>
            <div className="mt-3 flex justify-between text-sm">
              <span>{c._count.orders} orders</span>
              <span>{c._count.stitchOrders} stitch orders</span>
              <span className="text-ink-muted">{c.createdAt.toDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-border text-left text-ink-muted">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Mobile</th>
            <th className="py-2">Orders</th>
            <th className="py-2">Stitch Orders</th>
            <th className="py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-divider">
              <td className="py-2">
                <Link href={`/admin/customers/${c.id}`} className="text-accent hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="py-2">{c.email}</td>
              <td className="py-2">{c.mobile || "—"}</td>
              <td className="py-2">{c._count.orders}</td>
              <td className="py-2">{c._count.stitchOrders}</td>
              <td className="py-2 text-ink-muted">{c.createdAt.toDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
