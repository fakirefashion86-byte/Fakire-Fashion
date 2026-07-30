"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string; subCategories: { id: number; name: string }[] };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newCategory, setNewCategory] = useState("");
  const [subInputs, setSubInputs] = useState<Record<number, string>>({});

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    setNewCategory("");
    router.refresh();
  }

  async function addSubCategory(categoryId: number) {
    const name = subInputs[categoryId]?.trim();
    if (!name) return;
    await fetch("/api/admin/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, name }),
    });
    setSubInputs((s) => ({ ...s, [categoryId]: "" }));
    router.refresh();
  }

  async function deleteCategory(id: number) {
    if (!confirm("Delete this category and its subcategories?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={addCategory} className="flex gap-2">
        <input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded border border-border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded bg-btn px-4 py-2 text-sm text-btn-text transition hover:bg-btn-hover">
          Add Category
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {categories.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{c.name}</p>
              <button onClick={() => deleteCategory(c.id)} className="text-xs text-error underline">
                Delete
              </button>
            </div>
            <ul className="mt-2 flex flex-wrap gap-2 text-xs text-ink-secondary">
              {c.subCategories.map((s) => (
                <li key={s.id} className="rounded-full bg-section px-2 py-1">
                  {s.name}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <input
                placeholder="New subcategory"
                value={subInputs[c.id] ?? ""}
                onChange={(e) => setSubInputs((s) => ({ ...s, [c.id]: e.target.value }))}
                className="rounded border border-border px-2 py-1 text-sm"
              />
              <button
                onClick={() => addSubCategory(c.id)}
                className="rounded border border-border px-3 py-1 text-sm"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
