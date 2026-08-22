"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";

type Category = { id: number; name: string; subCategories: { id: number; name: string }[] };
type VariantRow = { size: string; color: string; qty: string };

let rowKey = 0;
function newRow(): VariantRow & { key: number } {
  return { key: rowKey++, size: "", color: "Default", qty: "0" };
}

export default function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 0);
  const [subCategoryId, setSubCategoryId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [variants, setVariants] = useState<(VariantRow & { key: number })[]>([newRow()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subCategories = useMemo(
    () => categories.find((c) => c.id === categoryId)?.subCategories ?? [],
    [categories, categoryId]
  );

  function updateVariant(key: number, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeVariant(key: number) {
    setVariants((rows) => rows.filter((r) => r.key !== key));
  }

  function updateImageUrl(index: number, value: string) {
    setImageUrls((urls) => urls.map((u, i) => (i === index ? value : u)));
  }

  function removeImageUrl(index: number) {
    setImageUrls((urls) => urls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanVariants = variants
      .filter((v) => v.size.trim())
      .map((v) => ({
        size: v.size.trim(),
        color: v.color.trim() || "Default",
        qty: Number(v.qty) || 0,
      }));

    setLoading(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        code,
        categoryId,
        subCategoryId: subCategoryId || undefined,
        description,
        mrp: Number(mrp),
        price: Number(price),
        imageUrls: imageUrls.map((u) => u.trim()).filter(Boolean),
        variants: cleanVariants,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not create product");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  if (categories.length === 0) {
    return <p className="text-ink-muted">Create a category first.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <input
        required
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={INPUT_CLASS}
      />
      <input
        required
        placeholder="Product code (unique)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
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

      <div>
        <p className="mb-2 text-sm font-medium">Photos</p>
        <div className="flex flex-col gap-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Image URL"
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
                className={`flex-1 ${INPUT_CLASS}`}
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageUrl(i)}
                  className="rounded border border-border px-3 text-sm text-error hover:bg-section"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setImageUrls((urls) => [...urls, ""])}
          className="mt-2 text-sm text-accent hover:underline"
        >
          + Add another photo
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Sizes &amp; stock</p>
        <p className="mb-2 text-xs text-ink-muted">
          Add each size you stitch to sell, with how many are in stock right now.
        </p>
        <div className="flex flex-col gap-2">
          {variants.map((v) => (
            <div key={v.key} className="flex gap-2">
              <input
                placeholder="Size (e.g. S, M, 38)"
                value={v.size}
                onChange={(e) => updateVariant(v.key, { size: e.target.value })}
                className={`w-28 ${INPUT_CLASS}`}
              />
              <input
                placeholder="Color"
                value={v.color}
                onChange={(e) => updateVariant(v.key, { color: e.target.value })}
                className={`flex-1 ${INPUT_CLASS}`}
              />
              <input
                type="number"
                min="0"
                placeholder="Stock"
                value={v.qty}
                onChange={(e) => updateVariant(v.key, { qty: e.target.value })}
                className={`w-24 ${INPUT_CLASS}`}
              />
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(v.key)}
                  className="rounded border border-border px-3 text-sm text-error hover:bg-section"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setVariants((rows) => [...rows, newRow()])}
          className="mt-2 text-sm text-accent hover:underline"
        >
          + Add another size
        </button>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={loading} className={PRIMARY_BUTTON_CLASS}>
        {loading ? "Creating…" : "Create Product"}
      </button>
    </form>
  );
}
