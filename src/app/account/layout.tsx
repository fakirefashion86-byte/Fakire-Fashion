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
  ];

  return (
    <div className="mx-auto flex max-w-4xl gap-8 px-4 py-16">
      <nav className="w-44 flex-shrink-0 text-sm">
        <p className="mb-4 font-serif text-lg text-foreground">My Account</p>
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-foreground/80 hover:text-accent-hover">
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <LogoutButton />
          </li>
        </ul>
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
