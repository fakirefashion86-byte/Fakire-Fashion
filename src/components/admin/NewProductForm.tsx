"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string; subCategories: { id: number; name: string }[] };

export default function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 0);
  const [subCategoryId, setSubCategoryId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subCategories = useMemo(
    () => categories.find((c) => c.id === categoryId)?.subCategories ?? [],
    [categories, categoryId]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
        imageUrl: imageUrl || undefined,
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
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <input
        required
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded border border-border px-3 py-2"
      />
      <input
        required
        placeholder="Product code (unique)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="rounded border border-border px-3 py-2"
      />
      <select
        value={categoryId}
        onChange={(e) => {
          setCategoryId(Number(e.target.value));
          setSubCategoryId("");
        }}
        className="rounded border border-border px-3 py-2"
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
          className="rounded border border-border px-3 py-2"
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
        className="rounded border border-border px-3 py-2"
      />
      <div className="flex gap-3">
        <input
          required
          type="number"
          placeholder="MRP"
          value={mrp}
          onChange={(e) => setMrp(e.target.value)}
          className="w-1/2 rounded border border-border px-3 py-2"
        />
        <input
          required
          type="number"
          placeholder="Selling price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-1/2 rounded border border-border px-3 py-2"
        />
      </div>
      <input
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="rounded border border-border px-3 py-2"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-btn px-4 py-2 text-btn-text transition hover:bg-btn-hover disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create Product"}
      </button>
    </form>
  );
}
