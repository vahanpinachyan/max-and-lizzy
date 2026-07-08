import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm, type ProductFormInitial } from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";
import { requireManagerSession } from "@/lib/admin/permissions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireManagerSession();
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const images = JSON.parse(product.images) as { src: string; alt: string }[];
  const materials = JSON.parse(product.materials) as string[];
  const safetyInfo = JSON.parse(product.safetyInfo) as string[];

  const initial: ProductFormInitial = {
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    nameHy: product.nameHy ?? "",
    nameRu: product.nameRu ?? "",
    shortDescription: product.shortDescription,
    shortDescriptionHy: product.shortDescriptionHy ?? "",
    shortDescriptionRu: product.shortDescriptionRu ?? "",
    description: product.description,
    descriptionHy: product.descriptionHy ?? "",
    descriptionRu: product.descriptionRu ?? "",
    priceAmd: product.priceAmd,
    compareAtPriceAmd: product.compareAtPriceAmd ?? "",
    category: product.category,
    subcategory: product.subcategory,
    ageRange: product.ageRange,
    brand: product.brand,
    materials: materials.join("\n"),
    safetyInfo: safetyInfo.join("\n"),
    imageSrcs: images.map((i) => i.src).join("\n"),
    imageAlts: images.map((i) => i.alt).join("\n"),
    inStock: product.inStock,
    stockQuantity: product.stockQuantity ?? "",
    featured: product.featured,
    bestseller: product.bestseller,
    newArrival: product.newArrival,
    dimensions: product.dimensions ?? "",
    weightGrams: product.weightGrams ?? "",
    careInstructions: product.careInstructions ?? "",
  };

  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-espresso">Edit Product</h1>
      <p className="mt-1 text-sm text-espresso/60">{product.name}</p>
      <div className="mt-6">
        <ProductForm action={boundUpdate} initial={initial} mode="edit" />
      </div>
    </div>
  );
}
