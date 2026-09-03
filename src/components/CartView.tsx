"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ArrowRightIcon,
  HeartIcon,
  TagIcon,
  ShieldIcon,
  RefreshIcon,
  MedalIcon,
  DeliveryVanIcon,
} from "@/components/icons";

type CartItem = {
  id: number;
  qty: number;
  product: { id: number; name: string; price: string; mrp: string; images: { url: string }[] };
  variant: { id: number; size: string; color: string; price: string; mrp: string } | null;
};

const FREE_SHIPPING_THRESHOLD = 1999;

const TRUST_ROW = [
  { icon: ShieldIcon, title: "Secure Checkout", desc: "100% safe & secure payments" },
  { icon: RefreshIcon, title: "Easy Returns", desc: "7 days return policy" },
];

const BOTTOM_ROW = [
  { icon: MedalIcon, title: "Premium Quality", desc: "Finest fabric & craftsmanship" },
  { icon: DeliveryVanIcon, title: "Free Shipping", desc: `On orders above ₹${FREE_SHIPPING_THRESHOLD}` },
  { icon: ShieldIcon, title: "Secure Payments", desc: "100% safe & secure" },
];

const PAYMENT_BADGES = [
  { label: "VISA", className: "text-[#1A1F71]" },
  { label: "Mastercard", className: "text-[#EB5F27]" },
  { label: "RuPay", className: "text-[#0B3D91]" },
  { label: "UPI", className: "text-[#2b2116]" },
];

export default function CartView() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    const res = await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not update quantity");
    }
    load();
  }

  async function removeItem(id: number) {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    load();
  }

  if (items === null) return <p className="text-[#8a6d2f]">Loading…</p>;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[#EAD9B8] bg-white py-16 text-center">
        <p className="text-[#5c4d38]">Your cart is empty.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#B8860B] hover:text-[#8a6d2f]"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Continue shopping
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => {
    const price = Number(item.variant?.price ?? item.product.price);
    return sum + price * item.qty;
  }, 0);

  const mrpTotal = items.reduce((sum, item) => {
    const mrp = Number(item.variant?.mrp ?? item.product.mrp);
    return sum + mrp * item.qty;
  }, 0);

  const savings = Math.max(0, mrpTotal - total);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progressPct = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div>
      {error && <p className="mb-4 text-sm font-medium text-red-600">{error}</p>}

      {/* Free shipping progress */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#EAD9B8] bg-[#FBF3E6] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <TagIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#B8860B]" />
          <div>
            <p className="text-sm font-semibold text-[#2b2116]">
              {remaining > 0
                ? `You're ₹${remaining.toFixed(0)} away from free shipping!`
                : "You've unlocked free shipping!"}
            </p>
            <div className="mt-2 h-2 w-56 overflow-hidden rounded-full bg-[#EAD9B8] sm:w-64">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C7A03D] to-[#8a6d2f]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-8 sm:pl-0">
          <DeliveryVanIcon className="h-6 w-6 flex-shrink-0 text-[#B8860B]" />
          <div className="text-sm">
            <p className="text-[#5c4d38]">Free Shipping</p>
            <p className="font-semibold text-[#2b2116]">₹{FREE_SHIPPING_THRESHOLD}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 flex flex-col gap-4">
        {items.map((item) => {
          const price = Number(item.variant?.price ?? item.product.price);
          const image = item.product.images[0]?.url;
          return (
            <div key={item.id} className="flex gap-4 rounded-xl border border-[#EAD9B8] bg-white p-4">
              <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#FBF3E6]">
                {image && (
                  <Image src={image} alt={item.product.name} fill sizes="96px" className="object-cover" />
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <p className="font-serif text-lg font-semibold leading-tight text-[#2b2116]">
                  {item.product.name}
                </p>
                {item.variant && (
                  <p className="mt-1 text-sm text-[#8a6d2f]">
                    Size: {item.variant.size} &nbsp;|&nbsp; Color: {item.variant.color}
                  </p>
                )}
                <p className="mt-2 text-xl font-semibold text-[#2b2116]">₹{(price * item.qty).toFixed(0)}</p>
                <span className="mt-2 w-fit rounded bg-[#F3E4C0] px-2 py-1 text-xs font-medium text-[#7A5B12]">
                  ₹{price.toFixed(0)} each
                </span>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  type="button"
                  aria-label="Add to wishlist"
                  className="text-[#2b2116] hover:text-[#B8860B]"
                >
                  <HeartIcon className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 rounded-lg border border-[#EAD9B8] px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    disabled={item.qty <= 1}
                    className="flex h-5 w-5 items-center justify-center text-[#2b2116] disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm font-medium text-[#2b2116]">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="flex h-5 w-5 items-center justify-center text-[#2b2116]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-[#F6EFE0] p-5 sm:grid-cols-2">
        {TRUST_ROW.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className={`flex items-center gap-3 ${i > 0 ? "sm:border-l sm:border-[#EAD9B8] sm:pl-4" : ""}`}
          >
            <Icon className="h-6 w-6 flex-shrink-0 text-[#B8860B]" />
            <div>
              <p className="text-sm font-semibold text-[#2b2116]">{title}</p>
              <p className="text-xs text-[#8a6d2f]">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total / checkout */}
      <div className="mt-8 flex flex-col gap-6 rounded-2xl bg-[#15110b] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm text-[#C9BFA4]">Total Amount</p>
          <p className="mt-1 font-serif text-4xl font-semibold text-white">₹{total.toFixed(0)}</p>
          <p className="mt-1 text-xs text-[#C9BFA4]">(Inclusive of all taxes)</p>
          {savings > 0 && (
            <p className="mt-1 text-sm font-medium text-[#8FCB9B]">You save ₹{savings.toFixed(0)}</p>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#C7A03D] to-[#B8860B] px-6 py-3 text-sm font-semibold text-[#2b2116] transition hover:brightness-105"
          >
            Proceed to Checkout <ArrowRightIcon className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-xs text-[#C9BFA4]">
            <span>We Accept</span>
            {PAYMENT_BADGES.map((b) => (
              <span
                key={b.label}
                className={`rounded bg-white px-1.5 py-0.5 text-[10px] font-bold ${b.className}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom trust row */}
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {BOTTOM_ROW.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-2">
            <Icon className="h-6 w-6 text-[#B8860B]" />
            <p className="text-xs font-semibold text-[#2b2116]">{title}</p>
            <p className="text-[11px] leading-snug text-[#8a6d2f]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
