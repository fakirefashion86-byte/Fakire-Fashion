"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RulerIcon, ClockIcon, BoltIcon, BagIcon } from "./icons";

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
    <div className="mt-5 flex flex-col gap-5">
      {hasVariants && (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#4a3a24]">Size</p>
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-[#8a6d2f] hover:text-[#B8860B]"
              >
                <RulerIcon className="h-3.5 w-3.5" />
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => selectSize(s)}
                  className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    s === size
                      ? "border-[#C7A03D] bg-[#FBF3E0] text-[#5c4413] shadow-[0_0_0_1px_#C7A03D]"
                      : "border-[#E3D3AC] text-[#4a3a24] hover:border-[#C7A03D]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#4a3a24]">Color</p>
            <div className="relative">
              <select
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setQty(1);
                  setAdded(false);
                }}
                className="w-full appearance-none rounded-lg border border-[#E3D3AC] bg-white px-4 py-2.5 pl-10 text-sm text-[#2b2116] focus:border-[#C7A03D] focus:outline-none"
              >
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#d9c691] bg-[#D9C9A0]"
              />
            </div>
          </div>

          {outOfStock ? (
            <p className="text-sm font-medium text-[#b5442f]">Out of stock</p>
          ) : selectedVariant && selectedVariant.qty <= 5 ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-[#EBD9BC] bg-[#FBEFE1] px-4 py-3">
              <ClockIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C97C1D]" />
              <p className="text-sm text-[#5c4413]">
                Only <span className="font-semibold text-[#b5442f]">{selectedVariant.qty}</span> left in stock!
                <span className="block text-xs text-[#8a6d2f]">Hurry up before it&apos;s gone.</span>
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium text-[#3F7A4E]">In stock</p>
          )}
        </>
      )}

      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#4a3a24]">Qty</p>
        <div className="flex items-center rounded-lg border border-[#E3D3AC]">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-[#6b5a35] hover:text-[#2b2116]"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-medium text-[#2b2116]">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1))}
            className="px-3 py-1.5 text-[#6b5a35] hover:text-[#2b2116]"
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-[#b5442f]">{error}</p>}
      {added && !error && <p className="text-sm text-[#3F7A4E]">Added to cart.</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={pending !== null || outOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#E4BC55] to-[#B8860B] px-4 py-3.5 text-sm font-semibold text-[#2b2116] shadow-[0_2px_6px_rgba(184,134,11,0.35)] transition hover:brightness-105 disabled:opacity-50"
        >
          <BagIcon className="h-4 w-4" />
          {pending === "cart" ? "Adding…" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={pending !== null || outOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#15110b] px-4 py-3.5 text-sm font-semibold text-[#F2D98A] transition hover:bg-[#241c12] disabled:opacity-50"
        >
          <BoltIcon className="h-4 w-4" />
          {pending === "buy" ? "Please wait…" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
