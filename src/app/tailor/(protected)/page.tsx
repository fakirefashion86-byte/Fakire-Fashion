import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StitchStatusSelect from "@/components/admin/StitchStatusSelect";
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
      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        <Link
          href="/tailor"
          className={`rounded-lg border p-3 text-center ${
            !activeStatus ? "border-btn bg-btn/10" : "border-border"
          }`}
        >
          <p className="text-xl font-semibold text-foreground">{total}</p>
          <p className="mt-1 text-xs text-ink-muted">All</p>
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/tailor?status=${s}`}
            className={`rounded-lg border p-3 text-center ${
              activeStatus === s ? "border-btn bg-btn/10" : "border-border"
            }`}
          >
            <p className="text-xl font-semibold text-foreground">{countByStatus[s] ?? 0}</p>
            <p className="mt-1 text-xs text-ink-muted">{STATUS_LABELS[s]}</p>
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm text-ink-muted">
        {activeStatus ? `Showing ${STATUS_LABELS[activeStatus]} orders.` : "All custom stitching orders."}{" "}
        Update the status as you work through each one.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-ink-muted">
            <th className="py-2">Customer</th>
            <th className="py-2">Garment</th>
            <th className="py-2">Contact</th>
            <th className="py-2">Delivery Address</th>
            <th className="py-2">Status</th>
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
              <td className="py-2 text-ink-muted">{o.customerAddress}</td>
              <td className="py-2">
                <StitchStatusSelect orderId={o.id} status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="mt-4 text-ink-muted">No stitching orders here.</p>}
    </div>
  );
}
