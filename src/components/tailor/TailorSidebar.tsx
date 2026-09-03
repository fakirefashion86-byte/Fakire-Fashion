"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/tailor", label: "Dashboard" },
  { href: "/tailor/notifications", label: "Notifications" },
  { href: "/tailor/settings", label: "Settings" },
];

export default function TailorSidebar() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 sm:mb-0 sm:w-44 sm:flex-shrink-0 sm:text-sm">
      <p className="mb-3 font-serif text-lg text-foreground sm:mb-4">Tailor</p>
      <ul className="flex gap-2 overflow-x-auto pb-2 sm:flex-col sm:overflow-visible sm:pb-0">
        {links.map((link) => {
          const active = link.href === "/tailor" ? pathname === "/tailor" : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="flex-shrink-0 sm:flex-shrink">
              <Link
                href={link.href}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 sm:rounded-none sm:border-0 sm:px-0 sm:py-1 ${
                  active
                    ? "border-accent text-accent sm:font-semibold"
                    : "border-border text-foreground/80 hover:text-accent-hover"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
