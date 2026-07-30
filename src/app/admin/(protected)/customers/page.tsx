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
      <table className="w-full text-sm">
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
      {customers.length === 0 && <p className="mt-4 text-ink-muted">No customers yet.</p>}
    </div>
  );
}
