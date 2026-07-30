import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { subCategories: { orderBy: { name: "asc" } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Categories</h1>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          subCategories: c.subCategories.map((s) => ({ id: s.id, name: s.name })),
        }))}
      />
    </div>
  );
}
