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
      className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
        completed ? "bg-success/10 text-success" : "bg-border text-ink-muted"
      }`}
    >
      {completed ? "Visit Complete" : "Visit Pending"}
    </button>
  );
}
