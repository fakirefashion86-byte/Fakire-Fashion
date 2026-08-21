"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <footer className="mt-auto bg-btn">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-ink-invert/70">
        <p className="mb-4 font-serif text-lg text-ink-invert">Fakire Fashion</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-ink-invert">
            About Us
          </Link>
          <Link href="/privacy-policy" className="hover:text-ink-invert">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-ink-invert">
            Terms &amp; Conditions
          </Link>
          <Link href="/shipping-policy" className="hover:text-ink-invert">
            Shipping Policy
          </Link>
          <Link href="/cancellation-refund" className="hover:text-ink-invert">
            Cancellation &amp; Refund
          </Link>
          <Link href="/size-guide" className="hover:text-ink-invert">
            Size Guide
          </Link>
          <Link href="/contact" className="hover:text-ink-invert">
            Contact
          </Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Fakire Fashion. All rights reserved.</p>
      </div>
    </footer>
  );
}
