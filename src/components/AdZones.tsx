// AdsBender publisher ad zones, rendered site-wide above the footer.
// The publisher tag script is loaded once in the root layout.
const ZONE_IDS = [
  "04a666a1-3019-47ea-a835-2b43c35a8650",
  "8d9a11dc-aa01-4c0a-bb0d-335ec1113fff",
  "d2a649e2-0486-4da8-a081-e177e2ded2f0",
  "23d6f7be-8e63-4d8a-b72c-879cb9bd4c1e",
  "1ea5d7cb-02ef-42a1-b55f-12951bd943f1",
];

export default function AdZones() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6">
      {ZONE_IDS.map((id) => (
        <section key={id} data-zone-id={id} />
      ))}
    </div>
  );
}
