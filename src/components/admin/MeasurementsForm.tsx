"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NUMBER_MEASUREMENT_FIELDS, BOOLEAN_MEASUREMENT_FIELDS } from "@/lib/stitchMeasurements";

type Measurements = Record<string, number | boolean | undefined>;

export default function MeasurementsForm({
  orderId,
  measurements,
}: {
  orderId: number;
  measurements: Measurements;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      NUMBER_MEASUREMENT_FIELDS.map((f) => [f.key, measurements[f.key] != null ? String(measurements[f.key]) : ""])
    )
  );
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(BOOLEAN_MEASUREMENT_FIELDS.map((f) => [f.key, Boolean(measurements[f.key])]))
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const parsedMeasurements: Measurements = {
      ...Object.fromEntries(
        Object.entries(values)
          .filter(([, v]) => v !== "")
          .map(([k, v]) => [k, Number(v)])
      ),
      ...checks,
    };

    const res = await fetch(`/api/admin/stitch-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ measurements: parsedMeasurements }),
    });

    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm font-medium">Measurements (inches)</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {NUMBER_MEASUREMENT_FIELDS.map((f) => (
          <label key={f.key} className="text-xs text-ink-muted">
            {f.label}
            <input
              type="number"
              step="0.1"
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="mt-1 w-full rounded border border-border px-2 py-1 text-sm text-foreground"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {BOOLEAN_MEASUREMENT_FIELDS.map((f) => (
          <label key={f.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={checks[f.key] ?? false}
              onChange={(e) => setChecks((c) => ({ ...c, [f.key]: e.target.checked }))}
              className="h-4 w-4 rounded border-border"
            />
            {f.label}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="w-fit rounded bg-btn px-5 py-2 text-sm text-btn-text transition hover:bg-btn-hover disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save Measurements"}
        </button>
        {saved && <span className="text-sm text-success">Saved</span>}
      </div>
    </form>
  );
}
