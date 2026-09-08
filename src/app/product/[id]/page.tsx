import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import StickyAddToCart from "@/components/StickyAddToCart";
import ProductReviewForm from "@/components/ProductReviewForm";
import { StarIcon, HeartIcon } from "@/components/icons";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, session, reviews] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
      },
    }),
    getSession(),
    prisma.productReview.findMany({
      where: { productId, status: "approved" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ]);

  if (!product || !product.status) notFound();

  const price = Number(product.price);
  const mrp = Number(product.mrp);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const savings = mrp > price ? mrp - price : 0;

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return (
    <div className="bg-white pb-24">
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
                  filled={i < Math.round(avgRating ?? 4.2)}
                  className={`h-4 w-4 ${i < Math.round(avgRating ?? 4.2) ? "text-[#C7A03D]" : "text-[#E3D3AC]"}`}
                />
              ))}
              <span className="ml-1 text-sm text-[#6b5a35]">
                {avgRating != null
                  ? `${avgRating.toFixed(1)} (${reviews.length} review${reviews.length === 1 ? "" : "s"})`
                  : "4.2 (250+ Happy Clients)"}
              </span>
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
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <h2 className="font-serif text-xl font-semibold text-[#2b2116]">Customer Reviews</h2>
          <div className="mt-4">
            <ProductReviewForm productId={product.id} loggedIn={Boolean(session)} />
          </div>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-[#8a6d2f]">No reviews yet — be the first to share your experience.</p>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-[#EAD9B8] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#2b2116]">{r.user.name}</p>
                    <p className="text-sm text-[#C7A03D]">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </p>
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm text-[#5c4d38]">{r.comment}</p>}
                  <p className="mt-1.5 text-xs text-[#a5987c]">{r.createdAt.toDateString()}</p>
                </div>
              ))}
            </div>
          )}
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
