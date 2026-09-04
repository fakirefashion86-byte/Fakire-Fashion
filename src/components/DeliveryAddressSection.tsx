"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MAPS_CONFIGURED } from "@/lib/mapsConfig";
import type { ConfirmedLocation } from "@/components/location/LocationPicker";
import { PlusIcon } from "@/components/icons";
import SavedAddressList, { type SavedAddress } from "@/components/address/SavedAddressList";
import AddressForm from "@/components/address/AddressForm";

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
  const [gpsLocating, setGpsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/addresses")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((data) => {
        if (cancelled) return;
        const addresses: SavedAddress[] = data.addresses ?? [];
        setSaved(addresses);
        setMode(addresses.length > 0 ? "saved" : MAPS_CONFIGURED ? "picking" : "editing");
        // Addresses come back default-first (see /api/addresses ordering), so
        // the top card is the one the customer expects to already be in
        // effect — pre-select it instead of leaving the form looking filled
        // in but actually unselected until they click it.
        if (addresses.length > 0) selectSaved(addresses[0]);
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

  // Raw-GPS fallback for while the Google Maps key isn't set up yet: no map
  // library needed, just the browser's own Geolocation API. It can't reverse
  // -geocode an address, so the customer still types that below — this just
  // pins the exact spot alongside it so delivery/tailor staff can copy the
  // coordinates into their own maps app and navigate from there.
  function handleUseGpsOnly() {
    setGpsError(null);
    if (!("geolocation" in navigator)) {
      setGpsError("Your browser doesn't support location access. Please fill in the address below.");
      return;
    }
    setGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocating(false);
        setGpsAccuracy(pos.coords.accuracy);
        onChange({
          ...value,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          locationConfirmed: true,
        });
      },
      () => {
        setGpsLocating(false);
        setGpsError("Couldn't access your location. You can still fill in the address below.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Delivery Address</h2>
        {mode === "saved" && saved && saved.length > 0 && (
          <button
            type="button"
            onClick={startPicking}
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
          >
            <PlusIcon className="h-4 w-4" /> Add New Address
          </button>
        )}
      </div>

      {mode === "saved" && saved && saved.length > 0 && (
        <SavedAddressList addresses={saved} selectedId={selectedId} onSelect={selectSaved} />
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
        <AddressForm
          value={value}
          onChange={onChange}
          errors={errors}
          mapsConfigured={MAPS_CONFIGURED}
          hasSavedAddresses={Boolean(saved && saved.length > 0)}
          gpsLocating={gpsLocating}
          gpsError={gpsError}
          gpsAccuracy={gpsAccuracy}
          onUseGps={handleUseGpsOnly}
          onPickOnMap={() => setMode("picking")}
          onUseSavedInstead={() => {
            setMode("saved");
            onChange(EMPTY_DELIVERY_ADDRESS);
          }}
        />
      )}

      {errors?.location && <p className="mt-2 text-xs text-error">{errors.location}</p>}
    </div>
  );
}
