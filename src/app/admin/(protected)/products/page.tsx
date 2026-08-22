import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductRowActions from "@/components/admin/ProductRowActions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-btn px-4 py-2 text-sm text-btn-text transition hover:bg-btn-hover"
        >
          + New Product
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-ink-muted">
            <th className="py-2">Name</th>
            <th className="py-2">Category</th>
            <th className="py-2">Price</th>
            <th className="py-2">Stock</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stock = p.variants.reduce((sum, v) => sum + v.qty, 0);
            return (
              <tr key={p.id} className="border-b border-divider">
                <td className="py-2">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="py-2">{p.category.name}</td>
                <td className="py-2">₹{Number(p.price).toFixed(0)}</td>
                <td className="py-2">
                  {p.variants.length === 0 ? (
                    <span className="text-ink-muted">No sizes yet</span>
                  ) : stock === 0 ? (
                    <span className="text-error">Out of stock</span>
                  ) : (
                    stock
                  )}
                </td>
                <td className="py-2">{p.status ? "Active" : "Hidden"}</td>
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.id}`} className="text-xs text-accent underline">
                      Edit
                    </Link>
                    <ProductRowActions productId={p.id} status={p.status} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {products.length === 0 && <p className="mt-4 text-ink-muted">No products yet.</p>}
    </div>
  );
}
