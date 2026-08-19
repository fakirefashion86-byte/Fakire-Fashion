"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LABEL: Record<string, string> = {
  requested: "Requested",
  accepted: "Accepted",
  rejected: "Rejected",
};
const COLOR: Record<string, string> = {
  requested: "text-ink-muted",
  accepted: "text-success",
  rejected: "text-error",
};

export default function BookingStatusActions({
  orderId,
  bookingStatus,
}: {
  orderId: number;
  bookingStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(bookingStatus: "accepted" | "rejected") {
    setLoading(true);
    await fetch(`/api/admin/stitch-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium ${COLOR[bookingStatus] ?? ""}`}>{LABEL[bookingStatus] ?? bookingStatus}</span>
      {bookingStatus === "requested" && (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStatus("accepted")}
            className="rounded bg-success px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Accept
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStatus("rejected")}
            className="rounded bg-error px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Reject
          </button>
        </>
      )}
    </div>
  );
}
