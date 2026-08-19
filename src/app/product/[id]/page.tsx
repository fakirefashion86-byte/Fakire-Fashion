import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import {
  StarIcon,
  CalendarIcon,
  ChatIcon,
  ChevronRightIcon,
} from "@/components/icons";

type Props = { params: Promise<{ id: string }> };

const STEPS = [
  { step: 1, title: "Choose Design" },
  { step: 2, title: "Share Measurements" },
  { step: 3, title: "We Start Stitching" },
  { step: 4, title: "Quality Check & Delivery" },
];

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
      },
    }),
    getSession(),
  ]);

  if (!product || !product.status) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:pt-10">
      <div className="grid gap-10 sm:grid-cols-2">
        <ProductGallery images={product.images.map((i) => i.url)} productName={product.name} />

        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">{product.name}</h1>
          <p className="mt-1 text-sm text-accent">Handcrafted for Elegance</p>

          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} filled={i < 4} className={`h-4 w-4 ${i < 4 ? "text-gold" : "text-border"}`} />
            ))}
            <span className="ml-1 text-sm text-ink-muted">250+ Happy Clients</span>
          </div>

          <div className="mt-4 flex items-baseline gap-2 text-xl">
            <span className="font-semibold text-foreground">₹{Number(product.price).toFixed(0)}</span>
            {Number(product.mrp) > Number(product.price) && (
              <span className="text-base text-ink-muted line-through">₹{Number(product.mrp).toFixed(0)}</span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{product.description}</p>
          )}

          <AddToCartPanel
            productId={product.id}
            variants={product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              price: v.price.toString(),
              mrp: v.mrp.toString(),
              qty: v.qty,
            }))}
            loggedIn={Boolean(session)}
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-center text-xs font-semibold tracking-widest text-ink-muted">HOW IT WORKS</h2>
        <div className="mx-auto mt-6 flex max-w-2xl items-start justify-between gap-2">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex flex-1 items-start">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border bg-section text-sm font-semibold text-foreground">
                  {s.step}
                </span>
                <p className="max-w-[6rem] text-xs text-ink-secondary">{s.title}</p>
              </div>
              {i < STEPS.length - 1 && <span className="mt-4 h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Link
          href="/stitching/new"
          className="flex flex-1 items-center justify-between rounded bg-btn px-4 py-3 text-btn-text"
        >
          <span className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5" />
            <span className="text-left">
              <span className="block text-sm font-semibold">Book Measurement</span>
              <span className="block text-xs opacity-80">Schedule your appointment</span>
            </span>
          </span>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
        <a
          href={`https://wa.me/919454282015?text=${encodeURIComponent(
            `Hi, I'm interested in the ${product.name}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-between rounded border border-border px-4 py-3 text-foreground"
        >
          <span className="flex items-center gap-3">
            <ChatIcon className="h-5 w-5" />
            <span className="text-left">
              <span className="block text-sm font-semibold">WhatsApp Us</span>
              <span className="block text-xs text-ink-muted">Quick chat with our stylist</span>
            </span>
          </span>
          <ChevronRightIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
