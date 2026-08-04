"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VisitToggle({
  orderId,
  completed,
}: {
  orderId: number;
  completed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/stitch-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitCompleted: !completed }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={completed}
      className="flex items-center gap-2 disabled:opacity-50"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          completed ? "bg-success" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            completed ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      <span className={`text-xs font-medium ${completed ? "text-success" : "text-ink-muted"}`}>
        {completed ? "Visit Complete" : "Visit Pending"}
      </span>
    </button>
  );
}
