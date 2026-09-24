import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDirectionsUrl } from "@/lib/directions";
import { garmentLabel, formatSerialNumber } from "@/lib/garment";
import VerifyOtpForm from "@/components/delivery/VerifyOtpForm";

export default async function DeliveryStitchOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "delivery") redirect("/delivery/login");

  const { id } = await params;
  const order = await prisma.stitchOrder.findUnique({
    where: { id: Number(id) },
    include: { stitchCategory: true },
  });

  if (!order || order.deliveryPersonId !== session.userId) notFound();

  const directionsUrl = buildDirectionsUrl({
    latitude: order.latitude,
    longitude: order.longitude,
    address: order.customerAddress,
  });

  return (
    <div>
      <Link href="/delivery" className="mb-4 inline-block text-sm text-accent hover:underline">
        ← Back to Dashboard
      </Link>
      <h1 className="mb-1 text-2xl font-semibold">{garmentLabel(order)}</h1>
      <p className="mb-4 font-mono text-xs text-ink-muted">{formatSerialNumber(order.serialNumber)}</p>

      <div className="mb-4 rounded-lg border border-border p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Customer</h2>
        <p className="font-medium">{order.customerName}</p>
        <p className="text-sm text-ink-secondary">{order.customerMobile}</p>
        <p className="mt-2 text-sm">{order.customerAddress}</p>
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

      {order.status === "delivered" ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
          This order has already been delivered.
        </div>
      ) : order.status !== "out_for_delivery" ? (
        <p className="text-sm text-ink-muted">This order isn&apos;t out for delivery yet.</p>
      ) : (
        <VerifyOtpForm verifyEndpoint={`/api/delivery/stitch-orders/${order.id}/verify`} />
      )}
    </div>
  );
}
