"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Variant = { id: number; size: string; color: string; price: string; mrp: string; qty: number };

type Props = {
  productId: number;
  variants: Variant[];
  loggedIn: boolean;
};

export default function AddToCartPanel({ productId, variants, loggedIn }: Props) {
  const router = useRouter();
  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size))), [variants]);
  const [size, setSize] = useState(sizes[0] ?? "");
  const colors = useMemo(
    () => Array.from(new Set(variants.filter((v) => v.size === size).map((v) => v.color))),
    [variants, size]
  );
  const [color, setColor] = useState(colors[0] ?? "");
  const selectedVariant = useMemo(
    () => variants.find((v) => v.size === size && v.color === color) ?? null,
    [variants, size, color]
  );

  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState<"cart" | "buy" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const hasVariants = variants.length > 0;
  const outOfStock = hasVariants && (!selectedVariant || selectedVariant.qty <= 0);
  const maxQty = hasVariants ? (selectedVariant?.qty ?? 0) : 99;

  function selectSize(next: string) {
    setSize(next);
    const nextColors = variants.filter((v) => v.size === next).map((v) => v.color);
    if (!nextColors.includes(color)) setColor(nextColors[0] ?? "");
    setQty(1);
    setAdded(false);
  }

  async function addToCart(): Promise<boolean> {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return false;
    }
    if (hasVariants && !selectedVariant) {
      setError("Please select a size and color.");
      return false;
    }
    if (outOfStock) {
      setError("This size/color is currently out of stock.");
      return false;
    }
    setError(null);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        variantId: selectedVariant?.id,
        qty,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add to cart. Please try again.");
      return false;
    }
    return true;
  }

  async function handleAddToCart() {
    if (pending) return;
    setPending("cart");
    const ok = await addToCart();
    setPending(null);
    if (ok) {
      setAdded(true);
      router.refresh();
    }
  }

  async function handleBuyNow() {
    if (pending) return;
    setPending("buy");
    const ok = await addToCart();
    setPending(null);
    if (ok) router.push("/cart");
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {hasVariants && (
        <>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => selectSize(s)}
                  className={`rounded border px-3 py-1.5 text-sm transition ${
                    s === size
                      ? "border-accent bg-accent/10 font-semibold text-accent"
                      : "border-border text-ink-secondary hover:border-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    setQty(1);
                    setAdded(false);
                  }}
                  className={`rounded border px-3 py-1.5 text-sm transition ${
                    c === color
                      ? "border-accent bg-accent/10 font-semibold text-accent"
                      : "border-border text-ink-secondary hover:border-accent"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm">
            {outOfStock ? (
              <span className="font-medium text-error">Out of stock</span>
            ) : selectedVariant && selectedVariant.qty <= 5 ? (
              <span className="font-medium text-accent">Only {selectedVariant.qty} left</span>
            ) : (
              <span className="font-medium text-success">In stock</span>
            )}
          </p>
        </>
      )}

      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Qty</p>
        <div className="flex items-center rounded border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-ink-secondary hover:text-foreground"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1))}
            className="px-3 py-1.5 text-ink-secondary hover:text-foreground"
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {added && !error && <p className="text-sm text-success">Added to cart.</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={pending !== null || outOfStock}
          className="flex-1 rounded border border-btn-secondary-border px-4 py-3 text-sm font-semibold text-btn-secondary-text transition hover:bg-section disabled:opacity-50"
        >
          {pending === "cart" ? "Adding…" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={pending !== null || outOfStock}
          className="flex-1 rounded bg-btn px-4 py-3 text-sm font-semibold text-btn-text transition hover:bg-btn-hover disabled:opacity-50"
        >
          {pending === "buy" ? "Please wait…" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
