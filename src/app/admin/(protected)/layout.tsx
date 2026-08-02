import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const pendingTailors = await prisma.user.count({ where: { role: "tailor", approved: false } });

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/stitch-orders", label: "Stitch Orders" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/tailors", label: "Tailors", badge: pendingTailors || undefined },
    { href: "/admin/content", label: "Site Content" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <div className="mx-auto max-w-6xl gap-8 px-4 py-6 sm:flex sm:py-10">
      <nav className="mb-6 sm:mb-0 sm:w-48 sm:flex-shrink-0 sm:text-sm">
        <p className="mb-3 font-serif text-lg text-foreground sm:mb-4">Control Centre</p>
        <ul className="flex gap-2 overflow-x-auto pb-2 sm:flex-col sm:overflow-visible sm:pb-0">
          {links.map((link) => (
            <li key={link.href} className="flex flex-shrink-0 items-center gap-1.5 sm:flex-shrink sm:justify-between">
              <Link
                href={link.href}
                className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-foreground/80 hover:text-accent-hover sm:rounded-none sm:border-0 sm:px-0 sm:py-0"
              >
                {link.label}
              </Link>
              {link.badge ? (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-btn-text">
                  {link.badge}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="mt-3 sm:mt-4 sm:pt-2">
          <LogoutButton />
        </div>
      </nav>
      <div className="min-w-0 flex-1 overflow-x-auto">{children}</div>
    </div>
  );
}
