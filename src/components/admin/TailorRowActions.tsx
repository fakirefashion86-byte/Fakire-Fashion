"use client";

import { useRouter } from "next/navigation";

export default function TailorRowActions({
  tailorId,
  approved,
}: {
  tailorId: number;
  approved: boolean;
}) {
  const router = useRouter();

  async function setApproved(value: boolean) {
    await fetch(`/api/admin/tailors/${tailorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: value }),
    });
    router.refresh();
  }

  async function remove() {
    if (!confirm("Remove this tailor account? This cannot be undone.")) return;
    await fetch(`/api/admin/tailors/${tailorId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex gap-3 text-xs">
      {approved ? (
        <button onClick={() => setApproved(false)} className="text-yellow-700 underline">
          Revoke
        </button>
      ) : (
        <button onClick={() => setApproved(true)} className="text-success underline">
          Approve
        </button>
      )}
      <button onClick={remove} className="text-error underline">
        {approved ? "Remove" : "Reject"}
      </button>
    </div>
  );
}
