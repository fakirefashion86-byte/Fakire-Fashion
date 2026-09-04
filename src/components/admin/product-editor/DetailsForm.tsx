"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";

type Category = { id: number; name: string; subCategories: { id: number; name: string }[] };
type ProductDetails = {
  id: number;
  code: string;
  name: string;
  description: string;
  mrp: string;
  price: string;
  status: boolean;
  categoryId: number;
  subCategoryId: number | null;
};

/** The name/category/price/visibility form at the top of the product editor. */
export default function DetailsForm({ product, categories }: { product: ProductDetails; categories: Category[] }) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [subCategoryId, setSubCategoryId] = useState<number | "">(product.subCategoryId ?? "");
  const [description, setDescription] = useState(product.description);
  const [mrp, setMrp] = useState(product.mrp);
  const [price, setPrice] = useState(product.price);
  const [status, setStatus] = useState(product.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const subCategories = useMemo(
    () => categories.find((c) => c.id === categoryId)?.subCategories ?? [],
    [categories, categoryId]
  );

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
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
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not save changes");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
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
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={saving} className={`self-start ${PRIMARY_BUTTON_CLASS}`}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </form>
  );
}
