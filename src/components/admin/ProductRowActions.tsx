"use client";

import { useRouter } from "next/navigation";

export default function ProductRowActions({
  productId,
  status,
}: {
  productId: number;
  status: boolean;
}) {
  const router = useRouter();

  async function toggleStatus() {
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !status }),
    });
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex gap-3 text-xs">
      <button onClick={toggleStatus} className="underline">
        {status ? "Hide" : "Show"}
      </button>
      <button onClick={remove} className="text-error underline">
        Delete
      </button>
    </div>
  );
}
