export default function AdminProductsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Products</h1>
      <p className="text-sm text-ink-muted">
        Product management is coming in the next phase.
      </p>
    </div>
  );
}

// Disabled for this phase — product management returns next phase.
// import Link from "next/link";
// import { prisma } from "@/lib/prisma";
// import ProductRowActions from "@/components/admin/ProductRowActions";
//
// export default async function AdminProductsPage() {
//   const products = await prisma.product.findMany({
//     orderBy: { createdAt: "desc" },
//     include: { category: true },
//   });
//
//   return (
//     <div>
//       <div className="mb-6 flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">Products</h1>
//         <Link href="/admin/products/new" className="rounded bg-btn px-4 py-2 text-sm text-btn-text transition hover:bg-btn-hover">
//           + New Product
//         </Link>
//       </div>
//
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b border-border text-left text-ink-muted">
//             <th className="py-2">Name</th>
//             <th className="py-2">Category</th>
//             <th className="py-2">Price</th>
//             <th className="py-2">Status</th>
//             <th className="py-2"></th>
//           </tr>
//         </thead>
//         <tbody>
//           {products.map((p) => (
//             <tr key={p.id} className="border-b border-divider">
//               <td className="py-2">{p.name}</td>
//               <td className="py-2">{p.category.name}</td>
//               <td className="py-2">₹{Number(p.price).toFixed(0)}</td>
//               <td className="py-2">{p.status ? "Active" : "Hidden"}</td>
//               <td className="py-2">
//                 <ProductRowActions productId={p.id} status={p.status} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       {products.length === 0 && <p className="mt-4 text-ink-muted">No products yet.</p>}
//     </div>
//   );
// }
