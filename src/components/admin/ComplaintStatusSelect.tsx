"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const OPTIONS = ["open", "in_progress", "resolved"] as const;

export default function ComplaintStatusSelect({
  complaintId,
  status,
}: {
  complaintId: number;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    await fetch(`/api/admin/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: e.target.value }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      onChange={handleChange}
      disabled={loading}
      className="rounded border border-border bg-transparent px-2 py-1 text-xs disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
