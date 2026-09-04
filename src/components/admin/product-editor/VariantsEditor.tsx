"use client";

import { useState } from "react";
import { INPUT_CLASS } from "@/lib/formStyles";

type Variant = { id: number; size: string; color: string; qty: number; mrp: string; price: string };

/** Add/remove size+color variants and edit their stock counts. */
export default function VariantsEditor({ productId, initialVariants }: { productId: number; initialVariants: Variant[] }) {
  const [variants, setVariants] = useState(initialVariants);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("Default");
  const [newQty, setNewQty] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | "new" | null>(null);

  async function saveQty(variantId: number) {
    const raw = edits[variantId];
    if (raw === undefined) return;
    const qty = Number(raw);
    if (!Number.isFinite(qty) || qty < 0) {
      setError("Stock must be a non-negative number");
      return;
    }
    setError(null);
    setSaving(variantId);
    const res = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });
    setSaving(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not update stock");
      return;
    }
    setVariants((vs) => vs.map((v) => (v.id === variantId ? { ...v, qty } : v)));
    setEdits((e) => {
      const next = { ...e };
      delete next[variantId];
      return next;
    });
  }

  async function removeVariant(variantId: number) {
    if (!confirm("Remove this size?")) return;
    await fetch(`/api/admin/products/${productId}/variants/${variantId}`, { method: "DELETE" });
    setVariants((vs) => vs.filter((v) => v.id !== variantId));
  }

  async function addVariant() {
    if (!newSize.trim()) return;
    setError(null);
    setSaving("new");
    const res = await fetch(`/api/admin/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size: newSize.trim(), color: newColor.trim() || "Default", qty: Number(newQty) || 0 }),
    });
    setSaving(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not add that size");
      return;
    }
    const data = await res.json();
    setVariants((vs) => [...vs, data.variant]);
    setNewSize("");
    setNewColor("Default");
    setNewQty("0");
  }

  return (
    <div className="max-w-xl rounded-lg border border-border p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-muted">Sizes &amp; Stock</h2>
      <p className="mb-3 text-xs text-ink-muted">Update how many of each size/color you have ready to sell.</p>
      <div className="flex flex-col gap-2">
        {variants.map((v) => (
          <div key={v.id} className="flex items-center gap-2">
            <p className="w-24 text-sm">{v.size}</p>
            <p className="flex-1 text-sm text-ink-secondary">{v.color}</p>
            <input
              type="number"
              min="0"
              value={edits[v.id] ?? v.qty}
              onChange={(e) => setEdits((prev) => ({ ...prev, [v.id]: e.target.value }))}
              className={`w-20 ${INPUT_CLASS}`}
            />
            <button
              type="button"
              onClick={() => saveQty(v.id)}
              disabled={saving === v.id || edits[v.id] === undefined}
              className="rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-section disabled:opacity-50"
            >
              {saving === v.id ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => removeVariant(v.id)} className="text-xs text-error underline">
              Remove
            </button>
          </div>
        ))}
        {variants.length === 0 && <p className="text-sm text-ink-muted">No sizes added yet.</p>}
      </div>

      <div className="mt-4 flex items-end gap-2 border-t border-border pt-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Size</label>
          <input
            placeholder="e.g. S, M, 38"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            className={`w-28 ${INPUT_CLASS}`}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-ink-muted">Color</label>
          <input value={newColor} onChange={(e) => setNewColor(e.target.value)} className={INPUT_CLASS} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Stock</label>
          <input
            type="number"
            min="0"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            className={`w-20 ${INPUT_CLASS}`}
          />
        </div>
        <button
          type="button"
          onClick={addVariant}
          disabled={saving === "new"}
          className="rounded border border-border px-3 py-2.5 text-sm font-medium hover:bg-section disabled:opacity-50"
        >
          {saving === "new" ? "Adding…" : "Add Size"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
