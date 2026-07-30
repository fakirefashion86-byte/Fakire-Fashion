"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type CartItem = {
  id: number;
  qty: number;
  product: { id: number; name: string; price: string; images: { url: string }[] };
  variant: { id: number; size: string; color: string; price: string } | null;
};

export default function CartView() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateQty(id: number, qty: number) {
    if (qty < 1) return;
    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });
    load();
  }

  async function removeItem(id: number) {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    load();
  }

  if (items === null) return <p className="text-ink-muted">Loading…</p>;

  if (items.length === 0) {
    return (
      <div className="text-ink-secondary">
        Your cart is empty.{" "}
        <Link href="/" className="underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => {
    const price = Number(item.variant?.price ?? item.product.price);
    return sum + price * item.qty;
  }, 0);

  return (
    <div>
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const price = Number(item.variant?.price ?? item.product.price);
          const image = item.product.images[0]?.url;
          return (
            <div key={item.id} className="flex items-center gap-4 border-b border-border pb-4">
              <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-section">
                {image && <Image src={image} alt={item.product.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                {item.variant && (
                  <p className="text-sm text-ink-muted">
                    {item.variant.size} / {item.variant.color}
                  </p>
                )}
                <p className="text-sm">₹{price.toFixed(0)}</p>
              </div>
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) => updateQty(item.id, Number(e.target.value))}
                className="w-16 rounded border border-border px-2 py-1"
              />
              <button onClick={() => removeItem(item.id)} className="text-sm text-error hover:underline">
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-lg font-semibold">Total: ₹{total.toFixed(0)}</p>
        <button
          onClick={() => router.push("/checkout")}
          className="rounded bg-btn px-5 py-2.5 text-btn-text transition hover:bg-btn-hover"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
