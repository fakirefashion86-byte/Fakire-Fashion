import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import StickyAddToCart from "@/components/StickyAddToCart";
import {
  StarIcon,
  HeartIcon,
  ShieldIcon,
  MedalIcon,
  RefreshIcon,
  DeliveryVanIcon,
} from "@/components/icons";

type Props = { params: Promise<{ id: string }> };

const TRUST_BADGES = [
  { icon: ShieldIcon, title: "Secure Payments", desc: "100% safe & secure checkout" },
  { icon: MedalIcon, title: "Premium Quality", desc: "Finest fabric & craftsmanship" },
  { icon: RefreshIcon, title: "Easy Returns", desc: "7 days easy return policy" },
  { icon: DeliveryVanIcon, title: "Free Shipping", desc: "On orders above ₹1999" },
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

  const price = Number(product.price);
  const mrp = Number(product.mrp);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const savings = mrp > price ? mrp - price : 0;

  return (
    <div className="bg-[#FBF3E6] pb-24">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:pt-10">
        <div className="grid gap-10 sm:grid-cols-2">
          <ProductGallery images={product.images.map((i) => i.url)} productName={product.name} />

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif text-3xl font-semibold leading-tight text-[#2b2116]">
                {product.name}
              </h1>
              <button
                type="button"
                aria-label="Add to wishlist"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#4a3a24] hover:text-[#B8860B]"
              >
                <HeartIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="mt-1 text-sm text-[#8a6d2f]">Handcrafted for Elegance</p>

            <div className="mt-2 flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  filled={i < 4}
                  className={`h-4 w-4 ${i < 4 ? "text-[#C7A03D]" : "text-[#E3D3AC]"}`}
                />
              ))}
              <span className="ml-1 text-sm text-[#6b5a35]">4.2 (250+ Happy Clients)</span>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-semibold text-[#2b2116]">₹{price.toFixed(0)}</span>
              {mrp > price && (
                <span className="text-base text-[#a5987c] line-through">₹{mrp.toFixed(0)}</span>
              )}
              {discount > 0 && (
                <span className="rounded bg-[#F3E4C0] px-2 py-0.5 text-xs font-semibold text-[#7A5B12]">
                  {discount}% OFF
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="mt-1 text-sm font-medium text-[#3F7A4E]">You save ₹{savings.toFixed(0)}</p>
            )}

            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-[#5c4d38]">{product.description}</p>
            )}

            <div className="mt-5 h-px bg-[#EAD9B8]" />

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

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl border border-[#EAD9B8] bg-white/60 p-5 sm:grid-cols-4">
              {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center gap-2 text-center">
                  <Icon className="h-6 w-6 text-[#B8860B]" />
                  <p className="text-xs font-semibold text-[#2b2116]">{title}</p>
                  <p className="text-[11px] leading-snug text-[#8a6d2f]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <Link
            href="/stitching/new"
            className="flex flex-1 items-center justify-center rounded-lg bg-[#15110b] px-4 py-3 text-sm font-semibold text-[#F2D98A]"
          >
            Book Measurement
          </Link>
          <a
            href={`https://wa.me/919454282015?text=${encodeURIComponent(
              `Hi, I'm interested in the ${product.name}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center rounded-lg border border-[#E3D3AC] px-4 py-3 text-sm font-semibold text-[#2b2116] hover:border-[#C7A03D]"
          >
            WhatsApp Us
          </a>
        </div>
      </div>

      <StickyAddToCart
        productId={product.id}
        name={product.name}
        price={price}
        mrp={mrp}
        image={product.images[0]?.url ?? null}
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
  );
}
