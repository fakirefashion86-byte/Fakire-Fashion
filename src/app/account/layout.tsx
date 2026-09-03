import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const links = [
    { href: "/account", label: "Overview" },
    { href: "/orders", label: "My Orders" },
    { href: "/stitching/my-orders", label: "Stitching Orders" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/account/notifications", label: "Notifications" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:flex sm:gap-8 sm:py-16">
      <nav className="mb-6 sm:mb-0 sm:w-44 sm:flex-shrink-0 sm:text-sm">
        <p className="mb-3 font-serif text-lg text-foreground sm:mb-4">My Account</p>
        <ul className="flex gap-2 overflow-x-auto pb-2 sm:flex-col sm:overflow-visible sm:pb-0">
          {links.map((link) => (
            <li key={link.href} className="flex-shrink-0 sm:flex-shrink">
              <Link
                href={link.href}
                className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-foreground/80 hover:text-accent-hover sm:rounded-none sm:border-0 sm:px-0 sm:py-0"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-3 sm:mt-4">
          <LogoutButton />
        </div>
      </nav>
      <div className="min-w-0 flex-1 overflow-x-auto">{children}</div>
    </div>
  );
}
