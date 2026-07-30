import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/wishlist");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
  });

  return (
    <div>
      <h2 className="mb-4 font-serif text-lg text-foreground">My Wishlist</h2>
      {items.length === 0 ? (
        <p className="text-ink-muted">
          Nothing saved yet.{" "}
          <Link href="/products" className="underline">
            Browse products
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items
            .filter((item) => item.product.status)
            .map((item) => (
              <ProductCard
                key={item.id}
                id={item.product.id}
                name={item.product.name}
                price={item.product.price.toString()}
                mrp={item.product.mrp.toString()}
                imageUrl={item.product.images[0]?.url ?? null}
                wishlisted
                loggedIn
              />
            ))}
        </div>
      )}
    </div>
  );
}
