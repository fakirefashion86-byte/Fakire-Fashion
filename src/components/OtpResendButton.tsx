"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OtpResendButton({ resendEndpoint }: { resendEndpoint: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(resendEndpoint, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "Couldn't generate a new OTP");
      return;
    }
    setMessage("New OTP generated.");
    router.refresh();
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
      >
        {loading ? "Generating…" : "Didn't get it / expired? Generate a new OTP"}
      </button>
      {message && <p className="mt-1 text-xs text-ink-muted">{message}</p>}
    </div>
  );
}
