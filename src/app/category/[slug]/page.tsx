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

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { subCategories: { orderBy: { name: "asc" } } },
  });

  if (!category) notFound();

  const activeSub = sub
    ? category.subCategories.find((s) => s.slug === sub)
    : undefined;

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      status: true,
      ...(activeSub ? { subCategoryId: activeSub.id } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const session = await getSession();
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
