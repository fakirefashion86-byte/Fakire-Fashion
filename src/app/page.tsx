import Link from "next/link";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import PromoStrip from "@/components/PromoStrip";
import { getSession } from "@/lib/auth";
import { DEFAULT_HOMEPAGE_CONTENT, HOMEPAGE_CONTENT_KEY, HomepageContent } from "@/lib/siteContent";

export default async function HomePage() {
  // Cookie read only, no DB round trip — resolve it first so the (session-
  // dependent) wishlist query can run alongside the others below instead of
  // waiting for them to finish first.
  const session = await getSession();

  const [products, contentRow, wishlistedIds] = await Promise.all([
    prisma.product.findMany({
      where: { status: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.siteContent.findUnique({ where: { key: HOMEPAGE_CONTENT_KEY } }),
    session
      ? prisma.wishlistItem
          .findMany({ where: { userId: session.userId }, select: { productId: true } })
          .then((rows) => new Set(rows.map((w) => w.productId)))
      : Promise.resolve(new Set<number>()),
  ]);

  const content: HomepageContent = {
    ...DEFAULT_HOMEPAGE_CONTENT,
    ...((contentRow?.data as Partial<HomepageContent>) ?? {}),
  };

  return (
    <div className="bg-background text-foreground">
      <PromoStrip />
      <HeroCarousel
        heroImageUrl={content.heroImageUrl}
        heroHeading={content.heroHeading}
        heroAccent={content.heroHeadingAccent}
        heroSubheading={content.heroSubheading}
      />

      {/* Design Catalog */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">Design Catalog</h2>
          <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover hover:underline">
            View All <span aria-hidden>→</span>
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-ink-muted">No products yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-6">
        <section data-zone-id="752dc79e-5bad-4c95-ba16-f342aaf75705"></section>
      </div>
      <Script async src="https://tag.adsbender.com/assets/publisher_tag.js" strategy="afterInteractive" />
    </div>
  );
}
