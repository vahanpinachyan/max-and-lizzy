import { ProductForm, emptyProduct } from "@/components/admin/ProductForm";
import { createProduct } from "../actions";
import { requireManagerSession } from "@/lib/admin/permissions";

export default async function NewProductPage() {
  await requireManagerSession();
  return (
    <div>
      <h1 className="text-2xl font-bold text-espresso">Add Product</h1>
      <div className="mt-6">
        <ProductForm action={createProduct} initial={emptyProduct} mode="create" />
      </div>
    </div>
  );
}
