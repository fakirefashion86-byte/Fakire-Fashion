import DetailsForm from "./product-editor/DetailsForm";
import PhotosEditor from "./product-editor/PhotosEditor";
import VariantsEditor from "./product-editor/VariantsEditor";

type Category = { id: number; name: string; subCategories: { id: number; name: string }[] };
type Image = { id: number; url: string };
type Variant = { id: number; size: string; color: string; qty: number; mrp: string; price: string };
type ProductData = {
  id: number;
  name: string;
  code: string;
  description: string;
  mrp: string;
  price: string;
  status: boolean;
  categoryId: number;
  subCategoryId: number | null;
  images: Image[];
  variants: Variant[];
};

export default function ProductEditor({ product, categories }: { product: ProductData; categories: Category[] }) {
  return (
    <div className="flex flex-col gap-8">
      <DetailsForm product={product} categories={categories} />
      <PhotosEditor productId={product.id} initialImages={product.images} />
      <VariantsEditor productId={product.id} initialVariants={product.variants} />
    </div>
  );
}
