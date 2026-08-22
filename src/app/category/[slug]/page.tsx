import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { getSession } from "@/lib/auth";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sub } = await searchParams;
  // Cookie read only, no DB round trip — safe to resolve before the queries
  // below so the (independent) wishlist lookup can run alongside them
  // instead of waiting its turn after.
  const session = await getSession();

  // Products are fetched nested under the category (one round trip) instead
  // of category -> then a second, dependent product query -> then a third
  // wishlist query. The sub-category filter is applied in memory below since
  // the product list per category is small; that trades a few dozen extra
  // rows for cutting a whole network round trip to the DB.
  const [category, wishlistedIds] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        subCategories: { orderBy: { name: "asc" } },
        products: {
          where: { status: true },
          orderBy: { createdAt: "desc" },
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
      },
    }),
    session
      ? prisma.wishlistItem
          .findMany({ where: { userId: session.userId }, select: { productId: true } })
          .then((rows) => new Set(rows.map((w) => w.productId)))
      : Promise.resolve(new Set<number>()),
  ]);

  if (!category) notFound();

  const activeSub = sub
    ? category.subCategories.find((s) => s.slug === sub)
    : undefined;

  const products = activeSub
    ? category.products.filter((p) => p.subCategoryId === activeSub.id)
    : category.products;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{category.name}</h1>

      {category.subCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/category/${category.slug}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              !activeSub ? "border-btn bg-btn text-btn-text" : "border-border"
            }`}
          >
            All
          </Link>
          {category.subCategories.map((s) => (
            <Link
              key={s.id}
              href={`/category/${category.slug}?sub=${s.slug}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                activeSub?.id === s.id ? "border-btn bg-btn text-btn-text" : "border-border"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        {products.length === 0 ? (
          <p className="text-ink-muted">No products in this category yet.</p>
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
    </div>
  );
}
