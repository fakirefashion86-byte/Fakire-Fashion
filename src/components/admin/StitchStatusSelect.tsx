"use client";

import { useRouter } from "next/navigation";

// out_for_delivery / delivered go through the OTP flow (see StitchDeliveryPanel),
// not a plain status change, so they're excluded from this select.
const STATUSES = ["not_started", "pending", "stitched"];

export default function StitchStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    await fetch(`/api/admin/stitch-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  if (status === "out_for_delivery" || status === "delivered") {
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
          status === "delivered" ? "bg-success/10 text-success" : "bg-black text-white"
        }`}
      >
        {status.replace(/_/g, " ")}
      </span>
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
          {s.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
