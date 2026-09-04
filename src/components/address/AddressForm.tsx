import { INPUT_CLASS } from "@/lib/formStyles";
import type { DeliveryAddressValue } from "@/components/DeliveryAddressSection";

type Errors = Partial<Record<"addressLine" | "city" | "state" | "pincode" | "location", string>>;

type Props = {
  value: DeliveryAddressValue;
  onChange: (value: DeliveryAddressValue) => void;
  errors?: Errors;
  mapsConfigured: boolean;
  hasSavedAddresses: boolean;
  gpsLocating: boolean;
  gpsError: string | null;
  gpsAccuracy: number | null;
  onUseGps: () => void;
  onPickOnMap: () => void;
  onUseSavedInstead: () => void;
};

/** The plain-text address fields, shown once the customer is typing/editing an address. */
export default function AddressForm({
  value,
  onChange,
  errors,
  mapsConfigured,
  hasSavedAddresses,
  gpsLocating,
  gpsError,
  gpsAccuracy,
  onUseGps,
  onPickOnMap,
  onUseSavedInstead,
}: Props) {
  const hasGpsPin = value.latitude != null && value.longitude != null;

  return (
    <div className="flex flex-col gap-3">
      {value.locationSource === "map" ? (
        <div className="rounded border border-success/30 bg-success/10 p-3 text-sm text-success">
          📍 Location confirmed — add your house/flat number and any landmark below.
        </div>
      ) : (
        <div className="rounded border border-border bg-section p-3 text-sm text-ink-secondary">
          {mapsConfigured
            ? "Map search is temporarily unavailable — please enter your delivery address below."
            : "Enter your delivery address below."}
        </div>
      )}

      {value.locationSource !== "map" &&
        (!hasGpsPin ? (
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={onUseGps}
              disabled={gpsLocating}
              className="flex items-center justify-center gap-2 self-start rounded border border-accent px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent hover:text-btn-text disabled:opacity-50"
            >
              {gpsLocating ? "Locating…" : "📍 Pin my exact GPS location"}
            </button>
            <p className="text-xs text-ink-muted">
              No map yet — this just drops an exact pin alongside the address you type below, so
              delivery/tailor staff can copy it into their maps app and navigate to you precisely.
            </p>
            {gpsError && <p className="text-xs text-error">{gpsError}</p>}
          </div>
        ) : (
          <div className="rounded border border-success/30 bg-success/10 p-3 text-sm text-success">
            📍 Exact GPS pin captured{gpsAccuracy != null ? ` (±${Math.round(gpsAccuracy)}m accuracy)` : ""} —
            delivery/tailor staff will be able to navigate straight to you.{" "}
            <button
              type="button"
              onClick={() => onChange({ ...value, latitude: null, longitude: null })}
              className="font-medium underline"
            >
              Remove
            </button>
          </div>
        ))}

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
        {mapsConfigured && (
          <button type="button" onClick={onPickOnMap} className="font-medium text-black hover:underline">
            {value.locationSource === "map" ? "Change pin location" : "Pick location on map"}
          </button>
        )}
        {hasSavedAddresses && (
          <button type="button" onClick={onUseSavedInstead} className="text-ink-muted hover:underline">
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
  );
}
