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
  ];

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <nav className="w-48 flex-shrink-0 text-sm">
        <p className="mb-4 font-serif text-lg text-foreground">Control Centre</p>
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.href} className="flex items-center justify-between">
              <Link href={link.href} className="text-foreground/80 hover:text-accent-hover">
                {link.label}
              </Link>
              {link.badge ? (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-btn-text">
                  {link.badge}
                </span>
              ) : null}
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
