"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MEASUREMENT_FIELDS: { key: string; label: string }[] = [
  { key: "length", label: "Length" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeves", label: "Sleeves" },
  { key: "upperChest", label: "Upper Chest" },
  { key: "belly", label: "Belly" },
  { key: "hip", label: "Hip" },
  { key: "collar", label: "Collar" },
  { key: "cuff", label: "Cuff" },
  { key: "front", label: "Front" },
  { key: "waist", label: "Waist" },
  { key: "thigh", label: "Thigh" },
  { key: "knee", label: "Knee" },
  { key: "bottom", label: "Bottom" },
  { key: "sleevesBottom", label: "Sleeves Bottom" },
  { key: "frontNeck", label: "Front Neck" },
  { key: "backNeck", label: "Back Neck" },
];

type CustomerValues = {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
};

export default function StitchOrderForm({
  categories,
  defaultValues,
}: {
  categories: { id: number; name: string }[];
  defaultValues: CustomerValues;
}) {
  const router = useRouter();
  const [stitchCategoryId, setStitchCategoryId] = useState(categories[0]?.id ?? 0);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [customer, setCustomer] = useState(defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateCustomer<K extends keyof CustomerValues>(key: K, value: CustomerValues[K]) {
    setCustomer((c) => ({ ...c, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const parsedMeasurements = Object.fromEntries(
      Object.entries(measurements)
        .filter(([, v]) => v !== "")
        .map(([k, v]) => [k, Number(v)])
    );

    const res = await fetch("/api/stitch-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stitchCategoryId,
        measurements: parsedMeasurements,
        ...customer,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not submit your stitching order. Please check the form and try again.");
      return;
    }
    router.push("/stitching/my-orders");
  }

  if (categories.length === 0) {
    return <p className="text-ink-muted">No stitching categories are available right now.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Garment type</label>
        <select
          value={stitchCategoryId}
          onChange={(e) => setStitchCategoryId(Number(e.target.value))}
          className="w-full rounded border border-border px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Measurements (inches)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {MEASUREMENT_FIELDS.map((f) => (
            <input
              key={f.key}
              type="number"
              step="0.1"
              placeholder={f.label}
              value={measurements[f.key] ?? ""}
              onChange={(e) => setMeasurements((m) => ({ ...m, [f.key]: e.target.value }))}
              className="rounded border border-border px-3 py-2 text-sm"
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Contact & delivery details</p>
        <div className="flex flex-col gap-3">
          <input
            required
            placeholder="Full name"
            value={customer.customerName}
            onChange={(e) => updateCustomer("customerName", e.target.value)}
            className="rounded border border-border px-3 py-2"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={customer.customerEmail}
            onChange={(e) => updateCustomer("customerEmail", e.target.value)}
            className="rounded border border-border px-3 py-2"
          />
          <input
            required
            placeholder="Mobile number"
            value={customer.customerMobile}
            onChange={(e) => updateCustomer("customerMobile", e.target.value)}
            className="rounded border border-border px-3 py-2"
          />
          <textarea
            required
            placeholder="Delivery address"
            rows={3}
            value={customer.customerAddress}
            onChange={(e) => updateCustomer("customerAddress", e.target.value)}
            className="rounded border border-border px-3 py-2"
          />
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-btn px-5 py-2.5 text-btn-text transition hover:bg-btn-hover disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Stitching Order"}
      </button>
    </form>
  );
}
