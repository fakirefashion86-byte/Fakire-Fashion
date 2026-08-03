export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">New Product</h1>
      <p className="text-sm text-ink-muted">
        Product management is coming in the next phase.
      </p>
    </div>
  );
}

// Disabled for this phase — product management returns next phase.
// import { prisma } from "@/lib/prisma";
// import NewProductForm from "@/components/admin/NewProductForm";
//
// export default async function NewProductPage() {
//   const categories = await prisma.category.findMany({
//     orderBy: { name: "asc" },
//     include: { subCategories: { orderBy: { name: "asc" } } },
//   });
//
//   return (
//     <div>
//       <h1 className="mb-6 text-2xl font-semibold">New Product</h1>
//       <NewProductForm
//         categories={categories.map((c) => ({
//           id: c.id,
//           name: c.name,
//           subCategories: c.subCategories.map((s) => ({ id: s.id, name: s.name })),
//         }))}
//       />
//     </div>
//   );
// }
