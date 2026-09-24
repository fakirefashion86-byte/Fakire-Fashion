import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDirectionsUrl } from "@/lib/directions";
import { garmentLabel, formatSerialNumber } from "@/lib/garment";

export default async function DeliveryDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "delivery") redirect("/delivery/login");

  const [pendingOrders, pendingStitchOrders, recentOrders, recentStitchOrders] = await Promise.all([
    prisma.order.findMany({
      where: { deliveryPersonId: session.userId, status: "out_for_delivery" },
      orderBy: { updatedAt: "desc" },
      include: { items: true },
    }),
    prisma.stitchOrder.findMany({
      where: { deliveryPersonId: session.userId, status: "out_for_delivery" },
      orderBy: { createdAt: "desc" },
      include: { stitchCategory: true },
    }),
    prisma.order.findMany({
      where: { deliveryPersonId: session.userId, status: "delivered" },
      orderBy: { deliveryOtpVerifiedAt: "desc" },
      take: 5,
    }),
    prisma.stitchOrder.findMany({
      where: { deliveryPersonId: session.userId, status: "delivered" },
      orderBy: { deliveryOtpVerifiedAt: "desc" },
      take: 5,
      include: { stitchCategory: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Out for Delivery {pendingOrders.length + pendingStitchOrders.length > 0 && `(${pendingOrders.length + pendingStitchOrders.length})`}
        </h2>
        {pendingOrders.length === 0 && pendingStitchOrders.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing assigned to you right now.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingOrders.map((o) => {
              const directionsUrl = buildDirectionsUrl({
                latitude: o.latitude,
                longitude: o.longitude,
                address: [o.houseNumber, o.addressLine, o.area, o.city, o.state, o.pincode].filter(Boolean).join(", "),
              });
              return (
                <div key={`order-${o.id}`} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">Order {o.orderNumber}</p>
                      <p className="text-sm text-ink-muted">{o.items.length} item(s) · ₹{Number(o.netAmount).toFixed(0)}</p>
                    </div>
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      Out for Delivery
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    {o.name} · {o.mobile}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {[o.houseNumber, o.addressLine, o.area, o.city, o.state, o.pincode].filter(Boolean).join(", ")}
                  </p>
                  {o.paymentMethod === "COD" && o.paymentStatus === "pending" && (
                    <p className="mt-1 text-sm font-medium text-accent">Collect ₹{Number(o.netAmount).toFixed(0)} (COD)</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        🧭 Directions
                      </a>
                    )}
                    <Link href={`/delivery/orders/${o.id}`} className="text-xs font-medium text-accent hover:underline">
                      Confirm Delivery →
                    </Link>
                  </div>
                </div>
              );
            })}

            {pendingStitchOrders.map((o) => {
              const directionsUrl = buildDirectionsUrl({
                latitude: o.latitude,
                longitude: o.longitude,
                address: o.customerAddress,
              });
              return (
                <div key={`stitch-${o.id}`} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{garmentLabel(o)}</p>
                      <p className="font-mono text-xs text-ink-muted">{formatSerialNumber(o.serialNumber)}</p>
                    </div>
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      Out for Delivery
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    {o.customerName} · {o.customerMobile}
                  </p>
                  <p className="text-sm text-ink-muted">{o.customerAddress}</p>
                  <div className="mt-3 flex items-center gap-3">
                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        🧭 Directions
                      </a>
                    )}
                    <Link
                      href={`/delivery/stitch-orders/${o.id}`}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Confirm Delivery →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(recentOrders.length > 0 || recentStitchOrders.length > 0) && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Recently Delivered</h2>
          <div className="flex flex-col gap-2">
            {recentOrders.map((o) => (
              <div key={`ro-${o.id}`} className="rounded-lg border border-border p-3 text-sm">
                <span className="font-medium">Order {o.orderNumber}</span>{" "}
                <span className="text-ink-muted">
                  · delivered {o.deliveryOtpVerifiedAt?.toLocaleString() ?? ""}
                </span>
              </div>
            ))}
            {recentStitchOrders.map((o) => (
              <div key={`rs-${o.id}`} className="rounded-lg border border-border p-3 text-sm">
                <span className="font-medium">{garmentLabel(o)}</span>{" "}
                <span className="text-ink-muted">
                  · delivered {o.deliveryOtpVerifiedAt?.toLocaleString() ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
