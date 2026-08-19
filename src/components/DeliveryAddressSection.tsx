"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { INPUT_CLASS } from "@/lib/formStyles";
import { MAPS_CONFIGURED } from "@/lib/mapsConfig";
import type { ConfirmedLocation } from "@/components/location/LocationPicker";

// The Maps JS SDK + Places library are only fetched once this section actually
// mounts the picker (and only client-side) — checkout's initial load, and every
// other page on the site, stays free of the ~100kb Maps bundle.
const LocationPicker = dynamic(() => import("@/components/location/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-border bg-section p-6 text-center text-sm text-ink-muted">
      Loading map…
    </div>
  ),
});

export type DeliveryAddressValue = {
  addressLine: string;
  houseNumber: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  locationConfirmed: boolean;
  /** How this address was captured — governs whether lat/lng are required at submit time. */
  locationSource: "map" | "manual" | null;
  /** Non-null while editing a brand-new address the customer wants saved for next time; null once it's a saved pick or they opt out. */
  saveAs: "Home" | "Work" | "Other" | null;
};

export const EMPTY_DELIVERY_ADDRESS: DeliveryAddressValue = {
  addressLine: "",
  houseNumber: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  latitude: null,
  longitude: null,
  locationConfirmed: false,
  locationSource: null,
  saveAs: "Home",
};

type SavedAddress = Omit<DeliveryAddressValue, "locationConfirmed" | "locationSource" | "saveAs"> & {
  id: number;
  label: string;
};

const LABEL_ICON: Record<string, string> = { Home: "🏠", Work: "🏢" };

type Props = {
  value: DeliveryAddressValue;
  onChange: (value: DeliveryAddressValue) => void;
  errors?: Partial<Record<"addressLine" | "city" | "state" | "pincode" | "location", string>>;
};

