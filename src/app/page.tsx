import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import { getSession } from "@/lib/auth";
import {
  KurtaIcon,
  JacketIcon,
  KidIcon,
  AccessoryIcon,
  AwardIcon,
  ScissorsIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/icons";
import { DEFAULT_HOMEPAGE_CONTENT, HOMEPAGE_CONTENT_KEY, HomepageContent } from "@/lib/siteContent";

const CATEGORY_ICONS: Record<string, typeof KurtaIcon> = {
  women: KurtaIcon,
  men: JacketIcon,
  kids: KidIcon,
  accessories: AccessoryIcon,
};

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
  const [session, categories, products, contentRow] = await Promise.all([
    getSession(),
    prisma.category.findMany({
      where: { status: true, slug: { in: ["women", "men"] } },
      orderBy: { name: "desc" }, // "Women" before "Men"
    }),
    prisma.product.findMany({
      where: { status: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.siteContent.findUnique({ where: { key: HOMEPAGE_CONTENT_KEY } }),
  ]);

  const content: HomepageContent = {
    ...DEFAULT_HOMEPAGE_CONTENT,
    ...((contentRow?.data as Partial<HomepageContent>) ?? {}),
  };

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
    <div>
      <HeroCarousel
        heroImageUrl={content.heroImageUrl}
        heroHeading={content.heroHeading}
        heroAccent={content.heroHeadingAccent}
        heroSubheading={content.heroSubheading}
      />

      {/* Shop by category */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center font-serif text-2xl text-foreground">
          <span className="mx-4 inline-block border-t border-accent/40 align-middle w-10" />
          Shop By Category
          <span className="mx-4 inline-block border-t border-accent/40 align-middle w-10" />
        </h2>
        <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-4">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] ?? KurtaIcon;
            return (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="flex flex-col items-center gap-3 rounded-lg border border-border px-4 py-8 text-center hover:border-accent hover:bg-section"
              >
                <Icon className="h-9 w-9 text-icon" />
                <span className="text-sm font-medium text-foreground">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Latest arrivals */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">Latest Arrivals</h2>
          <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover hover:underline">
            View All <span aria-hidden>→</span>
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-ink-muted">No products yet — check back soon.</p>
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
      </section>

      {/* Feature strip */}
      <section className="mt-8 border-y border-border bg-section">
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
            className="whitespace-nowrap rounded bg-accent px-6 py-3 text-sm font-semibold text-btn-text transition hover:bg-accent-hover"
          >
            {content.ctaButtonText}
          </Link>
        </div>
      </section>
    </div>
  );
}
