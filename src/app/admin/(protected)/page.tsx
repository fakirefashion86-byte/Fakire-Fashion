import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { garmentLabel } from "@/lib/garment";

export default async function AdminDashboardPage() {
  const [
    productCount,
    orderCount,
    stitchOrderCount,
    enquiryCount,
    pendingTailorCount,
    pendingBookingCount,
    pendingFeedbackCount,
    pendingProductReviewCount,
    openComplaintCount,
    recentOrders,
    recentStitchOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.stitchOrder.count(),
    prisma.enquiry.count(),
    prisma.user.count({ where: { role: "tailor", approved: false } }),
    prisma.stitchOrder.count({ where: { bookingStatus: "requested" } }),
    prisma.stitchFeedback.count({ where: { status: "pending" } }),
    prisma.productReview.count({ where: { status: "pending" } }),
    prisma.complaint.count({ where: { status: { not: "resolved" } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, orderNumber: true, name: true, netAmount: true, status: true, createdAt: true },
    }),
    prisma.stitchOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { stitchCategory: true },
    }),
  ]);

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Orders", value: orderCount, href: "/admin/orders" },
    { label: "Stitch Orders", value: stitchOrderCount, href: "/admin/stitch-orders" },
    { label: "Pending Bookings", value: pendingBookingCount, href: "/admin/stitch-orders" },
    { label: "Pending Tailors", value: pendingTailorCount, href: "/admin/tailors" },
    { label: "Enquiries", value: enquiryCount, href: "/admin/settings" },
    { label: "Feedback To Review", value: pendingFeedbackCount, href: "/admin/feedback" },
    { label: "Product Reviews To Review", value: pendingProductReviewCount, href: "/admin/product-reviews" },
    { label: "Open Complaints", value: openComplaintCount, href: "/admin/complaints" },
  ];

  const quickActions = [
    { href: "/admin/products", label: "Manage Products" },
    { href: "/admin/categories", label: "Manage Categories" },
    { href: "/admin/orders", label: "View Orders" },
    { href: "/admin/stitch-orders", label: "View Stitch Orders" },
    { href: "/admin/feedback", label: "Feedback & Ratings" },
    { href: "/admin/product-reviews", label: "Product Reviews" },
    { href: "/admin/complaints", label: "Complaints" },
    { href: "/admin/customers", label: "View Customers" },
    { href: "/admin/tailors", label: "Manage Tailors" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-border p-4 transition hover:border-accent"
          >
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-sm text-ink-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-serif text-lg text-foreground">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/80 hover:text-accent-hover"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg text-foreground">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-ink-muted">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-muted">
                  <th className="py-2">Order #</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-divider">
                    <td className="py-2">{o.orderNumber}</td>
                    <td className="py-2">{o.name}</td>
                    <td className="py-2">₹{Number(o.netAmount).toFixed(0)}</td>
                    <td className="py-2 capitalize">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg text-foreground">Recent Stitch Orders</h2>
            <Link href="/admin/stitch-orders" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          {recentStitchOrders.length === 0 ? (
            <p className="text-sm text-ink-muted">No stitching orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-muted">
                  <th className="py-2">Customer</th>
                  <th className="py-2">Garment</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStitchOrders.map((o) => (
                  <tr key={o.id} className="border-b border-divider">
                    <td className="py-2">{o.customerName}</td>
                    <td className="py-2">{garmentLabel(o)}</td>
                    <td className="py-2 capitalize">{o.status.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
