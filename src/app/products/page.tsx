import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { getSession } from "@/lib/auth";

export default async function AllProductsPage() {
  // Cookie read only, no DB round trip — resolve it first so the (session-
  // dependent) wishlist query can be kicked off alongside the products query
  // below instead of waiting for it to finish first.
  const session = await getSession();

  const [products, wishlistedIds] = await Promise.all([
    prisma.product.findMany({
      where: { status: true },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    session
      ? prisma.wishlistItem
          .findMany({ where: { userId: session.userId }, select: { productId: true } })
          .then((rows) => new Set(rows.map((w) => w.productId)))
      : Promise.resolve(new Set<number>()),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-serif text-2xl text-foreground">All Products</h1>
      {products.length === 0 ? (
        <p className="text-ink-muted">No products yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price.toString()}
              mrp={p.mrp.toString()}
              imageUrl={p.images[0]?.url ?? null}
              wishlisted={wishlistedIds.has(p.id)}
              loggedIn={Boolean(session)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
