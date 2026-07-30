import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { getSession } from "@/lib/auth";

export default async function AllProductsPage() {
  const [session, products] = await Promise.all([
    getSession(),
    prisma.product.findMany({
      where: { status: true },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  const wishlistedIds = session
    ? new Set(
        (
          await prisma.wishlistItem.findMany({
            where: { userId: session.userId },
            select: { productId: true },
          })
        ).map((w) => w.productId)
      )
    : new Set<number>();

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