export default function DeliveryAddressSection({ value, onChange, errors }: Props) {
  const [saved, setSaved] = useState<SavedAddress[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<"saved" | "picking" | "editing">("saved");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/addresses")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((data) => {
        if (cancelled) return;
        const addresses: SavedAddress[] = data.addresses ?? [];
        setSaved(addresses);
        setMode(addresses.length > 0 ? "saved" : MAPS_CONFIGURED ? "picking" : "editing");
        if (addresses.length === 0 && !MAPS_CONFIGURED) startManual();
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setSaved([]);
        setMode(MAPS_CONFIGURED ? "picking" : "editing");
        if (!MAPS_CONFIGURED) startManual();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startManual() {
    onChange({ ...EMPTY_DELIVERY_ADDRESS, locationConfirmed: true, locationSource: "manual" });
    setSelectedId(null);
    setMode("editing");
  }

  function startPicking() {
    setSelectedId(null);
    onChange(EMPTY_DELIVERY_ADDRESS);
    setMode(MAPS_CONFIGURED ? "picking" : "editing");
    if (!MAPS_CONFIGURED) startManual();
  }

  function selectSaved(addr: SavedAddress) {
    setSelectedId(addr.id);
    onChange({
      addressLine: addr.addressLine,
      houseNumber: addr.houseNumber,
      area: addr.area,
      landmark: addr.landmark,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      latitude: addr.latitude,
      longitude: addr.longitude,
      locationConfirmed: true,
      locationSource: addr.latitude != null && addr.longitude != null ? "map" : "manual",
      saveAs: null, // already saved — nothing new to persist
    });
  }

  function handleLocationConfirm(location: ConfirmedLocation) {
    onChange({
      addressLine: location.addressLine,
      houseNumber: location.houseNumber,
      area: location.area,
      landmark: value.landmark,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      country: location.country || "India",
      latitude: location.latitude,
      longitude: location.longitude,
      locationConfirmed: true,
      locationSource: "map",
      saveAs: "Home",
    });
    setSelectedId(null);
    setMode("editing");
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Delivery Address</h2>

      {mode === "saved" && saved && saved.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {saved.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => selectSaved(addr)}
                className={`rounded border p-3 text-left text-sm transition ${
                  selectedId === addr.id
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent"
                }`}
              >
                <p className="font-medium">
                  {LABEL_ICON[addr.label] ?? "📍"} {addr.label}
                </p>
                <p className="text-ink-secondary">
                  {[addr.houseNumber, addr.addressLine].filter(Boolean).join(", ")}
                </p>
                <p className="text-ink-muted">
                  {[addr.area, addr.city, addr.state].filter(Boolean).join(", ")} {addr.pincode}
                </p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={startPicking}
            className="self-start text-sm font-medium text-accent hover:underline"
          >
            + Add New Address
          </button>
        </div>
      )}

      {mode === "picking" && (
        <div className="flex flex-col gap-3">
          <LocationPicker
            initial={
              value.latitude != null && value.longitude != null
                ? { latitude: value.latitude, longitude: value.longitude }
                : null
            }
            onConfirm={handleLocationConfirm}
            onCancel={saved && saved.length > 0 ? () => setMode("saved") : undefined}
            onUnavailable={startManual}
          />
          {loadError && (
            <p className="text-xs text-ink-muted">
              Couldn&apos;t load your saved addresses, but you can still enter a new one below.
            </p>
          )}
        </div>
      )}

      {mode === "editing" && (
        <div className="flex flex-col gap-3">
          {value.locationSource === "map" ? (
            <div className="rounded border border-success/30 bg-success/10 p-3 text-sm text-success">
              📍 Location confirmed — add your house/flat number and any landmark below.
            </div>
          ) : (
            <div className="rounded border border-border bg-section p-3 text-sm text-ink-secondary">
              {MAPS_CONFIGURED
                ? "Map search is temporarily unavailable — please enter your delivery address below."
                : "Enter your delivery address below."}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="House/Flat/Shop No."
              className={INPUT_CLASS}
              value={value.houseNumber}
              onChange={(e) => onChange({ ...value, houseNumber: e.target.value })}
            />
            <input
              placeholder="Area/Locality"
              className={INPUT_CLASS}
              value={value.area}
              onChange={(e) => onChange({ ...value, area: e.target.value })}
            />
          </div>

          <div>
            <textarea
              placeholder="Full address"
              rows={2}
              className={`${INPUT_CLASS} w-full ${errors?.addressLine ? "border-error" : ""}`}
              value={value.addressLine}
              onChange={(e) => onChange({ ...value, addressLine: e.target.value })}
            />
            {errors?.addressLine && <p className="mt-1 text-xs text-error">{errors.addressLine}</p>}
          </div>

          <input
            placeholder="Landmark (optional)"
            className={INPUT_CLASS}
            value={value.landmark}
            onChange={(e) => onChange({ ...value, landmark: e.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <input
                placeholder="City"
                className={`${INPUT_CLASS} w-full ${errors?.city ? "border-error" : ""}`}
                value={value.city}
                onChange={(e) => onChange({ ...value, city: e.target.value })}
              />
              {errors?.city && <p className="mt-1 text-xs text-error">{errors.city}</p>}
            </div>
            <div>
              <input
                placeholder="State"
                className={`${INPUT_CLASS} w-full ${errors?.state ? "border-error" : ""}`}
                value={value.state}
                onChange={(e) => onChange({ ...value, state: e.target.value })}
              />
              {errors?.state && <p className="mt-1 text-xs text-error">{errors.state}</p>}
            </div>
          </div>

          <div>
            <input
              placeholder="Pincode"
              inputMode="numeric"
              className={`${INPUT_CLASS} w-full ${errors?.pincode ? "border-error" : ""}`}
              value={value.pincode}
              onChange={(e) => onChange({ ...value, pincode: e.target.value })}
            />
            {errors?.pincode && <p className="mt-1 text-xs text-error">{errors.pincode}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            {MAPS_CONFIGURED && (
              <button
                type="button"
                onClick={() => setMode("picking")}
                className="font-medium text-accent hover:underline"
              >
                {value.locationSource === "map" ? "Change pin location" : "Pick location on map"}
              </button>
            )}
            {saved && saved.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMode("saved");
                  onChange(EMPTY_DELIVERY_ADDRESS);
                }}
                className="text-ink-muted hover:underline"
              >
                Use a saved address instead
              </button>
            )}
          </div>

          <label className="flex flex-wrap items-center gap-2 text-sm text-ink-secondary">
            <input
              type="checkbox"
              className="accent-btn"
              checked={value.saveAs !== null}
              onChange={(e) => onChange({ ...value, saveAs: e.target.checked ? "Home" : null })}
            />
            Save this address as
            <select
              value={value.saveAs ?? "Home"}
              onChange={(e) => onChange({ ...value, saveAs: e.target.value as "Home" | "Work" | "Other" })}
              className="rounded border border-border bg-transparent px-2 py-1 text-sm"
              disabled={value.saveAs === null}
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
            for next time
          </label>
        </div>
      )}

      {errors?.location && <p className="mt-2 text-xs text-error">{errors.location}</p>}
    </div>
  );
}
