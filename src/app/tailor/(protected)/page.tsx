import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StitchStatusSelect from "@/components/admin/StitchStatusSelect";
import VisitToggle from "@/components/admin/VisitToggle";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import { buildDirectionsUrl } from "@/lib/directions";
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

export default async function TailorStitchOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const activeStatus = ALL_STATUSES.includes(status as StitchStatus)
    ? (status as StitchStatus)
    : undefined;

  const [counts, orders] = await Promise.all([
    prisma.stitchOrder.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.stitchOrder.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      orderBy: { createdAt: "desc" },
      include: { stitchCategory: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count.status])) as Record<
    StitchStatus,
    number
  >;
  const total = counts.reduce((sum, c) => sum + c._count.status, 0);

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Link
          href="/tailor"
          className={`rounded-xl border p-4 text-center transition ${
            !activeStatus ? "border-btn bg-btn/10 shadow-sm" : "border-border bg-card hover:border-btn/40"
          }`}
        >
          <p className="text-2xl font-semibold text-foreground">{total}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-muted">All</p>
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/tailor?status=${s}`}
            className={`rounded-xl border p-4 text-center transition ${
              activeStatus === s ? "border-btn bg-btn/10 shadow-sm" : "border-border bg-card hover:border-btn/40"
            }`}
          >
            <p className="text-2xl font-semibold text-foreground">{countByStatus[s] ?? 0}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-muted">{STATUS_LABELS[s]}</p>
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm text-ink-muted">
        {activeStatus ? `Showing ${STATUS_LABELS[activeStatus]} orders.` : "All custom stitching orders."}{" "}
        Update the status as you work through each one.
      </p>

      {orders.length === 0 && <p className="text-ink-muted">No stitching orders here.</p>}

      {/* Mobile: card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{o.customerName}</p>
                <p className="text-sm text-ink-muted">{o.stitchCategory.name}</p>
              </div>
              <StitchStatusSelect orderId={o.id} status={o.status} />
            </div>

            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Contact</dt>
                <dd className="text-right text-foreground">
                  {o.customerEmail}
                  <br />
                  {o.customerMobile}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Visit</dt>
                <dd className="text-right text-foreground">
                  {o.preferredDate.toDateString()}
                  <br />
                  {o.preferredTimeSlot}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-ink-muted">Address</dt>
                <dd className="text-right text-foreground">{o.customerAddress}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center justify-between border-t border-divider pt-3">
              <VisitToggle orderId={o.id} completed={o.visitCompleted} />
              <div className="flex items-center gap-3">
                {(() => {
                  const directionsUrl = buildDirectionsUrl({
                    latitude: o.latitude,
                    longitude: o.longitude,
                    address: o.customerAddress,
                  });
                  return (
                    directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        🧭 Directions
                      </a>
                    )
                  );
                })()}
                <Link href={`/tailor/stitch-orders/${o.id}`} className="text-xs text-accent hover:underline">
                  View / Measurements
                </Link>
                <DeleteOrderButton orderId={o.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      {orders.length > 0 && (
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-ink-muted">
                <th className="py-2">Customer</th>
                <th className="py-2">Garment</th>
                <th className="py-2">Contact</th>
                <th className="py-2">Visit Schedule</th>
                <th className="py-2">Delivery Address</th>
                <th className="py-2">Visit Status</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-divider align-top">
                  <td className="py-2">{o.customerName}</td>
                  <td className="py-2">{o.stitchCategory.name}</td>
                  <td className="py-2 text-ink-muted">
                    {o.customerEmail}
                    <br />
                    {o.customerMobile}
                  </td>
                  <td className="py-2 text-ink-muted">
                    {o.preferredDate.toDateString()}
                    <br />
                    {o.preferredTimeSlot}
                  </td>
                  <td className="py-2 text-ink-muted">{o.customerAddress}</td>
                  <td className="py-2">
                    <VisitToggle orderId={o.id} completed={o.visitCompleted} />
                  </td>
                  <td className="py-2">
                    <StitchStatusSelect orderId={o.id} status={o.status} />
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const directionsUrl = buildDirectionsUrl({
                          latitude: o.latitude,
                          longitude: o.longitude,
                          address: o.customerAddress,
                        });
                        return (
                          directionsUrl && (
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-accent hover:underline"
                            >
                              🧭 Directions
                            </a>
                          )
                        );
                      })()}
                      <Link href={`/tailor/stitch-orders/${o.id}`} className="text-xs text-accent hover:underline">
                        View / Measurements
                      </Link>
                      <DeleteOrderButton orderId={o.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
