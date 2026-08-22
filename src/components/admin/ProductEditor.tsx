"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";

type Category = { id: number; name: string; subCategories: { id: number; name: string }[] };
type Image = { id: number; url: string };
type Variant = { id: number; size: string; color: string; qty: number; mrp: string; price: string };
type ProductData = {
  id: number;
  name: string;
  code: string;
  description: string;
  mrp: string;
  price: string;
  status: boolean;
  categoryId: number;
  subCategoryId: number | null;
  images: Image[];
  variants: Variant[];
};

export default function ProductEditor({
  product,
  categories,
}: {
  product: ProductData;
  categories: Category[];
}) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [subCategoryId, setSubCategoryId] = useState<number | "">(product.subCategoryId ?? "");
  const [description, setDescription] = useState(product.description);
  const [mrp, setMrp] = useState(product.mrp);
  const [price, setPrice] = useState(product.price);
  const [status, setStatus] = useState(product.status);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const [images, setImages] = useState(product.images);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);

  const [variants, setVariants] = useState(product.variants);
  const [variantEdits, setVariantEdits] = useState<Record<number, string>>({});
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("Default");
  const [newQty, setNewQty] = useState("0");
  const [variantError, setVariantError] = useState<string | null>(null);
  const [savingVariant, setSavingVariant] = useState<number | "new" | null>(null);

  const subCategories = useMemo(
    () => categories.find((c) => c.id === categoryId)?.subCategories ?? [],
    [categories, categoryId]
  );

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setDetailsError(null);
    setDetailsSaved(false);
    setSavingDetails(true);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        categoryId,
        subCategoryId: subCategoryId === "" ? null : subCategoryId,
        description,
        mrp: Number(mrp),
        price: Number(price),
        status,
      }),
    });
    setSavingDetails(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDetailsError(typeof data.error === "string" ? data.error : "Could not save changes");
      return;
    }
    setDetailsSaved(true);
    router.refresh();
    setTimeout(() => setDetailsSaved(false), 2000);
  }

  async function addImage() {
    if (!newImageUrl.trim()) return;
    setImageError(null);
    const res = await fetch(`/api/admin/products/${product.id}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newImageUrl.trim() }),
    });
    if (!res.ok) {
      setImageError("Could not add that photo");
      return;
    }
    const data = await res.json();
    setImages((imgs) => [...imgs, data.image]);
    setNewImageUrl("");
  }

  async function removeImage(imageId: number) {
    setImages((imgs) => imgs.filter((i) => i.id !== imageId));
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, { method: "DELETE" });
  }

  async function saveVariantQty(variantId: number) {
    const raw = variantEdits[variantId];
    if (raw === undefined) return;
    const qty = Number(raw);
    if (!Number.isFinite(qty) || qty < 0) {
      setVariantError("Stock must be a non-negative number");
      return;
    }
    setVariantError(null);
    setSavingVariant(variantId);
    const res = await fetch(`/api/admin/products/${product.id}/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });
    setSavingVariant(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setVariantError(typeof data.error === "string" ? data.error : "Could not update stock");
      return;
    }
    setVariants((vs) => vs.map((v) => (v.id === variantId ? { ...v, qty } : v)));
    setVariantEdits((e) => {
      const next = { ...e };
      delete next[variantId];
      return next;
    });
  }

  async function removeVariant(variantId: number) {
    if (!confirm("Remove this size?")) return;
    await fetch(`/api/admin/products/${product.id}/variants/${variantId}`, { method: "DELETE" });
    setVariants((vs) => vs.filter((v) => v.id !== variantId));
  }

  async function addVariant() {
    if (!newSize.trim()) return;
    setVariantError(null);
    setSavingVariant("new");
    const res = await fetch(`/api/admin/products/${product.id}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        size: newSize.trim(),
        color: newColor.trim() || "Default",
        qty: Number(newQty) || 0,
      }),
    });
    setSavingVariant(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setVariantError(typeof data.error === "string" ? data.error : "Could not add that size");
      return;
    }
    const data = await res.json();
    setVariants((vs) => [...vs, data.variant]);
    setNewSize("");
    setNewColor("Default");
    setNewQty("0");
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={saveDetails} className="flex max-w-xl flex-col gap-4 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Details</h2>
        <p className="-mt-2 text-xs text-ink-muted">Code: {product.code}</p>
        <input
          required
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={INPUT_CLASS}
        />
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(Number(e.target.value));
            setSubCategoryId("");
          }}
          className={INPUT_CLASS}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {subCategories.length > 0 && (
          <select
            value={subCategoryId}
            onChange={(e) => setSubCategoryId(e.target.value ? Number(e.target.value) : "")}
            className={INPUT_CLASS}
          >
            <option value="">No subcategory</option>
            {subCategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={INPUT_CLASS}
        />
        <div className="flex gap-3">
          <input
            required
            type="number"
            step="0.01"
            placeholder="MRP"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            className={`w-1/2 ${INPUT_CLASS}`}
          />
          <input
            required
            type="number"
            step="0.01"
            placeholder="Selling price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`w-1/2 ${INPUT_CLASS}`}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
          Visible to customers
        </label>
        {detailsError && <p className="text-sm text-error">{detailsError}</p>}
        <button type="submit" disabled={savingDetails} className={`self-start ${PRIMARY_BUTTON_CLASS}`}>
          {savingDetails ? "Saving…" : detailsSaved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>

      <div className="max-w-xl rounded-lg border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Photos</h2>
        <div className="flex flex-col gap-2">
          {images.map((img) => (
            <div key={img.id} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external product photo URL */}
              <img src={img.url} alt="" className="h-12 w-12 rounded border border-border object-cover" />
              <p className="flex-1 truncate text-sm text-ink-secondary">{img.url}</p>
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="text-xs text-error underline"
              >
                Remove
              </button>
            </div>
          ))}
          {images.length === 0 && <p className="text-sm text-ink-muted">No photos yet.</p>}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="Image URL"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className={`flex-1 ${INPUT_CLASS}`}
          />
          <button
            type="button"
            onClick={addImage}
            className="rounded border border-border px-3 py-2.5 text-sm font-medium hover:bg-section"
          >
            Add
          </button>
        </div>
        {imageError && <p className="mt-1 text-sm text-error">{imageError}</p>}
      </div>

      <div className="max-w-xl rounded-lg border border-border p-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-muted">Sizes &amp; Stock</h2>
        <p className="mb-3 text-xs text-ink-muted">
          Update how many of each size/color you have ready to sell.
        </p>
        <div className="flex flex-col gap-2">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center gap-2">
              <p className="w-24 text-sm">{v.size}</p>
              <p className="flex-1 text-sm text-ink-secondary">{v.color}</p>
              <input
                type="number"
                min="0"
                value={variantEdits[v.id] ?? v.qty}
                onChange={(e) => setVariantEdits((edits) => ({ ...edits, [v.id]: e.target.value }))}
                className={`w-20 ${INPUT_CLASS}`}
              />
              <button
                type="button"
                onClick={() => saveVariantQty(v.id)}
                disabled={savingVariant === v.id || variantEdits[v.id] === undefined}
                className="rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-section disabled:opacity-50"
              >
                {savingVariant === v.id ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => removeVariant(v.id)}
                className="text-xs text-error underline"
              >
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
            <input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className={INPUT_CLASS}
            />
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
            disabled={savingVariant === "new"}
            className="rounded border border-border px-3 py-2.5 text-sm font-medium hover:bg-section disabled:opacity-50"
          >
            {savingVariant === "new" ? "Adding…" : "Add Size"}
          </button>
        </div>
        {variantError && <p className="mt-2 text-sm text-error">{variantError}</p>}
      </div>
    </div>
  );
}
