"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Shared OTP-entry form for the delivery portal — the delivery person asks the
// customer to read out the code shown on their order page, types it in here,
// and the item is only marked delivered on an exact match. Wrong attempts are
// tracked server-side (see lib/deliveryOtp.ts) and lock out after 5 tries.
export default function VerifyOtpForm({ verifyEndpoint }: { verifyEndpoint: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(verifyEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Verification failed");
      setOtp("");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
        Delivery confirmed. Thank you!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <label className="text-sm font-medium">
        Ask the customer for their delivery OTP and enter it here to confirm delivery.
      </label>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        required
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        placeholder="6-digit OTP"
        className="w-40 rounded border border-border px-3 py-2 text-lg tracking-widest"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-fit rounded bg-btn px-4 py-2 text-sm font-medium text-btn-text hover:bg-btn-hover disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Confirm Delivery"}
      </button>
    </form>
  );
}
