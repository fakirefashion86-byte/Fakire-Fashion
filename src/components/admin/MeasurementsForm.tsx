"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SHIRT_MEASUREMENT_FIELDS,
  PANT_MEASUREMENT_FIELDS,
  PANT_BOOLEAN_FIELDS,
  DEFAULT_SHIRT_SECTION_LABEL,
  DEFAULT_PANT_SECTION_LABEL,
} from "@/lib/stitchMeasurements";

type Measurements = Record<string, number | string | boolean | undefined>;

const ALL_TEXT_FIELDS = [...SHIRT_MEASUREMENT_FIELDS, ...PANT_MEASUREMENT_FIELDS];

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
      ALL_TEXT_FIELDS.map((f) => [f.key, measurements[f.key] != null ? String(measurements[f.key]) : ""])
    )
  );
  const [shirtSectionLabel, setShirtSectionLabel] = useState(
    (measurements.shirtSectionLabel as string | undefined) || DEFAULT_SHIRT_SECTION_LABEL
  );
  const [pantSectionLabel, setPantSectionLabel] = useState(
    (measurements.pantSectionLabel as string | undefined) || DEFAULT_PANT_SECTION_LABEL
  );
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PANT_BOOLEAN_FIELDS.map((f) => [f.key, Boolean(measurements[f.key])]))
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
          .filter(([, v]) => v.trim() !== "")
          .map(([k, v]) => {
            const trimmed = v.trim();
            const asNumber = Number(trimmed);
            // Store as a number when it's purely numeric, otherwise keep the text as-is
            // (e.g. tailor notes like "loose" or "34.5F").
            return [k, trimmed !== "" && !Number.isNaN(asNumber) ? asNumber : trimmed];
          })
      ),
      ...checks,
      shirtSectionLabel,
      pantSectionLabel,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <input
          type="text"
          value={shirtSectionLabel}
          onChange={(e) => setShirtSectionLabel(e.target.value)}
          aria-label="Shirt/Kurta section title"
          className="w-full max-w-sm rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-foreground transition hover:border-border focus:border-border focus:bg-white focus:outline-none"
        />
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHIRT_MEASUREMENT_FIELDS.map((f) => (
            <label key={f.key} className="text-xs text-ink-muted">
              {f.label}
              <input
                type="text"
                inputMode="text"
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                placeholder="e.g. 18 or 18.5"
                className="mt-1 w-full rounded border border-border px-2 py-1 text-sm text-foreground"
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <input
          type="text"
          value={pantSectionLabel}
          onChange={(e) => setPantSectionLabel(e.target.value)}
          aria-label="Pant/Trouser section title"
          className="w-full max-w-sm rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-foreground transition hover:border-border focus:border-border focus:bg-white focus:outline-none"
        />
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PANT_MEASUREMENT_FIELDS.map((f) => (
            <label key={f.key} className="text-xs text-ink-muted">
              {f.label}
              <input
                type="text"
                inputMode="text"
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                placeholder="e.g. 32 or 32.5"
                className="mt-1 w-full rounded border border-border px-2 py-1 text-sm text-foreground"
              />
            </label>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-4">
          {PANT_BOOLEAN_FIELDS.map((f) => (
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
