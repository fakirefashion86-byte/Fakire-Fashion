"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not cancel order");
      return;
    }

    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm font-medium text-error underline"
      >
        Cancel this order
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink-secondary">Are you sure you want to cancel this order?</p>
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="rounded bg-error px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
        >
          {loading ? "Cancelling…" : "Yes, cancel order"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded border border-border px-4 py-2 text-sm"
        >
          Keep order
        </button>
      </div>
    </div>
  );
}
