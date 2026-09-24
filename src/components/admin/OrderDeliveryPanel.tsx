"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeliveryBoy = { id: number; name: string; email: string };

type Props = {
  orderId: number;
  status: string;
  deliveryPersonId: number | null;
  deliveryPersonName: string | null;
  deliveryOtpExpiresAt: string | null;
  deliveryBoys: DeliveryBoy[];
};

// Admin-facing counterpart to the delivery portal's OTP flow: dispatch an order
// (optionally assigning a delivery boy, always generating a fresh OTP), then either
// verify the OTP the delivery person collected or — as a last-resort escape hatch —
// override and mark it delivered without one (always logged, see the API route).
export default function OrderDeliveryPanel({
  orderId,
  status,
  deliveryPersonId,
  deliveryPersonName,
  deliveryOtpExpiresAt,
  deliveryBoys,
}: Props) {
  const router = useRouter();
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>(
    deliveryPersonId ? String(deliveryPersonId) : ""
  );
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function dispatch() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "out_for_delivery",
        deliveryPersonId: selectedDeliveryPerson ? Number(selectedDeliveryPerson) : null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to dispatch");
      return;
    }
    router.refresh();
  }

  async function verify() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered", otp }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Verification failed");
      setOtp("");
      return;
    }
    router.refresh();
  }

  async function override() {
    if (!confirm("Mark this order delivered WITHOUT OTP verification? This is logged for audit.")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered", adminOverride: true }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to override");
      return;
    }
    router.refresh();
  }

  if (status === "delivered") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
        Delivered{deliveryPersonName ? ` by ${deliveryPersonName}` : ""}.
      </div>
    );
  }

  if (status === "out_for_delivery") {
    return (
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm font-medium">Out for delivery{deliveryPersonName ? ` · ${deliveryPersonName}` : ""}</p>
        {deliveryOtpExpiresAt && (
          <p className="mt-1 text-xs text-ink-muted">
            OTP valid until {new Date(deliveryOtpExpiresAt).toLocaleString()}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-ink-muted">Enter customer&apos;s OTP</label>
            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-32 rounded border border-border px-2 py-1.5 text-sm tracking-widest"
              placeholder="6-digit OTP"
            />
          </div>
          <button
            type="button"
            onClick={verify}
            disabled={loading || otp.length !== 6}
            className="rounded bg-btn px-3 py-1.5 text-xs font-medium text-btn-text hover:bg-btn-hover disabled:opacity-50"
          >
            Confirm Delivery
          </button>
          <button
            type="button"
            onClick={override}
            disabled={loading}
            className="rounded border border-error/40 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10 disabled:opacity-50"
          >
            Override (no OTP)
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-2 text-sm font-medium">Dispatch for delivery</p>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Delivery person (optional)</label>
          <select
            value={selectedDeliveryPerson}
            onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
            className="rounded border border-border px-2 py-1.5 text-sm"
          >
            <option value="">Hand-deliver myself</option>
            {deliveryBoys.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.email})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={dispatch}
          disabled={loading}
          className="rounded bg-btn px-3 py-1.5 text-xs font-medium text-btn-text hover:bg-btn-hover disabled:opacity-50"
        >
          {loading ? "Dispatching…" : "Dispatch (generate OTP)"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}
