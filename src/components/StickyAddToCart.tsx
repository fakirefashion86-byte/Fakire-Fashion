"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BagIcon } from "./icons";

type Variant = { id: number; size: string; color: string; price: string; mrp: string; qty: number };

type Props = {
  productId: number;
  name: string;
  price: number;
  mrp: number;
  image: string | null;
  variants: Variant[];
  loggedIn: boolean;
};

export default function StickyAddToCart({ productId, name, price, mrp, image, variants, loggedIn }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const hasVariants = variants.length > 0;
  const defaultVariant = variants[0] ?? null;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const outOfStock = hasVariants && (!defaultVariant || defaultVariant.qty <= 0);

  async function handleAdd() {
    if (pending) return;
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setPending(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variantId: defaultVariant?.id, qty }),
    });
    setPending(false);
    if (res.ok) router.refresh();
  }

  const maxQty = useMemo(() => (hasVariants ? (defaultVariant?.qty ?? 0) : 99), [hasVariants, defaultVariant]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EAD9B8] bg-[#FBF3E6]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-[#EAD9B8] bg-white">
          {image && <Image src={image} alt={name} fill className="object-cover" sizes="48px" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#2b2116]">{name}</p>
          <p className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-[#2b2116]">₹{price.toFixed(0)}</span>
            {discount > 0 && (
              <span className="rounded bg-[#F3E4C0] px-1.5 py-0.5 text-[10px] font-semibold text-[#7A5B12]">
                {discount}% OFF
              </span>
            )}
          </p>
        </div>
        <div className="hidden items-center rounded-lg border border-[#E3D3AC] sm:flex">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-2.5 py-1.5 text-[#6b5a35] hover:text-[#2b2116]"
          >
            −
          </button>
          <span className="min-w-[1.75rem] text-center text-sm font-medium text-[#2b2116]">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1))}
            className="px-2.5 py-1.5 text-[#6b5a35] hover:text-[#2b2116]"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || outOfStock}
          className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-gradient-to-b from-[#E4BC55] to-[#B8860B] px-5 py-2.5 text-sm font-semibold text-[#2b2116] shadow-[0_2px_6px_rgba(184,134,11,0.35)] transition hover:brightness-105 disabled:opacity-50"
        >
          <BagIcon className="h-4 w-4" />
          {pending ? "Adding…" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
