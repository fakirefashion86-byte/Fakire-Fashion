import Link from "next/link";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import PromoStrip from "@/components/PromoStrip";
import { getSession } from "@/lib/auth";
import {
  AwardIcon,
  ScissorsIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/icons";
import { DEFAULT_HOMEPAGE_CONTENT, HOMEPAGE_CONTENT_KEY, HomepageContent } from "@/lib/siteContent";

const FEATURES = [
  {
    icon: AwardIcon,
    title: "Premium Quality",
    subtitle: "Finest materials handpicked for you",
  },
  {
    icon: ScissorsIcon,
    title: "Custom Tailoring",
    subtitle: "Made to measure just for you",
  },
  {
    icon: ShieldIcon,
    title: "Perfect Fit",
    subtitle: "Tailored to perfection, every time",
  },
  {
    icon: TruckIcon,
    title: "On-Time Delivery",
    subtitle: "Delivered to your doorstep",
  },
];

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

      {/* AdsBender publisher ad zone - homepage banner, verified via
          public/ads.txt. See AdsBender Publisher Portal > fakirefashion.com. */}
      <section className="mx-auto flex max-w-6xl justify-center px-4 py-6">
        <section
          data-zone-id="d9181176-1cbe-480e-a145-130b63d4dd56"
          style={{ width: 300, height: 250 }}
        />
      </section>
      <Script
        async
        src="https://adsbender.onrender.com/assets/publisher_tag.js"
        strategy="afterInteractive"
      />

      {/* Feature strip */}
      <section className="border-y border-border bg-section">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
              <f.icon className="h-7 w-7 text-icon" />
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="text-xs text-ink-muted">{f.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-btn">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 text-center sm:flex-row sm:text-left">
          <p className="whitespace-pre-line font-serif text-2xl text-btn-text">{content.ctaHeading}</p>
          <Link
            href="/stitching/new"
            className="whitespace-nowrap rounded bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
          >
            {content.ctaButtonText}
          </Link>
        </div>
      </section>
    </div>
  );
}
