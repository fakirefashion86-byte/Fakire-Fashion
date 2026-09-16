"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openRazorpayCheckout, verifyRazorpayPayment } from "@/lib/razorpayCheckout";

export default function RazorpayPayButton({
  orderId,
  name,
  email,
  mobile,
}: {
  orderId: number;
  name: string;
  email: string;
  mobile: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Could not start payment");
      return;
    }

    try {
      const result = await openRazorpayCheckout(data.razorpay, { name, email, contact: mobile });
      const verified = await verifyRazorpayPayment(result);
      if (!verified) {
        setError("Payment verification failed. If money was deducted, it will reflect here shortly.");
      }
    } catch {
      // Customer closed the modal or the gateway didn't load — safe to just let them retry.
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="rounded bg-btn px-4 py-2 text-sm font-semibold text-btn-text transition hover:bg-btn-hover disabled:opacity-50"
      >
        {loading ? "Opening payment…" : "Complete Payment"}
      </button>
    </div>
  );
}
