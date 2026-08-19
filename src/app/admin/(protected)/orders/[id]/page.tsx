import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true, user: { select: { name: true, email: true, mobile: true } } },
  });

  if (!order) notFound();

  const hasCoords = order.latitude != null && order.longitude != null;
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // A static map image needs no client-side map library at all — the admin
  // order list/detail views stay light even though checkout ships a full
  // interactive map (see performance note in the location feature docs).
  const staticMapUrl =
    hasCoords && mapsKey
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${order.latitude},${order.longitude}&zoom=16&size=640x280&scale=2&markers=color:0x2c2a29%7C${order.latitude},${order.longitude}&key=${mapsKey}`
      : null;
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`
    : null;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-muted">Placed {order.createdAt.toDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect orderId={order.id} status={order.status} />
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">
            ← All Orders
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Customer
            </h2>
            <p className="font-medium">{order.name}</p>
            <p className="text-sm text-ink-secondary">
              {order.email} · {order.mobile}
            </p>
            {order.user && (
              <Link
                href={`/admin/customers/${order.userId}`}
                className="mt-1 inline-block text-sm text-accent hover:underline"
              >
                View customer profile
              </Link>
            )}
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Items ({order.items.length})
            </h2>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between border-b border-divider pb-2 text-sm last:border-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {(item.size || item.color) && (
                      <p className="text-ink-muted">
                        {item.size} {item.color && `/ ${item.color}`}
                      </p>
                    )}
                    <p className="text-ink-muted">Qty: {item.qty}</p>
                  </div>
                  <p className="font-medium">₹{(Number(item.price) * item.qty).toFixed(0)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-2 text-sm font-semibold">
              <span>Total</span>
              <span>₹{Number(order.netAmount).toFixed(0)}</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {order.paymentMethod} · <span className="capitalize">{order.paymentStatus}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Delivery Address
            </h2>
            <p>{[order.houseNumber, order.addressLine].filter(Boolean).join(", ")}</p>
            {order.area && <p>{order.area}</p>}
            {order.landmark && <p className="text-ink-secondary">Landmark: {order.landmark}</p>}
            <p>
              {[order.city, order.state].filter(Boolean).join(", ")} {order.pincode}
            </p>
            <p>{order.country}</p>

            {hasCoords ? (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">📍 Location</p>
                {staticMapUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static, external Google-hosted map image; no benefit from next/image here
                  <img
                    src={staticMapUrl}
                    alt="Delivery location map"
                    className="mb-3 w-full rounded border border-border"
                    width={640}
                    height={280}
                  />
                ) : (
                  <p className="mb-3 text-xs text-ink-muted">
                    Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show a map preview here.
                  </p>
                )}
                <a
                  href={googleMapsUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded bg-btn px-4 py-2 text-sm font-medium text-btn-text hover:bg-btn-hover"
                >
                  Open in Google Maps
                </a>
              </div>
            ) : (
              <p className="mt-4 text-xs text-ink-muted">
                No pinned location was captured for this order (placed before location tracking was added, or the customer skipped the map).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
