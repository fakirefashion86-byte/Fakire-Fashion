// AdsBender publisher ad zones, rendered site-wide above the footer.
// The publisher tag script is loaded once in the root layout.

// Overlay / on-demand formats: AdsBender renders these itself (full-screen,
// floating, or in a new window), so they take no space in the page layout.
const OVERLAY_ZONES = [
  { id: "1ea5d7cb-02ef-42a1-b55f-12951bd943f1", format: "interstitial" },
  { id: "23d6f7be-8e63-4d8a-b72c-879cb9bd4c1e", format: "popunder" },
  { id: "8d9a11dc-aa01-4c0a-bb0d-335ec1113fff", format: "chase-and-catch" },
];

// In-page banner zone (visible above the footer).
const INLINE_ZONE_ID = "04a666a1-3019-47ea-a835-2b43c35a8650";

export default function AdZones() {
  return (
    <>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-6">
        <section data-zone-id={INLINE_ZONE_ID} />
      </div>
      {OVERLAY_ZONES.map((z) => (
        <section key={z.id} data-zone-id={z.id} data-format={z.format} />
      ))}
    </>
  );
}
