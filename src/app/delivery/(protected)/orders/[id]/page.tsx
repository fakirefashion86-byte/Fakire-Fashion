import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDirectionsUrl } from "@/lib/directions";
import VerifyOtpForm from "@/components/delivery/VerifyOtpForm";

export default async function DeliveryOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "delivery") redirect("/delivery/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!order || order.deliveryPersonId !== session.userId) notFound();

  const directionsUrl = buildDirectionsUrl({
    latitude: order.latitude,
    longitude: order.longitude,
    address: [order.houseNumber, order.addressLine, order.area, order.city, order.state, order.pincode]
      .filter(Boolean)
      .join(", "),
  });

  return (
    <div>
      <Link href="/delivery" className="mb-4 inline-block text-sm text-accent hover:underline">
        ← Back to Dashboard
      </Link>
      <h1 className="mb-4 text-2xl font-semibold">Order {order.orderNumber}</h1>

      <div className="mb-4 rounded-lg border border-border p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Customer</h2>
        <p className="font-medium">{order.name}</p>
        <p className="text-sm text-ink-secondary">{order.mobile}</p>
        <p className="mt-2 text-sm">
          {[order.houseNumber, order.addressLine, order.area, order.city, order.state, order.pincode]
            .filter(Boolean)
            .join(", ")}
        </p>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded bg-btn px-3 py-1.5 text-xs font-medium text-btn-text hover:bg-btn-hover"
          >
            🧭 Get Directions
          </a>
        )}
      </div>

      <div className="mb-4 rounded-lg border border-border p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Items ({order.items.length})
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.productName} × {item.qty}
              </span>
              <span>₹{(Number(item.price) * item.qty).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm font-medium">
          {order.paymentMethod === "COD" ? `Collect ₹${Number(order.netAmount).toFixed(0)} (COD)` : "Prepaid order"}
        </p>
      </div>

      {order.status === "delivered" ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
          This order has already been delivered.
        </div>
      ) : order.status !== "out_for_delivery" ? (
        <p className="text-sm text-ink-muted">This order isn&apos;t out for delivery yet.</p>
      ) : (
        <VerifyOtpForm verifyEndpoint={`/api/delivery/orders/${order.id}/verify`} />
      )}
    </div>
  );
}
