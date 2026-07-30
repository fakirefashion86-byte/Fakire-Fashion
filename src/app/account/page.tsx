import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ProfileForm from "@/components/ProfileForm";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const [user, ordersCount, stitchOrdersCount, wishlistCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, mobile: true, address: true },
    }),
    prisma.order.count({ where: { userId: session.userId } }),
    prisma.stitchOrder.count({ where: { userId: session.userId } }),
    prisma.wishlistItem.count({ where: { userId: session.userId } }),
  ]);

  if (!user) redirect("/login");

  const stats = [
    { label: "Orders", value: ordersCount, href: "/orders" },
    { label: "Stitching Orders", value: stitchOrdersCount, href: "/stitching/my-orders" },
    { label: "Wishlist", value: wishlistCount, href: "/account/wishlist" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-foreground">
        Welcome, {user.name.split(" ")[0]}
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-border bg-card p-4 text-center hover:border-accent"
          >
            <p className="text-2xl font-semibold text-foreground">{s.value}</p>
            <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-lg text-foreground">Profile</h2>
        <dl className="mb-4 space-y-1 text-sm">
          <div>
            <dt className="inline text-ink-muted">Email: </dt>
            <dd className="inline">{user.email}</dd>
          </div>
        </dl>
        <ProfileForm
          initialName={user.name}
          initialMobile={user.mobile ?? ""}
          initialAddress={user.address ?? ""}
        />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-lg text-foreground">Change Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
