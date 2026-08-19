"use client";

import { useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { parseAddressComponents, type ParsedAddress } from "./geocode";

type Props = {
  onSelect: (result: ParsedAddress & { latitude: number; longitude: number }) => void;
  onError: (message: string) => void;
};

/**
 * Wraps the current recommended Places widget, `PlaceAutocompleteElement`
 * (the classic `google.maps.places.Autocomplete` class is deprecated for new
 * customers as of March 2025). It's a raw web component, not a React
 * component, so it's constructed imperatively and mounted into a container div.
 */
export default function PlaceSearchBox({ onSelect, onError }: Props) {
  const placesLib = useMapsLibrary("places");
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  useEffect(() => {
    if (!placesLib || !containerRef.current) return;
    if (typeof google === "undefined" || !google.maps.places.PlaceAutocompleteElement) {
      onError("Address search isn't available in this browser. Please enter your address manually.");
      return;
    }

    let cancelled = false;

    const el = new google.maps.places.PlaceAutocompleteElement({
      // Bias results towards India — this is a domestic delivery flow.
      includedRegionCodes: ["in"],
    });
    el.classList.add("w-full");
    containerRef.current.appendChild(el);
    elementRef.current = el;

    const handleSelect = async (event: Event) => {
      try {
        const { placePrediction } = event as google.maps.places.PlacePredictionSelectEvent;
        const place = placePrediction.toPlace();
        await place.fetchFields({
          fields: ["addressComponents", "formattedAddress", "location"],
        });
        if (cancelled) return;
        const loc = place.location;
        if (!loc) {
          onError("Couldn't get coordinates for that place. Please try another search or use the map.");
          return;
        }
        const components = (place.addressComponents ?? []).map((c) => ({
          long_name: c.longText ?? "",
          short_name: c.shortText ?? "",
          types: c.types,
        }));
        const parsed = parseAddressComponents(components, place.formattedAddress ?? "");
        onSelect({ ...parsed, latitude: loc.lat(), longitude: loc.lng() });
      } catch {
        if (!cancelled) onError("Couldn't load details for that place. Please try again.");
      }
    };

    el.addEventListener("gmp-select", handleSelect);

    return () => {
      cancelled = true;
      el.removeEventListener("gmp-select", handleSelect);
      el.remove();
      elementRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded border border-border [&>*]:w-full"
    />
  );
}
