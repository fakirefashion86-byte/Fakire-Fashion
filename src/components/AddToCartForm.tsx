"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  id: number;
  size: string;
  color: string;
  price: string;
  mrp: string;
  qty: number;
};

export default function AddToCartForm({
  productId,
  variants,
}: {
  productId: number;
  variants: Variant[];
}) {
  const router = useRouter();
  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size))), [variants]);
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))), [variants]);

  const [size, setSize] = useState(sizes[0] ?? "");
  const [color, setColor] = useState(colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedVariant = variants.find((v) => v.size === size && v.color === color);

  async function handleAddToCart() {
    setMessage(null);
    if (variants.length > 0 && !selectedVariant) {
      setMessage("That combination is unavailable.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variantId: selectedVariant?.id, qty }),
    });
    setLoading(false);
    if (res.status === 401) {
      router.push(`/login?next=/product/${productId}`);
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error ?? "Could not add to cart");
      return;
    }
    setMessage("Added to cart.");
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {sizes.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded border px-3 py-1 text-sm ${
                  size === s ? "border-btn bg-btn text-btn-text" : "border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`rounded border px-3 py-1 text-sm ${
                  color === c ? "border-btn bg-btn text-btn-text" : "border-border"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">Qty</p>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-16 rounded border border-border px-2 py-1"
        />
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="rounded bg-btn px-5 py-2.5 text-btn-text transition hover:bg-btn-hover disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add to Cart"}
      </button>

      {message && <p className="text-sm text-ink-secondary">{message}</p>}
    </div>
  );
}
