import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductEditor from "@/components/admin/ProductEditor";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { subCategories: { orderBy: { name: "asc" } } },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <Link href="/admin/products" className="text-sm text-accent hover:underline">
          ← All Products
        </Link>
      </div>

      <ProductEditor
        product={{
          id: product.id,
          name: product.name,
          code: product.code,
          description: product.description ?? "",
          mrp: product.mrp.toString(),
          price: product.price.toString(),
          status: product.status,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId,
          images: product.images.map((i) => ({ id: i.id, url: i.url })),
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            qty: v.qty,
            mrp: v.mrp.toString(),
            price: v.price.toString(),
          })),
        }}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          subCategories: c.subCategories.map((s) => ({ id: s.id, name: s.name })),
        }))}
      />
    </div>
  );
}
