"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteOrderButton({
  orderId,
  redirectTo,
}: {
  orderId: number;
  /** If set, navigate here after a successful delete (used on the detail page). */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this stitching order? This cannot be undone.");
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch(`/api/admin/stitch-orders/${orderId}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      window.alert("Could not delete this order. Please try again.");
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-error hover:underline disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
