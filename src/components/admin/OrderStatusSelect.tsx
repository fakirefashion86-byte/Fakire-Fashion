"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Dispatch (out_for_delivery) and delivery confirmation now go through the OTP flow
// on the order detail page (see DispatchPanel), not a plain status change, so they're
// excluded from this select. This still handles every other transition directly.
const STATUSES = ["pending", "confirmed", "shipped", "cancelled"];

const STATUS_LABELS: Record<string, string> = {
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export default function OrderStatusSelect({
  orderId,
  status,
  manageHref,
}: {
  orderId: number;
  status: string;
  manageHref?: string;
}) {
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  if (status === "out_for_delivery" || status === "delivered") {
    const badge = (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
          status === "delivered" ? "bg-success/10 text-success" : "bg-black text-white"
        }`}
      >
        {STATUS_LABELS[status]}
      </span>
    );
    return manageHref ? (
      <Link href={manageHref} className="hover:underline">
        {badge}
      </Link>
    ) : (
      badge
    );
  }

  return (
    <select
      defaultValue={status}
      onChange={(e) => updateStatus(e.target.value)}
      className="rounded border border-border px-2 py-1 text-xs capitalize"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
