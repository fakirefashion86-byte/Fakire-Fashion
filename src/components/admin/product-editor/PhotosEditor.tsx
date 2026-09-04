"use client";

import { useState } from "react";
import { INPUT_CLASS } from "@/lib/formStyles";

type Image = { id: number; url: string };

/** Add/remove product photos by URL. */
export default function PhotosEditor({ productId, initialImages }: { productId: number; initialImages: Image[] }) {
  const [images, setImages] = useState(initialImages);
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function addImage() {
    if (!newUrl.trim()) return;
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl.trim() }),
    });
    if (!res.ok) {
      setError("Could not add that photo");
      return;
    }
    const data = await res.json();
    setImages((imgs) => [...imgs, data.image]);
    setNewUrl("");
  }

  async function removeImage(imageId: number) {
    setImages((imgs) => imgs.filter((i) => i.id !== imageId));
    await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
  }

  return (
    <div className="max-w-xl rounded-lg border border-border p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Photos</h2>
      <div className="flex flex-col gap-2">
        {images.map((img) => (
          <div key={img.id} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external product photo URL */}
            <img src={img.url} alt="" className="h-12 w-12 rounded border border-border object-cover" />
            <p className="flex-1 truncate text-sm text-ink-secondary">{img.url}</p>
            <button type="button" onClick={() => removeImage(img.id)} className="text-xs text-error underline">
              Remove
            </button>
          </div>
        ))}
        {images.length === 0 && <p className="text-sm text-ink-muted">No photos yet.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          placeholder="Image URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
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
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
