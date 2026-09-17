"use client";

import { usePathname } from "next/navigation";

// AdsBender sticky banner - homepage only. Pinned to the bottom of the
// viewport while the visitor scrolls. Publisher tag script is already
// loaded globally in the root layout.
export default function StickyBanner() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
      <section
        data-zone-id="88c4eaac-4391-439f-8946-e95e172ba3db"
        style={{ width: 320, height: 50 }}
      />
    </div>
  );
}
