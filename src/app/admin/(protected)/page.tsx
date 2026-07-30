import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [productCount, orderCount, stitchOrderCount, enquiryCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.stitchOrder.count(),
    prisma.enquiry.count(),
  ]);

  const stats = [
    { label: "Products", value: productCount },
    { label: "Orders", value: orderCount },
    { label: "Stitch Orders", value: stitchOrderCount },
    { label: "Enquiries", value: enquiryCount },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border p-4">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-sm text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
