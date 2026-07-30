"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Values = { name: string; email: string; mobile: string; address: string };

export default function CheckoutForm({ defaultValues }: { defaultValues: Values }) {
  const router = useRouter();
  const [values, setValues] = useState(defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not place order");
      return;
    }
    router.push(`/orders/${data.order.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        required
        placeholder="Full name"
        value={values.name}
        onChange={(e) => update("name", e.target.value)}
        className="rounded border border-border px-3 py-2"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={values.email}
        onChange={(e) => update("email", e.target.value)}
        className="rounded border border-border px-3 py-2"
      />
      <input
        required
        placeholder="Mobile number"
        value={values.mobile}
        onChange={(e) => update("mobile", e.target.value)}
        className="rounded border border-border px-3 py-2"
      />
      <textarea
        required
        placeholder="Shipping address"
        value={values.address}
        onChange={(e) => update("address", e.target.value)}
        rows={3}
        className="rounded border border-border px-3 py-2"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-btn px-5 py-2.5 text-btn-text transition hover:bg-btn-hover disabled:opacity-50"
      >
        {loading ? "Placing order…" : "Place Order (Cash on Delivery)"}
      </button>
    </form>
  );
}
