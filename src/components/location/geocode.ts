// Helpers for turning Google Geocoder/Places results into the flat address
// shape the checkout form and /api/addresses expect. Kept dependency-free of
// any specific component so both the search box and "use current location"
// flows can share it.

export type ParsedAddress = {
  addressLine: string;
  houseNumber: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type AddressComponent = { long_name: string; short_name: string; types: string[] };

function pick(components: AddressComponent[], type: string, useShort = false): string {
  const match = components.find((c) => c.types.includes(type));
  if (!match) return "";
  return useShort ? match.short_name : match.long_name;
}

export function parseAddressComponents(
  components: AddressComponent[],
  formattedAddress: string
): ParsedAddress {
  const houseNumber = pick(components, "street_number");
  const route = pick(components, "route");
  const area =
    pick(components, "sublocality_level_1") ||
    pick(components, "sublocality") ||
    pick(components, "neighborhood") ||
    "";
  const city =
    pick(components, "locality") ||
    pick(components, "administrative_area_level_2") ||
    "";
  const state = pick(components, "administrative_area_level_1");
  const pincode = pick(components, "postal_code");
  const country = pick(components, "country");

  // Prefer street number + route for the editable "address line" — falls
  // back to the full formatted address when Google doesn't break it down
  // (common for rural/unnamed roads in India).
  const addressLine = [houseNumber, route].filter(Boolean).join(" ") || formattedAddress;

  return { addressLine, houseNumber, area, city, state, pincode, country };
}

/** Reverse-geocode a lat/lng into a parsed address. Throws on failure — callers decide the fallback UX. */
export function reverseGeocode(
  geocoder: google.maps.Geocoder,
  location: google.maps.LatLngLiteral
): Promise<ParsedAddress> {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location }, (results, status) => {
      if (status !== "OK" || !results || results.length === 0) {
        reject(new Error(`Reverse geocoding failed (${status})`));
        return;
      }
      const best = results[0];
      resolve(
        parseAddressComponents(
          best.address_components as unknown as AddressComponent[],
          best.formatted_address
        )
      );
    });
  });
}
