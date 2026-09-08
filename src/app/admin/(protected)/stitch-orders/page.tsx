import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StitchStatusSelect from "@/components/admin/StitchStatusSelect";
import VisitToggle from "@/components/admin/VisitToggle";
import BookingStatusActions from "@/components/admin/BookingStatusActions";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import { garmentLabel, formatSerialNumber } from "@/lib/garment";
import type { StitchStatus } from "@prisma/client";

const STATUS_LABELS: Record<StitchStatus, string> = {
  not_started: "Not Started",
  pending: "Pending",
  stitched: "Stitched",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as StitchStatus[];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminStitchOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const activeStatus = ALL_STATUSES.includes(status as StitchStatus) ? (status as StitchStatus) : undefined;

  const orders = await prisma.stitchOrder.findMany({
    where: activeStatus ? { status: activeStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { stitchCategory: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Stitching Orders</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/stitch-orders"
          className={`rounded-full border px-3 py-1 text-xs ${
            !activeStatus ? "border-btn bg-btn/10" : "border-border text-ink-muted"
          }`}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/stitch-orders?status=${s}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              activeStatus === s ? "border-btn bg-btn/10" : "border-border text-ink-muted"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Card layout — used on all screens up to lg, avoids cramming 9 columns into a phone row */}
      <div className="grid gap-3 lg:hidden">
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs text-ink-muted">{formatSerialNumber(o.serialNumber)}</span>
              <StitchStatusSelect orderId={o.id} status={o.status} />
            </div>

            <div className="mt-2">
              <p className="font-medium text-foreground">{o.customerName}</p>
              <p className="text-sm text-ink-secondary">{garmentLabel(o)}</p>
              <p className="text-xs text-ink-muted">
                {o.customerEmail} · {o.customerMobile}
              </p>
            </div>

            <p className="mt-2 text-xs text-ink-muted">
              Visit: {o.preferredDate.toDateString()} · {o.preferredTimeSlot}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-divider pt-3">
              <BookingStatusActions orderId={o.id} bookingStatus={o.bookingStatus} />
              <VisitToggle orderId={o.id} completed={o.visitCompleted} />
            </div>

            <div className="mt-3 flex items-center gap-3 border-t border-divider pt-3 text-xs">
              <Link href={`/admin/stitch-orders/${o.id}`} className="text-accent hover:underline">
                View / Measurements
              </Link>
              <DeleteOrderButton orderId={o.id} />
            </div>
          </div>
        ))}
      </div>

      {/* Table layout — used from lg up, where there's room for columns */}
      <table className="hidden w-full text-sm lg:table">
        <thead>
          <tr className="border-b border-border text-left text-ink-muted">
            <th className="py-2">Serial #</th>
            <th className="py-2">Customer</th>
            <th className="py-2">Garment</th>
            <th className="py-2">Contact</th>
            <th className="py-2">Visit Schedule</th>
            <th className="py-2">Booking</th>
            <th className="py-2">Visit Status</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-divider">
              <td className="py-2 font-mono text-xs text-ink-muted">{formatSerialNumber(o.serialNumber)}</td>
              <td className="py-2">{o.customerName}</td>
              <td className="py-2">{garmentLabel(o)}</td>
              <td className="py-2 text-ink-muted">
                {o.customerEmail} · {o.customerMobile}
              </td>
              <td className="py-2 text-ink-muted">
                {o.preferredDate.toDateString()} · {o.preferredTimeSlot}
              </td>
              <td className="py-2">
                <BookingStatusActions orderId={o.id} bookingStatus={o.bookingStatus} />
              </td>
              <td className="py-2">
                <VisitToggle orderId={o.id} completed={o.visitCompleted} />
              </td>
              <td className="py-2">
                <StitchStatusSelect orderId={o.id} status={o.status} />
              </td>
              <td className="py-2">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/stitch-orders/${o.id}`} className="text-xs text-accent hover:underline">
                    View / Measurements
                  </Link>
                  <DeleteOrderButton orderId={o.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="mt-4 text-ink-muted">No stitching orders yet.</p>}
    </div>
  );
}
