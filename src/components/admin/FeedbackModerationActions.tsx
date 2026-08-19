"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FeedbackModerationActions({
  feedbackId,
  status,
}: {
  feedbackId: number;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: "approved" | "hidden") {
    setLoading(true);
    await fetch(`/api/admin/stitch-feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Remove this feedback permanently?")) return;
    setLoading(true);
    await fetch(`/api/admin/stitch-feedback/${feedbackId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "approved" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus("approved")}
          className="rounded bg-success px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          Approve
        </button>
      )}
      {status !== "hidden" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus("hidden")}
          className="rounded border border-border px-2.5 py-1 text-xs font-medium disabled:opacity-50"
        >
          Hide
        </button>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={remove}
        className="rounded bg-error px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
