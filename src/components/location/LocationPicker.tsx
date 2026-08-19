"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMapsLibrary,
  useApiIsLoaded,
  useApiLoadingStatus,
  APILoadingStatus,
} from "@vis.gl/react-google-maps";
import { INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/formStyles";
import { parseAddressComponents, reverseGeocode, type ParsedAddress } from "./geocode";
import PlaceSearchBox from "./PlaceSearchBox";

export type ConfirmedLocation = ParsedAddress & { latitude: number; longitude: number };

type Props = {
  /** Center the map here on first render (e.g. a saved/typed address). Falls back to a India-wide default. */
  initial?: { latitude: number; longitude: number } | null;
  onConfirm: (location: ConfirmedLocation) => void;
  onCancel?: () => void;
  /** Called once if the Maps script itself fails to load (bad/restricted key, network/billing issue) — parent should fall back to a plain manual address form. */
  onUnavailable?: () => void;
};

const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

export default function LocationPicker(props: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Callers are expected to check MAPS_CONFIGURED before mounting this at
  // all, but stay defensive in case something renders it anyway.
  if (!apiKey) {
    return (
      <div className="rounded-lg border border-border bg-section p-4 text-sm text-ink-secondary">
        Map search isn&apos;t set up yet. Please fill in your delivery address in the fields below.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places", "marker", "geocoding"]}>
      <LocationPickerInner {...props} />
    </APIProvider>
  );
}

function LocationPickerInner({ initial, onConfirm, onCancel, onUnavailable }: Props) {
  const apiLoaded = useApiIsLoaded();
  const loadingStatus = useApiLoadingStatus();
  const geocodingLib = useMapsLibrary("geocoding");
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const reportedUnavailable = useRef(false);

  useEffect(() => {
    const failed =
      loadingStatus === APILoadingStatus.FAILED || loadingStatus === APILoadingStatus.AUTH_FAILURE;
    if (failed && !reportedUnavailable.current) {
      reportedUnavailable.current = true;
      onUnavailable?.();
    }
  }, [loadingStatus, onUnavailable]);

  // A hung request (network blocked, very slow connection) never reaches
  // FAILED — it just stays LOADING forever. Don't let checkout stall on that.
  useEffect(() => {
    if (apiLoaded) return;
    const timer = setTimeout(() => {
      if (!reportedUnavailable.current) {
        reportedUnavailable.current = true;
        onUnavailable?.();
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [apiLoaded, onUnavailable]);

  const [pin, setPin] = useState<google.maps.LatLngLiteral>(
    initial ? { lat: initial.latitude, lng: initial.longitude } : INDIA_CENTER
  );
  const [hasPin, setHasPin] = useState(Boolean(initial));
  const [resolvedAddress, setResolvedAddress] = useState<ParsedAddress | null>(null);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchUnavailable, setSearchUnavailable] = useState(false);
  const [manualQuery, setManualQuery] = useState("");

  useEffect(() => {
    if (geocodingLib && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [geocodingLib]);

  const resolvePin = useCallback(async (position: google.maps.LatLngLiteral) => {
    setError(null);
    setResolving(true);
    try {
      if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
      const parsed = await reverseGeocode(geocoderRef.current, position);
      setResolvedAddress(parsed);
    } catch {
      // Reverse geocoding failed (rate limit, no results, offline) — the pin
      // is still usable, the customer just has to fill address text manually.
      setResolvedAddress(null);
      setError("Couldn't look up an address for this point — you can still confirm it and fill details manually.");
    } finally {
      setResolving(false);
    }
  }, []);

  function selectPin(position: google.maps.LatLngLiteral) {
    setPin(position);
    setHasPin(true);
    resolvePin(position);
  }

  function handleUseCurrentLocation() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location access. Please search for your address instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        selectPin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setError("We couldn't access your location. Please search for your delivery address instead.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function handleManualSearch() {
    if (!manualQuery.trim()) return;
    setError(null);
    setResolving(true);
    try {
      if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoderRef.current!.geocode({ address: manualQuery, region: "in" }, (res, status) => {
          if (status !== "OK" || !res || res.length === 0) reject(new Error(status));
          else resolve(res);
        });
      });
      const best = results[0];
      const parsed = parseAddressComponents(
        best.address_components as unknown as Parameters<typeof parseAddressComponents>[0],
        best.formatted_address
      );
      const loc = best.geometry.location;
      setResolvedAddress(parsed);
      setPin({ lat: loc.lat(), lng: loc.lng() });
      setHasPin(true);
    } catch {
      setError("Couldn't find that address. Try a more specific search, or drop the pin on the map.");
    } finally {
      setResolving(false);
    }
  }

  function handleConfirm() {
    if (!hasPin) return;
    onConfirm({
      ...(resolvedAddress ?? {
        addressLine: "",
        houseNumber: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      }),
      latitude: pin.lat,
      longitude: pin.lng,
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">📍 Delivery Location</p>

      {!searchUnavailable ? (
        <PlaceSearchBox
          onSelect={(result) => {
            setResolvedAddress(result);
            setPin({ lat: result.latitude, lng: result.longitude });
            setHasPin(true);
            setError(null);
          }}
          onError={(message) => {
            setSearchUnavailable(true);
            setError(message);
          }}
        />
      ) : (
        <div className="flex gap-2">
          <input
            className={`${INPUT_CLASS} flex-1`}
            placeholder="Search your delivery address"
            value={manualQuery}
            onChange={(e) => setManualQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleManualSearch();
              }
            }}
          />
          <button
            type="button"
            onClick={handleManualSearch}
            disabled={resolving}
            className="whitespace-nowrap rounded border border-border px-3 py-2.5 text-sm font-medium hover:bg-section disabled:opacity-50"
          >
            Search
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating || !apiLoaded}
        className="flex items-center justify-center gap-2 rounded border border-accent px-3 py-2.5 text-sm font-medium text-accent transition hover:bg-accent hover:text-btn-text disabled:opacity-50"
      >
        {locating ? "Locating…" : "📍 Use my current location"}
      </button>

      <div className="relative h-56 w-full overflow-hidden rounded border border-border bg-section sm:h-64">
        {apiLoaded ? (
          <Map
            mapId={MAP_ID}
            defaultCenter={pin}
            center={hasPin ? pin : undefined}
            defaultZoom={hasPin ? 16 : 5}
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
            onClick={(e) => {
              if (e.detail.latLng) selectPin(e.detail.latLng);
            }}
          >
            {hasPin && (
              <AdvancedMarker
                position={pin}
                draggable
                onDragEnd={(e) => {
                  const position = e.latLng;
                  if (position) selectPin({ lat: position.lat(), lng: position.lng() });
                }}
              />
            )}
          </Map>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">Loading map…</div>
        )}
      </div>

      {resolving && <p className="text-xs text-ink-muted">Looking up address…</p>}
      {error && <p className="text-xs text-error">{error}</p>}
      {resolvedAddress && (
        <p className="text-xs text-ink-secondary">
          {[resolvedAddress.addressLine, resolvedAddress.city, resolvedAddress.state, resolvedAddress.pincode]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
      {!hasPin && !error && (
        <p className="text-xs text-ink-muted">
          Search above, use your current location, or tap the map to drop a pin.
        </p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded border border-border px-4 py-2.5 text-sm font-medium hover:bg-section"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!hasPin}
          className={`flex-1 ${PRIMARY_BUTTON_CLASS}`}
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
