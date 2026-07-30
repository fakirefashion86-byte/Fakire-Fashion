import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartForm from "@/components/AddToCartForm";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { id: "asc" } },
    },
  });

  if (!product || !product.status) notFound();

  const mainImage = product.images[0]?.url;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-section">
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill className="object-cover" sizes="50vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-muted">No image</div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">Code: {product.code}</p>
          <div className="mt-3 text-xl">
            <span className="font-semibold">₹{Number(product.price).toFixed(0)}</span>
            {Number(product.mrp) > Number(product.price) && (
              <span className="ml-2 text-ink-muted line-through">
                ₹{Number(product.mrp).toFixed(0)}
              </span>
            )}
          </div>
          {product.description && <p className="mt-4 text-ink-secondary">{product.description}</p>}

          <AddToCartForm
            productId={product.id}
            variants={product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              price: v.price.toString(),
              mrp: v.mrp.toString(),
              qty: v.qty,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
