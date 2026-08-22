// Builds a Google Maps turn-by-turn directions deep link for a delivery/visit
// address. Deliberately omits the `origin` param — when opened on a phone
// (in the Google Maps app or mobile browser) Maps fills that in with the
// staff member's current location automatically, so tapping the link starts
// live navigation with no extra steps.
export function buildDirectionsUrl({
  latitude,
  longitude,
  address,
}: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}): string | null {
  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
  }
  if (address && address.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.trim())}&travelmode=driving`;
  }
  return null;
}
