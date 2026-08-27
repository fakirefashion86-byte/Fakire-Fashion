"use client";

import { usePathname } from "next/navigation";

// AdsBender publisher ad zone - homepage banner, verified via public/ads.txt.
// See AdsBender Publisher Portal > fakirefashion.com.
//
// Mounted directly in the root layout (outside <main>{children}</main>'s
// async/Suspense-streamed subtree) so it is always part of the immediately
// visible DOM tree, never inside a streaming placeholder that only resolves
// after data-fetching finishes.
export default function AdZone() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <section className="mx-auto flex max-w-6xl justify-center px-4 py-6">
      <section
        data-zone-id="d9181176-1cbe-480e-a145-130b63d4dd56"
        style={{ width: 300, height: 250 }}
      />
    </section>
  );
}
